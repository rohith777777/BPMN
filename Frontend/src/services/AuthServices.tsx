import axios from 'axios';
import url from '../api/api';

// User
const userLogin = async (json: object) => {
  const URL = `${url}/user/login`
  console.log("userLogin: ", URL, json);
  try {
    const URL = `${url}/user/login`;
    return await axios.post(URL, json);
  } catch (error) {
    console.log(error);
  }
};
// User SingUp
const userRegister = async (json: object) => {
  try {
    const URL = `${url}/user/signup`;
    return await axios.post(URL, json);
  } catch (error) {
    console.log(error);
  }
};

// forgot password
const forgotPassword = async (json: object) => {
  try {
    const URL = `${url}/user/forgotPassword`;
    return await axios.post(URL, json);
  } catch (error) {
    console.log(error);
  }
};
// resend password reset link

const resendPasswordResetLink = async (json: object) => {
  try {
    const URL = `${url}/user/resendresetpassword`;
    return await axios.post(URL, json);
  } catch (error) {
    console.log(error);
  }
};

const resetPassword = async (token: string, password: string) => {
  try {
    const URL = `${url}/user/resetPassword/${token}`;

    return await axios.post(URL, { password });
  } catch (error) {
    console.log(error);
  }
};

export {
  // user auth
  userLogin,
  userRegister,
  forgotPassword,
  resendPasswordResetLink,
  resetPassword,
};
