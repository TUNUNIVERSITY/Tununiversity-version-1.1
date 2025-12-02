import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4008/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000, // 2 minute timeout - Updated: 2025-11-23 16:24:59
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token here if needed
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.code === 'ECONNABORTED') {
      return Promise.reject({ message: 'Request timeout - please try again', error });
    }
    if (!error.response) {
      return Promise.reject({ message: 'Network error - please check your connection', error });
    }
    const message = error.response?.data?.message || error.message || 'An error occurred';
    return Promise.reject({ message, error });
  }
);

export default api;

