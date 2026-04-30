import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getSingleEventAPI } from "../../services/allAPIs";
import TicketCard from "../components/events/TicketCard";

export default function TicketPage() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
  if (!event || !user) return;

  if (!event.participants.includes(user.email)) {
    alert("You are not registered for this event.");
    window.location.href = "/dashboard";
  }
}, [event]);

  useEffect(() => {
    const fetchEvent = async () => {
      const res = await getSingleEventAPI(id);
      if (res.status === 200) {
        setEvent(res.data);
      }
    };

    fetchEvent();
  }, [id]);

  if (!event) {
    return (
      <div className="py-20 text-center">
        Loading ticket...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg dark:bg-bg-dark flex items-center justify-center p-10">
      <TicketCard event={event} user={user} />
    </div>
  );
}
