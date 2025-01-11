const Room = require("../models/room.model");
const ApiError = require("../utils/ApiError");
const status = require("http-status");
const fs = require("fs");
const path = require("path");
const generateResponse = require("../utils/common");

const getRoomById = async (res, id) => {
  const room = await Room.findOne({ roomNumber: id });
  if (!room) {
    res
      .status(status.OK)
      .send(generateResponse(status.NOT_FOUND, { message: "Room Not Found" }));
    return;
  }
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

  if (!room) {
    return res
      .status(status.OK)
      .send(generateResponse(status.NOT_FOUND, { message: "Room Not Found" }));
  }
  if (photos?.length > 0) {
    room.photos.forEach((oldPhoto) => {
      const oldPhotoPath = path.join(__dirname, "../public", oldPhoto.url);

      fs.unlink(oldPhotoPath, (err) => {
        if (err) {
          console.error(`Failed to delete old image: ${oldPhotoPath}`, err);
        }
      });
    });
  }

  // If user is admin, allow updating price and amenities
  if (price) room.price = price;

  // Allow updating photos for both manager and admin
  if (photos?.length > 0) room.photos = photos;

  if (avaibility) room.avaibility = avaibility;

  return await room.save();
};

const getRooms = async () => {
  const currentDate = new Date();

  const roomsWithFlag = await Room.aggregate([
    {
      $lookup: {
        from: "bookings", // Collection to join
        localField: "_id", // Field in the Room schema
        foreignField: "rooms", // Field in the Booking schema
        as: "bookings",
      },
    },
    {
      $addFields: {
        isBooked: {
          $anyElementTrue: {
            $map: {
              input: "$bookings",
              as: "booking",
              in: {
                $and: [
                  { $lte: ["$$booking.checkInDate", currentDate] },
                  { $gte: ["$$booking.checkOutDate", currentDate] },
                ],
              },
            },
          },
        },
      },
    },
    {
      $project: {
        roomNumber: 1,
        photos: 1,
        price: 1,
        amenities: 1,
        availability: { $not: "$isBooked" }, // Add availability flag
      },
    },
  ]);
  return roomsWithFlag;
};

module.exports = { getRoomById, createRoom, updateRoom, getRooms };
