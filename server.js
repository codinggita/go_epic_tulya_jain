const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const dotenv = require("dotenv");
const path = require("path");

// Load Environment Variables
dotenv.config({ path: path.join(__dirname, ".env") });

const connectDB = require("./src/config/db");
const { errorHandler } = require("./src/middlewares/error.middleware");

// Import Route files
const authRoute = require("./src/routes/auth.route");
const jwtRoute = require("./src/routes/jwt.route");
const problemRoute = require("./src/routes/problem.route");
const topicRoute = require("./src/routes/topic.route");
const solutionRoute = require("./src/routes/solution.route");
const datasetRoute = require("./src/routes/dataset.route");
const searchRoute = require("./src/routes/search.route");
const statsRoute = require("./src/routes/stats.route");
const healthRoute = require("./src/routes/health.route");
const { adminRouter, protectedRouter } = require("./src/routes/middleware.route");

const app = express();

// Enable CORS
app.use(cors());

// Parse JSON payloads
app.use(express.json());

// Log HTTP requests
app.use(morgan("dev"));

// Root Endpoint
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to Go-Epic Backend API",
    version: "1.0.0",
  });
});

// Mount routes
app.use("/auth", authRoute);
app.use("/jwt", jwtRoute);
app.use("/problems", problemRoute);
app.use("/topics", topicRoute);
app.use("/solutions", solutionRoute);
app.use("/datasets", datasetRoute);
app.use("/search", searchRoute);
app.use("/stats", statsRoute);
app.use("/admin", adminRouter);
app.use("/protected", protectedRouter);

// Mount Health Check / Metrics / Server info
app.use("/", healthRoute);

// Centralized Error Handling Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();