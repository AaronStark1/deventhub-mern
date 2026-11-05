import { createContext, useContext } from "react";

// Kept apart from ThemeProvider so that file only exports a component
// (required for Vite fast refresh).
export const ThemeContext = createContext(null);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
