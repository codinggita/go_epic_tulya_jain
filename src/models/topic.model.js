const mongoose = require("mongoose");
const softDeletePlugin = require("./plugins/softDelete");

const topicSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Topic name is required"],
      unique: true,
      trim: true,
      index: true,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
      index: true,
    },
    popularity: {
      type: Number,
      default: 0,
    },
    isTrending: {
      type: Boolean,
      default: false,
    },
    trendingScore: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Apply soft delete plugin
topicSchema.plugin(softDeletePlugin);

module.exports = mongoose.model("Topic", topicSchema);
