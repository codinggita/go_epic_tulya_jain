const express = require("express");
const topicController = require("../controllers/topic.controller");
const { validateTopic } = require("../middlewares/validate.middleware");

const router = express.Router();



// Specific routes (MUST define before /:topicName)
router.get("/popular", topicController.getPopularTopics);
router.get("/trending", topicController.getTrendingTopics);

// Route parameters filters
router.get("/name/:name", topicController.getTopicByName);
router.get("/category/:category", topicController.getTopicsByCategory);

// Core CRUD Routes
router.get("/", topicController.getAllTopics);
router.get("/:topicName", topicController.getTopicByName);
router.post("/", validateTopic, topicController.createTopic);
router.put("/:topicName", validateTopic, topicController.replaceTopic);
router.patch("/:topicName", topicController.updateTopic);
router.delete("/:topicName", topicController.deleteTopic);

module.exports = router;
