const express = require("express");
const auth = require("../../middlewares/auth");
const validate = require("../../middlewares/validate");
const userValidation = require("../../validations/user.validation");
const userController = require("../../controllers/user.controller");
const { roles } = require("../../config/roles");

const router = express.Router();

router
  .route("/")
  .post(
    auth(roles.bhagwan),
    validate(userValidation.createUser),
    userController.createUser
  )
  .get(
    auth(roles.bhagwan),
    validate(userValidation.getUsers),
    userController.getUsers
  );

router
  .route("/:userId")
  .get(
    auth(roles.bhagwan),
    validate(userValidation.getUser),
    userController.getUser
  )
  .patch(
    auth(roles.bhagwan),
    validate(userValidation.updateUser),
    userController.updateUser
  )
  .delete(
    auth(roles.bhagwan),
    validate(userValidation.deleteUser),
    userController.deleteUser
  );

module.exports = router;
