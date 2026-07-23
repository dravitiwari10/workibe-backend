const express = require("express");
const router = express.Router();
const { register, verifyRegistration, login,  forgotPassword, resetPassword,logout,changePassword } = require("../controllers/auth.controller");
const { protect } = require("../middleware/authMiddleware");

/**
@route   POST /auth/register
@desc    Register a new user and send an email verification OTP
@access  Public
*/
router.post("/register", register);

/**
 @route   POST /auth/verify-email
 @desc    Verify a user's email using the OTP sent at registration
 @access  Public
 @body    { email, otp }*/ 
router.post("/verify-email", verifyRegistration);

/**
@route   POST /auth/login
@desc    Authenticate a user and issue access + refresh tokens
@access  Public
@body    { email, password }
 */
router.post("/login", login);

/**
@route   POST /auth/forgot-password
@desc    Send a password reset OTP to the user's email
@access  Public
@body    { email }
 */
router.post("/forgot-password", forgotPassword);

/**
@route   POST /auth/reset-password
@desc    Verify the reset OTP and set a new password
@access  Public
@body    { email, otp, newPassword } */
router.post("/reset-password", resetPassword);

/**
@route   POST /auth/logout
@desc    Log the user out by clearing their refresh token
@access  Private (requires valid access token)
@body    {id}
 */
router.post("/logout", protect, logout);

/**
@route   POST /auth/change-password
@desc    Change password for a logged-in user (requires current password)
@access  Private (requires valid access token)
@body    { currentPassword, newPassword }
 */
router.post("/change-password", protect, changePassword);

module.exports = router;