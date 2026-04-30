import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getHostEventsAPI } from "../../services/allAPIs";

export default function HostDashboard() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHostEvents = async () => {
      const token = localStorage.getItem("token");
      const res = await getHostEventsAPI(token);

      if (res.status === 200) {
        setEvents(res.data);
      }
      setLoading(false);
    };

    fetchHostEvents();
  }, []);

  if (loading) {
    return <p className="text-center py-20">Loading your events...</p>;
  }

  return (
    <div className="px-6 py-16 max-w-6xl mx-auto space-y-10">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Host Dashboard</h1>
        <button
          onClick={() => navigate("/host/events/create")}
          className="px-6 py-3 rounded-lg bg-primary text-white font-semibold"
        >
          + Create Event
        </button>
      </div>

      {/* EVENTS */}
      {events.length === 0 ? (
        <p className="text-muted">
          You haven’t created any events yet.
        </p>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {events.map((event) => (
            <div
              key={event._id}
              className="bg-surface dark:bg-surface-dark rounded-xl p-6 shadow"
            >
              <h3 className="text-lg font-semibold">{event.title}</h3>
              <p className="text-sm text-muted">
                📅 {new Date(event.date).toDateString()}
              </p>

              <div className="flex gap-3 mt-4">
                <button
                  onClick={() =>
                    navigate(`/host/events/edit/${event._id}`)
                  }
                  className="px-4 py-2 rounded bg-primary text-white text-sm"
                >
                  Edit
                </button>

                <button className="px-4 py-2 rounded border text-sm">
                  View
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
