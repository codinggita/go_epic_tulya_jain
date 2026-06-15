const express = require("express");
const mongoose = require("mongoose");
const Problem = require("../models/problem.model");
const Solution = require("../models/solution.model");
const Topic = require("../models/topic.model");
const User = require("../models/user.model");
const { sendSuccess } = require("../utils/response.util");

const router = express.Router();



// Health check API
router.get("/health", async (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? "Connected" : "Disconnected";
  res.status(200).json({
    status: "OK",
    database: dbStatus,
    timestamp: new Date(),
  });
});

// Version API
router.get("/version", (req, res) => {
  res.status(200).json({
    version: "1.0.0",
    name: "Go-Epic Backend API",
  });
});

// Metrics API
router.get("/metrics", async (req, res) => {
  const [problems, solutions, topics, users] = await Promise.all([
    Problem.countDocuments({}),
    Solution.countDocuments({}),
    Topic.countDocuments({}),
    User.countDocuments({}),
  ]);

  res.status(200).json({
    success: true,
    metrics: {
      totalProblems: problems,
      totalSolutions: solutions,
      totalTopics: topics,
      totalUsers: users,
    },
  });
});

// Server status API
router.get("/server-status", (req, res) => {
  res.status(200).json({
    success: true,
    status: {
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage(),
      environment: process.env.NODE_ENV || "development",
      nodeVersion: process.version,
      platform: process.platform,
    },
  });
});

module.exports = router;
