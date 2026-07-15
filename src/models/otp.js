const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    otp: {
      type: String,
      required: true,
    },

    purpose: {
      type: String,
      enum: ["verify_email", "forgot_password"],
      default: "verify_email",
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "verified", "expired"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("Otp", otpSchema);