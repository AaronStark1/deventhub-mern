import { useEffect, useRef, useState } from "react";
import ThreeDImageRing from "./lightswind/3d-image-ring";
import { getAllEventsAPI } from "../services/allAPIs";

const MAX_RING_WIDTH = 500;
const MIN_RING_WIDTH = 220;
const MAX_IMAGES = 7;

export default function FeaturedEventsRing() {
  const containerRef = useRef(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  // Ring size follows the available width so it never clips on phones.
  // Desktop keeps the original 500px.
  const [ringWidth, setRingWidth] = useState(MAX_RING_WIDTH);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await getAllEventsAPI({ limit: 10 });

        setImages(
          res.data.map(
            (event) => event.poster || "https://via.placeholder.com/600x800"
          )
        );
      } catch (err) {
        console.error("Failed to load featured events", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // The container is always rendered (loading text goes inside it), so the
  // observer attaches on mount rather than missing the element.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new ResizeObserver(([entry]) => {
      const available = Math.floor(entry.contentRect.width * 0.8);
      setRingWidth(Math.max(MIN_RING_WIDTH, Math.min(MAX_RING_WIDTH, available)));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const shown = images.slice(0, MAX_IMAGES);
  const ready = !loading && shown.length > 0;

  // On narrow screens the ring is wider than the viewport, so put one card
  // squarely in front instead of two straddling the centre (desktop keeps
  // the original 180°).
  const centerCard = ringWidth < MAX_RING_WIDTH && shown.length % 2 === 1;
  const initialRotation = centerCard ? 180 + 180 / shown.length : 180;

  return (
    <div
      ref={containerRef}
      className="relative w-full flex items-center justify-center px-4"
      style={{ height: ready ? Math.round(ringWidth * 1.4) : undefined }}
    >
      {loading ? (
        <div className="h-[70vh] flex items-center justify-center text-muted">
          Loading featured events...
        </div>
      ) : shown.length === 0 ? (
        <div className="h-[70vh] flex items-center justify-center text-muted">
          No events available
        </div>
      ) : (
        <ThreeDImageRing
          images={shown}
          width={ringWidth}
          perspective={ringWidth * 2.8}
          imageDistance={ringWidth * 1.2}
          initialRotation={initialRotation}
          animationDuration={1.2}
          staggerDelay={0.08}
          hoverOpacity={0.7}
          mobileScaleFactor={1}
          containerClassName="
            mx-auto
            bg-surface dark:bg-surface-dark
            rounded-2xl
          "
          imageClassName="rounded-xl shadow-xl"
        />
      )}
    </div>
  );
}
