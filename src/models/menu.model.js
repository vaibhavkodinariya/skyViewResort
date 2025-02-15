const mongoose = require("mongoose");
const { toJSON } = require("./plugins");
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
    },
    photo: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
);

menuSchema.plugin(toJSON);

const MenuItem = mongoose.model("MenuItem", menuSchema);

module.exports = MenuItem;
