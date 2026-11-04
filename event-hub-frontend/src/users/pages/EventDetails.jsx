import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getSingleEventAPI } from "../../services/allAPIs";
import { useAuth } from "../../hooks/useAuth";

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isHost } = useAuth(); // hosts can't register for events

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const result = await getSingleEventAPI(id);
        setEvent(result.data);
      } catch {
        setEvent(null);
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  if (loading) {
    return (
      <div className="py-20 text-center">
        <p className="text-muted dark:text-muted-dark">
          Loading event details...
        </p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="py-20 text-center">
        <p className="text-red-500">
          Event not found
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <div className="grid lg:grid-cols-[350px_1fr] gap-10">

        {/* POSTER */}
        <div className="w-full">
          <div className="aspect-[3/4] rounded-xl overflow-hidden bg-black/10 shadow-md">
            <img
              src={
                event.poster ||
                "https://via.placeholder.com/350x450"
              }
              alt={event.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* TYPE BADGE */}
          <span className="inline-block mt-4 px-4 py-1 rounded-full text-sm font-semibold bg-primary/20 text-primary">
            {event.category}
          </span>
        </div>

        {/* DETAILS */}
        <div>
          {/* TITLE */}
          <h1 className="text-4xl font-bold mb-4">
            {event.title}
          </h1>

          {/* ORGANIZER (placeholder for now) */}
          <p className="text-muted dark:text-muted-dark mb-6">
            Hosted by{" "}
            <span className="font-semibold">
              {event.hostName}
            </span>
          </p>

          {/* META */}
          <div className="grid sm:grid-cols-2 gap-4 mb-8">
            {[
              {
                label: "📅 Date",
                value: new Date(event.date).toDateString(),
              },
              { label: "⏰ Time", value: event.time },
              {
                label: "📍 Location",
                value: event.isOnline
                  ? "Online"
                  : event.location,
              },
              {
                label: "💻 Mode",
                value: event.isOnline
                  ? "Online"
                  : "Offline",
              },
              {
                label: "🎟 Seats",
                value: event.capacity || "Unlimited",
              },
              {
                label: "💰 Price",
                value:
                  event.priceType === "free"
                    ? "Free"
                    : `₹${event.price}`,
              },
            ].map((item, i) => (
              <div
                key={i}
                className="bg-surface dark:bg-surface-dark rounded-lg p-4"
              >
                <p className="text-sm text-muted dark:text-muted-dark">
                  {item.label}
                </p>
                <p className="font-semibold">
                  {item.value}
                </p>
              </div>
            ))}
          </div>

          {/* DESCRIPTION */}
          <div className="mb-10">
            <h2 className="text-2xl font-semibold mb-3">
              About this event
            </h2>
            <p className="text-muted dark:text-muted-dark leading-relaxed">
              {event.description}
            </p>
          </div>

          {/* ACTIONS */}
          <div className="flex flex-col sm:flex-row gap-4 bg-surface dark:bg-surface-dark p-6 rounded-xl">

            {!isHost && (
              <>
              <button
                onClick={() => navigate(`/events/${id}/register`)}
                className="flex-1 py-3 rounded-lg bg-primary text-white font-semibold hover:bg-primary-dark transition"
              >
                Register for Event
              </button>
                          <button className="px-6 py-3 rounded-lg border border-primary text-primary font-semibold hover:bg-primary hover:text-white transition">
              Save
            </button>

            <button className="px-6 py-3 rounded-lg border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition">
              Share
            </button>
            </>
            )}

            {isHost && (
              <p className="flex-1 text-sm text-muted dark:text-muted-dark flex items-center">
                Hosts cannot register for events
              </p>
            )}


          </div>

        </div>
      </div>
    </div>
  );
}
