import { updateEventAPI, deleteEventAPI } from "../../services/allAPIs";
import { useNavigate } from "react-router-dom";

export default function HostEventCard({ event, refresh }) {
  const navigate = useNavigate();

  const cancelEvent = async () => {
    await updateEventAPI(event._id, { status: "cancelled" });
    refresh();
  };

  const deleteEvent = async () => {
    await deleteEventAPI(event._id);
    refresh();
  };

  return (
    <div className="bg-surface dark:bg-surface-dark p-6 rounded-xl shadow-sm">
      <h2 className="text-xl font-semibold mb-1">
        {event.title}
      </h2>

      <p className="text-sm text-muted dark:text-muted-dark mb-3">
        {new Date(event.date).toDateString()} ·{" "}
        {event.isOnline ? "Online" : event.location}
      </p>

      {/* STATUS */}
      <span
        className={`inline-block mb-4 px-3 py-1 rounded-full text-xs font-semibold
          ${
            event.status === "scheduled"
              ? "bg-green-100 text-green-700"
              : event.status === "cancelled"
              ? "bg-red-100 text-red-700"
              : "bg-gray-200 text-gray-700"
          }`}
      >
        {event.status}
      </span>

      {/* ACTIONS */}
      <div className="flex flex-wrap gap-3 mt-4">
        <button
          onClick={() =>
            navigate(`/host/events/edit/${event._id}`)
          }
          className="px-4 py-2 rounded-lg border border-primary text-primary hover:bg-primary hover:text-white transition"
        >
          Edit
        </button>

        {event.status === "scheduled" && (
          <button
            onClick={cancelEvent}
            className="px-4 py-2 rounded-lg bg-yellow-500 text-white hover:bg-yellow-600 transition"
          >
            Cancel
          </button>
        )}

        {event.status === "cancelled" && (
          <button
            onClick={deleteEvent}
            className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
}
