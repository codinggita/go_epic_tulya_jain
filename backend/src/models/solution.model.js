const mongoose = require("mongoose");
const softDeletePlugin = require("./plugins/softDelete");

const solutionSchema = new mongoose.Schema(
  {
    output: {
      type: String,
      required: [true, "Solution output is required"],
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
    source: {
      type: String,
      required: [true, "Source is required"],
      index: true,
    },
    problemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Problem",
      required: [true, "Problem reference is required"],
    },
  },
  {
    timestamps: true,
  }
);

// Add text index on output for search
solutionSchema.index({ output: "text" });

// Apply soft delete plugin
solutionSchema.plugin(softDeletePlugin);

module.exports = mongoose.model("Solution", solutionSchema);
