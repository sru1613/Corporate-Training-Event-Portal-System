import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
  timeout: 30000,
});

// Request interceptor - attach token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle errors
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ===== Auth =====
export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  getMe: () => API.get('/auth/me'),
  updateProfile: (data) => API.put('/auth/profile', data),
  updatePassword: (data) => API.put('/auth/password', data),
};

// ===== Users =====
export const usersAPI = {
  getAll: (params) => API.get('/users', { params }),
  getById: (id) => API.get(`/users/${id}`),
  create: (data) => API.post('/users', data),
  update: (id, data) => API.put(`/users/${id}`, data),
  delete: (id) => API.delete(`/users/${id}`),
  getTrainers: () => API.get('/users/trainers'),
  getStats: () => API.get('/users/stats'),
};

// ===== Events =====
export const eventsAPI = {
  getAll: (params) => API.get('/events', { params }),
  getById: (id) => API.get(`/events/${id}`),
  create: (data) => API.post('/events', data),
  update: (id, data) => API.put(`/events/${id}`, data),
  delete: (id) => API.delete(`/events/${id}`),
  getStats: () => API.get('/events/stats'),
  getMyEvents: (params) => API.get('/events/my-events', { params }),
};

// ===== Registrations =====
export const registrationsAPI = {
  register: (eventId) => API.post('/registrations', { eventId }),
  getAll: (params) => API.get('/registrations', { params }),
  getMy: (params) => API.get('/registrations/my', { params }),
  cancel: (id, reason) => API.put(`/registrations/${id}/cancel`, { reason }),
  getParticipants: (eventId) => API.get(`/registrations/event/${eventId}/participants`),
};

// ===== Attendance =====
export const attendanceAPI = {
  mark: (data) => API.post('/attendance', data),
  bulkMark: (data) => API.post('/attendance/bulk', data),
  getForEvent: (eventId, params) => API.get(`/attendance/event/${eventId}`, { params }),
  getMy: (params) => API.get('/attendance/my', { params }),
  getStats: (eventId) => API.get(`/attendance/event/${eventId}/stats`),
};

// ===== Feedback =====
export const feedbackAPI = {
  submit: (data) => API.post('/feedback', data),
  getAll: (params) => API.get('/feedback', { params }),
  getEventSummary: (eventId) => API.get(`/feedback/event/${eventId}/summary`),
  getMy: (params) => API.get('/feedback/my', { params }),
  check: (eventId) => API.get(`/feedback/check/${eventId}`),
};

// ===== Materials =====
export const materialsAPI = {
  upload: (eventId, formData) => {
    formData.append('eventId', eventId);
    return API.post('/materials', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getByEvent: (eventId) => API.get(`/materials/event/${eventId}`),
  download: (id) => API.get(`/materials/${id}/download`, { responseType: 'blob' }),
  delete: (id) => API.delete(`/materials/${id}`),
};

// ===== Notifications =====
export const notificationsAPI = {
  getMy: (params) => API.get('/notifications', { params }),
  markRead: (id) => API.put(`/notifications/${id}/read`),
  markAllRead: () => API.put('/notifications/read-all'),
  delete: (id) => API.delete(`/notifications/${id}`),
  send: (data) => API.post('/notifications/send', data),
};

// ===== Reports =====
export const reportsAPI = {
  getDashboard: () => API.get('/reports/dashboard'),
  getAttendance: (params) => API.get('/reports/attendance', { params }),
  getParticipation: () => API.get('/reports/participation'),
  getCompletion: () => API.get('/reports/completion'),
  getFeedback: () => API.get('/reports/feedback'),
  getTrainers: () => API.get('/reports/trainers'),
};

export default API;
