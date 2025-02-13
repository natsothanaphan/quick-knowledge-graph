const admin = require("firebase-admin");
const { setGlobalOptions } = require("firebase-functions/v2");
const { onRequest } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const express = require("express");

setGlobalOptions({ region: 'asia-southeast1' });

admin.initializeApp();

const app = express();
app.use(express.json());

/**
 * Authentication middleware.
 * Checks for an Authorization header with a Bearer token,
 * verifies the token with Firebase Auth, and sets the uid on req.
 */
async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized: No token provided" });
  }
  const idToken = authHeader.split("Bearer ")[1];
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.uid = decodedToken.uid;
    next();
  } catch (error) {
    logger.error("Authentication error:", error);
    return res.status(401).json({ error: "Unauthorized: Invalid token" });
  }
}

// Use the authentication middleware for all routes
app.use(authenticate);

// Helper functions to get the Firestore collection references for the current user.
const getNodesCollection = (uid) =>
  admin.firestore().collection("users").doc(uid).collection("nodes");
const getEdgesCollection = (uid) =>
  admin.firestore().collection("users").doc(uid).collection("edges");

// ==========================
// Node Endpoints
// ==========================

/**
 * GET /api/nodes
 * Returns a list of nodes (id and title) for the authenticated user.
 * If a 'search' query parameter is provided, it filters nodes
 * by checking if the title includes the search substring.
 */
app.get("/api/nodes", async (req, res) => {
  const uid = req.uid;
  try {
    const search = req.query.search;
    const nodesRef = getNodesCollection(uid);
    const querySnapshot = await nodesRef.get();
    const nodes = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (!search || data.title.toLowerCase().includes(search.toLowerCase())) {
        nodes.push({ id: doc.id, title: data.title });
      }
    });
    return res.json(nodes);
  } catch (error) {
    logger.error("Error fetching nodes:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * POST /api/nodes
 * Creates a new node with a unique title and content.
 * Enforces uniqueness of the title (per user) before creation.
 */
app.post("/api/nodes", async (req, res) => {
  const uid = req.uid;
  const { title, content } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: "Title and content are required" });
  }
  try {
    const nodesRef = getNodesCollection(uid);
    // Check for duplicate title.
    const existsQuery = await nodesRef.where("title", "==", title).get();
    if (!existsQuery.empty) {
      return res.status(400).json({ error: "Node with this title already exists" });
    }
    const newNodeData = { title, content };
    const newNodeRef = await nodesRef.add(newNodeData);
    return res.status(201).json({ id: newNodeRef.id, title, content });
  } catch (error) {
    logger.error("Error creating node:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * GET /api/nodes/:nodeId
 * Retrieves a full node record along with its incoming and outgoing edges.
 * Outgoing edges are those where the node is the source,
 * and incoming edges are those where the node is the target.
 */
app.get("/api/nodes/:nodeId", async (req, res) => {
  const uid = req.uid;
  const { nodeId } = req.params;
  try {
    const nodeRef = getNodesCollection(uid).doc(nodeId);
    const nodeDoc = await nodeRef.get();
    if (!nodeDoc.exists) {
      return res.status(404).json({ error: "Node not found" });
    }
    const nodeData = { id: nodeDoc.id, ...nodeDoc.data() };

    const edgesRef = getEdgesCollection(uid);
    // Outgoing edges: node is the source.
    const outgoingSnapshot = await edgesRef.where("source", "==", nodeId).get();
    const outgoingEdges = [];
    outgoingSnapshot.forEach((doc) => {
      outgoingEdges.push({ id: doc.id, ...doc.data() });
    });
    // Incoming edges: node is the target.
    const incomingSnapshot = await edgesRef.where("target", "==", nodeId).get();
    const incomingEdges = [];
    incomingSnapshot.forEach((doc) => {
      incomingEdges.push({ id: doc.id, ...doc.data() });
    });

    return res.json({
      node: nodeData,
      incomingEdges: incomingEdges,
      outgoingEdges: outgoingEdges,
    });
  } catch (error) {
    logger.error("Error fetching node details:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * PATCH /api/nodes/:nodeId
 * Updates the specified node's title and/or content.
 * If the title is updated, enforces its uniqueness.s
 */
app.patch("/api/nodes/:nodeId", async (req, res) => {
  const uid = req.uid;
  const { nodeId } = req.params;
  const { title, content } = req.body;
  if (!title && !content) {
    return res.status(400).json({ error: "Nothing to update" });
  }
  try {
    const nodeRef = getNodesCollection(uid).doc(nodeId);
    const nodeDoc = await nodeRef.get();
    if (!nodeDoc.exists) {
      return res.status(404).json({ error: "Node not found" });
    }
    const updateData = {};
    if (title) {
      // Check for duplicate title.
      const nodesRef = getNodesCollection(uid);
      const existsQuery = await nodesRef.where("title", "==", title).get();
      let duplicate = false;
      existsQuery.forEach((doc) => {
        if (doc.id !== nodeId) {
          duplicate = true;
        }
      });
      if (duplicate) {
        return res.status(400).json({ error: "Another node with this title already exists" });
      }
      updateData.title = title;
    }
    if (content) {
      updateData.content = content;
    }
    await nodeRef.update(updateData);
    const updatedDoc = await nodeRef.get();
    return res.json({ id: updatedDoc.id, ...updatedDoc.data() });
  } catch (error) {
    logger.error("Error updating node:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * DELETE /api/nodes/:nodeId
 * Deletes the specified node and cascades the deletion to all associated edges (incoming and outgoing).
 */
app.delete("/api/nodes/:nodeId", async (req, res) => {
  const uid = req.uid;
  const { nodeId } = req.params;
  try {
    const nodeRef = getNodesCollection(uid).doc(nodeId);
    const nodeDoc = await nodeRef.get();
    if (!nodeDoc.exists) {
      return res.status(404).json({ error: "Node not found" });
    }
    const batch = admin.firestore().batch();
    // Delete the node.
    batch.delete(nodeRef);

    const edgesRef = getEdgesCollection(uid);
    // Delete outgoing edges.
    const outgoingSnapshot = await edgesRef.where("source", "==", nodeId).get();
    outgoingSnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });
    // Delete incoming edges.
    const incomingSnapshot = await edgesRef.where("target", "==", nodeId).get();
    incomingSnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();
    return res.json({ message: "Node and associated edges deleted successfully" });
  } catch (error) {
    logger.error("Error deleting node:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ==========================
// Edge Endpoints
// ==========================

/**
 * POST /api/edges
 * Creates an edge between two nodes.
 * Requires that both the source and target node IDs are valid.
 */
app.post("/api/edges", async (req, res) => {
  const uid = req.uid;
  const { source, target, label } = req.body;
  if (!source || !target || !label) {
    return res.status(400).json({ error: "Source, target, and label are required" });
  }
  try {
    const nodesRef = getNodesCollection(uid);
    const sourceDoc = await nodesRef.doc(source).get();
    const targetDoc = await nodesRef.doc(target).get();
    if (!sourceDoc.exists || !targetDoc.exists) {
      return res.status(400).json({ error: "Invalid source or target node" });
    }
    const edgeData = { source, target, label };
    const edgesRef = getEdgesCollection(uid);
    const edgeRef = await edgesRef.add(edgeData);
    return res.status(201).json({ id: edgeRef.id, ...edgeData });
  } catch (error) {
    logger.error("Error creating edge:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * PATCH /api/edges/:edgeId
 * Updates only the label of the specified edge.
 */
app.patch("/api/edges/:edgeId", async (req, res) => {
  const uid = req.uid;
  const { edgeId } = req.params;
  const { label } = req.body;
  if (!label) {
    return res.status(400).json({ error: "Label is required for update" });
  }
  try {
    const edgeRef = getEdgesCollection(uid).doc(edgeId);
    const edgeDoc = await edgeRef.get();
    if (!edgeDoc.exists) {
      return res.status(404).json({ error: "Edge not found" });
    }
    await edgeRef.update({ label });
    const updatedEdgeDoc = await edgeRef.get();
    return res.json({ id: updatedEdgeDoc.id, ...updatedEdgeDoc.data() });
  } catch (error) {
    logger.error("Error updating edge:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * DELETE /api/edges/:edgeId
 * Deletes the specified edge.
 */
app.delete("/api/edges/:edgeId", async (req, res) => {
  const uid = req.uid;
  const { edgeId } = req.params;
  try {
    const edgeRef = getEdgesCollection(uid).doc(edgeId);
    const edgeDoc = await edgeRef.get();
    if (!edgeDoc.exists) {
      return res.status(404).json({ error: "Edge not found" });
    }
    await edgeRef.delete();
    return res.json({ message: "Edge deleted successfully" });
  } catch (error) {
    logger.error("Error deleting edge:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Export the Express app as a Firebase Function.
exports.app = onRequest(app);
