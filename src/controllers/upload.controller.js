/**
 * POST /api/uploads  (single file, field name: "image")
 */
const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    res.status(201).json({
      success: true,
      message: "Image uploaded successfully",
      data: {
        url: req.file.path, // Cloudinary secure URL
        publicId: req.file.filename,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || "Upload failed" });
  }
};

/**
 * POST /api/uploads/multiple  (up to 5 files, field name: "images")
 */
const uploadMultipleImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: "No files uploaded" });
    }

    const urls = req.files.map((f) => ({ url: f.path, publicId: f.filename }));

    res.status(201).json({
      success: true,
      message: "Images uploaded successfully",
      data: urls,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || "Upload failed" });
  }
};

module.exports = { uploadImage, uploadMultipleImages };