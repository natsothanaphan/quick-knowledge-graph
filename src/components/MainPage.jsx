import React, { useState, useEffect } from 'react';
import './MainPage.css';
import api from '../api.js';
import { alertAndLogErr } from '../utils.js';

const MainPage = ({ user, onSelectGraph }) => {
  const [graphs, setGraphs] = useState([]);
  const [fullGraphs, setFullGraphs] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const [editingGraphId, setEditingGraphId] = useState(null);
  const [editingGraphName, setEditingGraphName] = useState('');

  const [newName, setNewName] = useState('');

  const fetchGraphs = async () => {
    setLoading(true);
    try {
      const idToken = await user.getIdToken();
      const data = await api.fetchGraphs(idToken);
      data.sort((a, b) => a.name.localeCompare(b.name));
      setFullGraphs(data);
    } catch (err) {
      alertAndLogErr(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditGraph = (graph) => {
    setEditingGraphId(graph.id);
    setEditingGraphName(graph.name);
  };
  const handleDeleteGraph = async (graphId) => {
    if (!window.confirm('Are you sure you want to delete this graph?')) return;
    try {
      const idToken = await user.getIdToken();
      await api.deleteGraph(idToken, graphId);
      fetchGraphs();
    } catch (err) {
      alertAndLogErr(err);
    }
  };

  const handleSaveGraph = async (graphId) => {
    try {
      const idToken = await user.getIdToken();
      await api.updateGraph(idToken, graphId, editingGraphName);
      setEditingGraphId(null);
      setEditingGraphName('');
      fetchGraphs();
    } catch (err) {
      alertAndLogErr(err);
    }
  };
  const handleCancelEditGraph = () => {
    setEditingGraphId(null);
    setEditingGraphName('');
  };

  const handleCreateGraph = async (e) => {
    e.preventDefault();
    try {
      const idToken = await user.getIdToken();
      await api.createGraph(idToken, newName);
      setNewName('');
      fetchGraphs();
    } catch (err) {
      alertAndLogErr(err);
    }
  };

  const handleSelectGraph = (e, graphId) => {
    e.preventDefault();
    onSelectGraph(graphId);
  };

  useEffect(() => {
    fetchGraphs();
  }, []);

  useEffect(() => {
    setGraphs(fullGraphs.filter((graph) => graph.name.includes(search)));
  }, [search, fullGraphs]);

  return (
    <>
      <div className='graphs-search-container'>
        <input type='text' value={search}
          onChange={(e) => setSearch(e.target.value)} />
      </div>
      <div className='graphs-list-container'>
        {loading && <p>Loading...</p>}
        {!loading && <ul>{graphs.map((graph) => <li key={graph.id}>
          {editingGraphId !== graph.id && <>
            <a href='#' onClick={(e) => handleSelectGraph(e, graph.id)}>{graph.name}</a>{' '}
            <button onClick={() => handleEditGraph(graph)} title='edit'>✏️</button>{' '}
            <button onClick={() => handleDeleteGraph(graph.id)} title='delete'>🗑️</button>
          </>}
          {editingGraphId === graph.id && <>
            <input type='text' placeholder='label' value={editingGraphName}
              onChange={(e) => setEditingGraphName(e.target.value)} required />
            <div>
              <button onClick={() => handleSaveGraph(graph.id)} title='save'>💾</button>{' '}
              <button onClick={handleCancelEditGraph} title='cancel'>❌</button>
            </div>
          </>}
        </li>)}</ul>}
      </div>
      <div className='add-graph-container'>
        <h3>new</h3>
        <form onSubmit={handleCreateGraph}>
          <input type='text' placeholder='name' value={newName}
            onChange={(e) => setNewName(e.target.value)} required />
          <button type='submit'>add</button>
        </form>
      </div>
    </>
  );
};

export default MainPage;
