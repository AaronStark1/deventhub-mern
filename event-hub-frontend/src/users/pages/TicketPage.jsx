import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getMyTicketAPI } from "../../services/allAPIs";
import { getErrorMessage } from "../../services/api";
import { useAuth } from "../../hooks/useAuth";
import TicketCard from "../components/events/TicketCard";

export default function TicketPage() {
  const { id } = useParams();
  const { user } = useAuth();

  const [event, setEvent] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const fetchTicket = async () => {
      try {
        // The server only returns the event if this user is registered for it.
        const res = await getMyTicketAPI(id);
        if (!cancelled) setEvent(res.data);
      } catch (err) {
        if (!cancelled) setError(getErrorMessage(err, "Unable to load ticket"));
      }
    };

    fetchTicket();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (error) {
    return (
      <div className="py-20 text-center space-y-4">
        <p className="text-red-500">{error}</p>
        <Link
          to="/dashboard"
          className="inline-block px-6 py-3 rounded-full bg-primary text-white font-semibold hover:bg-primary-dark transition"
        >
          Back to dashboard
        </Link>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="py-20 text-center">
        Loading ticket...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg dark:bg-bg-dark flex items-center justify-center px-4 py-10 sm:p-10">
      <TicketCard event={event} user={user} />
    </div>
  );
}
