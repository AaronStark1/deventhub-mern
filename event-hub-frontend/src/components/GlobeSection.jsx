import Globe from "./lightswind/globe";
import { useTheme } from "../hooks/useTheme";

export default function GlobeSection() {
  const { dark } = useTheme();

  return (
    <section className="relative py-20 bg-bg dark:bg-bg-dark overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 flex flex-col items-center text-center gap-14">

        <h2 className="text-3xl md:text-4xl font-bold text-text dark:text-text-dark">
          A Global  Community
        </h2>

        <p className="max-w-2xl text-lg text-muted dark:text-muted-dark">
          DEVentHub links builders, thinkers, and innovators across cities and countries.
        </p>

        <Globe
          className="w-full max-w-[30rem] aspect-square"
          theta={0.25}
          dark={dark ? 1 : 0}
          scale={1.15}
          diffuse={1.4}
          baseColor={dark ? "#10242b" : "#E6F0EE"}
          markerColor="#4FBF9B"
          glowColor="#4FBF9B"
        />

      </div>
    </section>
  );
}
