const Event = require("../models/eventModel");
const User = require("../models/userModel");

// Registration stays open until a day after the event's date, so a late
// sign-up on the day itself isn't refused over time zones.
const DAY_MS = 24 * 60 * 60 * 1000;
const registrationCutoff = () => new Date(Date.now() - DAY_MS);

// Shape returned to anyone. Attendee emails and the host's email stay private;
// clients get counts instead.
const toPublicEvent = (event) => {
  const obj = event.toObject();
  const participantCount = obj.participants?.length ?? 0;

  delete obj.participants;
  delete obj.hostEmail;
  delete obj.__v;

  return {
    ...obj,
    participantCount,
    seatsLeft: obj.capacity ? Math.max(obj.capacity - participantCount, 0) : null,
  };
};

const sendError = (res, err) => {
  if (err.name === "CastError") {
    // A malformed id means "no such event"; a malformed field is bad input.
    return err.kind === "ObjectId"
      ? res.status(404).json("Event not found")
      : res.status(400).json(`Invalid value for ${err.path}`);
  }
  if (err.name === "ValidationError") return res.status(400).json(err.message);
  res.status(500).json("Server Error: " + err.message);
};

// Capacity is either absent (unlimited → null) or a whole number >= 1.
// Returns NaN for anything else.
const parseCapacity = (value) => {
  if (value === undefined || value === null || value === "") return null;
  const n = Number(value);
  return Number.isInteger(n) && n >= 1 ? n : NaN;
};
const CAPACITY_ERROR = "Capacity must be a whole number of 1 or more";

// Loads an event and checks the caller owns it. Sends the error response itself
// and returns null when the caller should stop.
const findOwnedEvent = async (req, res) => {
  const event = await Event.findById(req.params.id);

  if (!event) {
    res.status(404).json("Event not found");
    return null;
  }
  if (event.hostEmail !== req.user.email) {
    res.status(403).json("You can only manage your own events");
    return null;
  }
  return event;
};

// ADD EVENT (host)
exports.addEvent = async (req, res) => {
  const {
    title,
    description,
    poster,
    date,
    time,
    location,
    isOnline,
    category,
    priceType = "free",
    price,
    capacity,
  } = req.body;
  const hostEmail = req.user.email;

  if (!title || !description || !date || !time) {
    return res.status(400).json("Required fields missing");
  }
  if (priceType === "paid" && (!price || price <= 0)) {
    return res.status(400).json("Paid event must have a valid price");
  }
  const parsedCapacity = parseCapacity(capacity);
  if (Number.isNaN(parsedCapacity)) {
    return res.status(400).json(CAPACITY_ERROR);
  }

  try {
    const existingEvent = await Event.findOne({ title, date, hostEmail });
    if (existingEvent) {
      return res
        .status(409)
        .json("You already have an event with this title on that date");
    }

    const newEvent = await Event.create({
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
      capacity: parsedCapacity ?? undefined,
      participants: [],
      status: "scheduled",
      hostEmail,
    });

    res.status(201).json({
      message: "Event created successfully",
      event: newEvent,
    });
  } catch (err) {
    sendError(res, err);
  }
};

// GET SINGLE EVENT (public)
exports.getSingleEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json("Event not found");
    }

    const host = await User.findOne({ email: event.hostEmail }).select("name");

    res.status(200).json({
      ...toPublicEvent(event),
      hostName: host?.name || "Unknown Host",
    });
  } catch (err) {
    sendError(res, err);
  }
};

// GET ALL EVENTS (public)
exports.getAllEvents = async (req, res) => {
  const { status, category, location } = req.query;

  try {
    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (location) filter.location = location;

    let query = Event.find(filter).sort({ date: 1 });

    // Anything that isn't a positive whole number is ignored, not a 500.
    const limit = Number.parseInt(req.query.limit, 10);
    if (Number.isInteger(limit) && limit > 0) {
      query = query.limit(limit);
    }

    const events = await query;
    res.status(200).json(events.map(toPublicEvent));
  } catch (err) {
    sendError(res, err);
  }
};

// UPDATE EVENT (host, own events only)
exports.updateEvent = async (req, res) => {
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
  } = req.body;

  try {
    const event = await findOwnedEvent(req, res);
    if (!event) return;

    const updateData = {};
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (poster) updateData.poster = poster;
    if (date) updateData.date = date;
    if (time) updateData.time = time;
    if (location) updateData.location = location;
    if (typeof isOnline === "boolean") updateData.isOnline = isOnline;
    if (category) updateData.category = category;
    if (status) updateData.status = status;

    // null / "" clears the limit; anything else must be a whole number >= 1.
    if (capacity !== undefined) {
      const parsedCapacity = parseCapacity(capacity);
      if (Number.isNaN(parsedCapacity)) {
        return res.status(400).json(CAPACITY_ERROR);
      }
      updateData.capacity = parsedCapacity;
    }

    if (priceType) {
      if (priceType === "paid" && (!price || price <= 0)) {
        return res.status(400).json("Paid event must have a valid price");
      }
      updateData.priceType = priceType;
      updateData.price = priceType === "paid" ? price : 0;
    }

    const updated = await Event.findByIdAndUpdate(
      event._id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      message: "Event updated successfully",
      event: updated,
    });
  } catch (err) {
    sendError(res, err);
  }
};

// DELETE EVENT (host, own events only, cancelled events only)
exports.deleteEvent = async (req, res) => {
  try {
    const event = await findOwnedEvent(req, res);
    if (!event) return;

    if (event.status !== "cancelled") {
      return res
        .status(403)
        .json("Event can be deleted only if status is cancelled");
    }

    await event.deleteOne();
    res.status(200).json("Event deleted successfully");
  } catch (err) {
    sendError(res, err);
  }
};

// CONFIRM EVENT REGISTRATION (user)
// Demo only: this trusts the client that payment happened. A real deployment
// would confirm paid registrations from a Stripe webhook instead.
exports.confirmRegistration = async (req, res) => {
  const { email: userEmail } = req.user;
  const { id } = req.params;

  try {
    // One atomic update: the seat is only taken if, at write time, the event
    // is still open, hasn't happened, has room, and doesn't already list this
    // user. Two concurrent requests can't both win the last seat.
    const updated = await Event.findOneAndUpdate(
      {
        _id: id,
        status: "scheduled",
        date: { $gte: registrationCutoff() },
        participants: { $ne: userEmail },
        $expr: {
          $or: [
            { $not: ["$capacity"] }, // no limit set
            {
              $lt: [
                { $size: { $ifNull: ["$participants", []] } },
                "$capacity",
              ],
            },
          ],
        },
      },
      { $addToSet: { participants: userEmail } },
      { new: true }
    );

    if (updated) {
      return res.status(200).json({
        message: "Registration confirmed",
        eventId: updated._id,
      });
    }

    // Nothing matched: read the event once to say why.
    const event = await Event.findById(id);
    if (!event) return res.status(404).json("Event not found");

    // Idempotent: the success page may call this again on reload.
    if (event.participants.includes(userEmail)) {
      return res.status(200).json({
        message: "Already registered",
        alreadyRegistered: true,
        eventId: event._id,
      });
    }
    if (event.status !== "scheduled") {
      return res.status(400).json(`Event is ${event.status}`);
    }
    if (event.date < registrationCutoff()) {
      return res.status(400).json("Event has already taken place");
    }
    return res.status(400).json("Event is full");
  } catch (err) {
    sendError(res, err);
  }
};

// GET EVENTS CREATED BY THE CALLING HOST
// Hosts own these events, so they do see their attendee list.
exports.getHostEvents = async (req, res) => {
  try {
    const events = await Event.find({ hostEmail: req.user.email }).sort({
      createdAt: -1,
    });
    res.status(200).json(events);
  } catch (err) {
    sendError(res, err);
  }
};

// GET EVENTS THE CALLING USER IS REGISTERED FOR
exports.getMyRegistrations = async (req, res) => {
  try {
    const events = await Event.find({ participants: req.user.email }).sort({
      date: 1,
    });
    res.status(200).json(events.map(toPublicEvent));
  } catch (err) {
    sendError(res, err);
  }
};

// GET ONE EVENT AS A TICKET — only for someone registered to it
exports.getMyTicket = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json("Event not found");
    }
    if (!event.participants.includes(req.user.email)) {
      return res.status(403).json("You are not registered for this event");
    }

    res.status(200).json(toPublicEvent(event));
  } catch (err) {
    sendError(res, err);
  }
};
