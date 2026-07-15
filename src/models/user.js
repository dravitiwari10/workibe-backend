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

    password: {
      type: String,
      required: true,
      select: false,
    },

    contact: {
      type: String,
      trim: true,
      default: "",
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

    hobbies: [
      {
        name: {
          type: String,
          required: true,
          trim: true,
        },
      },
    ],

    // photoUrl: {
    //   type: String,
    //   default: "",
    // },

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
    },

    privacyLevel: {
      type: String,
      enum: ["private", "public"],
      default: "private",
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    Status: {
      type: String,
      enum: ["active", "inactive", "deleted"],
      default: "active",
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