import React, { useState, useEffect } from 'react';
import '../styles.css';
import * as api from '../api.js';

export default function NodeDetail({ nodeId, user, onSelectNode, onBack, allNodes }) {
  const [nodeData, setNodeData] = useState(null);
  const [incomingEdges, setIncomingEdges] = useState([]);
  const [outgoingEdges, setOutgoingEdges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // States for node editing
  const [editingNode, setEditingNode] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');

  // States for edge editing
  const [editingEdgeId, setEditingEdgeId] = useState(null);
  const [editingEdgeLabel, setEditingEdgeLabel] = useState('');

  // States for adding an edge
  const [newEdgeTarget, setNewEdgeTarget] = useState('');
  const [newEdgeLabel, setNewEdgeLabel] = useState('');

  const fetchNodeDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const idToken = await user.getIdToken();
      const data = await api.getNodeDetails(idToken, nodeId);
      setNodeData(data.node);
      setIncomingEdges(data.incomingEdges);
      setOutgoingEdges(data.outgoingEdges);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNodeDetails();
  }, [nodeId]);

  const handleEditNode = () => {
    setEditingNode(true);
    setEditTitle(nodeData.title);
    setEditContent(nodeData.content);
  };

  const handleCancelEditNode = () => {
    setEditingNode(false);
  };

  const handleSaveNode = async (e) => {
    e.preventDefault();
    try {
      const idToken = await user.getIdToken();
      const updatedNode = await api.updateNode(idToken, nodeId, editTitle, editContent);
      setNodeData(updatedNode);
      setEditingNode(false);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteNode = async () => {
    if (!window.confirm("Are you sure you want to delete this entry?")) return;
    try {
      const idToken = await user.getIdToken();
      await api.deleteNode(idToken, nodeId);
      alert('Entry deleted');
      onBack();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleEditEdge = (edge) => {
    setEditingEdgeId(edge.id);
    setEditingEdgeLabel(edge.label);
  };

  const handleCancelEditEdge = () => {
    setEditingEdgeId(null);
    setEditingEdgeLabel('');
  };

  const handleSaveEdge = async (edgeId) => {
    try {
      const idToken = await user.getIdToken();
      await api.updateEdge(idToken, edgeId, editingEdgeLabel);
      await fetchNodeDetails(); // Refresh edges
      setEditingEdgeId(null);
      setEditingEdgeLabel('');
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteEdge = async (edgeId) => {
    if (!window.confirm("Are you sure you want to delete this connection?")) return;
    try {
      const idToken = await user.getIdToken();
      await api.deleteEdge(idToken, edgeId);
      await fetchNodeDetails(); // Refresh edges
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAddEdge = async (e) => {
    e.preventDefault();
    try {
      const idToken = await user.getIdToken();
      // Convert target title to node id using allNodes mapping.
      const targetNode = allNodes.find(n => n.title === newEdgeTarget);
      if (!targetNode) {
        throw new Error("Target entry with that title not found");
      }
      await api.addEdge(idToken, nodeId, targetNode.id, newEdgeLabel);
      await fetchNodeDetails(); // Refresh edges
      setNewEdgeTarget('');
      setNewEdgeLabel('');
    } catch (err) {
      alert(err.message);
    }
  };

  // Helper function to map a node ID to its title using the allNodes prop.
  const getNodeTitleById = (nodeId) => {
    const node = allNodes.find(n => n.id === nodeId);
    return node ? node.title : nodeId;
  };

  if (loading) {
    return <p>Loading entry...</p>;
  }

  if (error) {
    return <p className="error">Error: {error}</p>;
  }

  if (!nodeData) {
    return <p>No entry data available.</p>;
  }

  return (
    <div>
      {onBack && <button onClick={onBack}>Overview</button>}

      {editingNode ? (
        <form onSubmit={handleSaveNode}>
          <div>
            <input 
              type="text"
              placeholder="Title"
              value={editTitle} 
              onChange={(e) => setEditTitle(e.target.value)} 
              required 
            />
          </div>
          <div>
            <textarea
              placeholder="Details"
              value={editContent} 
              onChange={(e) => setEditContent(e.target.value)} 
              required 
              rows="6" 
              cols="60" 
            />
          </div>
          <button type="submit">Save</button>
          <button type="button" onClick={handleCancelEditNode}>Cancel</button>
        </form>
      ) : (
        <div>
          <h1>{nodeData.title}</h1>
          <p>{nodeData.content}</p>
          <button onClick={handleEditNode} title="Edit">✏️</button>
          <button onClick={handleDeleteNode} title="Delete">🗑️</button>
        </div>
      )}

      <section>
        <ul>
          {outgoingEdges.map(edge => (
            <li key={edge.id}>
              {editingEdgeId === edge.id ? (
                <>
                  <input 
                    type="text"
                    placeholder="Label"
                    value={editingEdgeLabel} 
                    onChange={(e) => setEditingEdgeLabel(e.target.value)} 
                  />
                  <button onClick={() => handleSaveEdge(edge.id)}>Save</button>
                  <button onClick={handleCancelEditEdge}>Cancel</button>
                </>
              ) : (
                <>
                  {edge.label}{' ➡️ '}
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (onSelectNode) onSelectNode(edge.target);
                    }}
                  >
                    {getNodeTitleById(edge.target)}
                  </a>{' '}
                  <button onClick={() => handleEditEdge(edge)} title="Edit">✏️</button>
                  <button onClick={() => handleDeleteEdge(edge.id)} title="Delete">🗑️</button>
                </>
              )}
            </li>
          ))}
          {incomingEdges.map(edge => (
            <li key={edge.id}>
              {editingEdgeId === edge.id ? (
                <>
                  <input 
                    type="text"
                    placeholder="Label"
                    value={editingEdgeLabel} 
                    onChange={(e) => setEditingEdgeLabel(e.target.value)} 
                  />
                  <button onClick={() => handleSaveEdge(edge.id)}>Save</button>
                  <button onClick={handleCancelEditEdge}>Cancel</button>
                </>
              ) : (
                <>
                  {edge.label}{' ⬅️ '}
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (onSelectNode) onSelectNode(edge.source);
                    }}
                  >
                    {getNodeTitleById(edge.source)}
                  </a>{' '}
                  <button onClick={() => handleEditEdge(edge)} title="Edit">✏️</button>
                  <button onClick={() => handleDeleteEdge(edge.id)} title="Delete">🗑️</button>
                </>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2>Connect to</h2>
        <form onSubmit={handleAddEdge}>
          <div>
            <input 
              type="text"
              placeholder="Title"
              value={newEdgeTarget}
              onChange={(e) => setNewEdgeTarget(e.target.value)}
              required
            />
          </div>
          <div>
            <input
              type="text"
              placeholder="Label"
              value={newEdgeLabel}
              onChange={(e) => setNewEdgeLabel(e.target.value)}
              required
            />
          </div>
          <button type="submit">Add</button>
        </form>
      </section>
    </div>
  );
}
