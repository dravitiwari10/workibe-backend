const User = require("../models/User");
const userService = require("../services/userService");

/**
 * Get Logged-in User Profile
 */
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Profile fetched successfully",
      data: user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Update User Profile
 */
const updateProfile = async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get User By Id
 */
const getUserById = async (req, res) => {
  try {
    const user = await userService.getUserDetails(req.params.id, req.user.id);
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (err) {
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || "Something went wrong",
    });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const radiusKm = req.query.radius ? parseFloat(req.query.radius) : null;
    const currentUser = await User.findById(req.user.id).select("location");
    const currentUserCoords = currentUser?.location?.coordinates || [0, 0];

    const users = await userService.getAllUsers(req.user.id, currentUserCoords, radiusKm);

    res.status(200).json({
      success: true,
      message: "Users fetched successfully.",
      data: users,
    });
  } catch (err) {
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || "Something went wrong",
    });
  }
};

const updateLocation = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    const user = await userService.updateLocation(req.user.id, latitude, longitude);

    res.status(200).json({
      success: true,
      message: "Location updated successfully",
      data: user,
    });
  } catch (err) {
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || "Something went wrong",
    });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getUserById,
  getAllUsers,
  updateLocation,
};