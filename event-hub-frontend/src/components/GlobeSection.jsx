import { useEffect, useState } from "react";
import Globe from "./lightswind/globe";

export default function GlobeSection() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const checkDark = () =>
      document.documentElement.classList.contains("dark");

    setIsDark(checkDark());

    const observer = new MutationObserver(() => {
      setIsDark(checkDark());
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  return (
    <section className="relative py-20 bg-bg dark:bg-bg-dark overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 flex flex-col items-center text-center gap-14">

        <h2 className="text-4xl font-bold text-text dark:text-text-dark">
          A Global  Community
        </h2>

        <p className="max-w-2xl text-lg text-muted dark:text-muted-dark">
          DEVentHub links builders, thinkers, and innovators across cities and countries.
        </p>

        <Globe
          className="w-full h-[480px]"
          theta={0.25}
          dark={isDark ? 1 : 0}
          scale={1.15}
          diffuse={1.4}
          baseColor={isDark ? "#10242b" : "#E6F0EE"}
          markerColor="#4FBF9B"
          glowColor="#4FBF9B"
        />

      </div>
    </section>
  );
}
