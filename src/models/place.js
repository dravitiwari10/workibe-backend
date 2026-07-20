const mongoose = require("mongoose");

const placeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ["cafe", "restaurant", "pub", "food_court", "coworking", "hotel", "other"],
      default: "other",
    },
    tags: {
      type: [String], // e.g. ["Cafe", "Work Friendly", "Good for Meetings"]
      default: [],
    },
    description: {
      type: String,
      default: "",
    },
    phone: {
      type: String,
      default: "",
    },
    photos: {
      type: [String], // gallery image URLs
      default: [],
    },
    openingHours: {
      type: String, // e.g. "10:00 AM - 11:00 PM"
      default: "",
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [0, 0],
      },
      address: {
        type: String,
        default: "",
      },
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    avgRating: {
      type: Number,
      default: 0,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    // Aggregated highlight tags across all reviews, most common first —
    // powers the "Highlights" chip row on the place detail screen
    highlights: [
      {
        tag: { type: String },
        count: { type: Number, default: 0 },
      },
    ],
  },
  { timestamps: true }
);

placeSchema.index({ location: "2dsphere" });
placeSchema.index({ name: "text" });

module.exports = mongoose.model("Place", placeSchema);