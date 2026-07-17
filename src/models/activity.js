const mongoose = require("mongoose");
const { CATEGORY_KEYS } = require("../config/activityCategories");

const activitySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    category: {
      type: String,
      enum: CATEGORY_KEYS,
      required: true,
    },
    customCategoryLabel: {
      type: String,
      default: "",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        default: [0, 0],
      },
      venueName: {
        type: String,
        default: "",
      },
      address: {
        type: String,
        default: "",
      },
    },
    scheduledAt: {
      type: Date,
      required: true,
    },
    maxParticipants: {
      type: Number,
      default: 0,
    },
    participants: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        joinedAt: { type: Date, default: Date.now },
      },
    ],
    status: {
      type: String,
      enum: ["upcoming", "ongoing", "completed", "cancelled"],
      default: "upcoming",
    },
  },
  { timestamps: true }
);

activitySchema.index({ location: "2dsphere" });
activitySchema.index({ category: 1, scheduledAt: 1 });

module.exports = mongoose.model("Activity", activitySchema);