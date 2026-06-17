import api from './api';

// ---- Problems (/problems) ----

// GET /problems?page=&limit=&topic=&difficulty=&source=
export const getAllProblems = (params) => api.get('/problems', { params });

// GET /problems/:problemId
export const getProblemById = (id) => api.get(`/problems/${id}`);

// GET /problems/random
export const getRandomProblem = () => api.get('/problems/random');

// GET /problems/trending
export const getTrendingProblems = () => api.get('/problems/trending');

// GET /problems/recent
export const getRecentProblems = () => api.get('/problems/recent');

// GET /problems/advanced
export const getAdvancedProblems = (params) => api.get('/problems/advanced', { params });

// GET /problems/topic/:topic
export const getProblemsByTopic = (topic, params) => api.get(`/problems/topic/${topic}`, { params });

// GET /problems/difficulty/:difficulty
export const getProblemsByDifficulty = (difficulty, params) => api.get(`/problems/difficulty/${difficulty}`, { params });

// GET /problems/source/:source
export const getProblemsBySource = (source, params) => api.get(`/problems/source/${source}`, { params });

// GET /problems/instruction/:keyword
export const getProblemsByKeyword = (keyword, params) => api.get(`/problems/instruction/${keyword}`, { params });

// POST /problems
export const createProblem = (data) => api.post('/problems', data);

// PUT /problems/:problemId
export const replaceProblem = (id, data) => api.put(`/problems/${id}`, data);

// PATCH /problems/:problemId
export const updateProblem = (id, data) => api.patch(`/problems/${id}`, data);

// DELETE /problems/:problemId
export const deleteProblem = (id) => api.delete(`/problems/${id}`);

// POST /problems/import-json
export const importProblemsJson = (data) => api.post('/problems/import-json', data);
