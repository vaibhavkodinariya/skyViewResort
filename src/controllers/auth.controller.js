const status = require("http-status");
const catchAsync = require("../utils/catchAsync");
const { loginUserWithEmailAndPassword } = require("../services/auth.service");
const config = require("../config/config");
const jwt = require("jsonwebtoken");
const generateResponse = require("../utils/common");

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const user = await loginUserWithEmailAndPassword(email, password);
  const token = jwt.sign({ pid: user.id, role: user.role }, config.jwt.secret, {
    expiresIn: "1h",
  });
  res.send(generateResponse(status.OK, { user: user, token: token }));
});

module.exports = {
  login,
};
