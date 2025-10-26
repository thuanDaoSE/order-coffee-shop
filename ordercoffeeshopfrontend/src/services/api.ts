import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ,
  withCredentials: true, // This is crucial for sending cookies
});

export default api;