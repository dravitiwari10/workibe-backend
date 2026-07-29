const Place = require("../models/place");
const User = require("../models/user");

/**
 * Find an existing place near given coords + name, or create a new one.
 * Avoids duplicate places when multiple users review the same venue.
 */
const findOrCreatePlace = async (userId, { name, category, latitude, longitude, address }) => {
  const existing = await Place.findOne({
    name: { $regex: `^${name}$`, $options: "i" },
    location: {
      $near: {
        $geometry: { type: "Point", coordinates: [longitude || 0, latitude || 0] },
        $maxDistance: 100,
      },
    },
  });

  if (existing) return existing;

  return Place.create({
    name,
    category: category || "other",
    location: {
      type: "Point",
      coordinates: [longitude || 0, latitude || 0],
      address: address || "",
    },
    addedBy: userId,
  });
};

/**
 * Search places by name, optionally biased near the user's location.
 */
const searchPlaces = async (search, userCoords) => {
  const query = search ? { $text: { $search: search } } : {};

  const hasValidOrigin =
    Array.isArray(userCoords) && !(userCoords[0] === 0 && userCoords[1] === 0);

  if (hasValidOrigin) {
    return Place.find({
      ...query,
      location: {
        $near: {
          $geometry: { type: "Point", coordinates: userCoords },
        },
      },
    }).limit(20);
  }

  return Place.find(query).limit(20);
};

/**
 * Get full place details (for the place detail screen)
 */
const getPlaceById = async (placeId) => {
  const place = await Place.findById(placeId).populate("addedBy", "name");
  if (!place) {
    const error = new Error("Place not found");
    error.statusCode = 404;
    throw error;
  }
  return place;
};

/**
 * Save / unsave a place for the logged-in user
 */
const toggleSavePlace = async (userId, placeId) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  const alreadySaved = user.savedPlaces.some((id) => id.toString() === placeId.toString());

  if (alreadySaved) {
    user.savedPlaces = user.savedPlaces.filter((id) => id.toString() !== placeId.toString());
  } else {
    user.savedPlaces.push(placeId);
  }

  await user.save();
  return { saved: !alreadySaved };
};

module.exports = {
  findOrCreatePlace,
  searchPlaces,
  getPlaceById,
  toggleSavePlace,
};