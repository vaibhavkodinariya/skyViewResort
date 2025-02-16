const Room = require("../models/room.model");
const Booking = require("../models/bookings.model");
const ApiError = require("../utils/ApiError");
const status = require("http-status");
const config = require("../config/config");
const generateResponse = require("../utils/common");

const createBooking = async (
  customerName,
  customerPhone,
  roomNumbers,
  adhaarCard,
  discount,
  checkInDate,
  checkOutDate,
  paymentMethod,
  bookingStatus,
  businessGSTIN,
  businessName
) => {
  // Fetch details of all rooms in the booking
  const rooms = await Room.find({ roomNumber: { $in: roomNumbers } });

  if (rooms.length !== roomNumbers.length) {
    throw new ApiError(status.OK, "One or more rooms not found");
  }

  // Check for conflicting bookings for each room
  for (const room of rooms) {
    const conflictingBooking = await Booking.findOne({
      rooms: { $in: room._id },
      $or: [
        {
          checkInDate: { $lte: checkOutDate },
          checkOutDate: { $gte: checkInDate },
        },
      ],
    });

    if (conflictingBooking) {
      throw new ApiError(
        status.BAD_REQUEST,
        `Room ${room.roomNumber} is already booked for the selected dates`
      );
    }
  }

  // Calculate total price and GST
  const duration = Math.ceil(
    (new Date(checkOutDate) - new Date(checkInDate)) / (1000 * 60 * 60 * 24)
  );

  let totalRoomPrice = 0;
  const roomDetails = [];

  for (const room of rooms) {
    const roomPrice = room.price * duration; // Daily rate * duration
    totalRoomPrice += roomPrice;
    roomDetails.push(room._id);
  }

  const gstRate = config.gst.hotelGst;
  const gstAmount = totalRoomPrice * gstRate;
  let totalPriceWithGST = totalRoomPrice + gstAmount - discount;

  // Create new booking
  await Booking.create({
    customerName,
    customerPhone,
    rooms: roomDetails,
    adhaarCard,
    discount,
    checkInDate,
    checkOutDate,
    gstRate,
    gstAmount,
    paymentMethod,
    totalPrice: Math.round(totalPriceWithGST),
    status: bookingStatus,
    businessGSTIN,
    businessName,
  });

  return;
};

const getBookings = async (res) => {
  const bookings = await Booking.find().populate("rooms", "roomNumber price");
  if (!bookings.length) {
    return res
      .status(status.OK)
      .send(
        generateResponse(status.NOT_FOUND, { message: "No bookings found" })
      );
  }
  return bookings;
};

const roomWiseBooking = async (res, roomNumber) => {
  const room = await Room.findOne({ roomNumber: roomNumber });
  if (!room) {
    return generateResponse(status.NOT_FOUND, { message: "Room not found" });
  }

  const bookings = await Booking.find({ rooms: { $in: [room._id] } }).populate(
    "rooms",
    "roomNumber price"
  );
  if (!bookings?.length) {
    return generateResponse(status.NOT_FOUND, {
      message: "No bookings found for this room",
    });
  }
  return generateResponse(status.OK, {
    message: "Booking Fetched Successfully",
    results: bookings.length,
    booking: bookings,
  });
};

const updateBookings = async (
  customerName,
  customerPhone,
  checkInDate,
  checkOutDate,
  bookingId,
  discount,
  adhaarCard,
  roomNumbers,
  paymentMethod,
  bookingStatus,
  businessGSTIN,
  businessName
) => {
  // Find the booking by ID and populate room details
  const booking = await Booking.findById(bookingId).populate("rooms.room");
  if (!booking) {
    throw new ApiError(status.OK, "Booking not found");
  }

  const currentRoomIds = booking.rooms.map((r) => r);

  // Check for room updates
  let updatedRoomIds = currentRoomIds;
  if (roomNumbers && roomNumbers.length > 0) {
    const rooms = await Room.find({ roomNumber: { $in: roomNumbers } });

    if (rooms.length !== roomNumbers.length) {
      throw new ApiError(status.OK, "One or more rooms not found");
    }

    // Check for conflicts in all new rooms in one query
    const conflictingBookings = await Booking.findOne({
      "rooms.room": { $in: rooms.map((r) => r._id) },
      _id: { $ne: bookingId },
      $or: [
        {
          checkInDate: { $lt: checkOutDate || booking.checkOutDate },
          checkOutDate: { $gt: checkInDate || booking.checkInDate },
        },
      ],
    });

    if (conflictingBookings) {
      throw new ApiError(
        status.BAD_REQUEST,
        `One or more selected rooms are already booked for the updated dates`
      );
    }

    updatedRoomIds = rooms.map((room) => room._id);
  }

  // Update fields dynamically
  if (customerName) booking.customerName = customerName;
  if (customerPhone) booking.customerPhone = customerPhone;
  if (adhaarCard) booking.adhaarCard = adhaarCard;
  if (paymentMethod) booking.paymentMethod = paymentMethod;
  if (checkInDate) booking.checkInDate = checkInDate;
  if (checkOutDate) booking.checkOutDate = checkOutDate;
  if (discount !== undefined) booking.discount = discount;
  if (bookingStatus) booking.status = bookingStatus;
  if (businessGSTIN) booking.businessGSTIN = businessGSTIN;
  if (businessName) booking.businessName = businessName;

  // Recalculate total price and GST if dates or rooms are updated
  const duration = Math.ceil(
    (new Date(booking.checkOutDate) - new Date(booking.checkInDate)) /
      (1000 * 60 * 60 * 24)
  ); // Calculate days

  if (duration < 0) {
    throw new ApiError(
      status.BAD_REQUEST,
      "Check-out date must be after the check-in date"
    );
  }

  const rooms = await Room.find({ _id: { $in: updatedRoomIds } });
  const totalRoomPrice = rooms.reduce(
    (sum, room) => sum + room.price * duration,
    0
  );

  const gstRate = config.gst.hotelGst;
  const gstAmount = totalRoomPrice * gstRate;
  let totalPriceWithGST = totalRoomPrice + gstAmount - (discount || 0);

  booking.rooms = updatedRoomIds.map((id) => id);
  booking.gstAmount = gstAmount;
  booking.totalPrice = Math.round(totalPriceWithGST);

  return await booking.save();
};

module.exports = {
  createBooking,
  getBookings,
  roomWiseBooking,
  updateBookings,
};
