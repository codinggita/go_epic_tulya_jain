const solutionService = require("../services/solution.service");
const { sendSuccess, sendError } = require("../utils/response.util");
const { asyncHandler } = require("../middlewares/error.middleware");

/**
 * Fetch all solutions
 */
const getAllSolutions = asyncHandler(async (req, res) => {
  const result = await solutionService.getAll(req.query);
  return sendSuccess(res, "Solutions fetched successfully.", result, 200);
});

/**
 * Fetch solution using ID
 */
const getSolutionById = asyncHandler(async (req, res) => {
  const solution = await solutionService.getById(req.params.solutionId);
  if (!solution) {
    return sendError(res, "Solution not found", null, 404);
  }
  return sendSuccess(res, "Solution fetched successfully.", solution, 200);
});

/**
 * Create new solution
 */
const createSolution = asyncHandler(async (req, res) => {
  const solution = await solutionService.create(req.body);
  return sendSuccess(res, "Solution created successfully.", solution, 201);
});

/**
 * Replace solution
 */
const replaceSolution = asyncHandler(async (req, res) => {
  const solution = await solutionService.update(req.params.solutionId, req.body);
  return sendSuccess(res, "Solution replaced successfully.", solution, 200);
});

/**
 * Update solution (PATCH)
 */
const updateSolution = asyncHandler(async (req, res) => {
  const solution = await solutionService.update(req.params.solutionId, req.body);
  return sendSuccess(res, "Solution updated successfully.", solution, 200);
});

/**
 * Delete solution
 */
const deleteSolution = asyncHandler(async (req, res) => {
  await solutionService.remove(req.params.solutionId);
  return sendSuccess(res, "Solution deleted successfully.", null, 200);
});

/**
 * Fetch solutions by topic
 */
const getSolutionsByTopic = asyncHandler(async (req, res) => {
  const { topic } = req.params;
  const result = await solutionService.getAll({ ...req.query, topic });
  return sendSuccess(res, `Solutions for topic '${topic}' fetched successfully.`, result, 200);
});

/**
 * Fetch solutions by difficulty
 */
const getSolutionsByDifficulty = asyncHandler(async (req, res) => {
  const { difficulty } = req.params;
  const result = await solutionService.getAll({ ...req.query, difficulty });
  return sendSuccess(res, `Solutions for difficulty '${difficulty}' fetched successfully.`, result, 200);
});

/**
 * Fetch solutions by source
 */
const getSolutionsBySource = asyncHandler(async (req, res) => {
  const { source } = req.params;
  const result = await solutionService.getAll({ ...req.query, source });
  return sendSuccess(res, `Solutions for source '${source}' fetched successfully.`, result, 200);
});

/**
 * Fetch random solution
 */
const getRandomSolution = asyncHandler(async (req, res) => {
  const solution = await solutionService.getRandom();
  if (!solution) {
    return sendError(res, "No solutions found.", null, 404);
  }
  return sendSuccess(res, "Random solution fetched successfully.", solution, 200);
});

/**
 * Fetch trending solutions
 */
const getTrendingSolutions = asyncHandler(async (req, res) => {
  const solutions = await solutionService.getTrending();
  return sendSuccess(res, "Trending solutions fetched successfully.", solutions, 200);
});

/**
 * Fetch recent solutions (Paginated)
 */
const getRecentSolutions = asyncHandler(async (req, res) => {
  const result = await solutionService.getAll({
    ...req.query,
    sort: "-createdAt",
  });
  return sendSuccess(res, "Recent solutions fetched successfully.", result, 200);
});

module.exports = {
  getAllSolutions,
  getSolutionById,
  createSolution,
  replaceSolution,
  updateSolution,
  deleteSolution,
  getSolutionsByTopic,
  getSolutionsByDifficulty,
  getSolutionsBySource,
  getRandomSolution,
  getTrendingSolutions,
  getRecentSolutions,
};
