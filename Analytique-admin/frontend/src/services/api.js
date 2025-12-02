import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Analytics Endpoints
export const analyticsAPI = {
  getComplete: () => api.get('/analytics'),
  getStudents: () => api.get('/analytics/students'),
  getAbsences: (params) => api.get('/analytics/absences', { params }),
  getGrades: (params) => api.get('/analytics/grades', { params }),
  getTeachersSubjects: () => api.get('/analytics/teachers-subjects'),
  getNotificationsMessaging: () => api.get('/analytics/notifications-messaging'),
}

// Reports Endpoints
export const reportsAPI = {
  getAbsences: (params) => api.get('/reports/absences', { params }),
  getGrades: (params) => api.get('/reports/grades', { params }),
  getStudents: (params) => api.get('/reports/students', { params }),
  getTeachersSubjects: (params) => api.get('/reports/teachers-subjects', { params }),
  
  // Download helpers
  downloadPDF: (endpoint, params) => {
    return api.get(endpoint, {
      params: { ...params, format: 'pdf' },
      responseType: 'blob',
    })
  },
  
  downloadCSV: (endpoint, params) => {
    return api.get(endpoint, {
      params: { ...params, format: 'csv' },
      responseType: 'blob',
    })
  },
}

// Dashboard Endpoints
export const dashboardAPI = {
  getComplete: () => api.get('/dashboard'),
  getStudentsPerDepartment: () => api.get('/dashboard/students-per-department'),
  getAbsencesPerMonth: (params) => api.get('/dashboard/absences-per-month', { params }),
  getSuccessRateByLevel: () => api.get('/dashboard/success-rate-by-level'),
  getTopStudents: (params) => api.get('/dashboard/top-students', { params }),
  getTeacherWorkload: () => api.get('/dashboard/teacher-workload'),
  getRoomUsage: () => api.get('/dashboard/room-usage'),
  getTimetableOccupancy: () => api.get('/dashboard/timetable-occupancy'),
  getRecentActivities: (params) => api.get('/dashboard/recent-activities', { params }),
}

// Metadata Endpoints
export const metadataAPI = {
  getAll: () => api.get('/metadata'),
  getDepartments: () => api.get('/metadata/departments'),
  getSubjects: () => api.get('/metadata/subjects'),
  getLevels: () => api.get('/metadata/levels'),
  getSpecialties: () => api.get('/metadata/specialties'),
  getGroups: () => api.get('/metadata/groups'),
}

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Error handling interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message)
    return Promise.reject(error)
  }
)

export default api
