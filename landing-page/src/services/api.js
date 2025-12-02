import axios from 'axios';

const API_URL = 'http://localhost:4001/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
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

// Auth API
export const authAPI = {
  // Login is handled by external authentication service
  // login: (credentials) => api.post('/auth/login', credentials),
  getMe: () => api.get('/auth/me'),
};

// Student API
export const studentAPI = {
  getDashboard: () => api.get('/student/dashboard'),
  getSchedule: () => api.get('/student/schedule'),
  getNotifications: () => api.get('/student/notifications'),
  markNotificationRead: (id) => api.put(`/student/notifications/${id}/read`),
  getAbsences: () => api.get('/student/absences'),
  requestAbsenceExcuse: (id, data) => api.post(`/student/absences/${id}/request-excuse`, data),
  getGrades: () => api.get('/student/grades'),
  getMessages: () => api.get('/student/messages'),
  sendMessage: (data) => api.post('/student/messages', data),
};

// Events API
export const eventsAPI = {
  getPublicEvents: (params) => api.get('/events', { params }),
};

export default api;
