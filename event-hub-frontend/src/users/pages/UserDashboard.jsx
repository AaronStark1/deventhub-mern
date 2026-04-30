import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllEventsAPI } from "../../services/allAPIs";

export default function Dashboard() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));
  const userEmail = user?.email;

  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [pastEvents, setPastEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      const res = await getAllEventsAPI();

      if (res.status === 200) {
        const allEvents = res.data;

        // events user is registered for
        const registeredEvents = allEvents.filter((event) =>
          event.participants.includes(userEmail)
        );

        const now = new Date();

        setUpcomingEvents(
          registeredEvents.filter(
            (event) => new Date(event.date) >= now
          )
        );

        setPastEvents(
          registeredEvents.filter(
            (event) => new Date(event.date) < now
          )
        );
      }

      setLoading(false);
    };

    fetchDashboardData();
  }, [userEmail]);

  if (loading) {
    return (
      <div className="py-20 text-center">
        <p className="text-muted dark:text-muted-dark">
          Loading dashboard...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg dark:bg-bg-dark px-6 py-16 transition-colors">
      <div className="max-w-6xl mx-auto space-y-12">

        {/* PROFILE HEADER */}
        <section className="bg-surface dark:bg-surface-dark rounded-2xl p-8 shadow flex flex-col md:flex-row justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold">
              Welcome back, {user?.name} 👋
            </h1>
            <p className="text-muted dark:text-muted-dark mt-1">
              {user?.role} · {user?.email}
            </p>
          </div>

          <div className="flex gap-6">
            <Stat label="Registered" value={upcomingEvents.length + pastEvents.length} />
            <Stat label="Upcoming" value={upcomingEvents.length} />
            <Stat label="Attended" value={pastEvents.length} />
          </div>
        </section>

        {/* UPCOMING EVENTS */}
        <Section title="Upcoming Events">
          {upcomingEvents.length === 0 ? (
            <Empty text="No upcoming events." />
          ) : (
            <EventGrid events={upcomingEvents} navigate={navigate} user={user}/>
          )}
        </Section>

        {/* PAST EVENTS */}
        <Section title="Past Events">
          {pastEvents.length === 0 ? (
            <Empty text="You haven’t attended any events yet." />
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {pastEvents.map((event) => (
                <div
                  key={event._id}
                  className="bg-surface dark:bg-surface-dark rounded-xl p-6 shadow"
                >
                  <h3 className="text-lg font-semibold">
                    {event.title}
                  </h3>
                  <p className="text-sm text-muted dark:text-muted-dark">
                    🗓 {new Date(event.date).toDateString()}
                  </p>
                  <span className="inline-block mt-3 px-3 py-1 rounded-full text-xs font-semibold bg-black/10 dark:bg-white/10">
                    Completed
                  </span>
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* QUICK ACTION */}
        <section className="bg-surface dark:bg-surface-dark rounded-2xl p-8 shadow flex justify-between items-center">
          <p className="text-lg font-semibold">
            Ready to explore more events?
          </p>
          <button
            onClick={() => navigate("/events")}
            className="px-6 py-3 rounded-full bg-primary text-white font-semibold hover:bg-primary-dark transition"
          >
            Browse Events
          </button>
        </section>

      </div>
    </div>
  );
}

/* ---------- Small helper components ---------- */

function Stat({ label, value }) {
  return (
    <div className="text-center">
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-sm text-muted dark:text-muted-dark">{label}</p>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-semibold">{title}</h2>
      {children}
    </section>
  );
}

function Empty({ text }) {
  return (
    <p className="text-muted dark:text-muted-dark">{text}</p>
  );
}

function EventGrid({ events, navigate }) {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      {events.map((event) => (
        <div
          key={event._id}
          className="bg-surface dark:bg-surface-dark rounded-xl p-6 shadow flex justify-between items-center"
        >
          <div>
            <h3 className="text-lg font-semibold">
              {event.title}
            </h3>
            <p className="text-sm text-muted dark:text-muted-dark">
              {new Date(event.date).toDateString()} ·{" "}
              {event.isOnline ? "Online" : "Offline"}
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => navigate(`/events/${event._id}`)}
              className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary-dark"
            >
              View
            </button>

            <button
              onClick={() => navigate(`/ticket/${event._id}`)}
              className="px-4 py-2 rounded-lg border border-primary text-primary hover:bg-primary hover:text-white"
            >
              Ticket
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
