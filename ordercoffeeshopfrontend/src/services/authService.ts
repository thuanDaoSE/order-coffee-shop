import api from './api';


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
