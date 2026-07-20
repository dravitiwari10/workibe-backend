const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const userRouter = require("./routes/user.routes");
const authRouter = require("./routes/auth.routes")
const activityRouter = require("./routes/activity.routes");
const connectionRouter = require("./routes/connection.routes");
const routes = require("./routes");

const app = express();

app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", routes);
app.use("/api/user", userRouter);
app.use("/auth", authRouter)
app.use("/api/activities", activityRouter);
app.use("/api/connections", connectionRouter);
const reviewRouter = require("./routes/review.routes");
const placeRouter = require("./routes/place.routes");

app.use("/api/reviews", reviewRouter);
app.use("/api/places", placeRouter);
const uploadRouter = require("./routes/upload.routes");
app.use("/api/uploads", uploadRouter);
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err); // full error in your terminal
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Something went wrong",
  });
});

module.exports = app;