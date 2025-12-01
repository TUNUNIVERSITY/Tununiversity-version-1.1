import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4002';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Authentication API calls
export const authAPI = {
  // Login with CIN and role
  login: async (cin, password, role) => {
    const response = await api.post('/auth/login', { cin, password, role });
    return response.data;
  },

  // Send verification email
  sendVerification: async (cin) => {
    const response = await api.post('/auth/send-verification', { cin });
    return response.data;
  },

  // Verify email with token
  verifyEmail: async (token) => {
    const response = await api.get(`/auth/verify?token=${token}`);
    return response.data;
  },

  // Request password reset
  requestPasswordReset: async (cin) => {
    const response = await api.post('/auth/request-reset', { cin });
    return response.data;
  },

  // Reset password
  resetPassword: async (token, newPassword) => {
    const response = await api.post('/auth/reset-password', { token, newPassword });
    return response.data;
  },

  // Get user profile
  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  // Logout user
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },
};

export default api;
