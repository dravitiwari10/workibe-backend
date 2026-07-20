const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Verifies the Bearer token (issued by generateRefreshToken) and attaches req.user
const protect = async (req, res, next) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Missing or invalid Authorization header" });
  }

  const token = header.split(" ")[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.id);

    if (!user || user.Status === "deleted") {
      return res.status(401).json({ message: "Account not found or deleted" });
    }

    // guards against a token that's technically valid but was invalidated by logout/reset
    if (user.refreshToken !== token) {
      return res.status(401).json({ message: "Session expired, please log in again" });
    }

    req.user = { id: user._id.toString(), email: user.email };
    next();
  } catch (err) {
    console.log("protect error:", err.name, "-", err.message); 
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = { protect };