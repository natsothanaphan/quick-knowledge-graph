import React, { useState } from 'react';
import Auth from './components/Auth';
import MainPage from './components/MainPage';
import GraphOverview from './components/GraphOverview';
import NodeDetail from './components/NodeDetail';
import './App.css';

const App = () => {
  const [user, setUser] = useState(null);
  const [selectedGraphId, setSelectedGraphId] = useState(null);
  const [allNodes, setAllNodes] = useState([]);
  const [selectedNodeId, setSelectedNodeId] = useState(null);

  const handleBackToMainPage = () => setSelectedGraphId(null);
  const handleBackToGraphOverview = () => setSelectedNodeId(null);

  if (!user) return <div className='App'><Auth onSignIn={setUser} /></div>;
  if (!selectedGraphId) return <div className='App'><MainPage user={user}
    onSelectGraph={setSelectedGraphId} /></div>;
  if (!selectedNodeId) return <div className='App'><GraphOverview user={user}
    graphId={selectedGraphId}
    onNodesFetched={setAllNodes} onSelectNode={setSelectedNodeId} onBack={handleBackToMainPage} /></div>;
  return <div className='App'><NodeDetail user={user}
    graphId={selectedGraphId} allNodes={allNodes} nodeId={selectedNodeId}
    onSelectNode={setSelectedNodeId} onBack={handleBackToGraphOverview} /></div>;
};

export default App;
