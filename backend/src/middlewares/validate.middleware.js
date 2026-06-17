const mongoose = require("mongoose");
const { sendError } = require("../utils/response.util");

/**
 * Helper to validate MongoDB ObjectId
 */
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

/**
 * Register validation
 */
const validateRegister = (req, res, next) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return sendError(res, "Username, email, and password are required.", null, 400);
  }

  // Basic email regex check
  const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  if (!emailRegex.test(email)) {
    return sendError(res, "Please provide a valid email address.", null, 400);
  }

  if (password.length < 6) {
    return sendError(res, "Password must be at least 6 characters long.", null, 400);
  }

  next();
};

/**
 * Login validation
 */
const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return sendError(res, "Email and password are required.", null, 400);
  }

  next();
};

/**
 * Problem validation
 */
const validateProblem = (req, res, next) => {
  const { instruction, topic, difficulty, source } = req.body;
  const dataset_source = req.body.dataset_source || source;

  if (!instruction || !topic || !difficulty || !dataset_source) {
    return sendError(
      res,
      "Instruction, topic, difficulty, and source (or dataset_source) are required.",
      null,
      400
    );
  }

  const validDiffs = ["easy", "medium", "advanced", "beginner", "hard", "intermediate"];
  if (!validDiffs.includes(difficulty.toLowerCase())) {
    return sendError(
      res,
      `Difficulty must be one of: ${validDiffs.join(", ")}`,
      null,
      400
    );
  }

  next();
};

/**
 * Problem Update validation
 */
const validateUpdateProblem = (req, res, next) => {
  const { difficulty } = req.body;

  if (difficulty) {
    const validDiffs = ["easy", "medium", "advanced", "beginner", "hard", "intermediate"];
    if (!validDiffs.includes(difficulty.toLowerCase())) {
      return sendError(
        res,
        `Difficulty must be one of: ${validDiffs.join(", ")}`,
        null,
        400
      );
    }
  }

  next();
};

/**
 * Topic validation
 */
const validateTopic = (req, res, next) => {
  const { name } = req.body;

  if (!name || typeof name !== "string" || name.trim() === "") {
    return sendError(res, "Topic name is required and must be a non-empty string.", null, 400);
  }

  next();
};

/**
 * Solution validation
 */
const validateSolution = (req, res, next) => {
  const { output, problemId } = req.body;

  if (!output || !problemId) {
    return sendError(res, "Output and problemId are required.", null, 400);
  }

  if (!isValidObjectId(problemId)) {
    return sendError(res, "Invalid problemId format.", null, 400);
  }

  next();
};

/**
 * Dataset validation
 */
const validateDataset = (req, res, next) => {
  const { source, topic, difficulty, problemId, solutionId } = req.body;

  if (!source) {
    return sendError(res, "Dataset source is required.", null, 400);
  }

  if (topic && typeof topic !== "string") {
    return sendError(res, "Topic must be a string.", null, 400);
  }

  if (difficulty) {
    const validDiffs = ["easy", "medium", "advanced", "beginner", "hard", "intermediate"];
    if (!validDiffs.includes(difficulty.toLowerCase())) {
      return sendError(
        res,
        `Difficulty must be one of: ${validDiffs.join(", ")}`,
        null,
        400
      );
    }
  }

  if (problemId && !isValidObjectId(problemId)) {
    return sendError(res, "Invalid problemId format.", null, 400);
  }

  if (solutionId && !isValidObjectId(solutionId)) {
    return sendError(res, "Invalid solutionId format.", null, 400);
  }

  next();
};

/**
 * Dataset update validation - Prevent invalid fields
 */
const validateUpdateDataset = (req, res, next) => {
  const allowedUpdates = ["source", "topic", "difficulty", "problemId", "solutionId"];
  const updates = Object.keys(req.body);

  const isValidOperation = updates.every((update) => allowedUpdates.includes(update));
  if (!isValidOperation) {
    return sendError(res, "Invalid update fields. Operations restricted.", null, 400);
  }

  if (req.body.problemId && !isValidObjectId(req.body.problemId)) {
    return sendError(res, "Invalid problemId format.", null, 400);
  }

  if (req.body.solutionId && !isValidObjectId(req.body.solutionId)) {
    return sendError(res, "Invalid solutionId format.", null, 400);
  }

  next();
};

/**
 * Import JSON validation
 */
const validateImportJson = (req, res, next) => {
  const items = req.body;

  if (!Array.isArray(items)) {
    return sendError(res, "Import payload must be a JSON array.", null, 400);
  }

  if (items.length === 0) {
    return sendError(res, "Import payload cannot be empty.", null, 400);
  }

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (!item.instruction || !item.output || !item.topic || !item.difficulty || !item.dataset_source) {
      return sendError(
        res,
        `Validation failed at index ${i}: instruction, output, topic, difficulty, and dataset_source are required.`,
        null,
        400
      );
    }
  }

  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validateProblem,
  validateUpdateProblem,
  validateTopic,
  validateSolution,
  validateDataset,
  validateUpdateDataset,
  validateImportJson,
};
