const problemService = require("../services/problem.service");
const { sendSuccess, sendError } = require("../utils/response.util");
const { asyncHandler } = require("../middlewares/error.middleware");

/**
 * Fetch all coding problems (Supports filter, paginate, sort)
 */
const getAllProblems = asyncHandler(async (req, res) => {
  const result = await problemService.getAll(req.query);
  return sendSuccess(res, "Problems fetched successfully.", result, 200);
});

/**
 * Fetch single problem using ID
 */
const getProblemById = asyncHandler(async (req, res) => {
  const problem = await problemService.getById(req.params.problemId);
  if (!problem) {
    return sendError(res, "Problem not found", null, 404);
  }
  return sendSuccess(res, "Problem fetched successfully.", problem, 200);
});

/**
 * Create new coding problem
 */
const createProblem = asyncHandler(async (req, res) => {
  const problem = await problemService.create(req.body);
  return sendSuccess(res, "Problem created successfully.", problem, 201);
});

/**
 * Replace complete problem (PUT)
 */
const replaceProblem = asyncHandler(async (req, res) => {
  const problem = await problemService.update(req.params.problemId, req.body);
  return sendSuccess(res, "Problem replaced successfully.", problem, 200);
});

/**
 * Update problem fields (PATCH)
 */
const updateProblemFields = asyncHandler(async (req, res) => {
  const problem = await problemService.update(req.params.problemId, req.body);
  return sendSuccess(res, "Problem updated successfully.", problem, 200);
});

/**
 * Delete problem
 */
const deleteProblem = asyncHandler(async (req, res) => {
  await problemService.remove(req.params.problemId);
  return sendSuccess(res, "Problem deleted successfully.", null, 200);
});

/**
 * Fetch problems by topic
 */
const getProblemsByTopic = asyncHandler(async (req, res) => {
  const { topic } = req.params;
  const result = await problemService.getAll({ ...req.query, topic });
  return sendSuccess(res, `Problems for topic '${topic}' fetched successfully.`, result, 200);
});

/**
 * Fetch problems by difficulty
 */
const getProblemsByDifficulty = asyncHandler(async (req, res) => {
  const { difficulty } = req.params;
  const result = await problemService.getAll({ ...req.query, difficulty });
  return sendSuccess(res, `Problems for difficulty '${difficulty}' fetched successfully.`, result, 200);
});

/**
 * Fetch problems by source
 */
const getProblemsBySource = asyncHandler(async (req, res) => {
  const { source } = req.params;
  const result = await problemService.getAll({ ...req.query, source });
  return sendSuccess(res, `Problems for source '${source}' fetched successfully.`, result, 200);
});

/**
 * Fetch problems by keyword in instruction
 */
const getProblemsByKeyword = asyncHandler(async (req, res) => {
  const { keyword } = req.params;
  const result = await problemService.getAll({ ...req.query, keyword });
  return sendSuccess(res, `Problems for keyword '${keyword}' fetched successfully.`, result, 200);
});

/**
 * Fetch random problem
 */
const getRandomProblem = asyncHandler(async (req, res) => {
  const problem = await problemService.getRandom();
  if (!problem) {
    return sendError(res, "No problems found.", null, 404);
  }
  return sendSuccess(res, "Random problem fetched successfully.", problem, 200);
});

/**
 * Fetch trending problems
 */
const getTrendingProblems = asyncHandler(async (req, res) => {
  const problems = await problemService.getTrending();
  return sendSuccess(res, "Trending problems fetched successfully.", problems, 200);
});

/**
 * Fetch recent problems
 */
const getRecentProblems = asyncHandler(async (req, res) => {
  const problems = await problemService.getRecent(5);
  return sendSuccess(res, "Recent problems fetched successfully.", problems, 200);
});

/**
 * Bulk Import JSON problems
 */
const importProblemsJson = asyncHandler(async (req, res) => {
  const result = await problemService.importJson(req.body);
  return sendSuccess(res, "JSON dataset imported successfully.", result, 201);
});

module.exports = {
  getAllProblems,
  getProblemById,
  createProblem,
  replaceProblem,
  updateProblemFields,
  deleteProblem,
  getProblemsByTopic,
  getProblemsByDifficulty,
  getProblemsBySource,
  getProblemsByKeyword,
  getRandomProblem,
  getTrendingProblems,
  getRecentProblems,
  importProblemsJson,
};