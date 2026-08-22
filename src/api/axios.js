import axios from 'axios';

const getBaseURL = () => {
  if (import.meta.env.VITE_API_URL) {
    const url = import.meta.env.VITE_API_URL.trim().replace(/\/$/, '');
    return url.endsWith('/api') ? url : `${url}/api`;
  }
  return '/api';
};

const API = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Token Interceptor
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('gentora_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
API.interceptors.response.use(
  (response) => response.data,
  (error) => {
    let message = error.response?.data?.message;
    if (!message) {
      if (error.code === 'ECONNREFUSED' || error.message?.includes('500') || error.message?.includes('Network Error')) {
        message = 'Backend Server is Offline! Please run "npm run dev" from the main project root folder (gentora-fabrics IDE).';
      } else {
        message = error.message || 'Something went wrong';
      }
    }
    return Promise.reject(new Error(message));
  }
);

export default API;
