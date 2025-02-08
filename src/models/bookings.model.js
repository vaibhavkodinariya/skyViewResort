const mongoose = require("mongoose");
const { toJSON } = require("./plugins");

const bookingSchema = new mongoose.Schema(
  {
    customerName: {
      type: String,
      required: true,
    },
    businessName: {
      type: String,
    },
    businessGSTIN: {
      type: String,
    },
    customerPhone: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ["pending", "confirmed", "completed", "cancelled"],
      default: "pending",
    },
    rooms: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Room",
        required: true,
      },
    ],
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
    adhaarCard: {
      type: Number,
      required: true,
    },
    discount: {
      type: Number,
      min: 0,
    },
    gstRate: {
      type: Number,
      required: true,
    },
    gstAmount: {
      type: Number,
      required: true,
    },
    invoiceNumber: {
      type: Number,
      unique: true,
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "upi", "account"],
      default: "cash",
    },
  },
  {
    timestamps: true,
  }
);

bookingSchema.plugin(toJSON);
bookingSchema.statics.generateInvoiceNumber = async function () {
  const lastBooking = await this.findOne().sort({ invoiceNumber: -1 });
  return lastBooking ? lastBooking.invoiceNumber + 1 : 1;
};

// Pre-save hook to assign the invoice number
bookingSchema.pre("save", async function (next) {
  if (!this.invoiceNumber) {
    try {
      this.invoiceNumber = await this.constructor.generateInvoiceNumber();
    } catch (error) {
      return next(error);
    }
  }
  next();
});

const Booking = mongoose.model("Booking", bookingSchema);
module.exports = Booking;
