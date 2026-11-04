import { Component } from "react";
import { Link } from "react-router-dom";

// Catches render errors below it so one broken page doesn't blank the app.
// Give it a `key` that changes with the route so it resets on navigation.
export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("Unhandled render error:", error, info.componentStack);
  }

  render() {
    if (!this.state.error) {
      return this.props.children;
    }

    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6 gap-4">
        <h1 className="text-3xl font-bold">Something went wrong</h1>
        <p className="text-muted dark:text-muted-dark max-w-md">
          The page hit an unexpected error. You can go back home and try again.
        </p>
        <Link
          to="/"
          className="px-6 py-3 rounded-full bg-primary text-white font-semibold hover:bg-primary-dark transition"
        >
          Go home
        </Link>
      </div>
    );
  }
}
