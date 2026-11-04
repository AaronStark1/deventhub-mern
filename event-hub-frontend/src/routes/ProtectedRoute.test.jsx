import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { AuthContext } from "../hooks/useAuth";
import ProtectedRoute from "./ProtectedRoute";

function LocationProbe() {
  const location = useLocation();
  return (
    <div data-testid="location">
      {location.pathname}|{JSON.stringify(location.state)}
    </div>
  );
}

function renderAt(path, { user = null, allowedRole } = {}) {
  const auth = { user, isAuthenticated: Boolean(user), isHost: user?.role === "host", login() {}, logout() {} };

  render(
    <AuthContext.Provider value={auth}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/login" element={<LocationProbe />} />
          <Route path="/events" element={<LocationProbe />} />
          <Route path="/host/dashboard" element={<LocationProbe />} />
          <Route
            path="/secret"
            element={
              <ProtectedRoute allowedRole={allowedRole}>
                <div>secret content</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  );
}

const host = { _id: "1", name: "H", email: "h@example.com", role: "host" };
const user = { _id: "2", name: "U", email: "u@example.com", role: "user" };

describe("ProtectedRoute", () => {
  it("sends anonymous visitors to /login and remembers where they were going", () => {
    renderAt("/secret?event=42#top");

    const probe = screen.getByTestId("location").textContent;
    expect(probe).toMatch(/^\/login\|/);
    const state = JSON.parse(probe.split("|")[1]);
    expect(state.from.pathname).toBe("/secret");
    expect(state.from.search).toBe("?event=42");
    expect(state.from.hash).toBe("#top");
  });

  it("renders the page for a user with the right role", () => {
    renderAt("/secret", { user, allowedRole: "user" });
    expect(screen.getByText("secret content")).toBeInTheDocument();
  });

  it("renders the page for any logged-in user when no role is required", () => {
    renderAt("/secret", { user: host });
    expect(screen.getByText("secret content")).toBeInTheDocument();
  });

  it("sends a user to their own home when a host page is requested", () => {
    renderAt("/secret", { user, allowedRole: "host" });
    expect(screen.getByTestId("location").textContent).toMatch(/^\/events\|/);
  });

  it("sends a host to the host dashboard when a user page is requested", () => {
    renderAt("/secret", { user: host, allowedRole: "user" });
    expect(screen.getByTestId("location").textContent).toMatch(/^\/host\/dashboard\|/);
  });
});
