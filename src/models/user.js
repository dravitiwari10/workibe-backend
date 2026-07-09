const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      default: "",
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    profession: {
      type: String,
      default: "",
    },

    company: {
      type: String,
      default: "",
    },

    experience: {
      type: Number,
      default: 0,
    },

    city: {
      type: String,
      default: "",
    },

    bio: {
      type: String,
      default: "",
    },

    interests: [
      {
        type: String,
      },
    ],

    photoUrl: {
      type: String,
      default: "",
    },

    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        default: [0, 0], // [longitude, latitude]
      },
    },

    privacyLevel: {
      type: String,
      enum: ["exact", "approximate", "hidden"],
      default: "approximate",
    },

    isProfileCompleted: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    refreshToken: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

userSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("User", userSchema);