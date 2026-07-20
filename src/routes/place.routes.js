const { Router } = require("express");
const placeRouter = Router();
const { protect } = require("../middleware/authMiddleware");
const placeController = require("../controllers/place.controller");

/**
 * @route GET /api/places/search?search=blue+tokai
 * NOTE: must be registered before /:id below
 */
placeRouter.get("/search", protect, placeController.searchPlaces);

/**
 * @route GET /api/places/:id
 */
placeRouter.get("/:id", protect, placeController.getPlaceById);

/**
 * @route POST /api/places/:id/save
 */
placeRouter.post("/:id/save", protect, placeController.toggleSave);

module.exports = placeRouter;