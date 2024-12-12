import React from 'react';
import FacebookLogin from 'react-facebook-login';
import axios from 'axios';

const FacebookAuth = () => {
  const handleFacebookSuccess = async (response) => {
    try {
      const backendResponse = await axios.post('/auth/facebook/callback', { token: response.accessToken });
      const token = backendResponse.data.token;
      localStorage.setItem('accessToken', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      alert('Facebook login successful');
    } catch (error) {
      console.error('Error with Facebook login:', error);
      alert('Facebook login failed');
    }
  };

  return (
    <FacebookLogin
      appId="YOUR_FACEBOOK_APP_ID"
      autoLoad={false}
      fields="name,email,picture"
      callback={handleFacebookSuccess}
      onFailure={() => alert('Facebook login failed')}
    />
  );
};

export default FacebookAuth;
