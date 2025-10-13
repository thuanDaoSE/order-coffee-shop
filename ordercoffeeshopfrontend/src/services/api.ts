import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api', // Your API base URL
  withCredentials: true, // This is crucial for sending cookies
});

export default api;