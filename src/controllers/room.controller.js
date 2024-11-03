const status = require("http-status");
const catchAsync = require("../utils/catchAsync");
const generateResponse = require("../utils/common");
const {
  getRoomById,
  createRoom,
  updateRoom,
  getRooms,
} = require("../services/room.service");

const getRoomDetails = catchAsync(async (req, res) => {
  const room = await getRoomById(req.params.roomId);
  res.status(status.OK).send(generateResponse(status.OK, room));
});

const addRoom = catchAsync(async (req, res) => {
  const { roomNumber, price } = req.body;

  const photos = req.files.map((file) => ({
    url: `/uploads/rooms/${roomNumber}/${file.filename}`,
  }));

  // Call the service to create the room with uploaded photos
  const newRoom = await createRoom(roomNumber, photos, price);

  // Send success response
  res.status(status.CREATED).send(
    generateResponse(status.CREATED, {
      message: "Room added successfully",
      room: newRoom,
    })
  );
});

const editRoom = catchAsync(async (req, res) => {
  const { roomNumber } = req.params;
  const { price, avaibility } = req.body;
  const photos = req.files.map((file) => ({
    url: `/uploads/rooms/${roomNumber}/${file.filename}`,
  }));
  const room = await updateRoom(roomNumber, price, photos, avaibility); // Update the room with new price and photos

  res.status(status.OK).send(
    generateResponse(status.OK, {
      message: "Room details updated successfully",
      room: room,
    })
  );
});

const getAllRooms = catchAsync(async (req, res) => {
  const rooms = await getRooms();
  res.status(status.OK).send(
    generateResponse(status.OK, {
      message: "Get All Room Fetched SuccessFully",
      rooms: rooms,
    })
  );
});

module.exports = { getRoomDetails, addRoom, editRoom, getAllRooms };
