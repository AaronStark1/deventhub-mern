import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getHostEventsAPI } from "../../services/allAPIs";
import { getErrorMessage } from "../../services/api";
import HostEventCard from "./HostEventCard";

export default function HostDashboard() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadEvents = useCallback(async () => {
    try {
      const res = await getHostEventsAPI();
      setEvents(res.data);
      setError("");
    } catch (err) {
      setError(getErrorMessage(err, "Unable to load your events"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  if (loading) {
    return <p className="text-center py-20">Loading your events...</p>;
  }

  if (error) {
    return <p className="text-center py-20 text-red-500">{error}</p>;
  }

  return (
    <div className="px-4 sm:px-6 py-16 max-w-6xl mx-auto space-y-10">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-3xl font-bold">Host Dashboard</h1>
        <button
          onClick={() => navigate("/host/events/create")}
          className="px-6 py-3 rounded-lg bg-primary text-white font-semibold hover:bg-primary-dark transition"
        >
          + Create Event
        </button>
      </div>

      {/* EVENTS */}
      {events.length === 0 ? (
        <p className="text-muted dark:text-muted-dark">
          You haven’t created any events yet.
        </p>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {events.map((event) => (
            <HostEventCard key={event._id} event={event} onChange={loadEvents} />
          ))}
        </div>
      )}
    </div>
  );
}
