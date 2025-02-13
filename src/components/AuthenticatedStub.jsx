import React from 'react';

export default function AuthenticatedStub({ user }) {
  return (
    <div>
      <h2>Welcome, {user.email}!</h2>
      <p>This is a stub content for authenticated users.</p>
    </div>
  );
}
