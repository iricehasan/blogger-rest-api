require("dotenv").config();
const express = require("express");
const { logger, httpLogger } = require("./middleware/logger");
const userRoutes = require("./v1/routes/users");
const blogRoutes = require("./v1/routes/blogs");
const authRoutes = require("./v1/routes/auth");
const errorHandler = require("./middleware/errorHandler");
const cookieParser = require("cookie-parser");

const app = express();

const PORT = process.env.PORT || 3000;

app.use(cookieParser());
app.use(httpLogger);
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/v1/users", userRoutes);
app.use("/api/v1/blogs", blogRoutes);
app.use("/api/v1/auth", authRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
