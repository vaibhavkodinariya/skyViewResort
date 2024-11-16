const mongoose = require("mongoose");
const { toJSON } = require("./plugins");
const orderSchema = new mongoose.Schema(
  {
    tableNumber: {
      type: String,
      required: true,
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
    gstRate: {
      type: Number,
      required: true,
    },
    gstAmount: {
      type: Number,
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["Pending", "Completed"],
      default: "Pending",
    },
    customerName: {
      type: String,
      trim: true,
    },
    customerPhoneNumber: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

orderSchema.plugin(toJSON);
const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
