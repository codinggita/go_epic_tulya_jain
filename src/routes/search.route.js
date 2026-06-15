const express = require("express");
const searchController = require("../controllers/search.controller");
const { searchLimiter } = require("../middlewares/rate-limiter.middleware");

const router = express.Router();



router.get("/problems", searchLimiter, searchController.searchProblems);
router.get("/topics", searchController.searchTopics);
router.get("/solutions", searchController.searchSolutions);
router.get("/datasets", searchController.searchDatasets);

module.exports = router;
