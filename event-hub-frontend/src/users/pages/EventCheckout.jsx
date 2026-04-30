import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  getSingleEventAPI,
  createCheckoutSessionAPI,
  confirmRegistrationAPI,
} from "../../services/allAPIs";

export default function EventCheckout() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (user?.role === "host") {
      navigate("/host/dashboard");
    }
  }, []);

  // FETCH EVENT 
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await getSingleEventAPI(id);
        if (res.status === 200) {
          setEvent(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  // HANDLE PAYMENT
  const handleCheckout = async () => {
  const token = localStorage.getItem("token");

  if (!token) {
    alert("Please login to continue");
    navigate("/login");
    return;
  }

  try {
    setProcessing(true);

    // ✅ FREE EVENT → directly confirm registration
    if (event.priceType === "free") {
      const res = await confirmRegistrationAPI(id, token);

      if (res.status === 200) {
        navigate(`/payment-success?event=${id}`);
      } else {
        alert(res.response?.data || "Registration failed");
      }

      return; // stop further execution
    }

    // 💳 PAID EVENT → Stripe Checkout
    const res = await createCheckoutSessionAPI(id, token);
    window.location.href = res.data.url;

  } catch (err) {
    console.error("Checkout error:", err);
    alert("Unable to start checkout");
  } finally {
    setProcessing(false);
  }
};


  // UI STATES 
  if (loading) {
    return (
      <div className="py-20 text-center">
        <p className="text-muted dark:text-muted-dark">
          Loading checkout...
        </p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="py-20 text-center text-red-500">
        Event not found
      </div>
    );
  }

  const price =
    event.priceType === "free" ? 0 : event.price;

  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-bold mb-10">
        Checkout
      </h1>

      <div className="grid lg:grid-cols-2 gap-10">

        {/* LEFT : ORDER SUMMARY */}
        <div className="bg-surface dark:bg-surface-dark rounded-xl p-6 space-y-6">
          <h2 className="text-xl font-semibold">
            Order Summary
          </h2>

          <div className="flex gap-4">
            <img
              src={event.poster || "https://via.placeholder.com/300x400"}
              alt={event.title}
              className="w-32 h-44 object-cover rounded-lg"
            />

            <div className="space-y-2">
              <h3 className="text-lg font-semibold">
                {event.title}
              </h3>
              <p className="text-sm text-muted dark:text-muted-dark">
                📅 {new Date(event.date).toDateString()}
              </p>
              <p className="text-sm text-muted dark:text-muted-dark">
                📍 {event.isOnline ? "Online" : event.location}
              </p>
            </div>
          </div>

          <div className="border-t border-black/10 dark:border-white/10 pt-4 space-y-2">
            <div className="flex justify-between">
              <span>Ticket Price</span>
              <span>
                {price === 0 ? "Free" : `₹${price}`}
              </span>
            </div>

            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>
                {price === 0 ? "Free" : `₹${price}`}
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT : PAYMENT */}
        <div className="bg-surface dark:bg-surface-dark rounded-xl p-6 space-y-6">
          <h2 className="text-xl font-semibold">
            Payment
          </h2>

          <button
            onClick={handleCheckout}
            disabled={processing}
            className={`
              w-full py-4 rounded-lg font-semibold transition
              ${processing
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-primary text-white hover:bg-primary-dark"
              }
            `}
          >
            {processing
              ? "Processing..."
              : price === 0
                ? "Confirm Registration"
                : `Pay ₹${price}`}
          </button>

          <p className="text-xs text-muted dark:text-muted-dark text-center">
            🔒 Payments secured by Stripe
          </p>
        </div>
      </div>
    </div>
  );
}
