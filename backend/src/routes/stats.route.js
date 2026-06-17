const express = require("express");
const statsController = require("../controllers/stats.controller");

const router = express.Router();



router.get("/problems", statsController.getProblemStats);
router.get("/topics", statsController.getTopicStats);
router.get("/difficulties", statsController.getDifficultyStats);
router.get("/datasets", statsController.getDatasetStats);
router.get("/advanced-problems", statsController.getAdvancedProblemsCount);
router.get("/topic/:topic", statsController.getTopicDetailStats);
router.get("/source/:source", statsController.getSourceDetailStats);
router.get("/total-solutions", statsController.getTotalSolutionsCount);

module.exports = router;
