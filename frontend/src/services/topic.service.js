import api from './api';

// ---- Topics (/topics) ----

// GET /topics?limit=
export const getAllTopics = (params) => api.get('/topics', { params });

// GET /topics/popular
export const getPopularTopics = () => api.get('/topics/popular');

// GET /topics/trending
export const getTrendingTopics = () => api.get('/topics/trending');

// GET /topics/name/:name
export const getTopicByName = (name) => api.get(`/topics/name/${name}`);

// GET /topics/category/:category
export const getTopicsByCategory = (category) => api.get(`/topics/category/${category}`);

// GET /topics/:topicName
export const getTopicById = (name) => api.get(`/topics/${name}`);

// POST /topics
export const createTopic = (data) => api.post('/topics', data);

// PUT /topics/:topicName
export const replaceTopic = (name, data) => api.put(`/topics/${name}`, data);

// PATCH /topics/:topicName
export const updateTopic = (name, data) => api.patch(`/topics/${name}`, data);

// DELETE /topics/:topicName
export const deleteTopic = (name) => api.delete(`/topics/${name}`);
