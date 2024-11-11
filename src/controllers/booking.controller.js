const status = require("http-status");
const {
  createBooking,
  getBookings,
  roomWiseBooking,
  updateBookings,
} = require("../services/booking.service");
const catchAsync = require("../utils/catchAsync");
const generateResponse = require("../utils/common");

const addBooking = catchAsync(async (req, res) => {
  const { customerName, customerPhone, room, checkInDate, checkOutDate } =
    req.body;

  const newBooking = await createBooking(
    customerName,
    customerPhone,
    room,
    checkInDate,
    checkOutDate
  );

  res.status(status.CREATED).send(
    generateResponse(status.CREATED, {
      message: "Booking created successfully",
      room: newBooking,
    })
  );
});

const getAllBookings = catchAsync(async (req, res) => {
  const bookings = await getBookings();
  res.status(status.OK).send(
    generateResponse(status.OK, {
      message: "Booking Fetched Successfully",
      rooms: bookings,
      results: bookings.length,
    })
  );
});

const getRoomWiseBooking = catchAsync(async (req, res) => {
  const { roomNumber } = req.params;

  const bookings = await roomWiseBooking(roomNumber);

  res.status(status.OK).send(
    generateResponse(status.OK, {
      message: "Booking Fetched Successfully",
      results: bookings.length,
      booking: bookings,
    })
  );
});

const editBooking = catchAsync(async (req, res) => {
  const { bookingId } = req.params;

  const { customerName, customerPhone, checkInDate, checkOutDate } = req.body;
  const booking = await updateBookings(
    customerName,
    customerPhone,
    checkInDate,
    checkOutDate,
    bookingId
  );
  res.status(status.OK).send(
    generateResponse(status.OK, {
      message: "Booking updated successfully",
      data: booking,
    })
  );
});

module.exports = {
  addBooking,
  getAllBookings,
  getRoomWiseBooking,
  editBooking,
};
