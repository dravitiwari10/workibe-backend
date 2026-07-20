const User = require("../models/User");
const reviewService = require("../services/reviewService");
const { SUGGESTED_HIGHLIGHTS } = require("../config/reviewHighlights");

/**
 * POST /api/reviews
 */
const createReview = async (req, res) => {
  try {
    const review = await reviewService.createReview(req.user.id, req.body);
    res.status(201).json({
      success: true,
      message: "Review posted successfully",
      data: review,
    });
  } catch (err) {
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || "Something went wrong",
    });
  }
};

/**
 * GET /api/reviews/feed?radius=10&category=cafe
 */
const getFeed = async (req, res) => {
  try {
    const { radius, category } = req.query;
    const radiusKm = radius ? parseFloat(radius) : null;

    const currentUser = await User.findById(req.user.id).select("location");
    const userCoords = currentUser?.location?.coordinates || [0, 0];

    const feed = await reviewService.getFeed({
      userId: req.user.id,
      userCoords,
      radiusKm,
      category,
    });

    res.status(200).json({
      success: true,
      message: "Feed fetched successfully",
      data: feed,
    });
  } catch (err) {
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || "Something went wrong",
    });
  }
};

/**
 * GET /api/reviews/highlights
 */
const listHighlightOptions = async (req, res) => {
  res.status(200).json({ success: true, data: SUGGESTED_HIGHLIGHTS });
};

/**
 * GET /api/reviews/place/:placeId
 */
const getReviewsForPlace = async (req, res) => {
  try {
    const reviews = await reviewService.getReviewsForPlace(req.params.placeId);
    res.status(200).json({ success: true, data: reviews });
  } catch (err) {
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || "Something went wrong",
    });
  }
};

/**
 * POST /api/reviews/:id/like
 */
const toggleLike = async (req, res) => {
  try {
    const result = await reviewService.toggleLike(req.params.id, req.user.id);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || "Something went wrong",
    });
  }
};

/**
 * POST /api/reviews/:id/comment
 */
const addComment = async (req, res) => {
  try {
    const comment = await reviewService.addComment(req.params.id, req.user.id, req.body.text);
    res.status(201).json({ success: true, data: comment });
  } catch (err) {
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || "Something went wrong",
    });
  }
};

/**
 * GET /api/reviews/:id/comments
 */
const getComments = async (req, res) => {
  try {
    const comments = await reviewService.getComments(req.params.id);
    res.status(200).json({ success: true, data: comments });
  } catch (err) {
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || "Something went wrong",
    });
  }
};

/**
 * POST /api/reviews/:id/share
 */
const recordShare = async (req, res) => {
  try {
    const result = await reviewService.recordShare(req.params.id);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || "Something went wrong",
    });
  }
};

module.exports = {
  createReview,
  getFeed,
  listHighlightOptions,
  getReviewsForPlace,
  toggleLike,
  addComment,
  getComments,
  recordShare,
};