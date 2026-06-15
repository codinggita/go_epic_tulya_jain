const express = require("express");
const datasetController = require("../controllers/dataset.controller");
const { validateDataset, validateUpdateDataset } = require("../middlewares/validate.middleware");
const { deleteDatasetLimiter } = require("../middlewares/rate-limiter.middleware");

const router = express.Router();



// Specific routes (MUST define before /:datasetId)
router.get("/latest", datasetController.getLatestDatasets);
router.get("/recent", datasetController.getRecentDatasets);

// Route parameters filters
router.get("/source/:source", datasetController.getDatasetsBySource);
router.get("/topic/:topic", datasetController.getDatasetsByTopic);
router.get("/difficulty/:difficulty", datasetController.getDatasetsByDifficulty);

// Core CRUD Routes
router.get("/", datasetController.getAllDatasets);
router.get("/:datasetId", datasetController.getDatasetById);
router.post("/", validateDataset, datasetController.createDataset);
router.put("/:datasetId", validateDataset, datasetController.replaceDataset);
router.patch("/:datasetId", validateUpdateDataset, datasetController.updateDataset);
router.delete("/:datasetId", deleteDatasetLimiter, datasetController.deleteDataset);

module.exports = router;
