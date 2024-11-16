const Room = require("../models/room.model");
const Booking = require("../models/bookings.model");
const ApiError = require("../utils/ApiError");
const status = require("http-status");
const config = require("../config/config");

const createBooking = async (
  customerName,
  customerPhone,
  room,
  checkInDate,
  checkOutDate
) => {
  // Check if the room exists
  const roomDetails = await Room.findOne({ roomNumber: room });
  if (!roomDetails) {
    throw new ApiError(status.NOT_FOUND, "Room not found");
  }

  room = roomDetails._id;

  // Check if booking dates are available
  const conflictingBooking = await Booking.findOne({
    room,
    $or: [
      {
        checkInDate: { $lt: checkOutDate },
        checkOutDate: { $gt: checkInDate },
      },
    ],
  });

  if (conflictingBooking && !roomDetails.availability) {
    throw new ApiError(
      status.BAD_REQUEST,
      "Room is already booked for the selected dates"
    );
  }

  // Calculate total price based on duration
  const roomPrice = roomDetails.price; // Assume `price` is the daily rate
  const checkIn = new Date(checkInDate);
  const checkOut = new Date(checkOutDate);
  const duration = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24)); // Calculate days
  const totalPrice = roomPrice * duration;

  // Add GST (e.g., 12%)
  const gstAmount = totalPrice * config.gst.hotelGst;
  const totalPriceWithGST = totalPrice + gstAmount;

  // Create new booking
  const newBooking = new Booking({
    customerName,
    customerPhone,
    room,
    checkInDate,
    checkOutDate,
    gstRate: config.gst.hotelGst,
    gstAmount,
    totalPrice: Math.round(totalPriceWithGST),
  });

  // Update room availability to false
  roomDetails.availability = false;
  await roomDetails.save();

  return await newBooking.save();
};

const getBookings = async () => {
  const bookings = await Booking.find().populate("room", "roomNumber price");
  if (!bookings.length) {
    throw new ApiError(status.NOT_FOUND, "No bookings found");
  }
  return bookings;
};

const roomWiseBooking = async (roomNumber) => {
  const room = await Room.findOne({ roomNumber: roomNumber });
  if (!room) {
    throw new ApiError(status.NOT_FOUND, "Room not found");
  }

  const bookings = await Booking.find({ room: room._id }).populate(
    "room",
    "roomNumber price"
  );

  if (!bookings.length) {
    throw new ApiError(status.NOT_FOUND, "No bookings found for this room");
  }
  return bookings;
};

const updateBookings = async (
  customerName,
  customerPhone,
  checkInDate,
  checkOutDate,
  bookingId
) => {
  // Find the booking by ID
  const booking = await Booking.findById(bookingId);
  if (!booking) {
    throw new ApiError(status.NOT_FOUND, "Booking not found");
  }

  // Check for conflicting bookings if check-in or check-out dates are updated
  if (checkInDate || checkOutDate) {
    const conflictingBooking = await Booking.findOne({
      room: booking.room,
      _id: { $ne: bookingId },
      $or: [
        {
          checkInDate: { $lt: checkOutDate || booking.checkOutDate },
          checkOutDate: { $gt: checkInDate || booking.checkInDate },
        },
      ],
    });

    if (conflictingBooking) {
      throw new ApiError(
        status.BAD_REQUEST,
        "Room is already booked for the updated dates"
      );
    }
  }

  // Update booking details if provided
  if (customerName) {
    booking.customerName = customerName;
  }
  if (customerPhone) {
    booking.customerPhone = customerPhone;
  }
  if (checkInDate) {
    booking.checkInDate = checkInDate;
  }
  if (checkOutDate) {
    booking.checkOutDate = checkOutDate;
  }

  // Recalculate total price if dates are updated
  if (checkInDate || checkOutDate) {
    const roomDetails = await Room.findById(booking.room);
    if (!roomDetails) {
      throw new ApiError(status.NOT_FOUND, "Room not found");
    }

    const roomPrice = roomDetails.price;
    const checkIn = new Date(booking.checkInDate);
    const checkOut = new Date(booking.checkOutDate);
    const duration = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24)); // Calculate days

    const totalPrice = roomPrice * duration;
    const gstAmount = totalPrice * config.gst.hotelGst;
    const totalPriceWithGST = totalPrice + gstAmount;

    booking.gstAmount = gstAmount;
    booking.totalPrice = Math.round(totalPriceWithGST);
  }
  return await booking.save();
};

module.exports = {
  createBooking,
  getBookings,
  roomWiseBooking,
  updateBookings,
};
