import React, { useState, useEffect } from 'react';
import './NodeDetail.css';
import api from '../api.js';
import { alertAndLogErr } from '../utils.js';

const NodeDetail = ({ user, allNodes, nodeId, onSelectNode, onBack }) => {
  const [nodeData, setNodeData] = useState(null);
  const [incomingEdges, setIncomingEdges] = useState([]);
  const [outgoingEdges, setOutgoingEdges] = useState([]);
  const [loading, setLoading] = useState(false);

  const [editingNode, setEditingNode] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');

  const [editingEdgeId, setEditingEdgeId] = useState(null);
  const [editingEdgeLabel, setEditingEdgeLabel] = useState('');

  const [newEdgeTarget, setNewEdgeTarget] = useState('');
  const [newEdgeLabel, setNewEdgeLabel] = useState('');

  const fetchNodeDetails = async () => {
    setLoading(true);
    try {
      const idToken = await user.getIdToken();
      const data = await api.getNodeDetails(idToken, nodeId);
      data.incomingEdges.sort((a, b) => a.label.localeCompare(b.label) || getNodeTitleById(a.source).localeCompare(getNodeTitleById(b.source)));
      data.outgoingEdges.sort((a, b) => a.label.localeCompare(b.label) || getNodeTitleById(a.target).localeCompare(getNodeTitleById(b.target)));
      setNodeData(data.node);
      setIncomingEdges(data.incomingEdges);
      setOutgoingEdges(data.outgoingEdges);
    } catch (err) {
      alertAndLogErr(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditNode = () => {
    setEditingNode(true);
    setEditTitle(nodeData.title);
    setEditContent(nodeData.content);
  };
  const handleDeleteNode = async () => {
    if (!window.confirm('Are you sure you want to delete this entry?')) return;
    try {
      const idToken = await user.getIdToken();
      await api.deleteNode(idToken, nodeId);
      alert('Entry deleted');
      onBack();
    } catch (err) {
      alertAndLogErr(err);
    }
  };

  const handleSaveNode = async (e) => {
    e.preventDefault();
    try {
      const idToken = await user.getIdToken();
      const updatedNode = await api.updateNode(idToken, nodeId, editTitle, editContent);
      setNodeData(updatedNode);
      setEditingNode(false);
    } catch (err) {
      alertAndLogErr(err);
    }
  };
  const handleCancelEditNode = () => setEditingNode(false);

  const handleEditEdge = (edge) => {
    setEditingEdgeId(edge.id);
    setEditingEdgeLabel(edge.label);
  };
  const handleDeleteEdge = async (edgeId) => {
    if (!window.confirm('Are you sure you want to delete this connection?')) return;
    try {
      const idToken = await user.getIdToken();
      await api.deleteEdge(idToken, edgeId);
      fetchNodeDetails();
    } catch (err) {
      alertAndLogErr(err);
    }
  };

  const handleSaveEdge = async (edgeId) => {
    try {
      const idToken = await user.getIdToken();
      await api.updateEdge(idToken, edgeId, editingEdgeLabel);
      setEditingEdgeId(null);
      setEditingEdgeLabel('');
      fetchNodeDetails();
    } catch (err) {
      alertAndLogErr(err);
    }
  };
  const handleCancelEditEdge = () => {
    setEditingEdgeId(null);
    setEditingEdgeLabel('');
  };

  const handleAddEdge = async (e) => {
    e.preventDefault();
    try {
      const idToken = await user.getIdToken();
      const targetNode = allNodes.find((node) => node.title === newEdgeTarget);
      if (!targetNode) throw new Error('Target entry with that title not found');
      await api.addEdge(idToken, nodeId, targetNode.id, newEdgeLabel);
      setNewEdgeTarget('');
      setNewEdgeLabel('');
      fetchNodeDetails();
    } catch (err) {
      alertAndLogErr(err);
    }
  };

  const handleSelectNode = (e, nodeId) => {
    e.preventDefault();
    onSelectNode(nodeId);
  };

  useEffect(() => {
    fetchNodeDetails();
  }, [nodeId]);

  const nodeTitleMap = allNodes.reduce((map, node) => {
    map[node.id] = node.title;
    return map;
  }, {});
  const getNodeTitleById = (nodeId) => nodeTitleMap[nodeId] || nodeId;

  if (loading) return <p>Loading...</p>;
  if (!nodeData) return <p>No entry data.</p>;
  return (
    <>
      <button onClick={onBack}>main</button>
      <div className='node-detail-container'>
        {!editingNode && <>
          <h1>{nodeData.title}</h1>
          <pre>{nodeData.content}</pre>
          <div>
            <button onClick={handleEditNode} title='edit'>✏️</button>{' '}
            <button onClick={handleDeleteNode} title='delete'>🗑️</button>
          </div>
        </>}
        {editingNode && <form onSubmit={handleSaveNode}>
          <input type='text' placeholder='title' value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)} required />
          <textarea placeholder='details' value={editContent}
            rows='4' onChange={(e) => setEditContent(e.target.value)} required />
          <div>
            <button type='submit' title='save'>💾</button>{' '}
            <button type='button' onClick={handleCancelEditNode} title='cancel'>❌</button>
          </div>
        </form>}
      </div>
      <div className='edges-container'>
        <ul>
          {outgoingEdges.map((edge) => <li key={edge.id}>
            {editingEdgeId !== edge.id && <>
              {edge.label}{' ➡️ '}
              <a href='#' onClick={(e) => handleSelectNode(e, edge.target)}>{getNodeTitleById(edge.target)}</a>{' '}
              <button onClick={() => handleEditEdge(edge)} title='edit'>✏️</button>{' '}
              <button onClick={() => handleDeleteEdge(edge.id)} title='delete'>🗑️</button>
            </>}
            {editingEdgeId === edge.id && <>
              <input type='text' placeholder='label' value={editingEdgeLabel}
                onChange={(e) => setEditingEdgeLabel(e.target.value)} required />
              <div>
                <button onClick={() => handleSaveEdge(edge.id)} title='save'>💾</button>{' '}
                <button onClick={handleCancelEditEdge} title='cancel'>❌</button>
              </div>
            </>}
          </li>)}
          {incomingEdges.map((edge) => <li key={edge.id}>
            {editingEdgeId !== edge.id && <>
              {edge.label}{' ⬅️ '}
              <a href='#' onClick={(e) => handleSelectNode(e, edge.source)}>{getNodeTitleById(edge.source)}</a>{' '}
              <button onClick={() => handleEditEdge(edge)} title='edit'>✏️</button>{' '}
              <button onClick={() => handleDeleteEdge(edge.id)} title='delete'>🗑️</button>
            </>}
            {editingEdgeId === edge.id && <>
              <input type='text' placeholder='label' value={editingEdgeLabel}
                onChange={(e) => setEditingEdgeLabel(e.target.value)} required />
              <div>
                <button onClick={() => handleSaveEdge(edge.id)} title='save'>💾</button>{' '}
                <button onClick={handleCancelEditEdge} title='cancel'>❌</button>
              </div>
            </>}
          </li>)}
        </ul>
      </div>
      <div className='add-edge-container'>
        <h3>connect</h3>
        <form onSubmit={handleAddEdge}>
          <input type='text' placeholder='title' value={newEdgeTarget}
            onChange={(e) => setNewEdgeTarget(e.target.value)} required />
          <input type='text' placeholder='label' value={newEdgeLabel}
            onChange={(e) => setNewEdgeLabel(e.target.value)} required />
          <button type='submit'>add</button>
        </form>
      </div>
    </>
  );
};

export default NodeDetail;
