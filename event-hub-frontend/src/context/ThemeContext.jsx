import { useEffect, useMemo, useState } from "react";
import { ThemeContext } from "../hooks/useTheme";

// index.html applies this same key before first paint; here we only keep
// the class and storage in sync with toggles.
const readStoredTheme = () => {
  try {
    return localStorage.getItem("theme") === "dark";
  } catch {
    return false;
  }
};

export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(readStoredTheme);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    try {
      localStorage.setItem("theme", dark ? "dark" : "light");
    } catch {
      // storage unavailable — theme still applies for this visit
    }
  }, [dark]);

  const value = useMemo(() => ({ dark, setDark }), [dark]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
