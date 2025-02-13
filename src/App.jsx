import React, { useState } from 'react';
import Auth from './components/Auth';
import Overview from './components/Overview';
import NodeDetail from './components/NodeDetail';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [allNodes, setAllNodes] = useState([]);

  const handleSignIn = (signedInUser) => {
    setUser(signedInUser);
  };

  const handleSelectNode = (nodeId) => {
    setSelectedNodeId(nodeId);
  };

  const handleBack = () => {
    setSelectedNodeId(null);
  };

  if (!user) {
    return (
      <div className="App">
        <Auth onSignIn={handleSignIn} />
      </div>
    );
  }

  return (
    <div className="App">
      {selectedNodeId ? (
        <NodeDetail
          nodeId={selectedNodeId}
          user={user}
          onSelectNode={handleSelectNode}
          onBack={handleBack}
          allNodes={allNodes}
        />
      ) : (
        <Overview user={user} onSelectNode={handleSelectNode} onNodesFetched={setAllNodes} />
      )}
    </div>
  );
}

export default App;
