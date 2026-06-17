const Topic = require("../models/topic.model");
const paginate = require("../utils/pagination.util");

/**
 * Helper to determine category for topic name if not provided
 */
const getTopicCategory = (topicName) => {
  if (topicName.includes(":")) {
    return topicName.split(":")[0].trim();
  }
  const topicLower = topicName.toLowerCase();
  if (topicLower.includes("concurrency") || topicLower.includes("channel")) return "Concurrency";
  if (topicLower.includes("test")) return "Testing";
  if (topicLower.includes("db") || topicLower.includes("sql") || topicLower.includes("mongo")) return "Database";
  if (topicLower.includes("docker") || topicLower.includes("kubernetes") || topicLower.includes("ci/cd")) return "DevOps";
  return "General Go Programming";
};

/**
 * Create Topic
 */
const create = async (topicData) => {
  const { name, category } = topicData;

  const topicExists = await Topic.findOne({ name });
  if (topicExists) {
    throw new Error("Topic already exists");
  }

  const finalCategory = category || getTopicCategory(name);

  return await Topic.create({
    name,
    category: finalCategory,
    popularity: 0,
  });
};

/**
 * Get All Topics (with sorting, searching, pagination)
 */
const getAll = async (queryParams) => {
  const filter = {};

  if (queryParams.search) {
    filter.name = { $regex: queryParams.search, $options: "i" };
  }

  const options = {
    page: queryParams.page,
    limit: queryParams.limit,
    sort: queryParams.sort || { name: 1 },
  };

  return await paginate(Topic, filter, options);
};

/**
 * Get Topic by Name
 */
const getByName = async (name) => {
  return await Topic.findOne({ name: new RegExp(`^${name}$`, "i") });
};

/**
 * Get Topics by Category
 */
const getByCategory = async (category) => {
  return await Topic.find({ category: new RegExp(`^${category}$`, "i") });
};

/**
 * Update Topic
 */
const update = async (name, updateData) => {
  const topic = await Topic.findOne({ name: new RegExp(`^${name}$`, "i") });
  if (!topic) {
    throw new Error("Topic not found");
  }

  Object.keys(updateData).forEach((key) => {
    topic[key] = updateData[key];
  });

  return await topic.save();
};

/**
 * Delete Topic (Soft Delete)
 */
const remove = async (name) => {
  const topic = await Topic.findOne({ name: new RegExp(`^${name}$`, "i") });
  if (!topic) {
    throw new Error("Topic not found");
  }

  topic.isDeleted = true;
  topic.deletedAt = new Date();
  await topic.save();
  return true;
};

/**
 * Get Popular Topics
 */
const getPopular = async (queryParams) => {
  const filter = {};
  const options = {
    page: queryParams.page || 1,
    limit: queryParams.limit || 10,
    sort: { popularity: -1 },
  };
  return await paginate(Topic, filter, options);
};

/**
 * Get Trending Topics
 */
const getTrending = async () => {
  return await Topic.find({ isTrending: true }).sort({ trendingScore: -1 });
};

module.exports = {
  create,
  getAll,
  getByName,
  getByCategory,
  update,
  remove,
  getPopular,
  getTrending,
};
