// controllers/paymentController.js
const stripe = require("../config/stripe");
const Event = require("../models/eventModel");

exports.createCheckoutSession = async (req, res) => {
  const { eventId } = req.body;
  const userEmail = req.payload;

  const event = await Event.findById(eventId);
  if (!event) return res.status(404).json("Event not found");

  // FREE EVENT → skip Stripe
  if (event.priceType === "free") {
    return res.status(200).json({
      free: true,
      redirectUrl: `/payment-success?event=${eventId}`,
    });
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    customer_email: userEmail,
    line_items: [
      {
        price_data: {
          currency: "inr",
          product_data: {
            name: event.title,
            images: [event.poster],
          },
          unit_amount: event.price * 100,
        },
        quantity: 1,
      },
    ],
    success_url: `http://localhost:5173/payment-success?event=${eventId}`,
    cancel_url: `http://localhost:5173/events/${eventId}/checkout`,
    metadata: {
  eventId: event._id.toString(),
  userEmail: userEmail,
}

  });

  res.status(200).json({ url: session.url });
};

