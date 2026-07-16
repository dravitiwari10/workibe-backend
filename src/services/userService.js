const User = require("../models/User");

/**
 * Get all registered users
 */
const getAllUsers = async (currentUserId, currentUserCoords, radiusKm) => {
  // currentUserCoords = [longitude, latitude]
  const hasValidOrigin =
    Array.isArray(currentUserCoords) &&
    currentUserCoords.length === 2 &&
    !(currentUserCoords[0] === 0 && currentUserCoords[1] === 0);

  if (!hasValidOrigin) {
    // Fallback: no geo sort possible, just return the list as before
    const users = await User.find(
      { Status: { $ne: "deleted" }, _id: { $ne: currentUserId } },
      { password: 0, refreshToken: 0, __v: 0 }
    ).sort({ createdAt: -1 });
    return users;
  }

  const pipeline = [
    {
      $geoNear: {
        near: { type: "Point", coordinates: currentUserCoords },
        distanceField: "distanceInMeters",
        spherical: true,
        query: {
          Status: { $ne: "deleted" },
          _id: { $ne: new mongoose.Types.ObjectId(currentUserId) },
        },
        ...(radiusKm ? { maxDistance: radiusKm * 1000 } : {}),
      },
    },
    {
      $addFields: {
        distanceInKm: { $round: [{ $divide: ["$distanceInMeters", 1000] }, 2] },
      },
    },
    {
      $project: {
        password: 0,
        refreshToken: 0,
        __v: 0,
        distanceInMeters: 0,
      },
    },
  ];

  const users = await User.aggregate(pipeline);
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

const updateLocation = async (userId, latitude, longitude) => {
  if (
    typeof latitude !== "number" ||
    typeof longitude !== "number" ||
    latitude < -90 || latitude > 90 ||
    longitude < -180 || longitude > 180
  ) {
    const error = new Error("Invalid latitude/longitude");
    error.statusCode = 400;
    throw error;
  }

  const user = await User.findByIdAndUpdate(
    userId,
    {
      location: {
        type: "Point",
        coordinates: [longitude, latitude], // GeoJSON order: [lng, lat]
      },
    },
    { new: true, runValidators: true }
  ).select("-password -refreshToken -__v");

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
  updateLocation,
};