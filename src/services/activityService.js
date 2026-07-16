const mongoose = require("mongoose");
const Activity = require("../models/Activity");

/**
 * Create a new activity
 */
const createActivity = async (userId, details) => {
  const { title, description, category, latitude, longitude, address, scheduledAt, maxParticipants } = details;

  if (!title || !category || !scheduledAt) {
    const error = new Error("title, category and scheduledAt are required");
    error.statusCode = 400;
    throw error;
  }

  const activity = await Activity.create({
    title,
    description,
    category,
    createdBy: userId,
    location: {
      type: "Point",
      coordinates: [longitude || 0, latitude || 0],
      address: address || "",
    },
    scheduledAt,
    maxParticipants: maxParticipants || 0,
    participants: [{ user: userId }], // creator auto-joins
  });

  return activity;
};

/**
 * List activities — filterable by category, and optionally sorted by
 * distance from the requesting user if coordinates + radius are given.
 */
const listActivities = async ({ category, userCoords, radiusKm, upcomingOnly = true }) => {
  const hasValidOrigin =
    Array.isArray(userCoords) &&
    userCoords.length === 2 &&
    !(userCoords[0] === 0 && userCoords[1] === 0);

  const matchQuery = {};
  if (category) matchQuery.category = category;
  if (upcomingOnly) matchQuery.status = { $in: ["upcoming", "ongoing"] };

  if (!hasValidOrigin) {
    const activities = await Activity.find(matchQuery)
      .populate("createdBy", "name profession city")
      .sort({ scheduledAt: 1 });
    return activities;
  }

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
    {
      $addFields: {
        distanceInKm: { $round: [{ $divide: ["$distanceInMeters", 1000] }, 2] },
      },
    },
    { $sort: { scheduledAt: 1 } },
    { $project: { distanceInMeters: 0 } },
  ];

  const activities = await Activity.aggregate(pipeline);
  await Activity.populate(activities, { path: "createdBy", select: "name profession city" });

  return activities;
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