const Room = require("../models/room.model");
const ApiError = require("../utils/ApiError");
const status = require("http-status");
const fs = require("fs");
const path = require("path");

const getRoomById = async (id) => {
  const room = await Room.findOne({ roomNumber: id });
  if (!room) throw new ApiError(status.NOT_FOUND, "Room Not Found");
  return room;
};

const createRoom = async (roomNumber, photos, price) => {
  const isExists = await Room.findOne({ roomNumber: roomNumber });
  if (isExists) throw new ApiError(status.BAD_REQUEST, "Room Already Exists");

  const newRoom = new Room({
    roomNumber,
    photos,
    price,
  });

  return await newRoom.save();
};

const updateRoom = async (roomNumber, price, photos, avaibility) => {
  const room = await Room.findOne({ roomNumber: roomNumber });

  if (!room) throw new ApiError(status.NOT_FOUND, "Room Not Found");

  room.photos.forEach((oldPhoto) => {
    const oldPhotoPath = path.join(__dirname, "../public", oldPhoto.url);

    fs.unlink(oldPhotoPath, (err) => {
      if (err) {
        console.error(`Failed to delete old image: ${oldPhotoPath}`, err);
      }
    });
  });

  // If user is admin, allow updating price and amenities
  if (price) room.price = price;
  //   if (req.user.role === "admin") {
  //   }

  // Allow updating photos for both manager and admin
  if (photos) room.photos = photos;

  if (avaibility) room.avaibility = avaibility;

  return await room.save();
};

const getRooms = () => {
  return Room.find({});
};
module.exports = { getRoomById, createRoom, updateRoom, getRooms };
