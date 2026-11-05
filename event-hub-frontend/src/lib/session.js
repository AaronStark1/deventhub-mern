// The single place that knows how the session is stored in the browser.

const USER_KEY = "user";
const TOKEN_KEY = "token";

// Fired by the API layer when the server rejects the current token.
export const SESSION_EXPIRED_EVENT = "auth:session-expired";

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

// Reads the `exp` claim without verifying the signature — the server still
// verifies every request. This only avoids showing a logged-in UI for a
// token we already know is dead.
export function isTokenExpired(token) {
  try {
    const payload = token.split(".")[1];
    const { exp } = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    return typeof exp === "number" && exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

// Returns the stored user, or null (and clears storage) when the session
// is missing, expired or unreadable.
export function loadSession() {
  const token = getToken();
  if (!token || isTokenExpired(token)) {
    clearSession();
    return null;
  }

  try {
    const user = JSON.parse(localStorage.getItem(USER_KEY));
    if (user && typeof user === "object") return user;
  } catch {
    // corrupted value — fall through and reset
  }

  clearSession();
  return null;
}

export function saveSession(user, token) {
  try {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    // storage unavailable (private mode, quota) — session lives in memory only
  }
}

export function clearSession() {
  try {
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    // nothing to clear
  }
}
