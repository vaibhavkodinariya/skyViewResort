const mongoose = require("mongoose");
const { toJSON, paginate } = require("./plugins");

const roomSchema = new mongoose.Schema(
  {
    roomNumber: {
      type: String,
      required: true,
      unique: true,
      index: true, // Indexing roomNumber
    },
    photos: [
      {
        url: String,
      },
    ],
    price: {
      type: Number,
      required: true,
    },
    amenities: {
      AC: { type: Boolean, default: true },
      TV: { type: Boolean, default: true },
      Geyser: { type: Boolean, default: true },
      MineralWater: { type: Boolean, default: true },
      Sofa: { type: Boolean, default: true },
      Fan: { type: Boolean, default: true },
      AttachBathroom: { type: Boolean, default: true },
    },
    availability: {
      type: Boolean,
      default: true,
      index: true, // Indexing availability for fast querying
    },
  },
  {
    timestamps: true,
  }
);

roomSchema.plugin(toJSON);
const Room = mongoose.model("Room", roomSchema);
module.exports = Room;
