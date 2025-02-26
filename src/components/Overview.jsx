import React, { useState, useEffect } from 'react';
import './Overview.css';
import api from '../api.js';
import { alertAndLogErr } from '../utils.js';

const Overview = ({ user, onNodesFetched, onSelectNode }) => {
  const [nodes, setNodes] = useState([]);
  const [fullNodes, setFullNodes] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');

  const fetchNodes = async () => {
    setLoading(true);
    try {
      const idToken = await user.getIdToken();
      const data = await api.fetchNodes(idToken, '');
      data.sort((a, b) => a.title.localeCompare(b.title));
      setFullNodes(data);
      onNodesFetched(data);
    } catch (err) {
      alertAndLogErr(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNode = async (e) => {
    e.preventDefault();
    try {
      const idToken = await user.getIdToken();
      await api.addNode(idToken, newTitle, newContent);
      setNewTitle('');
      setNewContent('');
      fetchNodes();
    } catch (err) {
      alertAndLogErr(err);
    }
  };

  const handleSelectNode = (e, nodeId) => {
    e.preventDefault();
    onSelectNode(nodeId);
  };

  useEffect(() => {
    fetchNodes();
  }, []);

  useEffect(() => {
    setNodes(fullNodes.filter((node) => node.title.includes(search)));
  }, [search, fullNodes]);

  return (
    <>
      <div className='search-container'>
        <input type='text' value={search}
          onChange={(e) => setSearch(e.target.value)} />
      </div>
      <div className='nodes-list-container'>
        {loading && <p>Loading...</p>}
        {!loading && <ul>{nodes.map((node) => (
          <li key={node.id}><a href='#' onClick={(e) => handleSelectNode(e, node.id)}>{node.title}</a></li>
        ))}</ul>}
      </div>
      <div className='add-node-container'>
        <h3>new</h3>
        <form onSubmit={handleAddNode}>
          <input type='text' placeholder='title' value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)} required />
          <textarea placeholder='details' value={newContent}
            rows='4' onChange={(e) => setNewContent(e.target.value)} required />
          <button type='submit'>add</button>
        </form>
      </div>
    </>
  );
};

export default Overview;
