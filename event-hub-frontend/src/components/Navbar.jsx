import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { HiMenu, HiX } from "react-icons/hi";
import ThemeToggle from "./ThemeToggle";
import { useAuth } from "../hooks/useAuth";

const navLinkStyles =
  "text-lg text-muted dark:text-muted-dark hover:text-primary transition";

export default function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  const go = (path) => {
    closeMenu();
    navigate(path);
  };

  const handleLogout = () => {
    logout();
    go("/");
  };

  const dashboardPath = user?.role === "host" ? "/host/dashboard" : "/dashboard";

  return (
    <nav className="w-full bg-surface dark:bg-surface-dark border-b border-black/5 dark:border-white/10">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">

        {/* LEFT SIDE — Logo + Welcome */}
        <div className="flex items-center gap-4 sm:gap-6 min-w-0">
          <Link to="/" className="flex items-center shrink-0" onClick={closeMenu}>
            <img
              src="/logo.svg"
              alt="DEVentHub Logo"
              className="h-12 w-auto transition-transform duration-300 hover:scale-105"
            />
          </Link>

          {user && (
            <span className="hidden sm:inline text-sm font-semibold text-muted dark:text-muted-dark truncate">
              Welcome,{" "}
              <span className="text-primary">{user.name}</span>
            </span>
          )}
        </div>

        {/* CENTER — NAV LINKS (desktop) */}
        <div className="absolute left-1/2 transform -translate-x-1/2 hidden md:flex items-center gap-10">
          <Link to="/events" className={navLinkStyles}>
            Events
          </Link>

          {user && (
            <Link to={dashboardPath} className={navLinkStyles}>
              Dashboard
            </Link>
          )}

          <Link to="/about" className={navLinkStyles}>
            About
          </Link>
        </div>

        {/* RIGHT SIDE — Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          <ThemeToggle />

          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-full text-sm font-semibold text-red-500 hover:bg-red-500/10 transition"
              >
                Logout
              </button>
            ) : (
              <>
                <button
                  onClick={() => navigate("/login")}
                  className="px-4 py-2 rounded-full text-sm font-semibold text-primary hover:bg-primary/10"
                >
                  Login
                </button>

                <button
                  onClick={() => navigate("/register")}
                  className="px-5 py-2 rounded-full bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition"
                >
                  Register
                </button>
              </>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-full text-text dark:text-text-dark hover:bg-black/5 dark:hover:bg-white/10 transition"
          >
            {menuOpen ? <HiX size={24} /> : <HiMenu size={24} />}
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      {menuOpen && (
        <div
          id="mobile-menu"
          className="md:hidden border-t border-black/5 dark:border-white/10 px-4 py-4 flex flex-col gap-1"
        >
          {user && (
            <p className="px-3 pb-2 text-sm font-semibold text-muted dark:text-muted-dark sm:hidden">
              Welcome, <span className="text-primary">{user.name}</span>
            </p>
          )}

          <Link to="/events" onClick={closeMenu} className={`${navLinkStyles} px-3 py-2 rounded-lg`}>
            Events
          </Link>

          {user && (
            <Link to={dashboardPath} onClick={closeMenu} className={`${navLinkStyles} px-3 py-2 rounded-lg`}>
              Dashboard
            </Link>
          )}

          <Link to="/about" onClick={closeMenu} className={`${navLinkStyles} px-3 py-2 rounded-lg`}>
            About
          </Link>

          <div className="mt-3 pt-3 border-t border-black/5 dark:border-white/10 flex flex-col gap-2">
            {user ? (
              <button
                onClick={handleLogout}
                className="w-full px-4 py-3 rounded-full text-sm font-semibold text-red-500 hover:bg-red-500/10 transition"
              >
                Logout
              </button>
            ) : (
              <>
                <button
                  onClick={() => go("/login")}
                  className="w-full px-4 py-3 rounded-full text-sm font-semibold text-primary hover:bg-primary/10 transition"
                >
                  Login
                </button>

                <button
                  onClick={() => go("/register")}
                  className="w-full px-5 py-3 rounded-full bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition"
                >
                  Register
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
