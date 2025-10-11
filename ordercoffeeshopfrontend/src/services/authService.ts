import axios from 'axios';

const API_URL = 'http://localhost:8080/api'; // Adjust the API URL as needed

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const register = (data: any) => {
  console.log("before axios: ", data);
  console.log("after axios: ", axios.post(`${API_URL}/v1/auth/register`, data));

  return axios.post(`${API_URL}/v1/auth/register`, data);
};

export const login = (data: any) => {
  return axios.post(`${API_URL}/v1/auth/login`, data);
};

export const logout = () => {
  return api.post(`${API_URL}/v1/auth/logout`);
};

export const getProfile = () => {
  return api.get('/v1/users/profile'); // This endpoint needs to be created in the backend
};

export default api;
