const connectionService = require("../services/connectionService");

/**
 * POST /api/connections/request/:userId
 */
const sendRequest = async (req, res) => {
  try {
    const connection = await connectionService.sendRequest(req.user.id, req.params.userId);
    res.status(201).json({
      success: true,
      message: "Connection request sent",
      data: connection,
    });
  } catch (err) {
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || "Something went wrong",
    });
  }
};

/**
 * PATCH /api/connections/:id/accept
 */
const acceptRequest = async (req, res) => {
  try {
    const connection = await connectionService.respondToRequest(req.params.id, req.user.id, "accept");
    res.status(200).json({
      success: true,
      message: "Connection accepted",
      data: connection,
    });
  } catch (err) {
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || "Something went wrong",
    });
  }
};

/**
 * PATCH /api/connections/:id/reject
 */
const rejectRequest = async (req, res) => {
  try {
    const connection = await connectionService.respondToRequest(req.params.id, req.user.id, "reject");
    res.status(200).json({
      success: true,
      message: "Connection rejected",
      data: connection,
    });
  } catch (err) {
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || "Something went wrong",
    });
  }
};

/**
 * GET /api/connections
 */
const listConnections = async (req, res) => {
  try {
    const connections = await connectionService.listConnections(req.user.id);
    res.status(200).json({
      success: true,
      message: "Connections fetched successfully",
      data: connections,
    });
  } catch (err) {
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || "Something went wrong",
    });
  }
};

/**
 * GET /api/connections/pending
 */
const listPendingRequests = async (req, res) => {
  try {
    const requests = await connectionService.listPendingRequests(req.user.id);
    res.status(200).json({
      success: true,
      message: "Pending requests fetched successfully",
      data: requests,
    });
  } catch (err) {
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || "Something went wrong",
    });
  }
};

const cancelConnectionRequest = async (req, res) => {
  try {
    const result = await connectionService.cancelConnectionRequest(
      req.params.id,   // "6a6881817da90b3ea4c60919"
      req.user.id
    );

    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (err) {
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || "Something went wrong",
    });
  }
};

module.exports = {
  sendRequest,
  acceptRequest,
  rejectRequest,
  listConnections,
  listPendingRequests,
  cancelConnectionRequest
};