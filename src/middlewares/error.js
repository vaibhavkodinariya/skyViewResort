const mongoose = require("mongoose");
const { status: httpStatus } = require("http-status");
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
        ? httpStatus.BAD_REQUEST
        : httpStatus.INTERNAL_SERVER_ERROR;
    const message = error.message || httpStatus[statusCode];
    error = new ApiError(statusCode, message, false, err.stack);
  }
  next(error);
};
// 1729933752829-fcca79b9-30e5-4e3a-955c-9e7c2e09f5bb-031.jpg
// 1729933795079-ba7c10c0-6413-41b4-b0d4-3571f2ed7859-031.jpg
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
    statusCode = httpStatus.INTERNAL_SERVER_ERROR;
    message = httpStatus[httpStatus.INTERNAL_SERVER_ERROR];
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
