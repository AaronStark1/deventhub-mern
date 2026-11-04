const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },

    poster: {
      type: String,
      required: false, // optional
    },
    date: { type: Date, required: true },
    time: { type: String, required: true },

    location: { type: String },
    isOnline: { type: Boolean, default: false },

    category: String,

    priceType: {
      type: String,
      enum: ["free", "paid"],
      default: "free",
    },
    price: {
      type: Number,
      default: 0,
    },

    // Absent/null means unlimited; otherwise a whole number of seats.
    capacity: { type: Number, min: 1 },

    participants: {
      type: [String],
      default: [],
    },

    status: {
      type: String,
      enum: ["scheduled", "completed", "cancelled"],
      default: "scheduled",
    },


    hostEmail: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("events", eventSchema);
