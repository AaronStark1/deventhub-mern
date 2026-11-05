import axios from "axios";
import { SESSION_EXPIRED_EVENT, clearSession, getToken } from "../lib/session";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
});

// Login/register never need a token, and a 401 from them is a failed
// login, not an expired session — so they get no token and never trigger
// the logout below.
const AUTH_ENDPOINTS = ["/api/login", "/api/register", "/api/google-login"];
const isAuthEndpoint = (url = "") => AUTH_ENDPOINTS.some((p) => url.endsWith(p));

// Attach the session token to every other request.
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token && !isAuthEndpoint(config.url)) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// A 401 on a request that carried a token means the session is dead
// (expired or invalid). Drop it and tell the app.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const sentToken = Boolean(error.config?.headers?.Authorization);
    if (error.response?.status === 401 && sentToken) {
      clearSession();
      window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
    }
    return Promise.reject(error);
  }
);

// The backend answers errors with a plain string or { message }.
export function getErrorMessage(error, fallback = "Something went wrong") {
  const data = error?.response?.data;
  if (typeof data === "string" && data) return data;
  if (data?.message) return data.message;
  if (!error?.response) return "Unable to reach the server";
  return fallback;
}

export default api;
