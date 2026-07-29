const mongoose = require("mongoose");
const User = require("../models/user");
const Connection = require("../models/connection");
const Activity = require("../models/activity");

/**
 * Get all registered users
 */
const getAllUsers = async (currentUserId, currentUserCoords, radiusKm) => {
  const currentUserObjectId = new mongoose.Types.ObjectId(currentUserId);

  const hasValidOrigin =
    Array.isArray(currentUserCoords) &&
    currentUserCoords.length === 2 &&
    !(currentUserCoords[0] === 0 && currentUserCoords[1] === 0);

  // ----------------------------------------------------
  // Helper: attach connection info to a list of users
  // ----------------------------------------------------
  const attachConnectionStatus = async (users) => {
    if (!users.length) return [];

    const userIds = users.map((u) => u._id);

    // Find all connections between current user and these users
    const connections = await Connection.find({
      $or: [
        { requester: currentUserObjectId, recipient: { $in: userIds } },
        { recipient: currentUserObjectId, requester: { $in: userIds } },
      ],
    }).lean();

    // Map for O(1) lookup: otherUserId → connection
    const connectionMap = {};
    connections.forEach((conn) => {
      const otherId =
        conn.requester.toString() === currentUserId
          ? conn.recipient.toString()
          : conn.requester.toString();
      connectionMap[otherId] = conn;
    });

    return users.map((user) => {
      const userObj = user.toObject ? user.toObject() : { ...user };
      const conn = connectionMap[userObj._id.toString()];

      if (!conn) {
        userObj.connectionStatus = "none";
        userObj.connectionId = null;
      } else if (conn.status === "accepted") {
        userObj.connectionStatus = "accepted";
        userObj.connectionId = conn._id;
      } else if (conn.status === "rejected") {
        userObj.connectionStatus = "rejected";
        userObj.connectionId = conn._id;
      } else if (conn.status === "pending") {
        // pending – who sent it?
        if (conn.requester.toString() === currentUserId) {
          userObj.connectionStatus = "pending_sent"; // I sent the request
        } else {
          userObj.connectionStatus = "pending_received"; // they sent it to me
        }
        userObj.connectionId = conn._id;
      }

      return userObj;
    });
  };

  // ----------------------------------------------------
  // No geo coordinates → simple find
  // ----------------------------------------------------
  if (!hasValidOrigin) {
    const users = await User.find(
      { Status: { $ne: "deleted" }, _id: { $ne: currentUserObjectId } },
      { password: 0, refreshToken: 0, __v: 0 }
    ).sort({ createdAt: -1 });

    return attachConnectionStatus(users);
  }

  // ----------------------------------------------------
  // Geo near pipeline
  // ----------------------------------------------------
  const pipeline = [
    {
      $geoNear: {
        near: { type: "Point", coordinates: currentUserCoords },
        distanceField: "distanceInMeters",
        spherical: true,
        query: {
          Status: { $ne: "deleted" },
          _id: { $ne: currentUserObjectId },
        },
        ...(radiusKm ? { maxDistance: radiusKm * 1000 } : {}),
      },
    },
    {
      $addFields: {
        distanceInKm: {
          $round: [{ $divide: ["$distanceInMeters", 1000] }, 2],
        },
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
  return attachConnectionStatus(users);
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

const getUserDetails = async (userId, currentUserId) => {
  const user = await User.findById(userId).select("-password -refreshToken -__v");
  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  const objectId = new mongoose.Types.ObjectId(userId);
  const currentUserObjectId = new mongoose.Types.ObjectId(currentUserId);

  const [
    connectionsCount,
    activitiesHostedCount,
    activitiesJoinedCount,
    upcomingActivities,
    connection,
  ] = await Promise.all([
    Connection.countDocuments({
      status: "accepted",
      $or: [{ requester: objectId }, { recipient: objectId }],
    }),
    Activity.countDocuments({ createdBy: objectId }),
    Activity.countDocuments({ "participants.user": objectId }),
    Activity.find({
      "participants.user": objectId,
      status: { $in: ["upcoming", "ongoing"] },
      scheduledAt: { $gte: new Date() },
    })
      .sort({ scheduledAt: 1 })
      .limit(3)
      .select("title category scheduledAt location.venueName location.address"),

    // Connection between current user and this profile
    Connection.findOne({
      $or: [
        { requester: currentUserObjectId, recipient: objectId },
        { requester: objectId, recipient: currentUserObjectId },
      ],
    }).lean(),
  ]);

  // Determine connection status
  let connectionStatus = "none";
  let connectionId = null;

  if (connection) {
    connectionId = connection._id;
    if (connection.status === "accepted") {
      connectionStatus = "accepted";
    } else if (connection.status === "rejected") {
      connectionStatus = "rejected";
    } else if (connection.status === "pending") {
      connectionStatus =
        connection.requester.toString() === currentUserId
          ? "pending_sent"
          : "pending_received";
    }
  }

  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    profession: user.profession,
    company: user.company,
    experience: user.experience,
    city: user.city,
    bio: user.bio,
    photoUrl: user.photoUrl,
    hobbies: user.hobbies || [],
    privacyLevel: user.privacyLevel,
    isVerified: user.isVerified,
    createdAt: user.createdAt,
    stats: {
      connections: connectionsCount,
      activitiesHosted: activitiesHostedCount,
      activitiesJoined: activitiesJoinedCount,
    },
    upcomingActivities: upcomingActivities.map((a) => ({
      _id: a._id,
      title: a.title,
      category: a.category,
      scheduledAt: a.scheduledAt,
      venueName: a.location?.venueName || "",
      address: a.location?.address || "",
    })),
    // NEW
    connectionStatus,
    connectionId,
  };
};

module.exports = {
  getAllUsers,
  getUserById,
  updateLocation,
  getUserDetails,
};