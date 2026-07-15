const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const userRouter = require("./routes/user.routes");
const authRouter = require("./routes/auth.routes")

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

module.exports = app;