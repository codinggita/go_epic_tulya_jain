const mongoose = require("mongoose");
const Problem = require("../models/problem.model");
const Solution = require("../models/solution.model");
const Dataset = require("../models/dataset.model");
const Topic = require("../models/topic.model");
const paginate = require("../utils/pagination.util");

/**
 * Helper to update Topic Popularity
 */
const updateTopicPopularity = async (topicName) => {
  const count = await Problem.countDocuments({ topic: topicName });
  const TopicModel = mongoose.model("Topic");
  await TopicModel.findOneAndUpdate(
    { name: topicName },
    { $set: { popularity: count } },
    { upsert: true }
  );
};

/**
 * Create Problem (with cascade to Solution & Dataset)
 */
const create = async (problemData) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { instruction, topic, difficulty, source, output } = problemData;

    const problemId = new mongoose.Types.ObjectId();
    const solutionId = new mongoose.Types.ObjectId();

    // 1. Create Solution first
    const solution = new Solution({
      _id: solutionId,
      output: output || "No solution provided yet.",
      topic,
      difficulty,
      source,
      problemId,
    });
    await solution.save({ session });

    // 2. Create Problem referencing Solution
    const problem = new Problem({
      _id: problemId,
      instruction,
      topic,
      difficulty,
      source,
      solutionId,
    });
    await problem.save({ session });

    // 3. Create Dataset entry
    const dataset = new Dataset({
      source,
      topic,
      difficulty,
      problemId,
      solutionId,
    });
    await dataset.save({ session });

    await session.commitTransaction();
    session.endSession();

    // Update Topic popularity in background
    updateTopicPopularity(topic).catch(console.error);

    return problem;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

/**
 * Get All Problems (with pagination, filtering, search, and sorting)
 */
const getAll = async (queryParams) => {
  const filter = {};

  // Filtering
  if (queryParams.difficulty) {
    filter.difficulty = new RegExp(`^${queryParams.difficulty}$`, "i");
  }
  if (queryParams.topic) {
    filter.topic = new RegExp(`^${queryParams.topic}$`, "i");
  }
  if (queryParams.source) {
    filter.source = queryParams.source;
  }

  // Regex Search
  if (queryParams.keyword) {
    filter.instruction = { $regex: queryParams.keyword, $options: "i" };
  }

  const options = {
    page: queryParams.page,
    limit: queryParams.limit,
    sort: queryParams.sort,
    populate: "solutionId",
  };

  return await paginate(Problem, filter, options);
};

/**
 * Get Problem by ID
 */
const getById = async (id) => {
  const problem = await Problem.findById(id).populate("solutionId");
  return problem;
};

/**
 * Update Problem (Cascade fields to Solution/Dataset if changed)
 */
const update = async (id, updateData) => {
  const problem = await Problem.findById(id);
  if (!problem) {
    throw new Error("Problem not found");
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const originalTopic = problem.topic;

    // Update problem document
    Object.keys(updateData).forEach((key) => {
      if (key !== "output") {
        problem[key] = updateData[key];
      }
    });
    await problem.save({ session });

    // Update corresponding Solution and Dataset if topic/difficulty/source/output updated
    const solutionUpdates = {};
    const datasetUpdates = {};

    if (updateData.output) solutionUpdates.output = updateData.output;
    if (updateData.topic) {
      solutionUpdates.topic = updateData.topic;
      datasetUpdates.topic = updateData.topic;
    }
    if (updateData.difficulty) {
      solutionUpdates.difficulty = updateData.difficulty;
      datasetUpdates.difficulty = updateData.difficulty;
    }
    if (updateData.source) {
      solutionUpdates.source = updateData.source;
      datasetUpdates.source = updateData.source;
    }

    if (Object.keys(solutionUpdates).length > 0) {
      await Solution.findOneAndUpdate({ problemId: id }, { $set: solutionUpdates }, { session });
    }

    if (Object.keys(datasetUpdates).length > 0) {
      await Dataset.findOneAndUpdate({ problemId: id }, { $set: datasetUpdates }, { session });
    }

    await session.commitTransaction();
    session.endSession();

    // Recalculate topic popularity if changed
    if (updateData.topic && updateData.topic !== originalTopic) {
      updateTopicPopularity(originalTopic).catch(console.error);
      updateTopicPopularity(updateData.topic).catch(console.error);
    }

    return await Problem.findById(id).populate("solutionId");
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

/**
 * Delete Problem (Soft delete cascade)
 */
const remove = async (id) => {
  const problem = await Problem.findById(id);
  if (!problem) {
    throw new Error("Problem not found");
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Soft delete problem
    problem.isDeleted = true;
    problem.deletedAt = new Date();
    await problem.save({ session });

    // Soft delete corresponding Solution
    await Solution.findOneAndUpdate(
      { problemId: id },
      { $set: { isDeleted: true, deletedAt: new Date() } },
      { session }
    );

    // Soft delete corresponding Dataset
    await Dataset.findOneAndUpdate(
      { problemId: id },
      { $set: { isDeleted: true, deletedAt: new Date() } },
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    // Recalculate topic popularity
    updateTopicPopularity(problem.topic).catch(console.error);

    return true;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

/**
 * Get Random Problem
 */
const getRandom = async () => {
  const randomDocs = await Problem.aggregate([
    { $match: { isDeleted: { $ne: true } } },
    { $sample: { size: 1 } },
  ]);

  if (randomDocs.length === 0) {
    return null;
  }

  // Populate solution manually after aggregation
  return await Problem.findById(randomDocs[0]._id).populate("solutionId");
};

/**
 * Get Trending Problems
 */
const getTrending = async () => {
  // Return some popular problems based on popular topics
  const trendingTopics = await Topic.find({ isDeleted: { $ne: true } })
    .sort({ popularity: -1 })
    .limit(5);

  const topics = trendingTopics.map((t) => t.name);

  // Return problems matching trending topics
  return await Problem.find({ topic: { $in: topics } })
    .limit(10)
    .populate("solutionId");
};

/**
 * Get Recent Problems
 */
const getRecent = async (limit = 10) => {
  return await Problem.find().sort({ createdAt: -1 }).limit(limit).populate("solutionId");
};

/**
 * Import JSON dataset
 */
const importJson = async (items) => {
  const problemsToCreate = [];
  const solutionsToCreate = [];
  const datasetsToCreate = [];
  const topicCounts = {};

  items.forEach((item) => {
    const problemId = new mongoose.Types.ObjectId();
    const solutionId = new mongoose.Types.ObjectId();
    const source = item.dataset_source || "imported";
    const topic = item.topic || "general";
    const difficulty = item.difficulty || "medium";

    topicCounts[topic] = (topicCounts[topic] || 0) + 1;

    problemsToCreate.push({
      _id: problemId,
      instruction: item.instruction,
      topic,
      difficulty,
      source,
      solutionId,
    });

    solutionsToCreate.push({
      _id: solutionId,
      output: item.output,
      topic,
      difficulty,
      source,
      problemId,
    });

    datasetsToCreate.push({
      source,
      topic,
      difficulty,
      problemId,
      solutionId,
    });
  });

  // Bulk write to MongoDB
  await Promise.all([
    Problem.insertMany(problemsToCreate),
    Solution.insertMany(solutionsToCreate),
    Dataset.insertMany(datasetsToCreate),
  ]);

  // Update topics and popularity
  const TopicModel = mongoose.model("Topic");
  for (const topicName of Object.keys(topicCounts)) {
    const count = await Problem.countDocuments({ topic: topicName });
    
    // Simple category derivation
    let category = "General Go Programming";
    if (topicName.includes(":")) {
      category = topicName.split(":")[0].trim();
    }

    await TopicModel.findOneAndUpdate(
      { name: topicName },
      { 
        $set: { popularity: count },
        $setOnInsert: { category, isTrending: false, trendingScore: 0 }
      },
      { upsert: true }
    );
  }

  return {
    importedCount: items.length,
  };
};

module.exports = {
  create,
  getAll,
  getById,
  update,
  remove,
  getRandom,
  getTrending,
  getRecent,
  importJson,
};
