const searchService = require("../services/search.service");
const { sendSuccess, sendError } = require("../utils/response.util");
const { asyncHandler } = require("../middlewares/error.middleware");

/**
 * Search problems
 */
const searchProblems = asyncHandler(async (req, res) => {
  const { q } = req.query;
  if (!q) {
    return sendError(res, "Search query parameter 'q' is required.", null, 400);
  }
  const results = await searchService.searchProblems(q);
  return sendSuccess(res, `Problems search results for '${q}'`, results, 200);
});

/**
 * Search topics
 */
const searchTopics = asyncHandler(async (req, res) => {
  const { q } = req.query;
  if (!q) {
    return sendError(res, "Search query parameter 'q' is required.", null, 400);
  }
  const results = await searchService.searchTopics(q);
  return sendSuccess(res, `Topics search results for '${q}'`, results, 200);
});

/**
 * Search solutions
 */
const searchSolutions = asyncHandler(async (req, res) => {
  const { q } = req.query;
  if (!q) {
    return sendError(res, "Search query parameter 'q' is required.", null, 400);
  }
  const results = await searchService.searchSolutions(q);
  return sendSuccess(res, `Solutions search results for '${q}'`, results, 200);
});

/**
 * Search datasets
 */
const searchDatasets = asyncHandler(async (req, res) => {
  const { q } = req.query;
  if (!q) {
    return sendError(res, "Search query parameter 'q' is required.", null, 400);
  }
  const results = await searchService.searchDatasets(q);
  return sendSuccess(res, `Datasets search results for '${q}'`, results, 200);
});

module.exports = {
  searchProblems,
  searchTopics,
  searchSolutions,
  searchDatasets,
};
