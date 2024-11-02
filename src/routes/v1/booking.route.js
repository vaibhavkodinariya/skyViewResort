const express = require("express");
const validate = require("../../middlewares/validate");
const auth = require("../../middlewares/auth");
const bookingController = require("../../controllers/booking.controller");
const bookingValidations = require("../../validations/booking.validation");

const router = express.Router();

router.post(
  "/",
  validate({ body: bookingValidations.bookingSchema }),
  bookingController.addBooking
);
router.get("/", bookingController.getAllBookings);
router.get("/:roomNumber", bookingController.getRoomWiseBooking);
router.put(
  "/:bookingId",
  validate({ body: bookingValidations.updateBookingSchema }),
  bookingController.editBooking
);

module.exports = router;
