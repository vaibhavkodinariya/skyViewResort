const status = require("http-status");
const stockService = require("../services/stock.service");
const catchAsync = require("../utils/catchAsync");
const generateResponse = require("../utils/common");

const updateStock = catchAsync(async (req, res) => {
  const { itemId, newQuantity } = req.body;
  const updatedStock = await stockService.updateStock(itemId, newQuantity);
  res.status(status.OK).send(
    generateResponse(status.OK, {
      updatedStock: updatedStock,
      message: "Stock Updated",
    })
  );
});

const setThreshold = catchAsync(async (req, res) => {
  const { itemId, newThreshold } = req.body;
  const stock = await stockService.setThreshold(itemId, newThreshold);
  res.status(status.OK).send(
    generateResponse(status.OK, {
      updatedThreshold: stock,
      message: "Threshold Updated",
    })
  );
});

const getItemsUnderThreshold = catchAsync(async (req, res) => {
  const items = await stockService.getItemsUnderThreshold();
  res.status(status.OK).send(
    generateResponse(status.OK, {
      underThresHold: items,
      message: "Stocks Under Threshold Fetched Successfully",
    })
  );
});

const addStock = catchAsync(async (req, res) => {
  const { itemName, quantity, threshold } = req.body;
  const newStock = await stockService.addStock({
    itemName,
    quantity,
    threshold,
  });
  res.status(status.CREATED).send(
    generateResponse(status.CREATED, {
      stock: newStock,
      message: "Item Added",
    })
  );
});

const removeStock = catchAsync(async (req, res) => {
  const { id } = req.params;
  const removedItem = await stockService.removeStock(id);
  if (!removedItem) {
    return res
      .status(status.NOT_FOUND)
      .send(generateResponse(status.NOT_FOUND, { message: "Not Found" }));
  }
  res.status(status.OK).send(
    generateResponse(status.OK, {
      message: "Item removed successfully",
      item: removedItem,
    })
  );
});

const getStocks = catchAsync(async (req, res) => {
  const stocks = await stockService.getAllItems();
  res.status(status.OK).send(
    generateResponse(status.OK, {
      message: "Stocks Fetched Successfully",
      items: stocks,
    })
  );
});

module.exports = {
  updateStock,
  setThreshold,
  getItemsUnderThreshold,
  addStock,
  removeStock,
  getStocks,
};
