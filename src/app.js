const express = require("express");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const compression = require("compression");
const cors = require("cors");
const passport = require("passport");
const status = require("http-status");
const config = require("./config/config");
const morgan = require("./config/morgan");
const { jwtStrategy } = require("./config/passport");
const setupRateLimiter = require("./middlewares/rateLimiter");
const routes = require("./routes/v1");
const loginRoutes = require("./routes/v1/auth.route");
const { errorConverter, errorHandler } = require("./middlewares/error");
const ApiError = require("./utils/ApiError");
const path = require("path");
const bodyParser = require("body-parser");

const app = express();

// Self-invoking async function to initialize app
(async () => {
  if (config.env !== "test") {
    app.use(morgan.successHandler);
    app.use(morgan.errorHandler);
  }

  // Security & performance middlewares
  app.set("trust proxy", true);
  app.use(helmet());
  app.use(express.json());
  app.use(bodyParser.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(mongoSanitize());
  app.use(compression());
  app.use(cors());
  app.use("/v1/auth", loginRoutes);

  // JWT authentication setup
  app.use(passport.initialize());
  passport.use("jwt", jwtStrategy);

  // Serve static files
  app.use(express.static(path.join(__dirname, "public")));

  const secureLimiter = await setupRateLimiter();
  app.use(secureLimiter);

  // API Routes
  app.use("/v1", routes);

  // Handle unknown routes
  app.use((req, res, next) => {
    next(new ApiError(status.NOT_FOUND, "Not found"));
  });

  // Error handling middleware
  app.use(errorConverter);
  app.use(errorHandler);
})();

module.exports = app;
