import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  getSingleEventAPI,
  confirmRegistrationAPI,
} from "../../services/allAPIs";
import { getErrorMessage } from "../../services/api";

export default function PaymentSuccess() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const eventId = params.get("event");
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!eventId) {
      navigate("/");
      return;
    }

    const finalize = async () => {
      try {
        // Demo only: registration is confirmed on the client's say-so.
        // The endpoint is idempotent, so reloading this page is safe.
        await confirmRegistrationAPI(eventId);

        const eventRes = await getSingleEventAPI(eventId);
        setEvent(eventRes.data);
      } catch (err) {
        alert(getErrorMessage(err, "Could not confirm your registration"));
        navigate(`/events/${eventId}`);
      } finally {
        setLoading(false);
      }
    };

    finalize();
  }, [eventId, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted">Finalizing registration…</p>
      </div>
    );
  }

  if (!event) return null;

  return (
    <div className="min-h-screen bg-bg dark:bg-bg-dark flex items-center justify-center px-4">
      <div className="max-w-lg w-full bg-surface dark:bg-surface-dark rounded-2xl shadow p-8 text-center space-y-4">
        <h1 className="text-3xl font-bold text-green-500">
          🎉 Registration Successful
        </h1>

        <h2 className="text-xl font-bold">
          {event.title}
        </h2>

        <p className="text-muted">
          📅 {new Date(event.date).toDateString()} ·{" "}
          {event.isOnline ? "Online" : event.location}
        </p>

        <div className="pt-6 flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex-1 py-3 rounded-lg bg-primary text-white font-semibold"
          >
            Go to Dashboard
          </button>

          <button
            onClick={() => navigate("/events")}
            className="flex-1 py-3 rounded-lg border border-black/10 dark:border-white/10"
          >
            Browse Events
          </button>
        </div>
      </div>
    </div>
  );
}
