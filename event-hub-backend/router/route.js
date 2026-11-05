const express = require("express");
const router = express.Router();

const eventController = require("../controllers/eventController");
const paymentController = require("../controllers/paymentController");
const userController = require("../controllers/userController");
const jwtMiddleware = require("../middleware/jwtMiddleware");
const requireRole = require("../middleware/requireRole");

const hostOnly = [jwtMiddleware, requireRole("host")];
const userOnly = [jwtMiddleware, requireRole("user")];

// AUTH
router.post("/api/register", userController.userRegister);
router.post("/api/login", userController.userLogin);
router.post("/api/google-login", userController.googleLogin);

// EVENTS — public
router.get("/api/getAllEvents", eventController.getAllEvents);
router.get("/api/getSingleEvent/:id", eventController.getSingleEvent);

// EVENTS — host manages their own
router.post("/api/addEvent", hostOnly, eventController.addEvent);
router.put("/api/updateEvent/:id", hostOnly, eventController.updateEvent);
router.delete("/api/deleteEvent/:id", hostOnly, eventController.deleteEvent);
router.get("/api/host/events", hostOnly, eventController.getHostEvents);

// REGISTRATIONS & TICKETS — user
router.post(
  "/api/events/:id/confirm-registration",
  userOnly,
  eventController.confirmRegistration
);
router.get("/api/user/registrations", userOnly, eventController.getMyRegistrations);
router.get("/api/events/:id/ticket", userOnly, eventController.getMyTicket);

// STRIPE CHECKOUT (demo only)
router.post(
  "/api/create-checkout-session",
  userOnly,
  paymentController.createCheckoutSession
);

module.exports = router;
