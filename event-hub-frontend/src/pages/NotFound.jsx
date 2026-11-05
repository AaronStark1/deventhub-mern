import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6 gap-4">
      <p className="text-6xl font-bold text-primary">404</p>
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <p className="text-muted dark:text-muted-dark max-w-md">
        The page you're looking for doesn't exist or has moved.
      </p>
      <Link
        to="/events"
        className="px-6 py-3 rounded-full bg-primary text-white font-semibold hover:bg-primary-dark transition"
      >
        Browse events
      </Link>
    </div>
  );
}
