const express = require("express");
const authRoute = require("./auth.route");
const userRoute = require("./user.route");
const roomRoute = require("./room.route");
const bookingRoute = require("./booking.route");
const stockRoute = require("./stock.route");
const menuRoute = require("./menu.route");
const orderRoute = require("./order.route");

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
  {
    path: "/stocks",
    route: stockRoute,
  },
  {
    path: "/menu",
    route: menuRoute,
  },
  {
    path: "/orders",
    route: orderRoute,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

module.exports = router;
