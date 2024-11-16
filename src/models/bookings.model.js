const mongoose = require("mongoose");
const { toJSON } = require("./plugins");

const bookingSchema = new mongoose.Schema(
  {
    customerName: {
      type: String,
      required: true,
    },
    customerPhone: {
      type: String,
      required: true,
    },
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: true,
    },
    platform: {
      type: String,
      enum: ["skyviewresort"],
      default: "skyviewresort",
    },
    checkInDate: {
      type: Date,
      required: true,
      index: true,
    },
    checkOutDate: {
      type: Date,
      required: true,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    gstRate: {
      type: Number,
      required: true,
    },
    gstAmount: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

bookingSchema.plugin(toJSON);
const Booking = mongoose.model("Booking", bookingSchema);
module.exports = Booking;
