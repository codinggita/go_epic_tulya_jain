const statsService = require("../services/stats.service");
const { sendSuccess } = require("../utils/response.util");
const { asyncHandler } = require("../middlewares/error.middleware");

/**
 * Fetch problem statistics
 */
const getProblemStats = asyncHandler(async (req, res) => {
  const stats = await statsService.getProblemStats();
  return sendSuccess(res, "Problem stats fetched successfully.", stats, 200);
});

/**
 * Fetch topic statistics
 */
const getTopicStats = asyncHandler(async (req, res) => {
  const stats = await statsService.getTopicStats();
  return sendSuccess(res, "Topic stats fetched successfully.", stats, 200);
});

/**
 * Fetch difficulty statistics
 */
const getDifficultyStats = asyncHandler(async (req, res) => {
  const stats = await statsService.getDifficultyStats();
  return sendSuccess(res, "Difficulty stats fetched successfully.", stats, 200);
});

/**
 * Fetch dataset statistics
 */
const getDatasetStats = asyncHandler(async (req, res) => {
  const stats = await statsService.getDatasetStats();
  return sendSuccess(res, "Dataset stats fetched successfully.", stats, 200);
});

/**
 * Count advanced problems
 */
const getAdvancedProblemsCount = asyncHandler(async (req, res) => {
  const count = await statsService.getAdvancedProblemsCount();
  return sendSuccess(res, "Advanced problems count fetched successfully.", { count }, 200);
});

/**
 * Fetch concurrency topic stats
 */
const getTopicDetailStats = asyncHandler(async (req, res) => {
  const { topic } = req.params;
  const stats = await statsService.getTopicDetailStats(topic);
  return sendSuccess(res, `Topic detail stats for '${topic}' fetched successfully.`, stats, 200);
});

/**
 * Fetch source statistics
 */
const getSourceDetailStats = asyncHandler(async (req, res) => {
  const { source } = req.params;
  const stats = await statsService.getSourceDetailStats(source);
  return sendSuccess(res, `Source detail stats for '${source}' fetched successfully.`, stats, 200);
});

/**
 * Count total solutions
 */
const getTotalSolutionsCount = asyncHandler(async (req, res) => {
  const count = await statsService.getTotalSolutionsCount();
  return sendSuccess(res, "Total solutions count fetched successfully.", { count }, 200);
});

module.exports = {
  getProblemStats,
  getTopicStats,
  getDifficultyStats,
  getDatasetStats,
  getAdvancedProblemsCount,
  getTopicDetailStats,
  getSourceDetailStats,
  getTotalSolutionsCount,
};
