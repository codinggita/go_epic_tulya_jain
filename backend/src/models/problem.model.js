const mongoose = require("mongoose");
const softDeletePlugin = require("./plugins/softDelete");

const problemSchema = new mongoose.Schema(
  {
    instruction: {
      type: String,
      required: [true, "Instruction is required"],
      trim: true,
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
      enum: {
        values: ["easy", "medium", "advanced", "beginner", "hard", "intermediate"],
        message: "Difficulty must be easy, medium, advanced, beginner, hard, or intermediate",
      },
      index: true,
    },
    source: {
      type: String,
      required: [true, "Source is required"],
      index: true,
    },
    solutionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Solution",
    },
  },
  {
    timestamps: true,
  }
);

// Add text index on instruction for search
problemSchema.index({ instruction: "text" });

// Apply soft delete plugin
problemSchema.plugin(softDeletePlugin);

module.exports = mongoose.model("Problem", problemSchema);