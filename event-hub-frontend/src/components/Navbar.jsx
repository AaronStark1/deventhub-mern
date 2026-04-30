import { Link, useNavigate } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const navLinkStyles =
    "text-lg text-muted dark:text-muted-dark hover:text-primary transition";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="w-full bg-surface dark:bg-surface-dark border-b border-black/5 dark:border-white/10">
      <div className="relative max-w-7xl mx-auto px-6 py-4 flex items-center justify-between ">

        {/* LEFT SIDE — Logo + Welcome */}
        <div className="flex items-center gap-6 ">
          <Link to="/" className="flex items-center">
            <img
              src="/logo.svg"
              alt="DEVentHub Logo"
              className="h-12 w-auto transition-transform duration-300 hover:scale-105"
            />
          </Link>

          {user && (
            <span className="text-sm font-semibold text-muted dark:text-muted-dark">
              Welcome,{" "}
              <span className="text-primary">{user.name}</span>
            </span>
          )}
        </div>

        {/* CENTER — NAV LINKS */}
        <div className="absolute left-1/2 transform -translate-x-1/2 hidden md:flex items-center gap-10">
          <Link to="/events" className={navLinkStyles}>
            Events
          </Link>

          {user && (
            <Link
              to={user.role === "host" ? "/host/dashboard" : "/dashboard"}
              className={navLinkStyles}
            >
              Dashboard
            </Link>
          )}

          <Link to="/about" className={navLinkStyles}>
            About
          </Link>
        </div>

        {/* RIGHT SIDE — Actions */}
        <div className="flex items-center gap-4">
          <ThemeToggle />

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
      </div>
    </nav>
  );
}
