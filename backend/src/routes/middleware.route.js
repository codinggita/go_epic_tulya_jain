const express = require("express");
const { protect, authorize } = require("../middlewares/auth.middleware");

// Controllers
const problemController = require("../controllers/problem.controller");
const topicController = require("../controllers/topic.controller");
const solutionController = require("../controllers/solution.controller");
const datasetController = require("../controllers/dataset.controller");
const authController = require("../controllers/auth.controller");

const adminRouter = express.Router();
const protectedRouter = express.Router();



// Admin Protected Routes (Require protect + admin role)
adminRouter.use(protect);
adminRouter.use(authorize("admin"));

adminRouter.get("/problems", problemController.getAllProblems);
adminRouter.get("/topics", topicController.getAllTopics);
adminRouter.get("/solutions", solutionController.getAllSolutions);
adminRouter.get("/datasets", datasetController.getAllDatasets);

// User CRUD operations for Admin Dashboard
adminRouter.get("/users", authController.getAllUsers);
adminRouter.post("/users", authController.createUserAdmin);
adminRouter.patch("/users/:id", authController.updateUserAdmin);
adminRouter.delete("/users/:id", authController.deleteUserAdmin);


// JWT Protected Routes (Require protect only)
protectedRouter.use(protect);

protectedRouter.get("/problems", problemController.getAllProblems);
protectedRouter.get("/topics", topicController.getAllTopics);
protectedRouter.get("/solutions", solutionController.getAllSolutions);
protectedRouter.get("/datasets", datasetController.getAllDatasets);

module.exports = {
  adminRouter,
  protectedRouter,
};
