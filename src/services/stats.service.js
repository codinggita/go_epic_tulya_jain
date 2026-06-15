const Problem = require("../models/problem.model");
const Topic = require("../models/topic.model");
const Solution = require("../models/solution.model");
const Dataset = require("../models/dataset.model");

/**
 * Get Problem Stats (grouped by difficulty and source)
 */
const getProblemStats = async () => {
  return await Problem.aggregate([
    { $match: { isDeleted: { $ne: true } } },
    {
      $group: {
        _id: { difficulty: "$difficulty", source: "$source" },
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        difficulty: "$_id.difficulty",
        source: "$_id.source",
        count: 1,
      },
    },
    { $sort: { source: 1, difficulty: 1 } },
  ]);
};

/**
 * Get Topic Stats (grouped by category, total count, and average popularity)
 */
const getTopicStats = async () => {
  return await Topic.aggregate([
    { $match: { isDeleted: { $ne: true } } },
    {
      $group: {
        _id: "$category",
        count: { $sum: 1 },
        avgPopularity: { $avg: "$popularity" },
      },
    },
    {
      $project: {
        _id: 0,
        category: "$_id",
        count: 1,
        avgPopularity: { $round: ["$avgPopularity", 1] },
      },
    },
    { $sort: { count: -1 } },
  ]);
};

/**
 * Get Difficulty Stats (count of problems per difficulty)
 */
const getDifficultyStats = async () => {
  return await Problem.aggregate([
    { $match: { isDeleted: { $ne: true } } },
    {
      $group: {
        _id: "$difficulty",
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        difficulty: "$_id",
        count: 1,
      },
    },
    { $sort: { count: -1 } },
  ]);
};

/**
 * Get Dataset Stats (datasets grouped by source and difficulty)
 */
const getDatasetStats = async () => {
  return await Dataset.aggregate([
    { $match: { isDeleted: { $ne: true } } },
    {
      $group: {
        _id: { source: "$source", difficulty: "$difficulty" },
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        source: "$_id.source",
        difficulty: "$_id.difficulty",
        count: 1,
      },
    },
    { $sort: { source: 1, count: -1 } },
  ]);
};

/**
 * Count advanced problems (difficulty = advanced)
 */
const getAdvancedProblemsCount = async () => {
  const result = await Problem.aggregate([
    { $match: { difficulty: "advanced", isDeleted: { $ne: true } } },
    { $count: "count" },
  ]);
  return result[0] ? result[0].count : 0;
};

/**
 * Fetch concurrency topic stats (specifically for topic concurrency-patterns or generic query)
 */
const getTopicDetailStats = async (topicName) => {
  const stats = await Problem.aggregate([
    { $match: { topic: topicName, isDeleted: { $ne: true } } },
    {
      $group: {
        _id: "$topic",
        totalProblems: { $sum: 1 },
        difficulties: { $addToSet: "$difficulty" },
        sources: { $addToSet: "$source" },
      },
    },
    {
      $project: {
        _id: 0,
        topic: "$_id",
        totalProblems: 1,
        difficulties: 1,
        sources: 1,
      },
    },
  ]);

  if (stats.length === 0) {
    return {
      topic: topicName,
      totalProblems: 0,
      difficulties: [],
      sources: [],
    };
  }
  return stats[0];
};

/**
 * Fetch source statistics
 */
const getSourceDetailStats = async (sourceName) => {
  const stats = await Problem.aggregate([
    { $match: { source: sourceName, isDeleted: { $ne: true } } },
    {
      $group: {
        _id: "$source",
        totalProblems: { $sum: 1 },
        topics: { $addToSet: "$topic" },
        difficulties: { $addToSet: "$difficulty" },
      },
    },
    {
      $project: {
        _id: 0,
        source: "$_id",
        totalProblems: 1,
        totalTopics: { $size: "$topics" },
        difficulties: 1,
      },
    },
  ]);

  if (stats.length === 0) {
    return {
      source: sourceName,
      totalProblems: 0,
      totalTopics: 0,
      difficulties: [],
    };
  }
  return stats[0];
};

/**
 * Count total solutions
 */
const getTotalSolutionsCount = async () => {
  return await Solution.countDocuments({ isDeleted: { $ne: true } });
};

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
