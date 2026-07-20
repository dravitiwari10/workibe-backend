const { Router } = require("express");
const uploadRouter = Router();
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");
const uploadController = require("../controllers/upload.controller");

uploadRouter.post("/", protect, upload.single("image"), uploadController.uploadImage);
uploadRouter.post("/multiple", protect, upload.array("images", 5), uploadController.uploadMultipleImages);

module.exports = uploadRouter;