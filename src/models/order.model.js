const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    tableNumber: {
      type: Number,
      required: true,
      min: 1,
    },
    waiter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        menuItem: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "MenuItem",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["Pending", "Completed", "Cancelled"],
      default: "Pending",
    },
    customerName: {
      type: String,
      required: true,
      trim: true,
    },
    customerPhoneNumber: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
