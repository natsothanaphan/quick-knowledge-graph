import React, { useState, useEffect } from 'react';
import '../styles.css';
import * as api from '../api.js';

export default function NodeDetail({ nodeId, user, onSelectNode, onBack, allNodes }) {
  const [nodeData, setNodeData] = useState(null);
  const [incomingEdges, setIncomingEdges] = useState([]);
  const [outgoingEdges, setOutgoingEdges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // New state for node editing
  const [editingNode, setEditingNode] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');

  // New state for edge editing (only one at a time)
  const [editingEdgeId, setEditingEdgeId] = useState(null);
  const [editingEdgeLabel, setEditingEdgeLabel] = useState('');

  // New state for adding an edge
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

  // Node editing functions
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
    if (!window.confirm("Are you sure you want to delete this node?")) return;
    try {
      const idToken = await user.getIdToken();
      await api.deleteNode(idToken, nodeId);
      alert('Node deleted');
      onBack(); // Return to overview after deletion
    } catch (err) {
      alert(err.message);
    }
  };

  // Edge editing functions
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
    if (!window.confirm("Are you sure you want to delete this edge?")) return;
    try {
      const idToken = await user.getIdToken();
      await api.deleteEdge(idToken, edgeId);
      await fetchNodeDetails(); // Refresh edges
    } catch (err) {
      alert(err.message);
    }
  };

  // Function to add a new outgoing edge
  const handleAddEdge = async (e) => {
    e.preventDefault();
    try {
      const idToken = await user.getIdToken();
      // Convert target title to node id using allNodes mapping.
      const targetTitle = newEdgeTarget;
      const targetNode = allNodes.find(n => n.title === targetTitle);
      if (!targetNode) {
        throw new Error("Target node with that title not found");
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
    return <p>Loading node details...</p>;
  }

  if (error) {
    return <p className="error">Error: {error}</p>;
  }

  if (!nodeData) {
    return <p>No node data available.</p>;
  }

  return (
    <div>
      {onBack && <button onClick={onBack}>Back</button>}

      {/* Node details and editing */}
      {editingNode ? (
        <form onSubmit={handleSaveNode}>
          <div>
            <label>Title: </label>
            <input 
              type="text" 
              value={editTitle} 
              onChange={(e) => setEditTitle(e.target.value)} 
              required 
            />
          </div>
          <div>
            <label>Content: </label>
            <textarea 
              value={editContent} 
              onChange={(e) => setEditContent(e.target.value)} 
              required 
              rows="4" 
              cols="50" 
            />
          </div>
          <button type="submit">Save</button>
          <button type="button" onClick={handleCancelEditNode}>Cancel</button>
        </form>
      ) : (
        <div>
          <h2>{nodeData.title}</h2>
          <p>{nodeData.content}</p>
          <button onClick={handleEditNode}>Edit Node</button>
          <button onClick={handleDeleteNode}>Delete Node</button>
        </div>
      )}

      {/* Outgoing edges section with inline editing */}
      <section>
        <h3>Outgoing edges</h3>
        <ul>
          {outgoingEdges.map(edge => (
            <li key={edge.id}>
              {editingEdgeId === edge.id ? (
                <>
                  <input 
                    type="text" 
                    value={editingEdgeLabel} 
                    onChange={(e) => setEditingEdgeLabel(e.target.value)} 
                  />
                  <button onClick={() => handleSaveEdge(edge.id)}>Save</button>
                  <button onClick={handleCancelEditEdge}>Cancel</button>
                </>
              ) : (
                <>
                  {edge.label} to:{' '}
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (onSelectNode) onSelectNode(edge.target);
                    }}
                  >
                    {getNodeTitleById(edge.target)}
                  </a>{' '}
                  <button onClick={() => handleEditEdge(edge)}>Edit</button>
                  <button onClick={() => handleDeleteEdge(edge.id)}>Delete</button>
                </>
              )}
            </li>
          ))}
        </ul>
      </section>

      {/* Form for adding a new outgoing edge */}
      <section>
        <h3>Add new outgoing edge</h3>
        <form onSubmit={handleAddEdge}>
          <div>
            <label>Target Node Title: </label>
            <input 
              type="text"
              value={newEdgeTarget}
              onChange={(e) => setNewEdgeTarget(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Label: </label>
            <input 
              type="text"
              value={newEdgeLabel}
              onChange={(e) => setNewEdgeLabel(e.target.value)}
              required
            />
          </div>
          <button type="submit">Add Edge</button>
        </form>
      </section>

      {/* Incoming edges section with inline editing */}
      <section>
        <h3>Incoming edges</h3>
        <ul>
          {incomingEdges.map(edge => (
            <li key={edge.id}>
              {editingEdgeId === edge.id ? (
                <>
                  <input 
                    type="text" 
                    value={editingEdgeLabel} 
                    onChange={(e) => setEditingEdgeLabel(e.target.value)} 
                  />
                  <button onClick={() => handleSaveEdge(edge.id)}>Save</button>
                  <button onClick={handleCancelEditEdge}>Cancel</button>
                </>
              ) : (
                <>
                  {edge.label} from:{' '}
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (onSelectNode) onSelectNode(edge.source);
                    }}
                  >
                    {getNodeTitleById(edge.source)}
                  </a>{' '}
                  <button onClick={() => handleEditEdge(edge)}>Edit</button>
                  <button onClick={() => handleDeleteEdge(edge.id)}>Delete</button>
                </>
              )}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
