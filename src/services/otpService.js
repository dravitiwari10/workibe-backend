const crypto = require("crypto");
const Otp = require("../models/otp");
const User = require("../models/user");
const { sendOtpEmail } = require("../utils/email");


const USE_FIXED_OTP = process.env.DEV_FIXED_OTP === "true";
const FIXED_OTP_CODE = "123123";

const generateOtpCode = () => {
  if (USE_FIXED_OTP) {
    console.warn("[otpService] DEV_FIXED_OTP is enabled — using fixed test OTP. Do NOT use in production.");
    return FIXED_OTP_CODE;
  }
  return crypto.randomInt(100000, 999999).toString();
};
const sendOtp = async (email, purpose = "verify_email") => {
  const user = await User.findOne({ email });
  if (!user) {
    const error = new Error("No account found for this email");
    error.statusCode = 404;
    throw error;
  }
 
  await Otp.updateMany({ email, purpose, status: "pending" }, { status: "expired" });
 
  const code = generateOtpCode();
  await Otp.create({ email, otp: code, purpose, status: "pending" });
 
  // Skip the actual email send while using a fixed test OTP, so
  // testing isn't blocked by the domain-verification issue either.
  if (USE_FIXED_OTP) {
    console.log(`[otpService] Skipping real email send (DEV_FIXED_OTP mode). OTP for ${email}: ${code}`);
  } else {
    await sendOtpEmail(email, code, purpose, user.name);
  }
 
  return {
    email,
  };
};

// const verifyOtp = async (email, code, purpose = "verify_email") => {
//   const record = await Otp.findOne({ email, otp: code, purpose, status: "pending" }).sort({
//     createdAt: -1,
//   });
//   console.log("Looking for:", { email, code, purpose });
// const allForEmail = await Otp.find({ email }).sort({ createdAt: -1 });
// console.log("All OTP records for this email:", allForEmail);
const verifyOtp = async (email, code, purpose = "verify_email") => {
  console.log("Inside verifyOtp");
  console.log("----------------");
  console.log("Email :", email);
  console.log("Code  :", code);
  console.log("Purpose:", purpose);
  const all = await Otp.find({ email }).sort({ createdAt: -1 });

console.log("All OTPs");
  console.table(
    all.map(o => ({
      otp: o.otp,
      purpose: o.purpose,
      status: o.status,
    }))
  );
  
  const record = await Otp.findOne({
    email,
    otp: code,
    purpose,
    status: "pending",
  });

  console.log("Found record:", record);
  if (!record) {
    const error = new Error("Invalid or expired OTP");
    error.statusCode = 400;
    throw error;
  }

  record.status = "verified";
  await record.save();

  let user;
  if (purpose === "verify_email") {
    user = await User.findOneAndUpdate({ email }, { isVerified: true }, { new: true });
  } else {
    user = await User.findOne({ email });
  }

  return { user };
};

module.exports = { sendOtp, verifyOtp };