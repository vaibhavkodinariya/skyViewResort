const mongoose = require("mongoose");
const { toJSON } = require("./plugins");
const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: Number,
      unique: true,
    },
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
    discount: {
      type: Number,
      min: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "cancelled"],
      default: "pending",
    },
    customerName: {
      type: String,
      trim: true,
    },
    customerPhoneNumber: {
      type: String,
      trim: true,
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "upi"],
    },
  },
  { timestamps: true }
);

// Static property to hold the current order number
orderSchema.statics.currentOrderNumber = 0;

// Pre-save hook to auto-increment orderNumber
orderSchema.pre("save", async function (next) {
  if (!this.isNew || this.orderNumber) return next();

  try {
    const model = this.constructor;
    if (model.currentOrderNumber === 0) {
      // Initialize the currentOrderNumber from the highest orderNumber in the collection
      const lastOrder = await model.findOne().sort("-orderNumber").exec();
      model.currentOrderNumber = lastOrder ? lastOrder.orderNumber : 0;
    }
    this.orderNumber = ++model.currentOrderNumber;
    next();
  } catch (error) {
    next(error);
  }
});

orderSchema.plugin(toJSON);
const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
