import api from './api';

// ---- Stats (/stats) ----

// GET /stats/problems
export const getProblemStats = () => api.get('/stats/problems');

// GET /stats/topics
export const getTopicStats = () => api.get('/stats/topics');

// GET /stats/difficulties
export const getDifficultyStats = () => api.get('/stats/difficulties');

// GET /stats/datasets
export const getDatasetStats = () => api.get('/stats/datasets');

// GET /stats/advanced-problems
export const getAdvancedProblemsCount = () => api.get('/stats/advanced-problems');

// GET /stats/total-solutions
export const getTotalSolutionsCount = () => api.get('/stats/total-solutions');

// GET /stats/topic/:topic
export const getTopicDetailStats = (topic) => api.get(`/stats/topic/${topic}`);

// GET /stats/source/:source
export const getSourceDetailStats = (source) => api.get(`/stats/source/${source}`);

// ---- Health (/health, /metrics, /server-status) ----

// GET /health
export const getHealth = () => api.get('/health');

// GET /metrics
export const getMetrics = () => api.get('/metrics');

// GET /server-status
export const getServerStatus = () => api.get('/server-status');

// ---- Search (/search) ----

// GET /search/problems?q=
export const searchProblems = (q, params) => api.get('/search/problems', { params: { q, ...params } });

// GET /search/topics?q=
export const searchTopics = (q) => api.get('/search/topics', { params: { q } });

// GET /search/solutions?q=
export const searchSolutions = (q) => api.get('/search/solutions', { params: { q } });

// GET /search/datasets?q=
export const searchDatasets = (q) => api.get('/search/datasets', { params: { q } });
