import { Link } from "react-router-dom";
import { SiGithub } from "react-icons/si";

export default function Footer() {
  return (
    <footer className="w-full bg-surface dark:bg-surface-dark border-t border-black/5 dark:border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-5">

        <div className="flex flex-col md:flex-row justify-between items-center gap-8">

          {/* LEFT — Logo + Tagline */}
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 text-center sm:text-left">
            <Link to="/">
              <img
                src="/logo.svg"
                alt="DEVentHub"
                className="h-14 w-auto"
              />
            </Link>

            <p className="text-base sm:text-lg font-medium text-muted dark:text-muted-dark">
              Connecting developers through meaningful events.
            </p>
          </div>

          {/* CENTER — Links */}
          <div className="flex flex-wrap justify-center gap-6 sm:gap-10 text-base sm:text-lg font-semibold text-muted dark:text-muted-dark">
            <Link to="/events" className="hover:text-primary transition">
              Events
            </Link>
            <Link to="/about" className="hover:text-primary transition">
              About
            </Link>
            <Link to="/" className="hover:text-primary transition">
              Home
            </Link>
          </div>

          {/* RIGHT — GitHub */}
          <div>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted dark:text-muted-dark hover:text-primary transition text-3xl"
            >
              <SiGithub />
            </a>
          </div>

        </div>

        <div className="mt-5 pt-6 border-t border-black/5 dark:border-white/10 text-center text-sm text-muted dark:text-muted-dark">
          © {new Date().getFullYear()} DEVentHub. All rights reserved.
        </div>

      </div>
    </footer>
  );
}
