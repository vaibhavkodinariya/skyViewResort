const status = require("http-status");
const {
  createBooking,
  getBookings,
  roomWiseBooking,
  updateBookings,
} = require("../services/booking.service");
const catchAsync = require("../utils/catchAsync");
const generateResponse = require("../utils/common");
const fs = require("fs");
const Booking = require("../models/bookings.model");
const path = require("path");
const config = require("../config/config");
const hbs = require("hbs");

const compileTemplate = (filePath, data) => {
  const templateContent = fs.readFileSync(filePath, "utf-8");
  const compiledTemplate = hbs.compile(templateContent);
  return compiledTemplate(data);
};

const addBooking = catchAsync(async (req, res) => {
  const {
    customerName,
    customerPhone,
    rooms,
    adhaarCard,
    discount,
    checkInDate,
    checkOutDate,
    paymentMethod,
    bookingStatus,
    businessGSTIN,
    businessName,
  } = req.body;

  await createBooking(
    customerName,
    customerPhone,
    rooms,
    adhaarCard,
    discount,
    checkInDate,
    checkOutDate,
    paymentMethod,
    bookingStatus,
    businessGSTIN,
    businessName
  );

  res.status(status.CREATED).send(
    generateResponse(status.CREATED, {
      message: "Booking created successfully",
    })
  );
});

const getAllBookings = catchAsync(async (req, res) => {
  const bookings = await getBookings(res);
  if (bookings) {
    res.status(status.OK).send(
      generateResponse(status.OK, {
        message: "Booking Fetched Successfully",
        bookings: bookings,
        results: bookings.length,
      })
    );
  }
});

const getRoomWiseBooking = catchAsync(async (req, res) => {
  const { roomNumber } = req.params;

  const response = await roomWiseBooking(res, roomNumber);
  if (response) {
    return res.status(status.OK).send(response);
  }
});

const editBooking = catchAsync(async (req, res) => {
  const { bookingId } = req.params;

  await updateBookings(
    req.body?.customerName,
    req.body?.customerPhone,
    req.body?.checkInDate,
    req.body?.checkOutDate,
    bookingId,
    req.body?.discount,
    req.body?.adhaarCard,
    req.body?.rooms,
    req.body?.paymentMethod,
    req.body?.bookingStatus,
    req.body?.businessGSTIN,
    req.body?.businessName
  );

  res.status(status.OK).send(
    generateResponse(status.OK, {
      message: "Booking updated successfully",
    })
  );
});

const deleteBooking = catchAsync(async (req, res) => {
  const { bookingId } = req.params;

  await Booking.deleteOne({ _id: bookingId });

  return res.status(status.OK).send(
    generateResponse(status.OK, {
      message: "Booking Deleted successfully",
    })
  );
});

const downloadBill = catchAsync(async (req, res) => {
  const { bookingId } = req.params;

  const booking = await Booking.findById(bookingId).populate("rooms");
  if (!booking) {
    return res
      .status(200)
      .send(
        generateResponse(status.NOT_FOUND, { message: "Booking not found" })
      );
  }
  const duration = Math.ceil(
    (new Date(booking.checkOutDate) - new Date(booking.checkInDate)) /
      (1000 * 60 * 60 * 24)
  );
  // Data to pass into the template
  const data = {
    hotelName: "Sky View Resort",
    hotelAddress: "Sukhpar-Mankuva Highway, Tal. Bhuj, Dist. Kutch,370040",
    hotelPhone: "+91 9909866657 | 9909266657",
    skyViewGSTNo: config.skyViewGSTNo,
    businessName: booking?.businessName,
    businessGSTIN: booking?.businessGSTIN,
    customerName: booking?.customerName,
    roomNumber: booking.rooms.map((room) => room.roomNumber).join(", "),
    checkIn: booking.checkInDate.toDateString(),
    checkOut: booking.checkOutDate.toDateString(),
    invoiceNumber: `#${booking.invoiceNumber}`,
    invoiceDate: new Date().toDateString(),
    paymentMethod: booking.paymentMethod,
    items: booking.rooms.map((room) => ({
      description: `Room: ${room.roomNumber}`,
      unitPrice: `${room.price} * ${duration}`,
      total: room.price * duration,
    })),
    discount: booking.discount,
    subtotal: booking.totalPrice - booking.gstAmount,
    gst: booking.gstAmount,
    grandTotal: booking.totalPrice,
    hotelLogo: `${config.baseUrl}/images/skyView.svg`,
  };

  const html = compileTemplate(
    path.resolve(__dirname, "../views/hotelBilling.hbs"),
    data
  );

  res.status(200).send(generateResponse(status.OK, { html: html }));
});

module.exports = {
  addBooking,
  getAllBookings,
  getRoomWiseBooking,
  editBooking,
  deleteBooking,
  downloadBill,
};
