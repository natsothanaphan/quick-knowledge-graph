import React, { useState } from 'react';
import Auth from './components/Auth';
import Overview from './components/Overview';
import './App.css';

function App() {
  const [user, setUser] = useState(null);

  const handleSignIn = (signedInUser) => {
    setUser(signedInUser);
  };

  return (
    <div className="App">
      {user ? (
        <Overview user={user} />
      ) : (
        <Auth onSignIn={handleSignIn} />
      )}
    </div>
  );
}

export default App;
