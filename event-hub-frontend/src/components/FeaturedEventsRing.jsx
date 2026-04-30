import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ThreeDImageRing from "./lightswind/3d-image-ring";
import { getAllEventsAPI } from "../services/allAPIs";

export default function FeaturedEventsRing() {
  const navigate = useNavigate();

  const [images, setImages] = useState([]);
  const [eventIds, setEventIds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await getAllEventsAPI("?limit=10");

        if (res.status === 200) {
          const posters = res.data.map(
            (event) =>
              event.poster ||
              "https://via.placeholder.com/600x800"
          );

          const ids = res.data.map((event) => event._id);

          setImages(posters);
          setEventIds(ids);
        }
      } catch (err) {
        console.error("Failed to load featured events", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  if (loading) {
    return (
      <div className="h-[70vh] flex items-center justify-center text-muted">
        Loading featured events...
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="h-[70vh] flex items-center justify-center text-muted">
        No events available
      </div>
    );
  }

  return (
<div className="relative w-full h-[700px] flex items-center justify-center">
  <ThreeDImageRing
    images={images.slice(0, 7)}
    width={500}
    height={420}
    perspective={1400}
    imageDistance={600}
    initialRotation={180}
    animationDuration={1.2}
    staggerDelay={0.08}
    hoverOpacity={0.7}
    containerClassName="
      mx-auto
      bg-surface dark:bg-surface-dark
      rounded-2xl
    "
    imageClassName="rounded-xl shadow-xl"

  />
</div>

  );
}
