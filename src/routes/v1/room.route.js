const express = require("express");
const auth = require("../../middlewares/auth");
const validate = require("../../middlewares/validate");
const { roles } = require("../../config/roles");
const upload = require("../../middlewares/multer");
const {
  addRoom,
  getRoomDetails,
  getAllRooms,
  editRoom,
} = require("../../controllers/room.controller");
const roomValidator = require("../../validations/room.validation");
const uploadMiddleware = require("../../middlewares/multer");

const router = express.Router();

router.post(
  "/",
  uploadMiddleware({
    folderName: "rooms",
    maxFiles: 5,
    fileSizeLimit: 5 * 1024 * 1024,
  }),
  validate({ body: roomValidator.roomValidationSchema }),
  addRoom
);
router.put(
  "/:roomNumber",
  uploadMiddleware({
    folderName: "rooms",
    maxFiles: 5,
    fileSizeLimit: 5 * 1024 * 1024,
  }),
  validate({ body: roomValidator.roomValidationSchema }),
  editRoom
);

router.get("/:roomId", getRoomDetails);
router.get("/", getAllRooms);

module.exports = router;
