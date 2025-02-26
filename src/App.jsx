import React, { useState } from 'react';
import Auth from './components/Auth';
import Overview from './components/Overview';
import NodeDetail from './components/NodeDetail';
import './App.css';

const App = () => {
  const [user, setUser] = useState(null);
  const [allNodes, setAllNodes] = useState([]);
  const [selectedNodeId, setSelectedNodeId] = useState(null);

  const handleSignIn = (signedInUser) => setUser(signedInUser);
  const handleSelectNode = (nodeId) => setSelectedNodeId(nodeId);
  const handleBack = () => setSelectedNodeId(null);

  if (!user) return <div className='App'><Auth onSignIn={handleSignIn} /></div>;

  return (
    <div className='App'>
      {!selectedNodeId && <Overview user={user} onNodesFetched={setAllNodes} onSelectNode={handleSelectNode} />}
      {selectedNodeId && <NodeDetail user={user} allNodes={allNodes} nodeId={selectedNodeId} onSelectNode={handleSelectNode} onBack={handleBack} />}
    </div>
  );
};

export default App;
