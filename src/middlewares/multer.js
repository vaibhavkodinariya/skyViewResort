const multer = require("multer");
const path = require("path");
const fs = require("fs");
const ApiError = require("../utils/ApiError");
const status = require("http-status");

// Reusable middleware function for handling uploads with custom settings
function uploadMiddleware({
  folderName,
  maxFiles = 5,
  fileSizeLimit = 5 * 1024 * 1024,
}) {
  // Configure Multer storage
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      if (!file) {
        cb(new ApiError(status.BAD_REQUEST, "Photoes are not there"), false);
      }

      const roomNumber = req.body?.roomNumber
        ? req.body.roomNumber
        : req.params.roomNumber;

      const dir = path.join(
        __dirname,
        "../public/uploads",
        folderName,
        roomNumber
      );

      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      cb(null, dir);
    },
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
    },
  });

  // File filter for valid image types
  const fileFilter = (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new ApiError(
          status.BAD_REQUEST,
          "Invalid file type. Only JPEG, JPG, and PNG are allowed."
        ),
        false
      );
    }
  };

  // Configure and return multer instance
  return multer({
    storage,
    fileFilter,
    limits: { fileSize: fileSizeLimit },
  }).array("photos", maxFiles);
}

module.exports = uploadMiddleware;
