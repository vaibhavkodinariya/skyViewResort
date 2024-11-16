const express = require("express");
const validate = require("../../middlewares/validate");
const auth = require("../../middlewares/auth");
const menuItemController = require("../../controllers/menu.controller");
const uploadMiddleware = require("../../middlewares/multer");
const { roles } = require("../../config/roles");
const menuValidator = require("../../validations/menu.validation");

const router = express.Router();

router.post(
  "/",
  auth(roles.bhagwan),
  uploadMiddleware({
    folderName: "menu",
    singleUpload: true,
  }),
  validate({ body: menuValidator.addMenuSchema }),
  menuItemController.createMenuItem
);
router.put(
  "/:id",
  auth(roles.bhagwan),
  uploadMiddleware({ folderName: "menu", singleUpload: true }),
  validate({ body: menuValidator.updateMenuSchema }),
  menuItemController.updateMenuItem
);
router.get("/", auth(roles.bhagwan), menuItemController.getAllMenuItems);
router.get("/:id", auth(roles.bhagwan), menuItemController.getMenuItemById);
router.delete("/:id", auth(roles.bhagwan), menuItemController.deleteMenuItem);

module.exports = router;
