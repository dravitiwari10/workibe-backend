const { Router } = require("express");
const activityRouter = Router();
const { protect } = require("../middleware/authMiddleware");
const activityController = require("../controllers/activity.controller");

/**
 * @route POST /api/activities
 * @description Create a new activity
 */
activityRouter.post("/", protect, activityController.createActivity);

/**
 * @route GET /api/activities?category=coffee&radius=10
 * @description List activities, optionally filtered by category / radius
 */
activityRouter.get("/", protect, activityController.listActivities);

/**
 * @route GET /api/activities/:id
 */
activityRouter.get("/:id", protect, activityController.getActivityById);

/**
 * @route POST /api/activities/:id/join
 */
activityRouter.post("/:id/join", protect, activityController.joinActivity);

/**
 * @route POST /api/activities/:id/leave
 */
activityRouter.post("/:id/leave", protect, activityController.leaveActivity);

module.exports = activityRouter;