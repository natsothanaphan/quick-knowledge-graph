import React, { useState, useEffect } from 'react';

export default function Overview({ user }) {
  const [nodes, setNodes] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');

  const fetchNodes = async () => {
    setLoading(true);
    setError('');
    try {
      const idToken = await user.getIdToken();
      const res = await fetch(`/api/nodes?search=${encodeURIComponent(search)}`, {
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      });
      if (!res.ok) {
        throw new Error('Failed to fetch nodes');
      }
      const data = await res.json();
      setNodes(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNodes();
    // Refetch nodes each time the search string changes
  }, [search]);

  const handleAddNode = async (e) => {
    e.preventDefault();
    try {
      const idToken = await user.getIdToken();
      const response = await fetch(`/api/nodes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({ title: newTitle, content: newContent })
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add node');
      }
      // After adding a node, re-fetch the node list.
      fetchNodes();
      setNewTitle('');
      setNewContent('');
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div>
      <h2>Entries</h2>
      <div style={{ marginBottom: "1em" }}>
        <input
          type="text"
          placeholder="Search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div>
        <h3>New entry</h3>
        <form onSubmit={handleAddNode}>
          <div>
            <input
              type="text"
              placeholder="Title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              required
            />
          </div>
          <div>
            <textarea
              placeholder="Details"
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              required
              rows="4"
              cols="50"
            />
          </div>
          <button type="submit">Add</button>
        </form>
      </div>
      <div>
        {loading && <p>Loading nodes...</p>}
        {error && <p style={{ color: 'firebrick' }}>{error}</p>}
        <ul>
          {nodes.map(node => (
            <li key={node.id}>{node.title}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
