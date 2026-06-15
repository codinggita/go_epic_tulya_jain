const datasetService = require("../services/dataset.service");
const { sendSuccess, sendError } = require("../utils/response.util");
const { asyncHandler } = require("../middlewares/error.middleware");

/**
 * Fetch all datasets
 */
const getAllDatasets = asyncHandler(async (req, res) => {
  const result = await datasetService.getAll(req.query);
  return sendSuccess(res, "Datasets fetched successfully.", result, 200);
});

/**
 * Fetch dataset using ID
 */
const getDatasetById = asyncHandler(async (req, res) => {
  const dataset = await datasetService.getById(req.params.datasetId);
  if (!dataset) {
    return sendError(res, "Dataset not found", null, 404);
  }
  return sendSuccess(res, "Dataset fetched successfully.", dataset, 200);
});

/**
 * Create new dataset
 */
const createDataset = asyncHandler(async (req, res) => {
  const dataset = await datasetService.create(req.body);
  return sendSuccess(res, "Dataset created successfully.", dataset, 201);
});

/**
 * Replace dataset
 */
const replaceDataset = asyncHandler(async (req, res) => {
  const dataset = await datasetService.update(req.params.datasetId, req.body);
  return sendSuccess(res, "Dataset replaced successfully.", dataset, 200);
});

/**
 * Update dataset (PATCH)
 */
const updateDataset = asyncHandler(async (req, res) => {
  const dataset = await datasetService.update(req.params.datasetId, req.body);
  return sendSuccess(res, "Dataset updated successfully.", dataset, 200);
});

/**
 * Delete dataset
 */
const deleteDataset = asyncHandler(async (req, res) => {
  await datasetService.remove(req.params.datasetId);
  return sendSuccess(res, "Dataset deleted successfully.", null, 200);
});

/**
 * Fetch datasets by source
 */
const getDatasetsBySource = asyncHandler(async (req, res) => {
  const { source } = req.params;
  const result = await datasetService.getAll({ ...req.query, source });
  return sendSuccess(res, `Datasets for source '${source}' fetched successfully.`, result, 200);
});

/**
 * Fetch datasets by topic
 */
const getDatasetsByTopic = asyncHandler(async (req, res) => {
  const { topic } = req.params;
  const result = await datasetService.getAll({ ...req.query, topic });
  return sendSuccess(res, `Datasets for topic '${topic}' fetched successfully.`, result, 200);
});

/**
 * Fetch datasets by difficulty
 */
const getDatasetsByDifficulty = asyncHandler(async (req, res) => {
  const { difficulty } = req.params;
  const result = await datasetService.getAll({ ...req.query, difficulty });
  return sendSuccess(res, `Datasets for difficulty '${difficulty}' fetched successfully.`, result, 200);
});

/**
 * Paginate latest datasets
 */
const getLatestDatasets = asyncHandler(async (req, res) => {
  const result = await datasetService.getLatest(req.query);
  return sendSuccess(res, "Latest datasets fetched successfully.", result, 200);
});

/**
 * Fetch recent datasets
 */
const getRecentDatasets = asyncHandler(async (req, res) => {
  const datasets = await datasetService.getRecent(5);
  return sendSuccess(res, "Recent datasets fetched successfully.", datasets, 200);
});

module.exports = {
  getAllDatasets,
  getDatasetById,
  createDataset,
  replaceDataset,
  updateDataset,
  deleteDataset,
  getDatasetsBySource,
  getDatasetsByTopic,
  getDatasetsByDifficulty,
  getLatestDatasets,
  getRecentDatasets,
};
