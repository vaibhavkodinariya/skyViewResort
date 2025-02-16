const OrderService = require("../services/order.service");
const catchAsync = require("../utils/catchAsync");
const status = require("http-status");
const generateResponse = require("../utils/common");
const Order = require("../models/order.model");
const hbs = require("hbs");
const fs = require("fs");
const path = require("path");
const moment = require("moment");
const config = require("../config/config");
const { tables } = require("../config/tables");

const compileTemplate = (filePath, data) => {
  const templateContent = fs.readFileSync(filePath, "utf-8");
  const compiledTemplate = hbs.compile(templateContent);
  return compiledTemplate(data);
};

const getAllTableStatus = catchAsync(async (req, res) => {
  // Map through the tables array and check the status for each table
  const tableStatuses = await Promise.all(
    tables.map(async (tableNumber) => {
      const pendingOrder = await Order.findOne({
        tableNumber,
        status: "pending",
      });

      return {
        id: tableNumber,
        name: tableNumber == "parcel" ? tableNumber : `Table ${tableNumber}`,
        isEditAllowed: tableNumber == "parcel" ? false : true,
        status: pendingOrder ? "pending" : "available",
      };
    })
  );

  return res.status(status.OK).send(
    generateResponse(status.OK, {
      tables: tableStatuses,
    })
  );
});

const createOrder = catchAsync(async (req, res, next) => {
  const orderData = req.body;
  orderData.waiter = req.user._id;
  await OrderService.createOrder(orderData);
  res.status(status.CREATED).send(
    generateResponse(status.CREATED, {
      message: "Order Placed Successfully",
    })
  );
});

const getOrderById = catchAsync(async (req, res, next) => {
  const order = req.params?.id;
  const isParcel = req.query?.parcel;
  const orderStatus = req.query?.status;
  const orderResponse = await OrderService.getOrderById(
    order,
    orderStatus,
    isParcel
  );
  res.status(status.OK).send(
    generateResponse(status.OK, {
      order: orderResponse,
      message: "Order Fetched Successfully",
    })
  );
});

const updateOrderStatus = catchAsync(async (req, res, next) => {
  const orderId = req.params.id;
  const orderStatus = req.body.status;
  const waiter = req.user._id;
  await OrderService.updateOrderStatus(res, orderId, orderStatus, waiter);
  return res.status(status.OK).send(
    generateResponse(status.OK, {
      message: "Order Status Updated Successfully",
    })
  );
});

const getAllOrders = catchAsync(async (req, res, next) => {
  const orders = await OrderService.getAllOrders();
  return res.status(status.OK).send(
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
  const updatedOrder = await OrderService.updateOrder(res, id, updateData);
  if (updatedOrder) {
    return res.status(status.OK).send(
      generateResponse(status.OK, {
        updatedOrder: updatedOrder,
        message: "Order Updated Successfully",
      })
    );
  }
});

const deleteOrder = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  await Order.deleteOne({ _id: id });
  return res.status(status.OK).send(
    generateResponse(status.OK, {
      message: "Order Deleted successfully",
    })
  );
});

const billGeneration = catchAsync(async (req, res) => {
  const { orderId } = req.body;
  const orderList = await Order.findOne({
    _id: orderId,
  }).populate("items.menuItem");
  orderList.items.map((item) => {
    item["itemTotalAmount"] = item.quantity * item.menuItem.price;
    item["price"] = item.menuItem.price;
  });
  orderList["hotelName"] = "Sky View Resort";
  orderList["GSTNO"] = config.skyViewGSTNo;
  orderList["hotelAddress"] =
    "Sukhpar-Mankuva Highway, Tal. Bhuj, Dist. Kutch,370040";
  orderList["hotelPhone"] = "+91 9909866657 | 9909266657";
  orderList.createdAt = moment(orderList.createdAt).format("DD-MM-YYYY");
  orderList["totalAmountPlusGST"] = orderList.totalAmount + orderList.gstAmount;

  if (orderList?.discount > 0) {
    orderList["totalAmountPlusGST"] =
      orderList["totalAmountPlusGST"] - orderList.discount;
  }
  orderList["hotelLogo"] = `${config.baseUrl}/images/skyView.svg`;
  orderList["partnerLogo"] = `${config.baseUrl}/images/chotuRestoLogo.png`;
  orderList["totalAmountPlusGST"] = parseInt(orderList["totalAmountPlusGST"]);
  const html = compileTemplate(
    path.resolve(__dirname, "../views/restoBilling.hbs"),
    orderList
  );

  res.status(200).send(generateResponse(status.OK, { html: html }));
});

module.exports = {
  createOrder,
  updateOrderStatus,
  getOrderById,
  getAllOrders,
  updateOrder,
  billGeneration,
  deleteOrder,
  getAllTableStatus,
};
