const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

// Load Environment Variables
dotenv.config({ path: path.join(__dirname, ".env") });

const User = require("./src/models/user.model");
const Problem = require("./src/models/problem.model");
const Solution = require("./src/models/solution.model");
const Dataset = require("./src/models/dataset.model");
const Topic = require("./src/models/topic.model");

const datasetPath = path.join(__dirname, "..", "go-epic.json");

const getTopicCategory = (topicName) => {
  if (topicName.includes(":")) {
    return topicName.split(":")[0].trim();
  }

  const topicLower = topicName.toLowerCase();
  if (
    topicLower.includes("concurrency") ||
    topicLower.includes("goroutine") ||
    topicLower.includes("channel") ||
    topicLower.includes("mutex") ||
    topicLower.includes("semaphore") ||
    topicLower.includes("atomic") ||
    topicLower.includes("worker")
  ) {
    return "Concurrency";
  }
  if (
    topicLower.includes("testing") ||
    topicLower.includes("test") ||
    topicLower.includes("mock") ||
    topicLower.includes("benchmark") ||
    topicLower.includes("fuzz")
  ) {
    return "Testing";
  }
  if (
    topicLower.includes("database") ||
    topicLower.includes("sql") ||
    topicLower.includes("mongo") ||
    topicLower.includes("redis") ||
    topicLower.includes("gorm") ||
    topicLower.includes("cache")
  ) {
    return "Database";
  }
  if (
    topicLower.includes("devops") ||
    topicLower.includes("docker") ||
    topicLower.includes("kubernetes") ||
    topicLower.includes("ci/cd") ||
    topicLower.includes("pipeline") ||
    topicLower.includes("deployment")
  ) {
    return "DevOps & Deployment";
  }
  if (
    topicLower.includes("api") ||
    topicLower.includes("microservice") ||
    topicLower.includes("grpc") ||
    topicLower.includes("http") ||
    topicLower.includes("gateway")
  ) {
    return "Microservices & Web";
  }
  return "General Go Programming";
};

const seedDatabase = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected!");

    // 1. Clear old data
    console.log("Clearing existing database collections...");
    await Promise.all([
      User.deleteMany({}),
      Problem.deleteMany({}),
      Solution.deleteMany({}),
      Dataset.deleteMany({}),
      Topic.deleteMany({}),
    ]);
    console.log("Collections cleared!");

    // 2. Seed Default Users
    console.log("Seeding default user accounts...");
    const adminUser = new User({
      username: "admin",
      email: "admin@goepic.com",
      password: "Admin@123",
      role: "admin",
    });

    const normalUser = new User({
      username: "user",
      email: "user@goepic.com",
      password: "User@123",
      role: "user",
    });

    await Promise.all([adminUser.save(), normalUser.save()]);
    console.log("Users seeded successfully!");

    // 3. Load & Parse dataset JSON
    console.log("Loading dataset file...");
    const rawData = JSON.parse(fs.readFileSync(datasetPath, "utf8"));
    console.log(`Loaded ${rawData.length} items from go-epic.json`);

    // 4. Normalize & Split Data
    const problems = [];
    const solutions = [];
    const datasets = [];
    const topicCounts = {};

    console.log("Preparing documents for database injection...");
    rawData.forEach((item) => {
      const problemId = new mongoose.Types.ObjectId();
      const solutionId = new mongoose.Types.ObjectId();

      const source = item.dataset_source || "go-source-code";
      const topic = item.topic || "general";
      const difficulty = item.difficulty || "medium";

      // Count topics for popularity scoring
      topicCounts[topic] = (topicCounts[topic] || 0) + 1;

      problems.push({
        _id: problemId,
        instruction: item.instruction,
        topic,
        difficulty,
        source,
        solutionId,
      });

      solutions.push({
        _id: solutionId,
        output: item.output,
        topic,
        difficulty,
        source,
        problemId,
      });

      datasets.push({
        source,
        topic,
        difficulty,
        problemId,
        solutionId,
      });
    });

    // 5. Generate Topic Documents
    console.log("Building topic catalog and categories...");
    const topicDocs = Object.keys(topicCounts).map((topicName) => {
      const category = getTopicCategory(topicName);
      const popularity = topicCounts[topicName];
      const isTrending = popularity > 20 && Math.random() > 0.5; // Dynamically make some popular topics trending
      const trendingScore = isTrending ? Math.floor(Math.random() * 100) + 50 : 0;

      return {
        name: topicName,
        category,
        popularity,
        isTrending,
        trendingScore,
      };
    });

    // 6. Bulk Insert
    console.log("Executing bulk inserts into MongoDB (batch mode)...");
    
    // Split operations into batches to prevent memory / timeout issues
    const batchSize = 1000;
    
    for (let i = 0; i < problems.length; i += batchSize) {
      const pBatch = problems.slice(i, i + batchSize);
      const sBatch = solutions.slice(i, i + batchSize);
      const dBatch = datasets.slice(i, i + batchSize);
      
      await Promise.all([
        Problem.insertMany(pBatch),
        Solution.insertMany(sBatch),
        Dataset.insertMany(dBatch)
      ]);
      console.log(`Inserted batch ${i / batchSize + 1} of ${Math.ceil(problems.length / batchSize)}`);
    }

    await Topic.insertMany(topicDocs);
    console.log(`Topics inserted: ${topicDocs.length}`);

    console.log("---------------------------------------");
    console.log("DATABASE SEEDING SUCCESSFUL!");
    console.log(`Total Problems: ${problems.length}`);
    console.log(`Total Solutions: ${solutions.length}`);
    console.log(`Total Datasets: ${datasets.length}`);
    console.log(`Total Topics: ${topicDocs.length}`);
    console.log("---------------------------------------");

    process.exit(0);
  } catch (error) {
    console.error("Database seeding failed:", error);
    process.exit(1);
  }
};

seedDatabase();
