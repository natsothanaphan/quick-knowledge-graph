require('dotenv').config({ path: ['.env', '.env.default'] });
const { initializeApp } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const { setGlobalOptions } = require('firebase-functions/v2');
const { onRequest } = require('firebase-functions/v2/https');
const logger = require('firebase-functions/logger');
const express = require('express');

setGlobalOptions({ region: 'asia-southeast1' });
initializeApp();
const db = getFirestore();

const app = express();
app.use(express.json());

const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }
  const idToken = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await getAuth().verifyIdToken(idToken);
    req.uid = decodedToken.uid;
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};
app.use(authenticate);

app.get('/api/ping', (req, res) => {
  res.send('pong');
});
const docToData = (doc) => {
  const data = doc.data();
  return { id: doc.id, ...data,
    createdAt: data.createdAt.toDate(), updatedAt: data.updatedAt.toDate() };
};

const getGraphsCollection = (uid) => db.collection('users').doc(uid).collection('graphs');
const getGraphDoc = (uid, graphId) => getGraphsCollection(uid).doc(graphId);
const getNodesCollection = (uid, graphId) => getGraphDoc(uid, graphId).collection('nodes');
const getEdgesCollection = (uid, graphId) => getGraphDoc(uid, graphId).collection('edges');

app.get('/api/graphs', async (req, res) => {
  const uid = req.uid;
  try {
    const graphsSnapshot = await getGraphsCollection(uid).get();
    const graphs = [];
    graphsSnapshot.forEach((doc) => {
      graphs.push(docToData(doc));
    });
    return res.json(graphs);
  } catch (error) {
    logger.error('Error fetching graphs:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/graphs', async (req, res) => {
  const uid = req.uid;
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Graph name is required' });
  try {
    const graphsRef = getGraphsCollection(uid);
    const existsQuery = await graphsRef.where('name', '==', name).get();
    if (!existsQuery.empty) return res.status(400).json({ error: 'Graph with this name already exists' });
    const graphData = { name, createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() };
    const newGraphRef = await graphsRef.add(graphData);
    return res.status(201).json({ id: newGraphRef.id, ...graphData });
  } catch (error) {
    logger.error('Error creating graph:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.patch('/api/graphs/:graphId', async (req, res) => {
  const uid = req.uid;
  const { graphId } = req.params;
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Graph name is required for update' });
  try {
    const graphRef = getGraphDoc(uid, graphId);
    const graphDoc = await graphRef.get();
    if (!graphDoc.exists) return res.status(404).json({ error: 'Graph not found' });
    const graphsRef = getGraphsCollection(uid);
    const existsQuery = await graphsRef.where('name', '==', name).get();
    let duplicate = false;
    existsQuery.forEach((doc) => {
      if (doc.id !== graphId) duplicate = true;
    });
    if (duplicate) return res.status(400).json({ error: 'Another graph with this name already exists' });
    await graphRef.update({ name, updatedAt: FieldValue.serverTimestamp() });
    const updatedGraph = await graphRef.get();
    return res.json(docToData(updatedGraph));
  } catch (error) {
    logger.error('Error updating graph:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/graphs/:graphId', async (req, res) => {
  const uid = req.uid;
  const { graphId } = req.params;
  try {
    const graphRef = getGraphDoc(uid, graphId);
    const graphDoc = await graphRef.get();
    if (!graphDoc.exists) return res.status(404).json({ error: 'Graph not found' });

    const batch = db.batch();
    const nodesSnapshot = await getNodesCollection(uid, graphId).get();
    nodesSnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });
    const edgesSnapshot = await getEdgesCollection(uid, graphId).get();
    edgesSnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });
    batch.delete(graphRef);
    await batch.commit();
    return res.status(204).send();
  } catch (error) {
    logger.error('Error deleting graph:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/graphs/:graphId/nodes', async (req, res) => {
  const uid = req.uid;
  const { graphId } = req.params;
  try {
    const querySnapshot = await getNodesCollection(uid, graphId).get();
    const nodes = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      nodes.push({ id: doc.id, title: data.title });
    });
    return res.json(nodes);
  } catch (error) {
    logger.error('Error fetching nodes:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/graphs/:graphId/nodes', async (req, res) => {
  const uid = req.uid;
  const { graphId } = req.params;
  const { title, content } = req.body;
  if (!title || !content) return res.status(400).json({ error: 'Title and content are required' });
  try {
    const nodesRef = getNodesCollection(uid, graphId);
    const existsQuery = await nodesRef.where('title', '==', title).get();
    if (!existsQuery.empty) return res.status(400).json({ error: 'Node with this title already exists' });
    const newNodeData = { title, content, createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() };
    const newNodeRef = await nodesRef.add(newNodeData);
    return res.status(201).json({ id: newNodeRef.id, ...newNodeData });
  } catch (error) {
    logger.error('Error creating node:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/graphs/:graphId/nodes/:nodeId', async (req, res) => {
  const uid = req.uid;
  const { graphId, nodeId } = req.params;
  try {
    const nodeRef = getNodesCollection(uid, graphId).doc(nodeId);
    const nodeDoc = await nodeRef.get();
    if (!nodeDoc.exists) return res.status(404).json({ error: 'Node not found' });
    const nodeData = docToData(nodeDoc);

    const edgesRef = getEdgesCollection(uid, graphId);
    const outgoingSnapshot = await edgesRef.where('source', '==', nodeId).get();
    const outgoingEdges = [];
    outgoingSnapshot.forEach((doc) => {
      outgoingEdges.push(docToData(doc));
    });
    const incomingSnapshot = await edgesRef.where('target', '==', nodeId).get();
    const incomingEdges = [];
    incomingSnapshot.forEach((doc) => {
      incomingEdges.push(docToData(doc));
    });

    return res.json({
      node: nodeData,
      incomingEdges: incomingEdges,
      outgoingEdges: outgoingEdges,
    });
  } catch (error) {
    logger.error('Error fetching node details:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.patch('/api/graphs/:graphId/nodes/:nodeId', async (req, res) => {
  const uid = req.uid;
  const { graphId, nodeId } = req.params;
  const { title, content } = req.body;
  if (!title && !content) return res.status(400).json({ error: 'Nothing to update' });
  try {
    const nodeRef = getNodesCollection(uid, graphId).doc(nodeId);
    const nodeDoc = await nodeRef.get();
    if (!nodeDoc.exists) return res.status(404).json({ error: 'Node not found' });
    const updateData = {};
    if (title) {
      const existsQuery = await getNodesCollection(uid, graphId).where('title', '==', title).get();
      let duplicate = false;
      existsQuery.forEach((doc) => {
        if (doc.id !== nodeId) duplicate = true;
      });
      if (duplicate) return res.status(400).json({ error: 'Another node with this title already exists' });
      updateData.title = title;
    }
    if (content) updateData.content = content;
    updateData.updatedAt = FieldValue.serverTimestamp();

    await nodeRef.update(updateData);
    const updatedDoc = await nodeRef.get();
    return res.json(docToData(updatedDoc));
  } catch (error) {
    logger.error('Error updating node:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/graphs/:graphId/nodes/:nodeId', async (req, res) => {
  const uid = req.uid;
  const { graphId, nodeId } = req.params;
  try {
    const nodeRef = getNodesCollection(uid, graphId).doc(nodeId);
    const nodeDoc = await nodeRef.get();
    if (!nodeDoc.exists) return res.status(404).json({ error: 'Node not found' });

    const batch = db.batch();
    batch.delete(nodeRef);
    const edgesRef = getEdgesCollection(uid, graphId);
    const outgoingSnapshot = await edgesRef.where('source', '==', nodeId).get();
    outgoingSnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });
    const incomingSnapshot = await edgesRef.where('target', '==', nodeId).get();
    incomingSnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();
    return res.status(204).send();
  } catch (error) {
    logger.error('Error deleting node:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/graphs/:graphId/edges', async (req, res) => {
  const uid = req.uid;
  const { graphId } = req.params;
  const { source, target, label } = req.body;
  if (!source || !target || !label) return res.status(400).json({ error: 'Source, target, and label are required' });
  try {
    const nodesRef = getNodesCollection(uid, graphId);
    const sourceDoc = await nodesRef.doc(source).get();
    const targetDoc = await nodesRef.doc(target).get();
    if (!sourceDoc.exists || !targetDoc.exists) return res.status(400).json({ error: 'Invalid source or target node' });
    const edgeData = { source, target, label, createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() };
    const edgeRef = await getEdgesCollection(uid, graphId).add(edgeData);
    return res.status(201).json({ id: edgeRef.id, ...edgeData });
  } catch (error) {
    logger.error('Error creating edge:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.patch('/api/graphs/:graphId/edges/:edgeId', async (req, res) => {
  const uid = req.uid;
  const { graphId, edgeId } = req.params;
  const { label } = req.body;
  if (!label) return res.status(400).json({ error: 'Label is required for update' });
  try {
    const edgeRef = getEdgesCollection(uid, graphId).doc(edgeId);
    const edgeDoc = await edgeRef.get();
    if (!edgeDoc.exists) return res.status(404).json({ error: 'Edge not found' });
    await edgeRef.update({ label, updatedAt: FieldValue.serverTimestamp() });
    const updatedEdgeDoc = await edgeRef.get();
    return res.json(docToData(updatedEdgeDoc));
  } catch (error) {
    logger.error('Error updating edge:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/graphs/:graphId/edges/:edgeId', async (req, res) => {
  const uid = req.uid;
  const { graphId, edgeId } = req.params;
  try {
    const edgeRef = getEdgesCollection(uid, graphId).doc(edgeId);
    const edgeDoc = await edgeRef.get();
    if (!edgeDoc.exists) return res.status(404).json({ error: 'Edge not found' });
    await edgeRef.delete();
    return res.status(204).send();
  } catch (error) {
    logger.error('Error deleting edge:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

exports.app = onRequest(app);
