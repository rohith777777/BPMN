import axios from 'axios';
import url from '../api/api'; // Correct import for the default export

// Get Profile
const getProfile = async (code?: string | null) => {
  try {
    const accessToken = localStorage.getItem('accessToken') || code;
    const options = {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    };
    const URL = `${url}/user/user-profile`;
    return await axios.get(URL, options);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response && error.response.status === 401) {
        console.error('Unauthorized: Invalid token or session expired');
        // Handle 401 errorlogout
        // logout();
      } else {
        console.error('An error occurred:', error.response?.data);
        // logout();
      }
    } else {
      console.error('An unexpected error occurred:', error);
    }
  }
};

// Update user profile
const updateProfile = async (json: object) => {
  try {
    const accessToken = localStorage.getItem('accessToken');
    // Set headers
    const headers = {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    };
    const URL = `${url}/user/user-profile`;
    return await axios.put(URL, json, { headers });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response && error.response.status === 401) {
        console.error('Unauthorized: Invalid token or session expired');
        // Handle 401 errorlogout
        // logout();
      } else {
        console.error('An error occurred:', error.response?.data);
        // logout();
      }
    } else {
      console.error('An unexpected error occurred:', error);
    }
  }
};

export {
  getProfile,
  updateProfile,
};
