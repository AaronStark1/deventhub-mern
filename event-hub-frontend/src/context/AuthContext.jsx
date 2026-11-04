import { useCallback, useEffect, useMemo, useState } from "react";
import { AuthContext } from "../hooks/useAuth";
import {
  SESSION_EXPIRED_EVENT,
  clearSession,
  loadSession,
  saveSession,
} from "../lib/session";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadSession);

  const login = useCallback((userData, token) => {
    saveSession(userData, token);
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
  }, []);

  // The API layer clears storage when the server rejects the token;
  // this keeps the React tree in sync so protected routes redirect.
  useEffect(() => {
    const onExpired = () => setUser(null);
    window.addEventListener(SESSION_EXPIRED_EVENT, onExpired);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, onExpired);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isHost: user?.role === "host",
      login,
      logout,
    }),
    [user, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
