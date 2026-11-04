import { createContext, useContext } from "react";

// Kept apart from AuthProvider so that file only exports a component
// (required for Vite fast refresh).
export const AuthContext = createContext(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
