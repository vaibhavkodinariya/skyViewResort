const multer = require("multer");
const path = require("path");
const fs = require("fs");
const ApiError = require("../utils/ApiError");
const status = require("http-status");

// Reusable directory creation function
const ensureDirectoryExists = (dir) =>
  !fs.existsSync(dir) && fs.mkdirSync(dir, { recursive: true });

function uploadMiddleware({
  folderName,
  maxFiles = 10,
  fileSizeLimit = 10 * 1024 * 1024,
  singleUpload = false,
}) {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const roomNumber = req.body?.roomNumber || req.params.roomNumber;
      let dir;
      if (singleUpload) {
        dir = path.join(__dirname, "../public/uploads", folderName);
        console.log("hii", dir);
      } else {
        dir = path.join(__dirname, "../public/uploads", folderName, roomNumber);
      }
      ensureDirectoryExists(dir);
      cb(null, dir);
    },
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
  });

  const fileFilter = (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
    cb(
      null,
      allowedTypes.includes(file.mimetype)
        ? true
        : new ApiError(
            status.BAD_REQUEST,
            "Invalid file type. Only JPEG, JPG, and PNG are allowed."
          )
    );
  };

  return multer({
    storage,
    fileFilter,
    limits: { fileSize: fileSizeLimit },
  })[singleUpload ? "single" : "array"](
    singleUpload ? "photo" : "photos",
    maxFiles
  );
}

module.exports = uploadMiddleware;
