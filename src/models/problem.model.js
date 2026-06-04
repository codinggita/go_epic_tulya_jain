const mongoose = require("mongoose");

const problemSchema = new mongoose.Schema(
  {
    instruction: {
      type: String,
      required: [true, "Instruction is required"],
      trim: true,
    },

    output: {
      type: String,
      required: [true, "Output is required"],
    },

    topic: {
      type: String,
      required: [true, "Topic is required"],
      trim: true,
    },

    difficulty: {
      type: String,
      required: [true, "Difficulty is required"],

      enum: {
        values: ["easy", "medium", "advanced"],
        message: "Difficulty must be easy, medium, or advanced",
      },
    },

    dataset_source: {
      type: String,
      required: [true, "Dataset source is required"],
    },
  },

  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Problem", problemSchema);