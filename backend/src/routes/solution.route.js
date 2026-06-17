const express = require("express");
const solutionController = require("../controllers/solution.controller");
const { validateSolution } = require("../middlewares/validate.middleware");

const router = express.Router();



// Specific routes (MUST define before /:solutionId)
router.get("/random", solutionController.getRandomSolution);
router.get("/trending", solutionController.getTrendingSolutions);
router.get("/recent", solutionController.getRecentSolutions);

// Route parameters filters
router.get("/topic/:topic", solutionController.getSolutionsByTopic);
router.get("/difficulty/:difficulty", solutionController.getSolutionsByDifficulty);
router.get("/source/:source", solutionController.getSolutionsBySource);

// Core CRUD Routes
router.get("/", solutionController.getAllSolutions);
router.get("/:solutionId", solutionController.getSolutionById);
router.post("/", validateSolution, solutionController.createSolution);
router.put("/:solutionId", validateSolution, solutionController.replaceSolution);
router.patch("/:solutionId", solutionController.updateSolution);
router.delete("/:solutionId", solutionController.deleteSolution);

module.exports = router;
