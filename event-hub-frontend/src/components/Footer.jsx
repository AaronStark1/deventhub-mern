import { Link, NavLink } from "react-router-dom";
import { SiGithub } from "react-icons/si";
import { cx } from "../lib/cx";

const FOOTER_LINKS = [
  { to: "/", label: "Home", end: true },
  { to: "/events", label: "Events" },
  { to: "/about", label: "About" },
];

// Phones/tablets: brand on its own row, then links (left) + GitHub (right).
// Desktop: one row — brand left, links centred, GitHub right.
export default function Footer() {
  return (
    <footer className="w-full bg-surface dark:bg-surface-dark border-t border-deep/[0.12] dark:border-white/10">
      <div className="shell py-10 lg:py-12">
        <div className="grid grid-cols-[1fr_auto] items-center gap-x-6 gap-y-8 lg:grid-cols-[1fr_auto_1fr]">

          {/* Logo + tagline */}
          <div className="col-span-2 lg:col-span-1 flex items-center gap-4">
            <Link to="/" className="logo-tile">
              <img src="/logo.svg" alt="DEVentHub" className="block h-12 w-12" />
            </Link>

            <p className="max-w-[30ch] text-balance text-[0.9375rem] sm:text-base leading-snug font-medium text-muted dark:text-muted-dark">
              Connecting developers through meaningful events.
            </p>
          </div>

          {/* Links */}
          <nav aria-label="Footer">
            <ul className="flex flex-wrap items-center gap-x-8 gap-y-3 text-[0.9375rem] font-semibold">
              {FOOTER_LINKS.map(({ to, label, end }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    end={end}
                    className={({ isActive }) =>
                      cx(
                        "link-underline",
                        isActive
                          ? "text-deep dark:text-text-dark"
                          : "text-muted dark:text-muted-dark hover:text-deep dark:hover:text-text-dark"
                      )
                    }
                  >
                    {label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          {/* GitHub */}
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub (opens in a new tab)"
            className="
              justify-self-end grid h-10 w-10 place-items-center rounded-full
              border border-deep/15 text-muted
              transition-[color,background-color,border-color,transform] duration-300 ease-soft
              hover:border-deep/30 hover:bg-white/40 hover:text-deep motion-safe:hover:-translate-y-px
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-deep/40
              dark:border-white/15 dark:text-muted-dark dark:hover:border-white/30 dark:hover:bg-white/5 dark:hover:text-text-dark
              dark:focus-visible:ring-white/40
            "
          >
            <SiGithub aria-hidden="true" className="h-5 w-5" />
          </a>
        </div>

        <div className="mt-8 pt-6 border-t border-deep/[0.12] dark:border-white/10 text-sm text-muted dark:text-muted-dark">
          © {new Date().getFullYear()} DEVentHub. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
