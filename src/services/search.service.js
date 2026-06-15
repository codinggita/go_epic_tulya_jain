const Problem = require("../models/problem.model");
const Topic = require("../models/topic.model");
const Solution = require("../models/solution.model");
const Dataset = require("../models/dataset.model");

/**
 * Search Problems
 */
const searchProblems = async (query) => {
  return await Problem.find({
    $or: [
      { instruction: { $regex: query, $options: "i" } },
      { topic: { $regex: query, $options: "i" } },
    ],
  }).populate("solutionId");
};

/**
 * Search Topics
 */
const searchTopics = async (query) => {
  return await Topic.find({
    $or: [
      { name: { $regex: query, $options: "i" } },
      { category: { $regex: query, $options: "i" } },
    ],
  });
};

/**
 * Search Solutions
 */
const searchSolutions = async (query) => {
  return await Solution.find({
    $or: [
      { output: { $regex: query, $options: "i" } },
      { topic: { $regex: query, $options: "i" } },
    ],
  }).populate("problemId");
};

/**
 * Search Datasets
 */
const searchDatasets = async (query) => {
  return await Dataset.find({
    $or: [
      { source: { $regex: query, $options: "i" } },
      { topic: { $regex: query, $options: "i" } },
      { difficulty: { $regex: query, $options: "i" } },
    ],
  }).populate(["problemId", "solutionId"]);
};

module.exports = {
  searchProblems,
  searchTopics,
  searchSolutions,
  searchDatasets,
};
