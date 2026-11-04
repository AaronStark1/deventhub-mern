// Demo only — see README. The frontend confirms the registration when the
// success page loads; there is no webhook verification here.
const stripe = require("../config/stripe");
const Event = require("../models/eventModel");

// Where Stripe sends the user afterwards. Defaults to the Vite dev server.
const CLIENT_URL = (process.env.CLIENT_URL || "http://localhost:5173").replace(/\/$/, "");

exports.createCheckoutSession = async (req, res) => {
  const { eventId } = req.body;
  const userEmail = req.user.email;

  try {
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json("Event not found");

    // FREE EVENT → skip Stripe
    if (event.priceType === "free") {
      return res.status(200).json({
        free: true,
        redirectUrl: `/payment-success?event=${eventId}`,
      });
    }

    // Don't take money for a seat the registration step would then refuse.
    if (event.participants.includes(userEmail)) {
      return res.status(400).json("Already registered");
    }
    if (event.status !== "scheduled") {
      return res.status(400).json(`Event is ${event.status}`);
    }
    if (event.capacity && event.participants.length >= event.capacity) {
      return res.status(400).json("Event is full");
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
              images: event.poster ? [event.poster] : [],
            },
            unit_amount: event.price * 100,
          },
          quantity: 1,
        },
      ],
      success_url: `${CLIENT_URL}/payment-success?event=${eventId}`,
      cancel_url: `${CLIENT_URL}/events/${eventId}/checkout`,
      metadata: {
        eventId: event._id.toString(),
        userEmail,
      },
    });

    res.status(200).json({ url: session.url });
  } catch (err) {
    if (err.name === "CastError") return res.status(404).json("Event not found");
    res.status(500).json("Server Error: " + err.message);
  }
};
