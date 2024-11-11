const mongoose = require("mongoose");

const menuSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      min: 0,
    },
    category: {
      type: String,
      enum: ["Starter", "Main Course", "Dessert", "Beverage"],
    },
    cuisine: {
      type: String,
      enum: ["Indian", "Chinese", "Italian", "Mexican"],
    },
    photo: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
);

const MenuItem = mongoose.model("MenuItem", menuSchema);

module.exports = MenuItem;
