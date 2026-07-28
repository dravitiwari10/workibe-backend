const { Router } = require("express");
const connectionRouter = Router();
const { protect } = require("../middleware/authMiddleware");
const connectionController = require("../controllers/connection.controller");

/**
 * @route POST /api/connections/request/:userId
 * @description Send a connection request to another user
 */
connectionRouter.post("/request/:userId", protect, connectionController.sendRequest);

/**
 * @route PATCH /api/connections/:id/accept
 */
connectionRouter.patch("/:id/accept", protect, connectionController.acceptRequest);

/**
 * @route PATCH /api/connections/:id/reject
 */
connectionRouter.patch("/:id/reject", protect, connectionController.rejectRequest);

/**
 * @route GET /api/connections
 * @description List logged-in user's accepted connections
 */
connectionRouter.get("/", protect, connectionController.listConnections);

/**
 * @route GET /api/connections/pending
 * @description List pending requests received by the logged-in user
 */
connectionRouter.get("/pending", protect, connectionController.listPendingRequests);
connectionRouter.delete("/:id/cancel",protect,cancelConnectionRequest);

module.exports = connectionRouter;