import React from 'react';
import { GoogleLogin } from 'react-oauth/google';
import axios from 'axios';

const GoogleAuth = () => {
  const handleGoogleSuccess = async (response) => {
    try {
      const backendResponse = await axios.post('/auth/google/callback', { token: response.credential });
      const token = backendResponse.data.token;
      localStorage.setItem('accessToken', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      alert('Google login successful');
    } catch (error) {
      console.error('Error with Google login:', error);
      alert('Google login failed');
    }
  };

  return (
    <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => alert('Google login failed')} />
  );
};

export default GoogleAuth;
