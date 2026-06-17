import api from './api';

// ---- Solutions (/solutions) ----

// GET /solutions?page=&limit=
export const getAllSolutions = (params) => api.get('/solutions', { params });

// GET /solutions/:solutionId
export const getSolutionById = (id) => api.get(`/solutions/${id}`);

// GET /solutions/random
export const getRandomSolution = () => api.get('/solutions/random');

// GET /solutions/trending
export const getTrendingSolutions = () => api.get('/solutions/trending');

// GET /solutions/recent
export const getRecentSolutions = () => api.get('/solutions/recent');

// GET /solutions/topic/:topic
export const getSolutionsByTopic = (topic, params) => api.get(`/solutions/topic/${topic}`, { params });

// GET /solutions/difficulty/:difficulty
export const getSolutionsByDifficulty = (difficulty, params) => api.get(`/solutions/difficulty/${difficulty}`, { params });

// GET /solutions/source/:source
export const getSolutionsBySource = (source, params) => api.get(`/solutions/source/${source}`, { params });

// POST /solutions
export const createSolution = (data) => api.post('/solutions', data);

// PUT /solutions/:solutionId
export const replaceSolution = (id, data) => api.put(`/solutions/${id}`, data);

// PATCH /solutions/:solutionId
export const updateSolution = (id, data) => api.patch(`/solutions/${id}`, data);

// DELETE /solutions/:solutionId
export const deleteSolution = (id) => api.delete(`/solutions/${id}`);
