const Order = require("../models/order.model");
const MenuItem = require("../models/menu.model");
const status = require("http-status");
const ApiError = require("../utils/ApiError");
const mongoose = require("mongoose");
const config = require("../config/config");
const generateResponse = require("../utils/common");

exports.createOrder = async (orderData) => {
  if (orderData.tableNumber != "parcel") {
    const existingOrder = await Order.findOne({
      tableNumber: orderData.tableNumber,
      status: "pending",
    }).lean();
    if (existingOrder) {
      throw new ApiError(
        status.BAD_REQUEST,
        `An order for table number ${orderData.tableNumber} is already reserved.`
      );
    }
  }

  let totalAmount = 0;
  // Calculate the total amount
  for (const item of orderData.items) {
    const menuItem = await MenuItem.findById(item.menuItem).lean();
    if (!menuItem) {
      throw new Error(`Menu item with ID ${item.menuItem} not found.`);
    }
    totalAmount += menuItem.price * item.quantity;
  }

  const gstRate = config.gst.foodGst;
  const gstAmount = parseFloat((totalAmount * gstRate).toFixed(2));
  totalAmount += gstAmount;
  // Create a new order
  const order = new Order({
    ...orderData,
    gstRate,
    gstAmount,
    totalAmount,
  });

  return await order.save();
};

exports.getOrderById = async (order, orderStatus, isParcel) => {
  const matchQuery = {};
  if (isParcel == "1") {
    matchQuery["_id"] = mongoose.Types.ObjectId(order);
  } else {
    matchQuery["tableNumber"] = order;
  }

  if (orderStatus) {
    matchQuery["status"] = orderStatus;
  }
  return await Order.aggregate([
    { $match: matchQuery },
    {
      $lookup: {
        from: "menuitems",
        localField: "items.menuItem",
        foreignField: "_id",
        as: "menuItems",
      },
    },
    {
      $addFields: {
        items: {
          $map: {
            input: "$items",
            as: "item",
            in: {
              _id: "$$item._id",
              menuItem: {
                $arrayElemAt: [
                  {
                    $filter: {
                      input: "$menuItems",
                      as: "menu",
                      cond: { $eq: ["$$menu._id", "$$item.menuItem"] },
                    },
                  },
                  0,
                ],
              },
              quantity: "$$item.quantity",
              itemPrice: {
                $arrayElemAt: [
                  {
                    $map: {
                      input: {
                        $filter: {
                          input: "$menuItems",
                          as: "menu",
                          cond: { $eq: ["$$menu._id", "$$item.menuItem"] },
                        },
                      },
                      as: "menu",
                      in: "$$menu.price",
                    },
                  },
                  0,
                ],
              },
              totalPrice: {
                $multiply: [
                  {
                    $arrayElemAt: [
                      {
                        $map: {
                          input: {
                            $filter: {
                              input: "$menuItems",
                              as: "menu",
                              cond: { $eq: ["$$menu._id", "$$item.menuItem"] },
                            },
                          },
                          as: "menu",
                          in: "$$menu.price",
                        },
                      },
                      0,
                    ],
                  },
                  "$$item.quantity",
                ],
              },
            },
          },
        },
      },
    },
    { $project: { menuItems: 0 } }, // Exclude unnecessary field
  ]);
};

exports.updateOrderStatus = async (res, orderId, orderStatus, waiter) => {
  const order = await Order.findById(orderId);
  if (!order) {
    return res
      .status(status.OK)
      .send(generateResponse(status.NOT_FOUND, { message: "Order not found" }));
  }
  order.waiter = waiter;
  order.status = orderStatus;
  return await order.save();
};

exports.getAllOrders = async () => {
  return await Order.find();
};

exports.updateOrder = async (res, orderId, updateData) => {
  const order = await Order.findById(orderId);
  if (!order) {
    throw new ApiError(status.OK, "Order Not Found");
  }
  let totalAmount = order.totalAmount;

  // If items are updated, recalculate the total amount
  if (updateData.items?.length) {
    totalAmount = 0;
    for (const item of updateData.items) {
      const menuItem = await MenuItem.findById(item.menuItem).lean();
      totalAmount += menuItem.price * item.quantity;
    }
  }

  // Update order details
  Object.entries(updateData).forEach(([key, value]) => {
    if (key === "items") {
      order.items = value;
    } else {
      order.set(key, value);
    }
  });

  if (order.totalAmount != totalAmount) {
    const gstAmount = totalAmount * config.gst.foodGst;
    // Set the new total amount if recalculated
    order.gstAmount = parseFloat(gstAmount).toFixed(2);
    order.totalAmount = totalAmount;
  }

  return await order.save();
};
