const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const paymentController = require("../controllers/paymentController");

const userController = require("../controllers/userController");
const jwtMiddleware = require("../middleware/jwtMiddleware");

// AUTH
router.post("/api/register", userController.userRegister);
router.post("/api/login", userController.userLogin);
router.post("/api/google-login", userController.googleLogin);


// create event
router.post('/api/addEvent', jwtMiddleware,eventController.addEvent);

// get all events
router.get('/api/getAllEvents', eventController.getAllEvents);

// get single event 
router.get('/api/getSingleEvent/:id',eventController.getSingleEvent)

// update event
router.put('/api/updateEvent/:id', eventController.updateEvent);

// delete event
router.delete('/api/deleteEvent/:id', eventController.deleteEvent);

// register for event 
router.post("/api/events/:id/confirm-registration", jwtMiddleware, eventController.confirmRegistration );


// get events of cuurent host 
router.get("/api/host/events",jwtMiddleware,eventController.getHostEvents);

// stripe checkout 
router.post("/api/create-checkout-session",jwtMiddleware,paymentController.createCheckoutSession);

module.exports = router;
