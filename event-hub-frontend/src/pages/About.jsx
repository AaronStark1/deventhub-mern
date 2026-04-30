import {
  SiMongodb,
  SiExpress,
  SiReact,
  SiNodedotjs,
  SiTailwindcss,
  SiAxios,
  SiJavascript,
  SiGithub,
  SiPostman,
} from "react-icons/si";
import LogoLoop from "../components/animations/LogoLoop";

export default function About() {
  const mernLogos = [
    {
      node: <SiMongodb className="text-green-500" />,
      title: "MongoDB",
      href: "https://www.mongodb.com",
    },
    {
      node: <SiExpress className="text-gray-600 dark:text-gray-300" />,
      title: "Express",
      href: "https://expressjs.com",
    },
    {
      node: <SiReact className="text-cyan-400" />,
      title: "React",
      href: "https://react.dev",
    },
    {
      node: <SiNodedotjs className="text-green-600" />,
      title: "Node.js",
      href: "https://nodejs.org",
    },
    {
      node: <SiTailwindcss className="text-sky-400" />,
      title: "Tailwind CSS",
      href: "https://tailwindcss.com",
    },
    {
      node: <SiJavascript className="text-yellow-400" />,
      title: "JavaScript",
      href: "https://developer.mozilla.org/en-US/docs/Web/JavaScript",
    },
    {
      node: <SiGithub className="text-black dark:text-white" />,
      title: "GitHub",
      href: "https://github.com",
    },
      {
    node: (
      <SiPostman className="text-orange-500" />
    ),
    title: "Postman",
    href: "https://postman.com",
  },
    {
      node: <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="100" height="100" viewBox="0 0 48 48">
        <polygon fill="#546e7a" points="21.906,31.772 24.507,29.048 27.107,31.772 27.107,43 21.906,43"></polygon><polygon fill="#f50057" points="17.737,29.058 21.442,28.383 21.945,32.115 15.345,41.199 11.138,38.141"></polygon><polygon fill="#d500f9" points="15.962,24.409 19.355,26.041 17.569,29.356 6.89,32.825 5.283,27.879"></polygon><polygon fill="#29b6f6" points="17.256,19.607 19.042,22.922 15.649,24.554 4.97,21.084 6.577,16.137"></polygon><polygon fill="#00e5ff" points="21.126,16.482 20.623,20.214 16.918,19.539 10.318,10.455 14.526,7.398"></polygon><polygon fill="#546e7a" points="26.094,16.228 23.493,18.952 20.893,16.228 20.893,5 26.094,5"></polygon><polygon fill="#f50057" points="30.262,18.943 26.558,19.618 26.055,15.886 32.654,6.802 36.862,9.859"></polygon><polygon fill="#d500f9" points="32.039,23.59 28.645,21.958 30.431,18.643 41.11,15.174 42.717,20.12"></polygon><polygon fill="#29b6f6" points="30.744,28.393 28.958,25.078 32.351,23.447 43.03,26.916 41.423,31.863"></polygon><polygon fill="#00e5ff" points="26.874,31.518 27.378,27.786 31.082,28.461 37.682,37.545 33.474,40.602"></polygon>
      </svg>,
      title: "JWT",
      href: "https://jwt.io",
    },
    {
      node: <SiAxios className="text-indigo-500" />,
      title: "Axios",
      href: "https://axios-http.com",
    },
    {
      node: <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="100" height="100" viewBox="0 0 48 48">
        <path fill="#9575cd" d="M44.86,9.976L25.023,45.448c-0.41,0.732-1.462,0.737-1.878,0.008L2.915,9.979 C2.462,9.185,3.141,8.223,4.041,8.384l19.859,3.55c0.127,0.023,0.256,0.022,0.383-0.001l19.443-3.544 C44.623,8.225,45.305,9.18,44.86,9.976z"></path><path fill="#fbc02d" d="M33.574,3.01L19.019,5.862c-0.239,0.047-0.416,0.25-0.431,0.493l-0.895,15.121 c-0.021,0.356,0.306,0.633,0.654,0.552l4.052-0.935c0.379-0.087,0.722,0.246,0.644,0.628l-1.204,5.895 c-0.081,0.397,0.291,0.736,0.679,0.618l2.503-0.76c0.388-0.118,0.761,0.222,0.679,0.62l-1.913,9.26 c-0.12,0.579,0.651,0.895,0.972,0.398l0.215-0.332l11.86-23.669c0.199-0.396-0.144-0.848-0.579-0.764l-4.171,0.805 c-0.392,0.076-0.725-0.289-0.615-0.673l2.722-9.438C34.301,3.299,33.967,2.933,33.574,3.01z"></path>
      </svg>,
      title: "Vite",
      href: "https://vitejs.dev",
    }
  ];

  return (
    <div className="min-h-screen px-6 py-16 bg-bg dark:bg-bg-dark transition-colors">
      <div className="max-w-6xl mx-auto space-y-16">

        {/* HERO */}
        <section className="text-center space-y-6">
          <h1 className="text-5xl font-bold text-text dark:text-text-dark">
            About DEVentHub
          </h1>
          <p className="text-lg text-muted dark:text-muted-dark max-w-3xl mx-auto">
            DEVentHub is a platform built to connect developers with meaningful
            events — from meetups and hackathons to workshops and webinars —
            all in one place.
          </p>
        </section>

        {/* MISSION */}
        <section className="grid md:grid-cols-2 gap-10 items-center">
          <div className="space-y-4">
            <h2 className="text-3xl font-semibold">
              Our Mission
            </h2>
            <p className="text-muted dark:text-muted-dark">
              The developer ecosystem thrives on collaboration, learning, and
              shared experiences. EventHub aims to simplify how developers
              discover events and how organizers manage them.
            </p>
            <p className="text-muted dark:text-muted-dark">
              Whether you’re a student attending your first meetup or an
              organizer hosting a large-scale hackathon, EventHub provides the
              tools to make the experience seamless.
            </p>
          </div>

          <div className="bg-surface dark:bg-surface-dark rounded-2xl p-8 shadow">
            <ul className="space-y-4 text-text dark:text-text-dark">
              <li>✔ Discover developer-focused events</li>
              <li>✔ Simple and fast registration</li>
              <li>✔ Organizer dashboards & analytics</li>
              {/* <li>✔ Real-time updates & notifications</li> */}
            </ul>
          </div>
        </section>

        {/* WHO IT'S FOR */}
        <section className="space-y-8">
          <h2 className="text-3xl font-semibold text-center">
            Who Is EventHub For?
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Developers",
                desc: "Find events that match your interests, skill level, and location.",
              },
              {
                title: "Students",
                desc: "Learn, network, and grow through workshops and hackathons.",
              },
              {
                title: "Organizers",
                desc: "Create events, manage registrations, and track engagement.",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="
                  bg-surface dark:bg-surface-dark
                  rounded-xl p-6 text-center
                  shadow-sm hover:shadow-md
                  transition
                "
              >
                <h3 className="text-xl font-semibold mb-2">
                  {item.title}
                </h3>
                <p className="text-muted dark:text-muted-dark">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* TECH STACK */}
        <section className="text-center space-y-6">
          <h2 className="text-3xl font-semibold">
            Built With Modern Technologies
          </h2>
          <p className="text-muted dark:text-muted-dark max-w-3xl mx-auto">
            DEVentHub is a full-stack application built using the MERN stack,
            focusing on scalability, performance, and clean user experience.
          </p>

          <div className="w-screen relative left-1/2 -translate-x-1/2 h-[120px] mt-8 overflow-hidden">
            <LogoLoop
              logos={mernLogos}
              speed={80}
              direction="left"
              logoHeight={90}
              gap={90}
              hoverSpeed={0}
              scaleOnHover
              fadeOut
              fadeOutColor="var(--bg)" // optional
              ariaLabel="MERN Stack Technologies"
            />
          </div>

        </section>


      </div>
    </div>
  );
}
