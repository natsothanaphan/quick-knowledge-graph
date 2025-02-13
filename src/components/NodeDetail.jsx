import React, { useState, useEffect } from 'react';

export default function NodeDetail({ nodeId, user, onSelectNode, onBack }) {
  const [nodeData, setNodeData] = useState(null);
  const [incomingEdges, setIncomingEdges] = useState([]);
  const [outgoingEdges, setOutgoingEdges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchNodeDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const idToken = await user.getIdToken();
      const res = await fetch(`/api/nodes/${nodeId}`, {
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Error fetching node details');
      }
      const data = await res.json();
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

  if (loading) {
    return <p>Loading node details...</p>;
  }

  if (error) {
    return <p style={{ color: 'firebrick' }}>Error: {error}</p>;
  }

  if (!nodeData) {
    return <p>No node data available.</p>;
  }

  return (
    <div>
      {onBack && <button onClick={onBack}>Back</button>}
      <h2>{nodeData.title}</h2>
      <p>{nodeData.content}</p>

      <section>
        <h3>Outgoing edges</h3>
        <ul>
          {outgoingEdges.map(edge => (
            <li key={edge.id}>
              {edge.label} to:{' '}
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (onSelectNode) onSelectNode(edge.target);
                }}
              >
                {edge.target}
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3>Incoming edges</h3>
        <ul>
          {incomingEdges.map(edge => (
            <li key={edge.id}>
              {edge.label} from:{' '}
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (onSelectNode) onSelectNode(edge.source);
                }}
              >
                {edge.source}
              </a>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
} 