import { useState, useEffect } from "react";
import EventCard from "../components/events/EventCard";
import EventFilters from "../components/events/EventFilters";
import EventPagination from "../components/events/EventPagination";
import { getAllEventsAPI } from "../../services/allAPIs";
import { getErrorMessage } from "../../services/api";

export default function Events() {
  const EVENTS_PER_PAGE = 3;

  const [events, setEvents] = useState([]);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [mode, setMode] = useState("");

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const result = await getAllEventsAPI();
        setEvents(result.data);
      } catch (err) {
        setError(getErrorMessage(err, "Unable to load events"));
      }
    };
    fetchEvents();
  }, []);

  // FILTER LOGIC (backend-aligned)
  const filteredEvents = events.filter((event) => {
    const matchesSearch = event.title
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesType = type ? event.category === type : true;

    const matchesMode = mode
      ? mode === "Online"
        ? event.isOnline
        : !event.isOnline
      : true;

    return matchesSearch && matchesType && matchesMode;
  });

  // Any filter change starts again from page 1.
  const withPageReset = (setter) => (value) => {
    setter(value);
    setCurrentPage(1);
  };

  // PAGINATION
  const totalPages = Math.ceil(filteredEvents.length / EVENTS_PER_PAGE);
  const startIndex = (currentPage - 1) * EVENTS_PER_PAGE;

  const paginatedEvents = filteredEvents.slice(
    startIndex,
    startIndex + EVENTS_PER_PAGE
  );

  return (
    <div className="px-6 py-16 max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-2">
          Upcoming Events
        </h1>
        <p className="text-muted dark:text-muted-dark">
          Discover and register for developer events worldwide.
        </p>
      </div>

      {/* FILTERS */}
      <EventFilters
        search={search}
        setSearch={withPageReset(setSearch)}
        type={type}
        setType={withPageReset(setType)}
        mode={mode}
        setMode={withPageReset(setMode)}
      />

      {/* EVENTS GRID */}
      {error ? (
        <p className="text-red-500">{error}</p>
      ) : paginatedEvents.length === 0 ? (
        <p className="text-muted dark:text-muted-dark">
          No events found.
        </p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {paginatedEvents.map((event) => (
            <EventCard key={event._id} event={event} />
          ))}
        </div>
      )}

      {/* PAGINATION */}
      {totalPages > 1 && (
        <EventPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
}
