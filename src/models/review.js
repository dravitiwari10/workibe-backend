const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

const reviewSchema = new mongoose.Schema(
  {
    place: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Place",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    text: {
      type: String,
      default: "",
      trim: true,
    },
    highlights: {
      type: [String], // e.g. ["Great Coffee", "Fast WiFi", "Quiet"]
      default: [],
    },
    photos: {
      type: [String],
      default: [],
    },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    comments: [commentSchema],
    shareCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

reviewSchema.index({ place: 1, createdAt: -1 });
reviewSchema.index({ createdAt: -1 }); // for the main feed

module.exports = mongoose.model("Review", reviewSchema);