const mongoose = require("mongoose");

const stockSchema = new mongoose.Schema(
  {
    itemName: {
      type: String,
      required: true,
      unique: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
    measure: {
      type: Number,
      required: true,
      enum: ["grams", "kilograms", "liters"],
    },
    threshold: {
      type: Number,
      required: true,
      min: 0,
      default: 10, // Default threshold value, can be customized
    },
  },
  {
    timestamps: true,
  }
);

const Stock = mongoose.model("Stock", stockSchema);

module.exports = Stock;
