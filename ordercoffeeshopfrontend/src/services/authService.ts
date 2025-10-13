import axios from 'axios';


// It's best practice to use environment variables for the API URL.
// Example: const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
const API_URL = 'http://localhost:8080/api';

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
