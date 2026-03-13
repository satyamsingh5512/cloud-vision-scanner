import axios from 'axios';

const apiBaseUrl = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: apiBaseUrl,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('qr_admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const adminLogin = (data) => api.post('/auth/login', data);

// Users
export const registerUser = (data) => api.post('/users/register', data);
export const bulkUploadUsers = (formData) => api.post('/users/bulk-upload', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const getAllUsers = () => api.get('/users');
export const deleteAllUsers = () => api.delete('/users');
export const getUserById = (userId) => api.get(`/users/${userId}`);
export const deleteUser = (userId) => api.delete(`/users/${userId}`);

// Scan
export const verifyScan = (data) => api.post('/scan/verify', data);

// Attendance
export const getAttendance = (params) => api.get('/attendance', { params });
export const getAttendanceStats = (params) => api.get('/attendance/stats', { params });
export const getAttendanceBySession = (id) => api.get(`/attendance/session/${id}`);
export const getAttendanceByGroup = (group) => api.get(`/attendance/group/${encodeURIComponent(group)}`);

export default api;
