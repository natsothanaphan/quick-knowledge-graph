import React, { useState } from 'react';
import Auth from './components/Auth';
import AuthenticatedStub from './components/AuthenticatedStub';
import './App.css';

function App() {
  const [user, setUser] = useState(null);

  const handleSignIn = (signedInUser) => {
    setUser(signedInUser);
  };

  return (
    <div className="App">
      {user ? (
        <AuthenticatedStub user={user} />
      ) : (
        <Auth onSignIn={handleSignIn} />
      )}
    </div>
  );
}

export default App;
