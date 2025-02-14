import React, { useState, useEffect } from 'react';
import '../styles.css';
import * as api from '../api.js';

export default function Overview({ user, onSelectNode, onNodesFetched }) {
  // nodes that are actually displayed (filtered)
  const [nodes, setNodes] = useState([]);
  // store full list of nodes fetched from the API
  const [fullNodes, setFullNodes] = useState([]);
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
      // Always fetch all nodes by passing an empty string for search
      const data = await api.fetchNodes(idToken, '');
      setFullNodes(data);
      if (onNodesFetched) {
        onNodesFetched(data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch nodes when the component mounts
  useEffect(() => {
    fetchNodes();
  }, []);

  useEffect(() => {
    const filteredNodes = fullNodes.filter(node =>
      node.title.includes(search)
    );
    setNodes(filteredNodes);
  }, [search, fullNodes]);

  const handleAddNode = async (e) => {
    e.preventDefault();
    try {
      const idToken = await user.getIdToken();
      await api.addNode(idToken, newTitle, newContent);
      // After adding a node, re-fetch the full node list.
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
      <div className="search-container">
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
        {error && <p className="error">{error}</p>}
        <ul>
          {nodes.map(node => (
            <li key={node.id}>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  onSelectNode(node.id);
                }}
              >
                {node.title}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
