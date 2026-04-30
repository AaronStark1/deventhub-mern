import { useNavigate } from "react-router-dom";
import ThemeToggle from "../components/ThemeToggle";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div
      className="
        min-h-screen
        bg-bg dark:bg-bg-dark
        text-text dark:text-text-dark
        transition-colors duration-300
      "
    >
      {/* HERO */}
      <section className="flex flex-col items-center justify-center text-center px-6 py-24">
        <h1 className="text-5xl font-bold mb-6">
          Discover Developer Events & Workshops
        </h1>

        <p className="text-lg text-muted dark:text-muted-dark max-w-2xl mb-10">
          Meetups, hackathons, bootcamps, and webinars —
          curated for developers who love to learn and build.
        </p>

        <div className="flex gap-4">
          <button
            onClick={() => navigate("/events")}
            className="
              px-8 py-3 rounded-full
              bg-primary text-white font-semibold
              hover:bg-primary-dark
              transition
            "
          >
            Explore Events
          </button>

          <button
            onClick={() => navigate("/register")}
            className="
              px-8 py-3 rounded-full
              border border-primary
              text-primary font-semibold
              hover:bg-primary hover:text-white
              transition
            "
          >
            Get Started
          </button>
        </div>
      </section>

      {/* WHY EVENTHUB */}
      <section className="py-20 px-6 bg-surface dark:bg-surface-dark transition-colors">
        <div className="max-w-5xl mx-auto text-center space-y-10">
          <h2 className="text-4xl font-semibold">
            Why EventHub?
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Curated Events",
                desc: "Only developer-focused events that actually matter.",
              },
              {
                title: "Seamless Registration",
                desc: "One-click sign-ups with instant confirmation.",
              },
              {
                title: "Built for Organizers",
                desc: "Create events, manage attendees, track analytics.",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="
                  bg-bg dark:bg-bg-dark
                  p-6 rounded-xl
                  shadow-sm hover:shadow-md
                  transition
                "
              >
                <h3 className="text-xl font-semibold mb-3">
                  {item.title}
                </h3>
                <p className="text-muted dark:text-muted-dark">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED EVENTS */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center">
            <h2 className="text-4xl font-semibold mb-3">
              Featured Events
            </h2>
            <p className="text-muted dark:text-muted-dark">
              Hand-picked upcoming events you shouldn’t miss
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "React Dev Meetup",
                meta: "📍 Bangalore · 🗓 Aug 24",
                poster:
        "https://img.pikbest.com/origin/09/21/38/14EpIkbEsTws7.jpg!w700wp",
              },
              {
                title: "AI Hackathon 2025",
                meta: "🌐 Online · 🗓 Sep 10",
              },
              {
                title: "Full-Stack Bootcamp",
                meta: "📍 Kochi · 🗓 Oct 5",
              },
            ].map((event, i) => (
              <div
                key={i}
                className="
                  bg-surface dark:bg-surface-dark
                  p-6 rounded-xl shadow
                  hover:shadow-lg
                  transition
                "
              >
                <span
                  className="
                    inline-block mb-3
                    px-3 py-1 rounded-full
                    text-xs font-semibold
                    bg-primary/20 text-primary
                  "
                >
                  Featured
                </span>

                <h3 className="text-xl font-semibold mb-2">
                  {event.title}
                </h3>

                <p className="text-sm text-muted dark:text-muted-dark mb-6">
                  {event.meta}
                </p>

                <button
                  onClick={() => navigate("/events")}
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
            ))}
          </div>
        </div>
      </section>

      {/* ORGANIZER CTA */}
      <section className="py-24 px-6 bg-primary text-white text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-4xl font-bold">
            hosting a developer Event?
          </h2>
          <p className="text-white/90">
            Reach the right audience, manage registrations, and track engagement —
            all from one dashboard.
          </p>
          <button
            onClick={() => navigate("/register")}
            className="
              px-10 py-4 rounded-full
              bg-white text-primary font-semibold
              hover:bg-white/90
              transition
            "
          >
            Become an Organizer
          </button>
        </div>
      </section>
    </div>
  );
}
