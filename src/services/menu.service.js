const MenuItem = require("../models/menu.model");
const fs = require("fs").promises;
const path = require("path");
const ApiError = require("../utils/ApiError");
const status = require("http-status");

async function createMenuItem(data) {
  const menuItem = new MenuItem(data);
  return await menuItem.save();
}

async function getAllMenuItems() {
  return await MenuItem.find().lean();
}

async function getMenuItemById(id) {
  return await MenuItem.findById(id).lean();
}

async function updateMenuItem(id, data) {
  const existingMenuItem = await MenuItem.findById(id).lean();

  if (!existingMenuItem)
    throw new ApiError(status.NOT_FOUND, "Menu item not found");

  if (
    existingMenuItem.photo &&
    data.photo &&
    existingMenuItem.photo !== data.photo
  ) {
    const imagePath = path.join(__dirname, "../public", existingMenuItem.photo);
    await fs.unlink(imagePath).catch((err) => {
      throw new ApiError(
        status.BAD_REQUEST,
        `Failed to delete old image: ${err.message}`
      );
    });
  }

  Object.keys(data).forEach((key) => {
    if (data[key] !== undefined) existingMenuItem[key] = data[key];
  });

  return await existingMenuItem.save();
}

async function deleteMenuItem(id) {
  return await MenuItem.findByIdAndDelete(id);
}

module.exports = {
  createMenuItem,
  getAllMenuItems,
  getMenuItemById,
  updateMenuItem,
  deleteMenuItem,
};
