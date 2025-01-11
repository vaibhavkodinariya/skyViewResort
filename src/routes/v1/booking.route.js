const express = require("express");
const validate = require("../../middlewares/validate");
const auth = require("../../middlewares/auth");
const bookingController = require("../../controllers/booking.controller");
const bookingValidations = require("../../validations/booking.validation");
const { roles } = require("../../config/roles");

const router = express.Router();

router.post(
  "/",
  auth(roles.bhagwan, roles.hotelManager),
  validate({ body: bookingValidations.bookingSchema }),
  bookingController.addBooking
);
router.get(
  "/",
  auth(roles.bhagwan, roles.hotelManager),
  bookingController.getAllBookings
);
router.get(
  "/:roomNumber",
  auth(roles.bhagwan, roles.hotelManager),
  bookingController.getRoomWiseBooking
);
router.put(
  "/:bookingId",
  auth(roles.bhagwan, roles.hotelManager),
  validate({ body: bookingValidations.updateBookingSchema }),
  bookingController.editBooking
);
router.delete(
  "/:bookingId",
  auth(roles.bhagwan, roles.hotelManager),
  bookingController.deleteBooking
);
router.get(
  "/generateBill/:bookingId",
  auth(roles.bhagwan, roles.hotelManager, roles.admin),
  validate({ params: bookingValidations.validateBookingId }),
  bookingController.downloadBill
);

module.exports = router;
