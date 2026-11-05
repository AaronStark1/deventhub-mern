import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { homeFor } from "../lib/routes";

export default function ProtectedRoute({ children, allowedRole }) {
  const { user } = useAuth();
  const location = useLocation();

  // Not logged in: remember where they were going so login can send them back.
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Wrong role: send them to their own home rather than a dead end.
  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to={homeFor(user.role)} replace />;
  }

  return children;
}
