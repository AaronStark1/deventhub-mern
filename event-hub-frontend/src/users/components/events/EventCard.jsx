import { useNavigate } from "react-router-dom";

export default function EventCard({ event }) {
  const navigate = useNavigate();

  return (
    <div
      className="
        bg-surface dark:bg-surface-dark
        rounded-xl
        overflow-hidden
        shadow-sm hover:shadow-md
        transition
        flex flex-col
      "
    >

      <div className="relative w-full aspect-[3/4] bg-black/10">
        {event.poster ? (
          <img
            src={event.poster}
            alt={event.title}
            loading="lazy"
            decoding="async"
            className="
              w-full h-full object-cover
              transition-transform duration-300
              hover:scale-105
            "
          />
        ) : (
          <div
            className="
              w-full h-full
              flex items-center justify-center
              text-muted dark:text-muted-dark
              text-sm
            "
          >
            No Poster
          </div>
        )}

        {/* CATEGORY BADGE (on image) */}
        <span
          className="
            absolute top-3 left-3
            px-3 py-1 rounded-full
            text-xs font-semibold
            bg-primary/90 text-white
            backdrop-blur
          "
        >
          {event.category}
        </span>
      </div>

      {/* CONTENT */}
      <div className="p-6 flex flex-col flex-1">

        <h3 className="text-xl font-semibold mb-2">
          {event.title}
        </h3>

        {/* META */}
        <p className="text-sm text-muted dark:text-muted-dark mb-4">
          {event.isOnline ? "🌐 Online" : `📍 ${event.location}`} · 🗓{" "}
          {new Date(event.date).toDateString()}
        </p>

        {/* DESCRIPTION */}
        <p className="text-sm mb-6 line-clamp-3 flex-1">
          {event.description}
        </p>

        {/* ACTION */}
        <button
          onClick={() => navigate(`/events/${event._id}`)}
          className="
            w-full py-2 rounded-lg
            bg-primary text-white font-semibold
            hover:bg-primary-dark
            transition
          "
        >
          View Details
        </button>
      </div>
    </div>
  );
}
