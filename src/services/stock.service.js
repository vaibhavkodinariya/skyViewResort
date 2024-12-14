const status = require("http-status");
const Stock = require("../models/stock.model");
const ApiError = require("../utils/ApiError");
const generateResponse = require("../utils/common");

exports.updateStock = async (itemId, measure, newQuantity) => {
  if (newQuantity < 0) {
    throw new ApiError(status.BAD_REQUEST, "Quantity cannot be negative.");
  }

  const item = await Stock.findById(itemId);
  if (!item) {
    return res
      .status(status.OK)
      .send(generateResponse(status.NOT_FOUND, { message: "Item not found." }));
  }

  item.quantity = newQuantity && newQuantity;
  item.measure = measure && measure;
  return await item.save();
};

exports.setThreshold = async (itemId, newThreshold) => {
  const item = await Stock.findById(itemId);
  if (!item) {
    return res
      .status(status.OK)
      .send(generateResponse(status.NOT_FOUND, { message: "Item not found." }));
  }

  item.threshold = newThreshold;
  return await item.save();
};

exports.getItemsUnderThreshold = async () => {
  const items = await Stock.find({
    $expr: { $lt: ["$quantity", "$threshold"] },
  });
  return items;
};

exports.addStock = async (stockData) => {
  const { itemName, measure, quantity, threshold } = stockData;
  // Validate if the itemName already exists to avoid duplicates (optional)
  const existingStock = await Stock.findOne({ itemName });
  if (existingStock) {
    throw new ApiError(
      status.BAD_REQUEST,
      `Item "${itemName}" already exists in stock.`
    );
  }
  // Create and save the new stock item
  const newStock = new Stock({ itemName, measure, quantity, threshold });
  await newStock.save();
  return newStock;
};

exports.removeStock = async (id) => {
  return await Stock.findByIdAndDelete(id);
};

exports.getAllItems = async () => {
  return await Stock.find({});
};
