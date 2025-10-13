import axios from 'axios';

const api = axios.create({
  baseURL: 'https://spring-boot-coffeeshop-backend.onrender.com/api', // Deployed backend URL
  withCredentials: true, // This is crucial for sending cookies
});

export default api;