const User = require("../models/User");

/**
 * Get all registered users
 */
const getAllUsers = async () => {
  const users = await User.find(
    { Status: { $ne: "deleted" } },
    {
      password: 0,
      refreshToken: 0,
      __v: 0,
    }
  ).sort({ createdAt: -1 });

  return users;
};

/**
 * Get user by ID
 */
const getUserById = async (userId) => {
  const user = await User.findById(userId).select(
    "-password -refreshToken -__v"
  );

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  return user;
};

module.exports = {
  getAllUsers,
  getUserById,
};