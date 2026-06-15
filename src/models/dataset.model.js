const mongoose = require("mongoose");
const softDeletePlugin = require("./plugins/softDelete");

const datasetSchema = new mongoose.Schema(
  {
    source: {
      type: String,
      required: [true, "Dataset source is required"],
      index: true,
    },
    topic: {
      type: String,
      required: [true, "Topic is required"],
      trim: true,
      index: true,
    },
    difficulty: {
      type: String,
      required: [true, "Difficulty is required"],
      enum: ["easy", "medium", "advanced", "beginner", "hard", "intermediate"],
      index: true,
    },
    problemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Problem",
      required: [true, "Problem reference is required"],
    },
    solutionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Solution",
      required: [true, "Solution reference is required"],
    },
  },
  {
    timestamps: true,
  }
);

// Apply soft delete plugin
datasetSchema.plugin(softDeletePlugin);

module.exports = mongoose.model("Dataset", datasetSchema);
