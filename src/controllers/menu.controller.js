const httpStatus = require("http-status");
const menuItemService = require("../services/menu.service");
const catchAsync = require("../utils/catchAsync");
const generateResponse = require("../utils/common");
const ApiError = require("../utils/ApiError");

const createMenuItem = catchAsync(async (req, res) => {
  const photo = req.file ? `/uploads/menu/${req.file.filename}` : null;
  const { name, price, category, cuisine, calories } = req.body;
  const item = {
    name,
    price,
    photo,
    category,
    cuisine,
    calories,
  };
  const menuItem = await menuItemService.createMenuItem(item);
  res.status(httpStatus.OK).send(
    generateResponse(httpStatus.OK, {
      createdItem: menuItem,
      message: "Item Created Successfully",
    })
  );
});

const getAllMenuItems = catchAsync(async (req, res) => {
  const menuItems = await menuItemService.getAllMenuItems();
  res.status(httpStatus.OK).send(
    generateResponse(httpStatus.OK, {
      menuItems: menuItems,
      message: "Menu Items Fetched Successfully",
    })
  );
});

const getMenuItemById = catchAsync(async (req, res) => {
  const menuItem = await menuItemService.getMenuItemById(req.params.id);
  if (!menuItem)
    throw new ApiError(httpStatus.NOT_FOUND, "Menu item not found.");
  res.status(httpStatus.OK).send(
    generateResponse(httpStatus.OK, {
      item: menuItem,
      message: "Item Fetched Successfully",
    })
  );
});

const updateMenuItem = catchAsync(async (req, res) => {
  const photo = req.file ? `/uploads/menu/${req.file.filename}` : null;
  const { name, price, description, category, cuisine, calories } = req.body;

  const item = {
    name,
    price,
    description,
    photo,
    category,
    cuisine,
    calories,
  };

  const menuItem = await menuItemService.updateMenuItem(req.params.id, item);
  if (!menuItem)
    throw new ApiError(httpStatus.NOT_FOUND, "Menu item not found.");
  res.status(httpStatus.OK).send(
    generateResponse(httpStatus.OK, {
      updatedItem: menuItem,
      message: "Item Updated",
    })
  );
});

const deleteMenuItem = catchAsync(async (req, res) => {
  const menuItem = await menuItemService.deleteMenuItem(req.params.id);
  if (!menuItem)
    throw new ApiError(httpStatus.NOT_FOUND, "Menu item not found.");
  res.status(httpStatus.OK).send(
    generateResponse(httpStatus.OK, {
      message: "Item Deleted Successfully",
    })
  );
});

module.exports = {
  createMenuItem,
  getAllMenuItems,
  getMenuItemById,
  updateMenuItem,
  deleteMenuItem,
};
