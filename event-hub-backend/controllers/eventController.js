const Event = require('../models/eventModel');

// ADD EVENT
exports.addEvent = async (req, res) => {
  console.log("Inside createEvent");
  console.log(req.body);

  const {
    title,
    description,
    poster,
    date,
    time,
    location,
    isOnline,
    category,
    priceType,
    price,
    capacity
  } = req.body;

  const hostEmail = req.payload; // ✅ from JWT

  try {
    // form validation
    if (!title || !description || !date || !time) {
      return res.status(400).json("Required fields missing");
    }

    // Paid event must have price
    if (priceType === "paid" && (!price || price <= 0)) {
      return res.status(400).json("Paid event must have a valid price");
    }

    // Check if event already exists
    const existingEvent = await Event.findOne({ title, date });

    if (existingEvent) {
      return res.status(402).json("Event already exists");
    }

    // Create new event with hostEmail
    const newEvent = new Event({
      title,
      description,
      poster,
      date,
      time,
      location,
      isOnline,
      category,
      priceType,
      price: priceType === "paid" ? price : 0,
      capacity,
      participants: [],
      status: "scheduled",
      hostEmail, 
    });

    await newEvent.save();

    res.status(200).json({
      message: "Event created successfully",
      event: newEvent,
    });

  } catch (err) {
    res.status(500).json("Server Error: " + err.message);
  }
};


// GET SINGLE EVENT
exports.getSingleEvent = async (req, res) => {
  const User = require("../models/userModel"); //for getting hostname
  console.log("Inside getSingleEvent");

  const { id } = req.params;

  try {
    const event = await Event.findById(id);
    
    if (!event) {
      return res.status(404).json("Event not found");
    }

    const host = await User.findOne({ email: event.hostEmail });
    
    res.status(200).json({
      ...event._doc,
      hostName: host?.name || "Unknown Host",
    });

  } catch (err) {
    res.status(500).json("Server Error: " + err.message);
  }
};


// GET ALL EVENTS
exports.getAllEvents = async (req, res) => {
  console.log("Inside getAllEvents");

  const { status, category, location, limit } = req.query;

  try {
    let filter = {};

    if (status) filter.status = status;
    if (category) filter.category = category;
    if (location) filter.location = location;

    // ✅ DO NOT await yet
    let query = Event.find(filter).sort({ date: 1 });

    // ✅ Landing page support
    if (limit) {
      query = query.limit(Number(limit));
    }

    const events = await query;

    res.status(200).json(events);
  } catch (err) {
    console.error(err);
    res.status(500).json("Server Error: " + err.message);
  }
};

// UPDATE EVENT
exports.updateEvent = async (req, res) => {
  console.log("Inside updateEvent");

  const { id } = req.params;
  const {
    title,
    description,
    poster,
    date,
    time,
    location,
    isOnline,
    category,
    priceType,
    price,
    capacity,
    status,
    addParticipant,
    removeParticipant,
  } = req.body;

  try {
    // Build update object dynamically
    let updateData = {};

    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (poster) updateData.poster = poster;
    if (date) updateData.date = date;
    if (time) updateData.time = time;
    if (location) updateData.location = location;
    if (typeof isOnline === "boolean") updateData.isOnline = isOnline;
    if (category) updateData.category = category;
    if (capacity) updateData.capacity = capacity;
    if (status) updateData.status = status;

    if (priceType) {
      updateData.priceType = priceType;
      updateData.price = priceType === "paid" ? price : 0;
    }

    // Update basic fields
    let event = await Event.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    );

    if (!event) {
      return res.status(404).json("Event not found");
    }

    // Add participant (single)
    if (addParticipant) {
      event = await Event.findByIdAndUpdate(
        id,
        { $push: { participants: addParticipant } },
        { new: true }
      );
    }

    // Remove participant (single)
    if (removeParticipant) {
      event = await Event.findByIdAndUpdate(
        id,
        { $pull: { participants: removeParticipant } },
        { new: true }
      );
    }

    res.status(200).json({
      message: "Event updated successfully",
      event,
    });
  } catch (err) {
    res.status(500).json("Server Error: " + err.message);
  }
};

// DELETE EVENT
exports.deleteEvent = async (req, res) => {
  console.log("Inside deleteEvent");

  const { id } = req.params;

  try {
    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json("Event not found");
    }

    // Allow delete ONLY if status is cancelled
    if (event.status !== "cancelled") {
      return res.status(403).json(
        "Event can be deleted only if status is cancelled"
      );
    }

    await Event.findByIdAndDelete(id);

    res.status(200).json("Event deleted successfully");
  } catch (err) {
    res.status(500).json("Server Error: " + err.message);
  }
};

// CONFIRM EVENT REGISTRATION (AFTER PAYMENT / CONFIRMATION)
exports.confirmRegistration = async (req, res) => {
  const { id } = req.params;
  const userEmail = req.payload; // set by jwtMiddleware
  const role = req.role; // make sure that only users can reg

  if (role === "host") {
    return res.status(403).json("Hosts cannot register for events");
  }
  if (!userEmail) {
  return res.status(401).json("Invalid user");
}

  try {
    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json("Event not found");
    }

    if (event.status === "cancelled") {
      return res.status(400).json("Event is cancelled");
    }

    // capacity check
    if (event.capacity && event.participants.length >= event.capacity) {
      return res.status(400).json("Event is full");
    }

    // prevent duplicate registration
    if (event.participants.includes(userEmail)) {
      return res.status(400).json("Already registered");
    }

    // ✅ FINAL COMMIT
    event.participants.push(userEmail);
    await event.save();

    res.status(200).json({
      message: "Registration confirmed",
      eventId: event._id,
    });
  } catch (err) {
    res.status(500).json("Server Error: " + err.message);
  }
};


// GET EVENTS CREATED BY HOST
exports.getHostEvents = async (req, res) => {
  const hostEmail = req.payload;

  try {
    const events = await Event.find({ hostEmail }).sort({ createdAt: -1 });
    res.status(200).json(events);
  } catch (err) {
    res.status(500).json("Server Error: " + err.message);
  }
};
