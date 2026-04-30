import DecryptedText from "../components/animations/DecryptedText";
import RotatingText from "../components/animations/RotatingText";
import ShinyText from "../components/animations/ShinyText";
import Balatro from "../components/backgrounds/Balatro";
import { useNavigate } from "react-router-dom";
import FeaturedEventsRing from "../components/FeaturedEventsRing";
import ScrollStack, { ScrollStackItem } from "../components/animations/ScrollStack";
import EventScrollStack from "../components/EventScrollStack";
import GlobeSection from "../components/GlobeSection";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="w-full">

      {/* HERO SECTION */}
      <section className="relative h-screen overflow-hidden">

        {/* BACKGROUND */}
        <div className="absolute inset-0">
          <Balatro
            isRotate={false}
            mouseInteraction
            pixelFilter={1020}
            color1="#539b8f"
            color2="#255156"
            color3="#10242b"
          />
        </div>

        {/* OVERLAY (optional for readability) */}
        <div className="absolute inset-0 bg-black/40" />

        {/* CONTENT */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">
          <h1 className="text-6xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white mb-6">
            <ShinyText

              text="Welcome to DEVentHub"
              speed={2.5}
              delay={0}
              color="#3e797f"
              shineColor="#9ee3b5"
              spread={120}
              direction="right"
              yoyo={true}
              pauseOnHover={false}
              disabled={false}
            />

            <span className="text-primary block text-3xl">
              <div style={{ marginTop: '2rem' }}>
                <DecryptedText
                  text="Discover events that connect, challenge, and inspire"
                  animateOn="view"
                  revealDirection="start"
                  sequential
                  useOriginalCharsOnly={false}
                />
              </div>
            </span>
          </h1>

          <p className="mt-6 mb-10 flex items-center gap-3 text-3xl font-semibold text-white/80">
            <span>Host and attend</span>

            <RotatingText
              texts={["Meetups", "Hackathons", "Workshops", "Bootcamps"]}
              rotationInterval={2800}
              staggerFrom="first"
              initial={{ y: "120%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "-120%", opacity: 0 }}
              transition={{
                type: "spring",
                stiffness: 180,
                damping: 20,
              }}
              mainClassName="
      inline-flex
      px-3 py-1
      rounded-md
      bg-[#D2E4DF] text-[#255156]
      font-bold
      shadow-sm
    "
              splitLevelClassName="overflow-hidden"
            />
          </p>



          <div className="flex gap-4">
            <button
              onClick={() => navigate("/events")}
              className="
                px-8 py-4 rounded-full
                bg-primary text-white font-semibold
                hover:bg-primary-dark transition
              "
            >
              Explore Events
            </button>

            <button
              onClick={() => navigate("/register")}
              className="
                px-8 py-4 rounded-full
                border border-white/60 text-white
                hover:bg-white hover:text-black transition
              "
            >
              Host an Event
            </button>
          </div>
        </div>
      </section>
      {/* FEATURED EVENTS SLIDER */}
      <section className="relative py-24 bg-bg dark:bg-bg-dark">
        <h2 className="text-center text-4xl font-bold mb-12">
          Featured Events
        </h2>

        <FeaturedEventsRing />
      </section>

      {/* 🌍 GLOBE SECTION */}
      <GlobeSection />

      <section className="relative py-20 bg-bg dark:bg-bg-dark">
        <h2 className="text-center text-4xl font-bold mb-10">
          What We Host
        </h2>

        <div className="relative h-[280vh] overflow-hidden">
          <EventScrollStack useWindowScroll />
        </div>

      </section>


      {/* NEXT SECTIONS */}
      {/* Features, stats, CTA, etc */}

    </div>
  );
}
