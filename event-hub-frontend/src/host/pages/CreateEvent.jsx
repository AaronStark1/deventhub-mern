import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { addEventAPI } from "../../services/allAPIs";
import { getErrorMessage } from "../../services/api";

const CATEGORIES = ["Meetup", "Hackathon", "Workshop", "Conference"];

// Same input styling as the rest of the app (filters, auth forms).
const fieldClass =
  "w-full px-4 py-3 rounded-lg bg-bg dark:bg-bg-dark border border-black/10 dark:border-white/10 outline-none focus:border-primary transition-colors";
const labelClass = "block text-sm font-semibold mb-2";

function Field({ label, htmlFor, children }) {
  return (
    <div>
      <label htmlFor={htmlFor} className={labelClass}>
        {label}
      </label>
      {children}
    </div>
  );
}

export default function CreateEvent() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [event, setEvent] = useState({
    title: "",
    description: "",
    poster: "",
    date: "",
    time: "",
    location: "",
    isOnline: false,
    category: "",
    priceType: "free",
    price: "",
    capacity: "",
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEvent((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const setPriceType = (priceType) =>
    setEvent((prev) => ({
      ...prev,
      priceType,
      price: priceType === "free" ? "" : prev.price,
    }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!event.title || !event.description || !event.date || !event.time) {
      alert("Please fill all required fields");
      return;
    }

    const price = Number(event.price) || 0;
    if (event.priceType === "paid" && price <= 0) {
      alert("Paid events must have a valid price");
      return;
    }

    try {
      setLoading(true);
      await addEventAPI({
        ...event,
        price,
        capacity: event.capacity ? Number(event.capacity) : undefined,
        location: event.isOnline ? "" : event.location,
      });
      alert("Event created successfully");
      navigate("/host/dashboard");
    } catch (err) {
      alert(getErrorMessage(err, "Event creation failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-4 md:px-10 lg:px-20 py-12 flex justify-center">
      <div className="w-full max-w-3xl">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">Create Event</h1>
          <p className="text-sm text-muted dark:text-muted-dark">
            Enter the details of your event
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-surface dark:bg-surface-dark rounded-2xl shadow p-6 sm:p-8 space-y-6"
        >
          <Field label="Event Title" htmlFor="title">
            <input
              id="title"
              name="title"
              placeholder="Tech Conference 2025"
              value={event.title}
              onChange={handleChange}
              className={fieldClass}
              required
            />
          </Field>

          <Field label="Poster Image URL" htmlFor="poster">
            <input
              id="poster"
              name="poster"
              type="url"
              placeholder="https://example.com/poster.jpg"
              value={event.poster}
              onChange={handleChange}
              className={fieldClass}
            />
          </Field>

          <Field label="Description" htmlFor="description">
            <textarea
              id="description"
              name="description"
              placeholder="Brief description of the event"
              value={event.description}
              onChange={handleChange}
              rows={4}
              className={fieldClass}
              required
            />
          </Field>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Date" htmlFor="date">
              <input
                id="date"
                type="date"
                name="date"
                value={event.date}
                onChange={handleChange}
                className={fieldClass}
                required
              />
            </Field>

            <Field label="Time" htmlFor="time">
              <input
                id="time"
                type="time"
                name="time"
                value={event.time}
                onChange={handleChange}
                className={fieldClass}
                required
              />
            </Field>
          </div>

          <div>
            <span className={labelClass}>Event Mode</span>
            <label className="flex items-center gap-3 mb-3 cursor-pointer">
              <input
                type="checkbox"
                name="isOnline"
                checked={event.isOnline}
                onChange={handleChange}
                className="w-4 h-4 accent-primary"
              />
              <span className="text-sm">Online Event</span>
            </label>

            {!event.isOnline && (
              <input
                name="location"
                placeholder="Event Location"
                aria-label="Event Location"
                value={event.location}
                onChange={handleChange}
                className={fieldClass}
                required
              />
            )}
          </div>

          <Field label="Category" htmlFor="category">
            <select
              id="category"
              name="category"
              value={event.category}
              onChange={handleChange}
              className={fieldClass}
              required
            >
              <option value="">Select category</option>
              {CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </Field>

          <div>
            <span className={labelClass}>Pricing</span>
            <div className="flex gap-3">
              {["free", "paid"].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setPriceType(type)}
                  className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition ${
                    event.priceType === type
                      ? "bg-primary text-white"
                      : "border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5"
                  }`}
                >
                  {type === "free" ? "Free" : "Paid"}
                </button>
              ))}
            </div>

            {event.priceType === "paid" && (
              <input
                className={`${fieldClass} mt-3`}
                type="number"
                name="price"
                placeholder="Ticket price (₹)"
                aria-label="Ticket price"
                min="1"
                value={event.price}
                onChange={handleChange}
                required
              />
            )}
          </div>

          <Field label="Total Seats" htmlFor="capacity">
            <input
              id="capacity"
              type="number"
              name="capacity"
              placeholder="Leave empty for unlimited"
              min="1"
              value={event.capacity}
              onChange={handleChange}
              className={fieldClass}
            />
          </Field>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 rounded-lg bg-primary text-white font-semibold hover:bg-primary-dark transition disabled:opacity-60"
            >
              {loading ? "Creating..." : "Create Event"}
            </button>

            <Link
              to="/host/dashboard"
              className="flex-1 py-3 rounded-lg border border-black/10 dark:border-white/10 text-center font-semibold hover:bg-black/5 dark:hover:bg-white/5 transition"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
