const mongoose = require("mongoose");
const Activity = require("../models/Activity");
const { CATEGORY_KEYS } = require("../config/activityCategories");

/**
 * Create a new activity
 */
const createActivity = async (userId, details) => {
  const {
    title,
    description,
    category,
    customCategoryLabel,
    latitude,
    longitude,
    venueName,
    address,
    scheduledAt,
    maxParticipants,
  } = details;

  if (!title || !category || !scheduledAt) {
    const error = new Error("title, category and scheduledAt are required");
    error.statusCode = 400;
    throw error;
  }

  if (!CATEGORY_KEYS.includes(category)) {
    const error = new Error(`Invalid category. Must be one of: ${CATEGORY_KEYS.join(", ")}`);
    error.statusCode = 400;
    throw error;
  }

  if (category === "other" && !customCategoryLabel) {
    const error = new Error("customCategoryLabel is required when category is 'other'");
    error.statusCode = 400;
    throw error;
  }

  const activity = await Activity.create({
    title,
    description,
    category,
    customCategoryLabel: category === "other" ? customCategoryLabel : "",
    createdBy: userId,
    location: {
      type: "Point",
      coordinates: [longitude || 0, latitude || 0],
      venueName: venueName || "",
      address: address || "",
    },
    scheduledAt,
    maxParticipants: maxParticipants || 0,
    participants: [{ user: userId }],
  });

  return activity;
};

/**
 * List activities — filterable by category, and optionally sorted by
 * distance from the requesting user if coordinates + radius are given.
 */
const listActivities = async ({ category, search, userId, userCoords, radiusKm, upcomingOnly = true }) => {
  const hasValidOrigin =
    Array.isArray(userCoords) &&
    userCoords.length === 2 &&
    !(userCoords[0] === 0 && userCoords[1] === 0);

  const matchQuery = {};
  if (category && category !== "all") matchQuery.category = category;
  if (upcomingOnly) matchQuery.status = { $in: ["upcoming", "ongoing"] };
  if (search) matchQuery.title = { $regex: search, $options: "i" };

  let activities;

  if (!hasValidOrigin) {
    activities = await Activity.find(matchQuery)
      .populate("createdBy", "name photoUrl")
      .sort({ scheduledAt: 1 })
      .lean();
  } else {
    const pipeline = [
      {
        $geoNear: {
          near: { type: "Point", coordinates: userCoords },
          distanceField: "distanceInMeters",
          spherical: true,
          query: matchQuery,
          ...(radiusKm ? { maxDistance: radiusKm * 1000 } : {}),
        },
      },
      { $addFields: { distanceInKm: { $round: [{ $divide: ["$distanceInMeters", 1000] }, 2] } } },
      { $sort: { scheduledAt: 1 } },
      { $project: { distanceInMeters: 0 } },
    ];
    activities = await Activity.aggregate(pipeline);
    await Activity.populate(activities, { path: "createdBy", select: "name photoUrl" });
  }

  return activities.map((a) => ({
    _id: a._id,
    title: a.title,
    category: a.category,
    customCategoryLabel: a.customCategoryLabel,
    host: {
      id: a.createdBy?._id,
      name: a.createdBy?.name || "Unknown",
      avatar: a.createdBy?.photoUrl || "",
    },
    scheduledAt: a.scheduledAt,
    venueName: a.location?.venueName || "",
    address: a.location?.address || "",
    joinedCount: a.participants?.length || 0,
    maxParticipants: a.maxParticipants || 0,
    distanceInKm: a.distanceInKm ?? null,
    status: a.status,
    // NEW — lets the frontend disable/hide the Join button correctly
    joinedByMe: userId
      ? a.participants?.some((p) => p.user.toString() === userId.toString())
      : false,
    isHostedByMe: userId ? a.createdBy?._id?.toString() === userId.toString() : false,
  }));
};

/**
 * Get single activity by id
 */
const getActivityById = async (activityId) => {
  const activity = await Activity.findById(activityId)
    .populate("createdBy", "name profession city")
    .populate("participants.user", "name profession");

  if (!activity) {
    const error = new Error("Activity not found");
    error.statusCode = 404;
    throw error;
  }

  return activity;
};

/**
 * Join an activity
 */
const joinActivity = async (activityId, userId) => {
  const activity = await Activity.findById(activityId);

  if (!activity) {
    const error = new Error("Activity not found");
    error.statusCode = 404;
    throw error;
  }

  const alreadyJoined = activity.participants.some(
    (p) => p.user.toString() === userId.toString()
  );
  if (alreadyJoined) {
    const error = new Error("You already joined this activity");
    error.statusCode = 409;
    throw error;
  }

  if (activity.maxParticipants > 0 && activity.participants.length >= activity.maxParticipants) {
    const error = new Error("This activity is full");
    error.statusCode = 409;
    throw error;
  }

  activity.participants.push({ user: userId });
  await activity.save();

  return activity;
};

/**
 * Leave an activity
 */
const leaveActivity = async (activityId, userId) => {
  const activity = await Activity.findById(activityId);

  if (!activity) {
    const error = new Error("Activity not found");
    error.statusCode = 404;
    throw error;
  }

  activity.participants = activity.participants.filter(
    (p) => p.user.toString() !== userId.toString()
  );
  await activity.save();

  return activity;
};

module.exports = {
  createActivity,
  listActivities,
  getActivityById,
  joinActivity,
  leaveActivity,
};