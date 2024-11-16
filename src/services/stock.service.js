const status = require("http-status");
const Stock = require("../models/stock.model");
const ApiError = require("../utils/ApiError");

exports.updateStock = async (itemId, measure, newQuantity) => {
  if (newQuantity < 0)
    throw new ApiError(status.BAD_REQUEST, "Quantity cannot be negative.");

  const item = await Stock.findById(itemId);
  if (!item) throw new ApiError(status.NOT_FOUND, "Item not found.");

  item.quantity = newQuantity && newQuantity;
  item.measure = measure && measure;
  await item.save();

  return item;
};

exports.setThreshold = async (itemId, newThreshold) => {
  const item = await Stock.findById(itemId);
  if (!item) throw new ApiError(status.NOT_FOUND, "Item not found.");

  item.threshold = newThreshold;
  await item.save();
  return item;
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
