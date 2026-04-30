import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Card,
  Label,
  TextInput,
  Textarea,
  Select,
  Checkbox,
  Button,
} from "flowbite-react";
import { addEventAPI } from "../../services/allAPIs";

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
    price: 0,
    capacity: "",
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEvent({
      ...event,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!event.title || !event.description || !event.date || !event.time) {
      alert("Please fill all required fields");
      return;
    }

    if (event.priceType === "paid" && (!event.price || event.price <= 0)) {
      alert("Paid events must have a valid price");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login as host");
      navigate("/login");
      return;
    }

    try {
      setLoading(true);

      const res = await addEventAPI(event, token);

      if (res.status === 200) {
        alert("Event created successfully");
        navigate("/host/dashboard");
      } else {
        alert(res.response?.data || "Event creation failed");
      }
    } catch (err) {
      alert(err.response?.data || "Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-4 md:px-10 lg:px-20 py-12 flex justify-center">
      <div className="w-full max-w-3xl">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">Create Event</h1>
          <p className="text-sm opacity-70">
            Enter the details of your event
          </p>
        </div>

        <Card className="bg-surface dark:bg-surface-dark">
          <form onSubmit={handleSubmit} className="space-y-6">

            <div>
              <Label value="Event Title" />
              <TextInput
                name="title"
                placeholder="Tech Conference 2025"
                value={event.title}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <Label value="Poster Image URL" />
              <TextInput
                name="poster"
                placeholder="https://example.com/poster.jpg"
                value={event.poster}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label value="Description" />
              <Textarea
                name="description"
                placeholder="Brief description of the event"
                value={event.description}
                onChange={handleChange}
                rows={4}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label value="Date" />
                <TextInput
                  type="date"
                  name="date"
                  value={event.date}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <Label value="Time" />
                <TextInput
                  type="time"
                  name="time"
                  value={event.time}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div>
              <Label value="Event Mode" />
              <div className="flex items-center gap-3 mb-2">
                <Checkbox
                  name="isOnline"
                  checked={event.isOnline}
                  onChange={handleChange}
                />
                <span className="text-sm">Online Event</span>
              </div>

              {!event.isOnline && (
                <TextInput
                  name="location"
                  placeholder="Event Location"
                  value={event.location}
                  onChange={handleChange}
                  required
                />
              )}
            </div>

            <div>
              <Label value="Category" />
              <Select
                name="category"
                value={event.category}
                onChange={handleChange}
                required
              >
                <option value="">Select category</option>
                <option value="Meetup">Meetup</option>
                <option value="Hackathon">Hackathon</option>
                <option value="Workshop">Workshop</option>
                <option value="Conference">Conference</option>
              </Select>
            </div>

            <div>
              <Label value="Pricing" />
              <div className="flex gap-4 mt-2">
                <Button
                  type="button"
                  color={event.priceType === "free" ? "success" : "gray"}
                  onClick={() =>
                    setEvent({ ...event, priceType: "free", price: 0 })
                  }
                >
                  Free
                </Button>

                <Button
                  type="button"
                  color={event.priceType === "paid" ? "success" : "gray"}
                  onClick={() =>
                    setEvent({ ...event, priceType: "paid" })
                  }
                >
                  Paid
                </Button>
              </div>

              {event.priceType === "paid" && (
                <TextInput
                  className="mt-3"
                  type="number"
                  name="price"
                  placeholder="Ticket Price"
                  min="1"
                  value={event.price}
                  onChange={handleChange}
                  required
                />
              )}
            </div>

            <div>
              <Label value="Total Seats" />
              <TextInput
                type="number"
                name="capacity"
                placeholder="260"
                value={event.capacity}
                onChange={handleChange}
                min="1"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? "Creating..." : "Create Event"}
              </Button>

              <Link to="/host/dashboard" className="flex-1">
                <Button color="gray" className="w-full">
                  Cancel
                </Button>
              </Link>
            </div>

          </form>
        </Card>
      </div>
    </div>
  );
}
