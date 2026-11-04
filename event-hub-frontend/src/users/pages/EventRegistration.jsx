import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getSingleEventAPI } from "../../services/allAPIs";

export default function EventRegistration() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await getSingleEventAPI(id);
        setEvent(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  const handleProceed = () => navigate(`/events/${id}/checkout`);

  if (loading) {
    return (
      <div className="py-20 text-center">
        <p className="text-muted dark:text-muted-dark">
          Loading registration details...
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

  // The API sends null when the event has no capacity limit.
  const seatsLeft = event.seatsLeft ?? "Unlimited";

  return (
    <div className="min-h-screen bg-bg dark:bg-bg-dark px-6 py-16 transition-colors">
      <div className="max-w-4xl mx-auto space-y-12">

        {/* EVENT SUMMARY */}
        <section className="bg-surface dark:bg-surface-dark rounded-2xl shadow overflow-hidden">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="h-[260px] md:h-full">
              <img
                src={event.poster || "https://via.placeholder.com/400x500"}
                alt={event.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="md:col-span-2 p-6 space-y-4">
              <h1 className="text-3xl font-bold">
                {event.title}
              </h1>

              <p className="text-muted dark:text-muted-dark">
                📍 {event.isOnline ? "Online" : event.location} · 🗓{" "}
                {new Date(event.date).toDateString()}
              </p>

              <p className="text-sm text-muted dark:text-muted-dark">
                Review details before proceeding to checkout.
              </p>
            </div>
          </div>
        </section>

        {/* REGISTRATION INFO */}
        <section className="bg-surface dark:bg-surface-dark rounded-2xl shadow p-8 space-y-4">
          <h2 className="text-2xl font-semibold">
            Registration Summary
          </h2>

          <div className="flex justify-between">
            <span className="text-muted dark:text-muted-dark">
              Seats Available
            </span>
            <span className="font-semibold">
              {seatsLeft}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-muted dark:text-muted-dark">
              Ticket Type
            </span>
            <span className="font-semibold capitalize">
              {event.priceType}
            </span>
          </div>
        </section>

        {/* ACTION */}
        <section className="bg-surface dark:bg-surface-dark rounded-2xl shadow p-8">
          <div className="flex items-center justify-between mb-6">
            <span className="text-muted dark:text-muted-dark">
              Total Amount
            </span>
            <span className="text-xl font-bold">
              {event.priceType === "free"
                ? "Free"
                : `₹${event.price}`}
            </span>
          </div>

          <button
            onClick={handleProceed}
            disabled={seatsLeft === 0}
            className={`w-full py-4 rounded-xl font-semibold transition
              ${
                seatsLeft === 0
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-primary text-white hover:bg-primary-dark"
              }
            `}
          >
            {seatsLeft === 0
              ? "Event Full"
              : "Proceed to Checkout"}
          </button>

          <button
            onClick={() => navigate(-1)}
            className="w-full mt-4 py-3 rounded-xl border border-muted dark:border-muted-dark text-muted dark:text-muted-dark hover:bg-black/5 transition"
          >
            Cancel
          </button>
        </section>

      </div>
    </div>
  );
}
