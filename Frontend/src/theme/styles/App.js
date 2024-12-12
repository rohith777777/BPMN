import React from 'react';
import Login from './components/Login';
import GoogleAuth from './components/GoogleAuth';
import FacebookAuth from './components/FacebookAuth';

const App = () => {
  return (
    <div>
      <h1>Login</h1>
      <Login />
      <h2>Or</h2>
      <GoogleAuth />
      <FacebookAuth />
    </div>
  );
};

export default App;
