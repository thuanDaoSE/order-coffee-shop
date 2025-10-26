import axios from 'axios';


// Use environment variables for API URL
const API_URL = "https://41a29b870a63.ngrok-free.app/api";
// const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
console.log("API_URL: ", API_URL);

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true // This is crucial for sending HttpOnly cookies
});


export const register = (data: any) => {
  return api.post(`/v1/auth/register`, data);
};

export const login = (data: any) => {
  return api.post(`/v1/auth/login`, data);
};

export const logout = () => {
  return api.post(`/v1/auth/logout`);
};

export const getProfile = () => {
  return api.get('/v1/auth/profile'); // Corrected endpoint
};


export default api;
