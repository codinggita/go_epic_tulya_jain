const Solution = require("../models/solution.model");
const Problem = require("../models/problem.model");
const paginate = require("../utils/pagination.util");

/**
 * Create Solution
 */
const create = async (solutionData) => {
  const { output, problemId } = solutionData;

  const problem = await Problem.findById(problemId);
  if (!problem) {
    throw new Error("Problem referencing this solution does not exist.");
  }

  // Create Solution
  const solution = await Solution.create({
    output,
    topic: problem.topic,
    difficulty: problem.difficulty,
    source: problem.source,
    problemId,
  });

  // Link back to Problem
  problem.solutionId = solution._id;
  await problem.save();

  return solution;
};

/**
 * Get All Solutions (with pagination, sorting, filtering)
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
    filter.source = queryParams.source;
  }

  const options = {
    page: queryParams.page,
    limit: queryParams.limit,
    sort: queryParams.sort,
    populate: "problemId",
  };

  return await paginate(Solution, filter, options);
};

/**
 * Get Solution by ID
 */
const getById = async (id) => {
  return await Solution.findById(id).populate("problemId");
};

/**
 * Update Solution
 */
const update = async (id, updateData) => {
  const solution = await Solution.findById(id);
  if (!solution) {
    throw new Error("Solution not found");
  }

  Object.keys(updateData).forEach((key) => {
    solution[key] = updateData[key];
  });

  await solution.save();

  // If output updated, also update Problem's solution output representation if needed
  return await Solution.findById(id).populate("problemId");
};

/**
 * Delete Solution (Soft delete)
 */
const remove = async (id) => {
  const solution = await Solution.findById(id);
  if (!solution) {
    throw new Error("Solution not found");
  }

  solution.isDeleted = true;
  solution.deletedAt = new Date();
  await solution.save();
  return true;
};

/**
 * Get Random Solution
 */
const getRandom = async () => {
  const randomDocs = await Solution.aggregate([
    { $match: { isDeleted: { $ne: true } } },
    { $sample: { size: 1 } },
  ]);

  if (randomDocs.length === 0) {
    return null;
  }

  return await Solution.findById(randomDocs[0]._id).populate("problemId");
};

/**
 * Get Trending Solutions
 */
const getTrending = async () => {
  // Pull solutions for popular topics
  const ProblemModel = require("../models/problem.model");
  const trendingProblems = await ProblemModel.find().sort({ createdAt: -1 }).limit(10);
  const problemIds = trendingProblems.map((p) => p._id);

  return await Solution.find({ problemId: { $in: problemIds } }).populate("problemId");
};

module.exports = {
  create,
  getAll,
  getById,
  update,
  remove,
  getRandom,
  getTrending,
};
