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
  auth(roles.bhagwan),
  uploadMiddleware({
    folderName: "rooms",
    fileSizeLimit: 10 * 1024 * 1024, // e.g., 2 MB limit
    singleUpload: false,
  }),
  validate({ body: roomValidator.roomValidationSchema }),
  addRoom
);
router.put(
  "/:roomNumber",
  auth(roles.hotelManager, roles.admin, roles.bhagwan),
  uploadMiddleware({
    folderName: "rooms",
    fileSizeLimit: 10 * 1024 * 1024,
    singleUpload: false,
  }),
  validate({ body: roomValidator.roomUpdateValidationSchema }),
  editRoom
);

router.get(
  "/:roomId",
  auth(roles.hotelManager, roles.admin, roles.bhagwan),
  getRoomDetails
);
router.get(
  "/",
  auth(roles.hotelManager, roles.admin, roles.bhagwan),
  getAllRooms
);

module.exports = router;
