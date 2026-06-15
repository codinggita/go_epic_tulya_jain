const topicService = require("../services/topic.service");
const { sendSuccess, sendError } = require("../utils/response.util");
const { asyncHandler } = require("../middlewares/error.middleware");

/**
 * Fetch all topics
 */
const getAllTopics = asyncHandler(async (req, res) => {
  const result = await topicService.getAll(req.query);
  return sendSuccess(res, "Topics fetched successfully.", result, 200);
});

/**
 * Fetch single topic using topicName
 */
const getTopicByName = asyncHandler(async (req, res) => {
  const name = req.params.topicName || req.params.name;
  const topic = await topicService.getByName(name);
  if (!topic) {
    return sendError(res, "Topic not found", null, 404);
  }
  return sendSuccess(res, "Topic fetched successfully.", topic, 200);
});

/**
 * Create new topic
 */
const createTopic = asyncHandler(async (req, res) => {
  const topic = await topicService.create(req.body);
  return sendSuccess(res, "Topic created successfully.", topic, 201);
});

/**
 * Replace topic
 */
const replaceTopic = asyncHandler(async (req, res) => {
  const name = req.params.topicName;
  const topic = await topicService.update(name, req.body);
  return sendSuccess(res, "Topic replaced successfully.", topic, 200);
});

/**
 * Update topic (PATCH)
 */
const updateTopic = asyncHandler(async (req, res) => {
  const name = req.params.topicName;
  const topic = await topicService.update(name, req.body);
  return sendSuccess(res, "Topic updated successfully.", topic, 200);
});

/**
 * Delete topic
 */
const deleteTopic = asyncHandler(async (req, res) => {
  const name = req.params.topicName;
  await topicService.remove(name);
  return sendSuccess(res, "Topic deleted successfully.", null, 200);
});

/**
 * Fetch topics by category
 */
const getTopicsByCategory = asyncHandler(async (req, res) => {
  const { category } = req.params;
  const topics = await topicService.getByCategory(category);
  return sendSuccess(res, `Topics for category '${category}' fetched successfully.`, topics, 200);
});

/**
 * Paginate popular topics
 */
const getPopularTopics = asyncHandler(async (req, res) => {
  const result = await topicService.getPopular(req.query);
  return sendSuccess(res, "Popular topics fetched successfully.", result, 200);
});

/**
 * Fetch trending topics
 */
const getTrendingTopics = asyncHandler(async (req, res) => {
  const topics = await topicService.getTrending();
  return sendSuccess(res, "Trending topics fetched successfully.", topics, 200);
});

module.exports = {
  getAllTopics,
  getTopicByName,
  createTopic,
  replaceTopic,
  updateTopic,
  deleteTopic,
  getTopicsByCategory,
  getPopularTopics,
  getTrendingTopics,
};
