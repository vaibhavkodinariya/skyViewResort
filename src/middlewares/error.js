const mongoose = require("mongoose");
const status = require("http-status");
const config = require("../config/config");
const logger = require("../config/logger");
const ApiError = require("../utils/ApiError");
const multer = require("multer");
const fs = require("fs").promises;

const errorConverter = (err, req, res, next) => {
  let error = err;
  if (!(error instanceof ApiError)) {
    const statusCode =
      error.statusCode ||
      error instanceof mongoose.Error ||
      error instanceof multer.MulterError
        ? status.BAD_REQUEST
        : status.INTERNAL_SERVER_ERROR;
    const message = error.message || status[statusCode];
    error = new ApiError(statusCode, message, false, err.stack);
  }
  next(error);
};

// eslint-disable-next-line no-unused-vars
const errorHandler = async (err, req, res, next) => {
  let { statusCode, message } = err;
  if (req.files) {
    await Promise.all(
      req.files.map(async (file) => {
        try {
          if (fs.access(file.path)) {
            await fs.unlink(file.path);
          }
        } catch (unlinkError) {
          console.error(`Failed to delete file: ${unlinkError.message}`);
        }
      })
    );
  }

  if (config.env === "production" && !err.isOperational) {
    statusCode = status.INTERNAL_SERVER_ERROR;
    message = status[status.INTERNAL_SERVER_ERROR];
  }

  res.locals.errorMessage = err.message;

  const response = {
    message,
    ...(config.env === "development" && { stack: err.stack }),
  };

  if (config.env === "development") {
    logger.error(err);
  }

  return res
    .status(statusCode || 500)
    .send({ status: statusCode, error: response, response: {} });
};

module.exports = {
  errorConverter,
  errorHandler,
};
