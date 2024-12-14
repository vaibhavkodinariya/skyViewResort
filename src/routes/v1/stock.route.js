const express = require("express");
const validate = require("../../middlewares/validate");
const auth = require("../../middlewares/auth");
const stockController = require("../../controllers/stock.controller");
const { roles } = require("../../config/roles");
const stockValidator = require("../../validations/stock.validation");

const router = express.Router();

router.get(
  "/under-threshold",
  auth(roles.bhagwan, roles.admin),
  stockController.getItemsUnderThreshold
);
router.post(
  "/",
  auth(roles.bhagwan, roles.restaurantManager),
  validate({ body: stockValidator.addStock }),
  stockController.addStock
);
router.put(
  "/",
  auth(roles.bhagwan, roles.restaurantManager),
  validate({ body: stockValidator.updateStock }),
  stockController.updateStock
);
router.patch(
  "/update-threshold",
  auth(roles.bhagwan, roles.restaurantManager),
  validate({ body: stockValidator.updatedThreshold }),
  stockController.setThreshold
);
router.delete(
  "/:id",
  auth(roles.bhagwan, roles.restaurantManager),
  validate({ params: stockValidator.removeStockSchema }),
  stockController.removeStock
);

router.get(
  "/",
  auth(roles.bhagwan, roles.restaurantManager, roles.admin),
  stockController.getStocks
);

module.exports = router;
