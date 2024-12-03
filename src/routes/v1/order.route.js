const express = require("express");
const validate = require("../../middlewares/validate");
const auth = require("../../middlewares/auth");
const orderController = require("../../controllers/order.controller");
const { roles } = require("../../config/roles");
const orderValidations = require("../../validations/order.validation");
const router = express.Router();

router.post(
  "/",
  auth(roles.bhagwan, roles.waiter),
  validate({ body: orderValidations.createOrder }),
  orderController.createOrder
);
router.patch(
  "/:id",
  auth(roles.bhagwan, roles.restaurantManager),
  validate({ body: orderValidations.updateStatus }),
  orderController.updateOrderStatus
);
router.get(
  "/:id",
  auth(roles.bhagwan, roles.waiter, roles.restaurantManager),
  orderController.getOrderById
);
router.get(
  "/",
  auth(roles.bhagwan, roles.restaurantManager, roles.admin),
  orderController.getAllOrders
);
router.put(
  "/:id",
  auth(roles.bhagwan, roles.restaurantManager, roles.waiter),
  validate({ body: orderValidations.updateOrder }),
  orderController.updateOrder
);

router.post("/billGenerate", orderController.billGeneration);

module.exports = router;
