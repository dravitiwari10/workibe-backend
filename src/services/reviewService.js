const Review = require("../models/Review");
const Place = require("../models/Place");
const User = require("../models/User");
const placeService = require("./placeService");

/**
 * Haversine distance in km between two [lng, lat] pairs
 */
const calculateDistanceKm = ([lng1, lat1], [lng2, lat2]) => {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
};

/**
 * Create a review — finds/creates the Place, creates the Review,
 * then recalculates the Place's avgRating + highlight tag counts.
 */
const createReview = async (userId, details) => {
  const {
    placeName,
    placeCategory,
    latitude,
    longitude,
    address,
    rating,
    text,
    highlights,
    photos,
  } = details;

  if (!placeName || !rating) {
    const error = new Error("placeName and rating are required");
    error.statusCode = 400;
    throw error;
  }
  if (rating < 1 || rating > 5) {
    const error = new Error("rating must be between 1 and 5");
    error.statusCode = 400;
    throw error;
  }

  const place = await placeService.findOrCreatePlace(userId, {
    name: placeName,
    category: placeCategory,
    latitude,
    longitude,
    address,
  });

  const review = await Review.create({
    place: place._id,
    user: userId,
    rating,
    text: text || "",
    highlights: highlights || [],
    photos: photos || [],
  });

  // Recalculate place's average rating
  const stats = await Review.aggregate([
    { $match: { place: place._id } },
    { $group: { _id: "$place", avg: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);

  // Aggregate highlight tag counts across all reviews for this place
  const highlightStats = await Review.aggregate([
    { $match: { place: place._id } },
    { $unwind: "$highlights" },
    { $group: { _id: "$highlights", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 },
  ]);

  await Place.findByIdAndUpdate(place._id, {
    avgRating: stats[0] ? Math.round(stats[0].avg * 10) / 10 : rating,
    reviewCount: stats[0] ? stats[0].count : 1,
    highlights: highlightStats.map((h) => ({ tag: h._id, count: h.count })),
  });

  return Review.findById(review._id).populate("user", "name photoUrl badge").populate("place");
};

/**
 * Discover feed — recent reviews, optionally scoped to a radius/category.
 * NOTE: `rating` on each card is the review's own star rating.
 * If your design wants the PLACE's aggregate rating shown on the card
 * instead, swap `rating: r.rating` below for `rating: r.place.avgRating`.
 */
const getFeed = async ({ userId, userCoords, radiusKm, category }) => {
  const hasValidOrigin =
    Array.isArray(userCoords) && !(userCoords[0] === 0 && userCoords[1] === 0);

  let placeIds = null;

  if (hasValidOrigin && radiusKm) {
    const nearQuery = {
      location: {
        $near: {
          $geometry: { type: "Point", coordinates: userCoords },
          $maxDistance: radiusKm * 1000,
        },
      },
    };
    if (category) nearQuery.category = category;
    const nearbyPlaces = await Place.find(nearQuery).select("_id");
    placeIds = nearbyPlaces.map((p) => p._id);
  }

  const query = placeIds ? { place: { $in: placeIds } } : {};

  const reviews = await Review.find(query)
    .populate("user", "name photoUrl badge")
    .populate("place")
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  const currentUser = userId ? await User.findById(userId).select("savedPlaces") : null;
  const savedPlaceIds = new Set((currentUser?.savedPlaces || []).map((id) => id.toString()));

  return reviews.map((r) => {
    let distanceInKm = null;
    if (hasValidOrigin && r.place?.location?.coordinates) {
      distanceInKm = calculateDistanceKm(userCoords, r.place.location.coordinates);
    }

    return {
      _id: r._id,
      user: {
        id: r.user?._id,
        name: r.user?.name || "Unknown",
        avatar: r.user?.photoUrl || "",
        badge: r.user?.badge || "none",
      },
      createdAt: r.createdAt,
      photos: r.photos,
      place: {
        id: r.place?._id,
        name: r.place?.name,
        address: r.place?.location?.address || "",
        tags: r.place?.tags || [],
      },
      rating: r.rating,
      text: r.text,
      highlights: r.highlights || [],
      distanceInKm,
      likeCount: r.likes?.length || 0,
      commentCount: r.comments?.length || 0,
      shareCount: r.shareCount || 0,
      likedByMe: userId ? r.likes?.some((id) => id.toString() === userId.toString()) : false,
      savedByMe: r.place?._id ? savedPlaceIds.has(r.place._id.toString()) : false,
    };
  });
};

/**
 * All reviews for a specific place (place detail screen)
 */
const getReviewsForPlace = async (placeId) => {
  return Review.find({ place: placeId })
    .populate("user", "name photoUrl badge")
    .populate("comments.user", "name photoUrl")
    .sort({ createdAt: -1 });
};

/**
 * Like / unlike a review
 */
const toggleLike = async (reviewId, userId) => {
  const review = await Review.findById(reviewId);
  if (!review) {
    const error = new Error("Review not found");
    error.statusCode = 404;
    throw error;
  }

  const alreadyLiked = review.likes.some((id) => id.toString() === userId.toString());

  if (alreadyLiked) {
    review.likes = review.likes.filter((id) => id.toString() !== userId.toString());
  } else {
    review.likes.push(userId);
  }

  await review.save();
  return { liked: !alreadyLiked, likeCount: review.likes.length };
};

/**
 * Add a comment to a review
 */
const addComment = async (reviewId, userId, text) => {
  if (!text || !text.trim()) {
    const error = new Error("Comment text is required");
    error.statusCode = 400;
    throw error;
  }

  const review = await Review.findByIdAndUpdate(
    reviewId,
    { $push: { comments: { user: userId, text: text.trim() } } },
    { new: true }
  ).populate("comments.user", "name photoUrl");

  if (!review) {
    const error = new Error("Review not found");
    error.statusCode = 404;
    throw error;
  }

  return review.comments[review.comments.length - 1];
};

/**
 * Track a share event on a review
 */
const recordShare = async (reviewId) => {
  const review = await Review.findByIdAndUpdate(
    reviewId,
    { $inc: { shareCount: 1 } },
    { new: true }
  );
  if (!review) {
    const error = new Error("Review not found");
    error.statusCode = 404;
    throw error;
  }
  return { shareCount: review.shareCount };
};

/**
 * Get all comments for a single review
 */
const getComments = async (reviewId) => {
  const review = await Review.findById(reviewId)
    .select("comments")
    .populate("comments.user", "name photoUrl badge");

  if (!review) {
    const error = new Error("Review not found");
    error.statusCode = 404;
    throw error;
  }

  // Most recent first (flip to reverse if you want oldest-first threading)
  return [...review.comments].sort((a, b) => b.createdAt - a.createdAt);
};

module.exports = {
  createReview,
  getFeed,
  getReviewsForPlace,
  toggleLike,
  addComment,
  getComments,
  recordShare,
};