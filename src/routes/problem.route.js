const express = require("express");
const problemController = require("../controllers/problem.controller");
const { validateProblem, validateUpdateProblem, validateImportJson } = require("../middlewares/validate.middleware");
const { generalLimiter, problemSubmissionLimiter, importLimiter } = require("../middlewares/rate-limiter.middleware");

const router = express.Router();



// Specific routes (MUST define before /:problemId)
router.get("/random", problemController.getRandomProblem);
router.get("/trending", problemController.getTrendingProblems);
router.get("/recent", problemController.getRecentProblems);
router.post("/import-json", importLimiter, validateImportJson, problemController.importProblemsJson);

// Paginate advanced problems route specifically matching /problems/advanced
router.get("/advanced", (req, res, next) => {
  req.query.difficulty = "advanced";
  next();
}, problemController.getAllProblems);

// Route parameters filters
router.get("/topic/:topic", problemController.getProblemsByTopic);
router.get("/difficulty/:difficulty", problemController.getProblemsByDifficulty);
router.get("/source/:source", problemController.getProblemsBySource);
router.get("/instruction/:keyword", problemController.getProblemsByKeyword);

// Core CRUD Routes
router.get("/", generalLimiter, problemController.getAllProblems);
router.get("/:problemId", problemController.getProblemById);
router.post("/", problemSubmissionLimiter, validateProblem, problemController.createProblem);
router.put("/:problemId", validateProblem, problemController.replaceProblem);
router.patch("/:problemId", validateUpdateProblem, problemController.updateProblemFields);
router.delete("/:problemId", problemController.deleteProblem);

module.exports = router;