import api from './api';

// Teacher Profile
export const getTeacher = (teacherId) => {
  return api.get(`/teachers/${teacherId}`);
};

export const getTeacherSubjects = (teacherId, params = {}) => {
  return api.get(`/teachers/${teacherId}/subjects`, { params });
};

export const getTeacherGroups = (teacherId, params = {}) => {
  return api.get(`/teachers/${teacherId}/groups`, { params });
};

// Timetable & Sessions
export const getTeacherTimetable = (teacherId, params = {}) => {
  return api.get(`/teachers/${teacherId}/timetable`, { params });
};

export const getTodaySessions = (teacherId) => {
  return api.get(`/teachers/${teacherId}/sessions/today`);
};

export const getWeekSessions = (teacherId) => {
  return api.get(`/teachers/${teacherId}/sessions/week`);
};

export const getSessionDetails = (sessionId) => {
  return api.get(`/sessions/${sessionId}`);
};

export const getSessionAbsences = (sessionId) => {
  return api.get(`/sessions/${sessionId}/absences`);
};

// Absence Management
export const reportAbsence = (data) => {
  return api.post('/absences/report', data);
};

export const getReportedAbsences = (teacherId, params = {}) => {
  return api.get(`/teachers/${teacherId}/absences/reported`, { params });
};

// Absence Requests
export const getAbsenceRequests = (teacherId, params = {}) => {
  return api.get(`/teachers/${teacherId}/absence-requests`, { params });
};

export const approveAbsenceRequest = (requestId, data) => {
  return api.put(`/absence-requests/${requestId}/approve`, data);
};

export const rejectAbsenceRequest = (requestId, data) => {
  return api.put(`/absence-requests/${requestId}/reject`, data);
};

// Make-Up Sessions
export const createMakeupSession = (data) => {
  return api.post('/makeup-sessions', data);
};

export const getMakeupSessions = (teacherId, params = {}) => {
  return api.get(`/teachers/${teacherId}/makeup-sessions`, { params });
};

// Messaging
export const getInboxMessages = (params = {}) => {
  return api.get('/messages/inbox', { params });
};

export const getSentMessages = (params = {}) => {
  return api.get('/messages/sent', { params });
};

export const getMessage = (messageId, params = {}) => {
  return api.get(`/messages/${messageId}`, { params });
};

export const sendMessage = (data) => {
  return api.post('/messages/send', data);
};

export const replyToMessage = (messageId, data) => {
  return api.post(`/messages/${messageId}/reply`, data);
};

// Attendance Management
export const getSessionAttendance = (sessionId, params = {}) => {
  return api.get(`/attendance/sessions/${sessionId}/attendance`, { params });
};

export const markAttendance = (sessionId, data) => {
  return api.post(`/attendance/sessions/${sessionId}/attendance/mark`, data);
};

export const markBulkAttendance = (sessionId, data) => {
  return api.post(`/attendance/sessions/${sessionId}/attendance/bulk`, data);
};

export const getAttendanceStatistics = (sessionId) => {
  return api.get(`/attendance/sessions/${sessionId}/attendance/statistics`);
};

export const getStudentAttendanceHistory = (studentId, params = {}) => {
  return api.get(`/attendance/students/${studentId}/attendance/history`, { params });
};

// User Search for Messaging
export const searchUsersByEmail = (email) => {
  return api.get('/messages/search-users', { params: { email } });
};

export const getUserByEmail = (email) => {
  return api.get('/messages/user-by-email', { params: { email } });
};

// Rooms
export const getRooms = () => {
  return api.get('/rooms');
};
