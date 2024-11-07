const express = require("express");
const validate = require("../../middlewares/validate");
const auth = require("../../middlewares/auth");
const menuItemController = require("../../controllers/menu.controller");
// const uploadMiddleware = require("../../middlewares/multer");

const router = express.Router();

// router.post(
//   "/",
//   uploadMiddleware({
//     folderName: "menu",
//     fileSizeLimit: 5 * 1024 * 1024,
//     maxFiles: 1,
//     single: true,
//   }),
//   menuItemController.createMenuItem
// );
// router.put(
//   "/:id",
//   uploadMiddleware({ folderName: "menu", single: true }),
//   menuItemController.updateMenuItem
// );
router.get("/", menuItemController.getAllMenuItems);
router.get("/:id", menuItemController.getMenuItemById);
router.delete("/:id", menuItemController.deleteMenuItem);

module.exports = router;
