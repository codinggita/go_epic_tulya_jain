const Dataset = require("../models/dataset.model");
const paginate = require("../utils/pagination.util");

/**
 * Create Dataset
 */
const create = async (datasetData) => {
  return await Dataset.create(datasetData);
};

/**
 * Get All Datasets (with pagination, sorting, filtering)
 */
const getAll = async (queryParams) => {
  const filter = {};

  if (queryParams.difficulty) {
    filter.difficulty = new RegExp(`^${queryParams.difficulty}$`, "i");
  }
  if (queryParams.topic) {
    filter.topic = new RegExp(`^${queryParams.topic}$`, "i");
  }
  if (queryParams.source) {
    // Exact or regex matching depending on query style
    filter.source = queryParams.source;
  }

  const options = {
    page: queryParams.page,
    limit: queryParams.limit,
    sort: queryParams.sort,
    populate: ["problemId", "solutionId"],
  };

  return await paginate(Dataset, filter, options);
};

/**
 * Get Dataset by ID
 */
const getById = async (id) => {
  return await Dataset.findById(id).populate(["problemId", "solutionId"]);
};

/**
 * Update Dataset
 */
const update = async (id, updateData) => {
  const dataset = await Dataset.findById(id);
  if (!dataset) {
    throw new Error("Dataset not found");
  }

  Object.keys(updateData).forEach((key) => {
    dataset[key] = updateData[key];
  });

  await dataset.save();
  return await Dataset.findById(id).populate(["problemId", "solutionId"]);
};

/**
 * Delete Dataset (Soft Delete)
 */
const remove = async (id) => {
  const dataset = await Dataset.findById(id);
  if (!dataset) {
    throw new Error("Dataset not found");
  }

  dataset.isDeleted = true;
  dataset.deletedAt = new Date();
  await dataset.save();
  return true;
};

/**
 * Get Latest Datasets (with pagination support)
 */
const getLatest = async (queryParams) => {
  const filter = {};
  const options = {
    page: queryParams.page || 1,
    limit: queryParams.limit || 5,
    sort: { createdAt: -1 },
    populate: ["problemId", "solutionId"],
  };

  return await paginate(Dataset, filter, options);
};

/**
 * Get Recent Datasets
 */
const getRecent = async (limit = 10) => {
  return await Dataset.find().sort({ createdAt: -1 }).limit(limit).populate(["problemId", "solutionId"]);
};

module.exports = {
  create,
  getAll,
  getById,
  update,
  remove,
  getLatest,
  getRecent,
};
