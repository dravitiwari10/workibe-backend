const express = require("express");
const router = express.Router();
const { register, verifyRegistration, login,  forgotPassword, resetPassword } = require("../controllers/auth.controller");
const { protect } = require("../middleware/authMiddleware");

router.post("/register", register);
router.post("/verify-email", verifyRegistration);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// requires a valid token
// router.post("/logout", protect, logout);
// router.post("/change-password", protect, changePassword);

module.exports = router;