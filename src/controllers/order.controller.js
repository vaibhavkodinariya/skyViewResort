const OrderService = require("../services/order.service");
const catchAsync = require("../utils/catchAsync");
const status = require("http-status");
const generateResponse = require("../utils/common");
const ApiError = require("../utils/ApiError");

const createOrder = catchAsync(async (req, res, next) => {
  const orderData = req.body;
  orderData.waiter = req.user._id;
  const order = await OrderService.createOrder(orderData);
  res.status(status.CREATED).send(
    generateResponse(status.CREATED, {
      message: "Order Placed Successfully",
    })
  );
});

const getOrderById = catchAsync(async (req, res, next) => {
  const orderId = req.params.id;
  const order = await OrderService.getOrderById(orderId);
  res.status(status.OK).send(
    generateResponse(status.OK, {
      order: order,
      message: "Order Fetched Successfully",
    })
  );
});

const updateOrderStatus = catchAsync(async (req, res, next) => {
  const orderId = req.params.id;
  const orderStatus = req.body.status;
  const waiter = req.user._id;
  const updatedOrder = await OrderService.updateOrderStatus(
    orderId,
    orderStatus,
    waiter
  );
  res.status(status.OK).send(
    generateResponse(status.OK, {
      message: "Order Status Updated Successfully",
    })
  );
});

const getAllOrders = catchAsync(async (req, res, next) => {
  const orders = await OrderService.getAllOrders();
  res.status(status.OK).send(
    generateResponse(status.OK, {
      orders: orders,
      message: "Orders Fetched Successfully",
    })
  );
});

const updateOrder = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const updateData = req.body;
  updateData.waiter = req.user._id;
  const updatedOrder = await OrderService.updateOrder(id, updateData);

  if (!updatedOrder) {
    throw new ApiError(status.NOT_FOUND, "Order not found");
  }

  res.status(status.OK).send(
    generateResponse(status.OK, {
      updatedOrder: updatedOrder,
      message: "Order Updated Successfully",
    })
  );
});

module.exports = {
  createOrder,
  updateOrderStatus,
  getOrderById,
  getAllOrders,
  updateOrder,
};
