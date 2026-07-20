const { Router } = require("express");
const reviewRouter = Router();
const { protect } = require("../middleware/authMiddleware");
const reviewController = require("../controllers/review.controller");

/**
 * @route POST /api/reviews
 */
reviewRouter.post("/", protect, reviewController.createReview);

/**
 * @route GET /api/reviews/feed?radius=10&category=cafe
 * NOTE: must be registered before /:id-style routes below
 */
reviewRouter.get("/feed", protect, reviewController.getFeed);

/**
 * @route GET /api/reviews/highlights
 * NOTE: must be registered before /:id-style routes below
 */
reviewRouter.get("/highlights", protect, reviewController.listHighlightOptions);

/**
 * @route GET /api/reviews/place/:placeId
 */
reviewRouter.get("/place/:placeId", protect, reviewController.getReviewsForPlace);

/**
 * @route POST /api/reviews/:id/like
 */
reviewRouter.post("/:id/like", protect, reviewController.toggleLike);

/**
 * @route POST /api/reviews/:id/comment
 */
reviewRouter.post("/:id/comment", protect, reviewController.addComment);
/**
 * @route GET /api/reviews/:id/comments
 * @description Get all comments for a review
 */
reviewRouter.get("/:id/comments", protect, reviewController.getComments);
/**
 * @route POST /api/reviews/:id/share
 */
reviewRouter.post("/:id/share", protect, reviewController.recordShare);

module.exports = reviewRouter;