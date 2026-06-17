import api from './api';

// POST /auth/register
export const register = (data) => api.post('/auth/register', data);

// POST /auth/login
export const login = (data) => api.post('/auth/login', data);

// POST /auth/logout
export const logout = (refreshToken) => api.post('/auth/logout', { refreshToken });

// GET /auth/profile
export const getProfile = () => api.get('/auth/profile');

// PATCH /auth/profile
export const updateProfile = (data) => api.patch('/auth/profile', data);

// POST /auth/forgot-password
export const forgotPassword = (email) => api.post('/auth/forgot-password', { email });

// POST /auth/reset-password
export const resetPassword = (data) => api.post('/auth/reset-password', data);

// POST /auth/send-otp
export const sendOtp = (email) => api.post('/auth/send-otp', { email });

// POST /auth/verify-otp
export const verifyOtp = (data) => api.post('/auth/verify-otp', data);

// POST /auth/refresh-token
export const refreshToken = (token) => api.post('/auth/refresh-token', { refreshToken: token });

// ---- Admin User Management ----

// GET /admin/users
export const getAllUsers = (params) => api.get('/admin/users', { params });

// POST /admin/users
export const createUserAdmin = (data) => api.post('/admin/users', data);

// PATCH /admin/users/:id
export const updateUserAdmin = (id, data) => api.patch(`/admin/users/${id}`, data);

// DELETE /admin/users/:id
export const deleteUserAdmin = (id) => api.delete(`/admin/users/${id}`);
