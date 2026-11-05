import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { updateEventAPI, deleteEventAPI } from "../../services/allAPIs";
import { getErrorMessage } from "../../services/api";

const STATUS_STYLES = {
  scheduled: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
  completed: "bg-gray-200 text-gray-700",
};

export default function HostEventCard({ event, onChange }) {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  const run = async (action, confirmText) => {
    if (confirmText && !window.confirm(confirmText)) return;
    try {
      setBusy(true);
      await action();
      await onChange();
    } catch (err) {
      alert(getErrorMessage(err, "Action failed"));
    } finally {
      setBusy(false);
    }
  };

  const cancelEvent = () =>
    run(
      () => updateEventAPI(event._id, { status: "cancelled" }),
      `Cancel "${event.title}"? Nobody will be able to register any more.`
    );

  const deleteEvent = () =>
    run(() => deleteEventAPI(event._id), `Delete "${event.title}" permanently?`);

  const registered = event.participants?.length ?? 0;
  const seats = event.capacity ? `${registered} / ${event.capacity}` : `${registered}`;

  return (
    <div className="bg-surface dark:bg-surface-dark p-6 rounded-xl shadow-sm">
      <h2 className="text-xl font-semibold mb-1">
        {event.title}
      </h2>

      <p className="text-sm text-muted dark:text-muted-dark mb-3">
        {new Date(event.date).toDateString()} ·{" "}
        {event.isOnline ? "Online" : event.location} · 🎟 {seats} registered
      </p>

      {/* STATUS */}
      <span
        className={`inline-block mb-4 px-3 py-1 rounded-full text-xs font-semibold ${
          STATUS_STYLES[event.status] ?? STATUS_STYLES.completed
        }`}
      >
        {event.status}
      </span>

      {/* ACTIONS */}
      <div className="flex flex-wrap gap-3 mt-4">
        <button
          onClick={() => navigate(`/events/${event._id}`)}
          className="px-4 py-2 rounded-lg border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition"
        >
          View
        </button>

        <button
          onClick={() => navigate(`/host/events/edit/${event._id}`)}
          className="px-4 py-2 rounded-lg border border-primary text-primary hover:bg-primary hover:text-white transition"
        >
          Edit
        </button>

        {event.status === "scheduled" && (
          <button
            onClick={cancelEvent}
            disabled={busy}
            className="px-4 py-2 rounded-lg bg-yellow-500 text-white hover:bg-yellow-600 transition disabled:opacity-60"
          >
            Cancel
          </button>
        )}

        {event.status === "cancelled" && (
          <button
            onClick={deleteEvent}
            disabled={busy}
            className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition disabled:opacity-60"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
}
