const express = require("express");
const authRoute = require("./auth.route");
const userRoute = require("./user.route");
const roomRoute = require("./room.route");
const bookingRoute = require("./booking.route");

const router = express.Router();

const defaultRoutes = [
  {
    path: "/auth",
    route: authRoute,
  },
  {
    path: "/users",
    route: userRoute,
  },
  {
    path: "/rooms",
    route: roomRoute,
  },
  {
    path: "/bookings",
    route: bookingRoute,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

module.exports = router;
