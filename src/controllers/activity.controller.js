const User = require("../models/User");
const activityService = require("../services/activityService");
const { ACTIVITY_CATEGORIES } = require("../config/activityCategories");

/**
 * POST /api/activities
 * @description Create a new activity
 */
const createActivity = async (req, res) => {
  try {
    const activity = await activityService.createActivity(req.user.id, req.body);
    res.status(201).json({
      success: true,
      message: "Activity created successfully",
      data: activity,
    });
  } catch (err) {
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || "Something went wrong",
    });
  }
};

/**
 * GET /api/activities?category=coffee&radius=10&search=meetup
 * @description List activities, filterable by category/search, sorted by
 * distance when the requesting user's location is known
 */
const listActivities = async (req, res) => {
  try {
    const { category, radius, search } = req.query;
    const radiusKm = radius ? parseFloat(radius) : null;

    const currentUser = await User.findById(req.user.id).select("location");
    const userCoords = currentUser?.location?.coordinates || [0, 0];

    const activities = await activityService.listActivities({
      category,
      search,
      userCoords,
      radiusKm,
    });

    res.status(200).json({
      success: true,
      message: "Activities fetched successfully.",
      data: activities,
    });
  } catch (err) {
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || "Something went wrong",
    });
  }
};

/**
 * GET /api/activities/categories
 * @description Return the fixed list of activity categories (for dropdown/filter UI)
 */
const listCategories = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      data: ACTIVITY_CATEGORIES,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || "Something went wrong",
    });
  }
};

/**
 * GET /api/activities/:id
 * @description Get a single activity with host + participant details
 */
const getActivityById = async (req, res) => {
  try {
    const activity = await activityService.getActivityById(req.params.id);
    res.status(200).json({
      success: true,
      data: activity,
    });
  } catch (err) {
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || "Something went wrong",
    });
  }
};

/**
 * POST /api/activities/:id/join
 * @description Join an activity
 */
const joinActivity = async (req, res) => {
  try {
    const activity = await activityService.joinActivity(req.params.id, req.user.id);
    res.status(200).json({
      success: true,
      message: "Joined activity successfully",
      data: activity,
    });
  } catch (err) {
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || "Something went wrong",
    });
  }
};

/**
 * POST /api/activities/:id/leave
 * @description Leave an activity
 */
const leaveActivity = async (req, res) => {
  try {
    const activity = await activityService.leaveActivity(req.params.id, req.user.id);
    res.status(200).json({
      success: true,
      message: "Left activity successfully",
      data: activity,
    });
  } catch (err) {
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || "Something went wrong",
    });
  }
};

module.exports = {
  createActivity,
  listActivities,
  listCategories,
  getActivityById,
  joinActivity,
  leaveActivity,
};