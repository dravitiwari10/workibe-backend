const User = require("../models/User");
const placeService = require("../services/placeService");

/**
 * GET /api/places/search?search=blue+tokai
 */
const searchPlaces = async (req, res) => {
  try {
    const { search } = req.query;
    const currentUser = await User.findById(req.user.id).select("location");
    const userCoords = currentUser?.location?.coordinates || [0, 0];

    const places = await placeService.searchPlaces(search, userCoords);
    res.status(200).json({ success: true, data: places });
  } catch (err) {
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || "Something went wrong",
    });
  }
};

/**
 * GET /api/places/:id
 */
const getPlaceById = async (req, res) => {
  try {
    const place = await placeService.getPlaceById(req.params.id);
    res.status(200).json({ success: true, data: place });
  } catch (err) {
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || "Something went wrong",
    });
  }
};

/**
 * POST /api/places/:id/save
 */
const toggleSave = async (req, res) => {
  try {
    const result = await placeService.toggleSavePlace(req.user.id, req.params.id);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || "Something went wrong",
    });
  }
};

module.exports = {
  searchPlaces,
  getPlaceById,
  toggleSave,
};