const status = require("http-status");
const pick = require("../utils/pick");
const ApiError = require("../utils/ApiError");
const catchAsync = require("../utils/catchAsync");
const userService = require("../services/user.service");
const generateResponse = require("../utils/common");

const createUser = catchAsync(async (req, res) => {
  const user = await userService.addUser(req.body);
  res.status(status.CREATED).send(generateResponse(status.CREATED, user));
});

const getUsers = catchAsync(async (req, res) => {
  const filter = pick(req.query, ["name", "role"]);
  const options = pick(req.query, ["sortBy", "limit", "page"]);
  const result = await userService.queryUsers(filter, options);
  res.status(status.OK).send(generateResponse(status.OK, result));
});

const getUser = catchAsync(async (req, res) => {
  const user = await userService.getUserById(req.params.userId);
  if (!user) {
    return res
      .status(status.OK)
      .send(generateResponse(status.NOT_FOUND, "User not found"));
  }
  res.status(status.OK).send(generateResponse(status.OK, user));
});

const updateUser = catchAsync(async (req, res) => {
  const user = await userService.updateUserById(req.params.userId, req.body);
  res.status(status.OK).send(res.send(generateResponse(status.OK, user)));
});

const deleteUser = catchAsync(async (req, res) => {
  await userService.deleteUserById(req.params.userId);
  res.send(generateResponse(status.OK, { message: "User Deleted" }));
});

module.exports = {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
};
