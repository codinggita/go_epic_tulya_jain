import api from './api';

// ---- Datasets (/datasets) ----

// GET /datasets?page=&limit=
export const getAllDatasets = (params) => api.get('/datasets', { params });

// GET /datasets/:datasetId
export const getDatasetById = (id) => api.get(`/datasets/${id}`);

// GET /datasets/latest
export const getLatestDatasets = () => api.get('/datasets/latest');

// GET /datasets/recent
export const getRecentDatasets = () => api.get('/datasets/recent');

// GET /datasets/source/:source
export const getDatasetsBySource = (source, params) => api.get(`/datasets/source/${source}`, { params });

// GET /datasets/topic/:topic
export const getDatasetsByTopic = (topic, params) => api.get(`/datasets/topic/${topic}`, { params });

// GET /datasets/difficulty/:difficulty
export const getDatasetsByDifficulty = (difficulty, params) => api.get(`/datasets/difficulty/${difficulty}`, { params });

// POST /datasets
export const createDataset = (data) => api.post('/datasets', data);

// PUT /datasets/:datasetId
export const replaceDataset = (id, data) => api.put(`/datasets/${id}`, data);

// PATCH /datasets/:datasetId
export const updateDataset = (id, data) => api.patch(`/datasets/${id}`, data);

// DELETE /datasets/:datasetId
export const deleteDataset = (id) => api.delete(`/datasets/${id}`);
