const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const otpService = require("./otpService");

const generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRY || "30d",
  });
};

/**
 * Register a new account: hashes password, stores user (unverified),
 * then sends an email-verification OTP.
 */
const register = async (details) => {
  const { email, password, name, contact, profession, company, experience, city, bio } = details;

  const existing = await User.findOne({ email });
  if (existing && existing.isVerified) {
    const error = new Error("Email already registered");
    error.statusCode = 409;
    throw error;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  let user;
  if (existing) {
    
    Object.assign(existing, { password: passwordHash, name, contact, profession, company, experience, city, bio });
    user = await existing.save();
  } else {
    user = await User.create({
      email,
      password: passwordHash,
      name,
      contact,
      profession,
      company,
      experience,
      city,
      bio,
    });
  }

  await otpService.sendOtp(email, "verify_email");

return {
  userId: user._id,
  email: user.email,
  isVerified: user.isVerified,
};};

/**
 * Verify the signup OTP to activate the account.
 */
// const verifyRegistration = async (email, otp) => {
//   const { user } = await otpService.verifyOtp(email, otp, "verify_email");
//   console.log("verifyRegistration called");
//   console.log({ email, otp });
//   console.log("verifyOtp returned");

//   return { user };

// };
const verifyRegistration = async (email, otp) => {
  const result = await otpService.verifyOtp(
    email,
    otp,
    "verify_email"
  );

  return result;
};

/**
 * Login with email + password. Requires a verified account.
 * Issues a single refresh token used for all authenticated requests.
 */
const login = async (email, password) => {
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  if (!user.isVerified) {
    const error = new Error("Please verify your email before logging in");
    error.statusCode = 403;
    throw error;
  }

  if (user.Status === "deleted") {
    const error = new Error("This account has been deleted");
    error.statusCode = 401;
    throw error;
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  const refreshToken = generateRefreshToken(user._id);

  user.refreshToken = refreshToken;
  user.Status = "active";
  await user.save();

  user.password = undefined;

  return { user, refreshToken };
};

/**
 * Step 1 of forgot-password: send a reset OTP to the user's email.
 */
const forgotPassword = async (email) => {
  await otpService.sendOtp(email, "reset_password");
  return { message: "Password reset OTP sent to email" };
};

/**
 * Step 2 of forgot-password: verify the reset OTP and set a new password.
 */
const resetPassword = async (email, otp, newPassword) => {
  const { user } = await otpService.verifyOtp(email, otp, "reset_password");

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  user.password = await bcrypt.hash(newPassword, 10);
  user.refreshToken = ""; // force re-login on all devices after password reset
  await user.save();

  return { message: "Password reset successful. Please log in with your new password." };
};

const logout = async (userId) => {
  await User.findByIdAndUpdate(userId, { refreshToken: "" });
  return { message: "Logged out" };
};

const changePassword = async(currentPassword,newPassword) =>{
  if(currentPassword != newPassword){
    return {message:""}
  }
}

module.exports = {
  register,
  verifyRegistration,
  login,
  forgotPassword,
  resetPassword,
  logout,
};