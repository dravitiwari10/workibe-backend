const Connection = require("../models/connection");

/**
 * Send a connection request
 */
const sendRequest = async (requesterId, recipientId) => {
  if (requesterId.toString() === recipientId.toString()) {
    const error = new Error("You cannot connect with yourself");
    error.statusCode = 400;
    throw error;
  }

  // Check if a connection already exists in either direction
  const existing = await Connection.findOne({
    $or: [
      { requester: requesterId, recipient: recipientId },
      { requester: recipientId, recipient: requesterId },
    ],
  });

  if (existing) {
    const error = new Error(`Connection already ${existing.status === "pending" ? "requested" : existing.status}`);
    error.statusCode = 409;
    throw error;
  }

  const connection = await Connection.create({
    requester: requesterId,
    recipient: recipientId,
  });

  return connection;
};

/**
 * Respond to a connection request (accept/reject)
 */
const respondToRequest = async (connectionId, recipientId, action) => {
  const connection = await Connection.findById(connectionId);

  if (!connection) {
    const error = new Error("Connection request not found");
    error.statusCode = 404;
    throw error;
  }

  if (connection.recipient.toString() !== recipientId.toString()) {
    const error = new Error("You are not authorized to respond to this request");
    error.statusCode = 403;
    throw error;
  }

  if (connection.status !== "pending") {
    const error = new Error(`Request already ${connection.status}`);
    error.statusCode = 409;
    throw error;
  }

  connection.status = action === "accept" ? "accepted" : "rejected";
  await connection.save();

  return connection;
};

/**
 * List a user's accepted connections
 */
const listConnections = async (userId) => {
  const connections = await Connection.find({
    status: "accepted",
    $or: [{ requester: userId }, { recipient: userId }],
  })
    .populate("requester", "name profession city")
    .populate("recipient", "name profession city");

  // Return the "other person" in each connection, not the raw pair
  return connections.map((c) => {
    const isRequester = c.requester._id.toString() === userId.toString();
    return {
      connectionId: c._id,
      user: isRequester ? c.recipient : c.requester,
      connectedAt: c.updatedAt,
    };
  });
};

/**
 * List pending requests received by this user
 */
const listPendingRequests = async (userId) => {
  const requests = await Connection.find({
    recipient: userId,
    status: "pending",
  }).populate("requester", "name profession city");

  return requests;
};

const cancelConnectionRequest = async (connectionId, currentUserId) => {
  // connectionId must be a string / ObjectId, NOT the req object
  const connection = await Connection.findById(connectionId);

  if (!connection) {
    const error = new Error("Connection request not found");
    error.statusCode = 404;
    throw error;
  }

  if (connection.requester.toString() !== currentUserId.toString()) {
    const error = new Error("You are not authorized to cancel this request");
    error.statusCode = 403;
    throw error;
  }

  if (connection.status !== "pending") {
    const error = new Error("Only pending requests can be cancelled");
    error.statusCode = 400;
    throw error;
  }

  await connection.deleteOne();

  return { message: "Connection request cancelled successfully" };
};

module.exports = {
  sendRequest,
  respondToRequest,
  listConnections,
  listPendingRequests,
  cancelConnectionRequest
};