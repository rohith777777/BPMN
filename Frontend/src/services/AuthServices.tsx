import axios from 'axios';
import url from '../api/api'; // Correct import for the default export

// User login function
const userLogin = async (json: object) => {
  try {
    const URL = `${url}/user/login`;
    console.log("userLogin: ", URL, json);
    return await axios.post(URL, json);
  } catch (error) {
    console.log(error);
  }
};

// User signup function
const userRegister = async (json: object) => {
  try {
    const URL = `${url}/user/signup`;
    return await axios.post(URL, json);
  } catch (error) {
    console.log(error);
  }
};

// Forgot password function
const forgotPassword = async (json: object) => {
  try {
    const URL = `${url}/user/forgotPassword`;
    return await axios.post(URL, json);
  } catch (error) {
    console.log(error);
  }
};

// Resend password reset link function
const resendPasswordResetLink = async (json: object) => {
  try {
    const URL = `${url}/user/resendresetpassword`;
    return await axios.post(URL, json);
  } catch (error) {
    console.log(error);
  }
};

// Reset password function
const resetPassword = async (token: string, password: string) => {
  try {
    const URL = `${url}/user/resetPassword/${token}`;
    return await axios.post(URL, { password });
  } catch (error) {
    console.log(error);
  }
};

export {
  userLogin,
  userRegister,
  forgotPassword,
  resendPasswordResetLink,
  resetPassword,
};
