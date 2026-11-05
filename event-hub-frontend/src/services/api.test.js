import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AxiosError } from "axios";
import api, { getErrorMessage } from "./api";
import { SESSION_EXPIRED_EVENT, getToken, saveSession } from "../lib/session";

const user = { _id: "1", name: "Ann", email: "ann@example.com", role: "user" };
const TOKEN = "header.payload.signature";

// Replace the network with a fake adapter; interceptors still run around it.
let lastConfig;
function respondWith(status, data = "") {
  api.defaults.adapter = async (config) => {
    lastConfig = config;
    const response = { status, data, headers: {}, config, statusText: "" };
    if (status >= 400) {
      throw new AxiosError("Request failed", "ERR_BAD_REQUEST", config, null, response);
    }
    return response;
  };
}

beforeEach(() => {
  localStorage.clear();
  lastConfig = undefined;
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("request interceptor", () => {
  it("attaches the stored token to API requests", async () => {
    saveSession(user, TOKEN);
    respondWith(200, []);

    await api.get("/api/user/registrations");

    expect(lastConfig.headers.Authorization).toBe(`Bearer ${TOKEN}`);
  });

  it("sends nothing when there is no session", async () => {
    respondWith(200, []);

    await api.get("/api/getAllEvents");

    expect(lastConfig.headers.Authorization).toBeUndefined();
  });

  it("never attaches the token to login, register or google-login", async () => {
    saveSession(user, TOKEN);
    respondWith(200, {});

    for (const path of ["/api/login", "/api/register", "/api/google-login"]) {
      await api.post(path, {});
      expect(lastConfig.headers.Authorization).toBeUndefined();
    }
  });
});

describe("response interceptor", () => {
  it("clears the session and announces expiry on a 401 for an authenticated request", async () => {
    saveSession(user, TOKEN);
    const expired = vi.fn();
    window.addEventListener(SESSION_EXPIRED_EVENT, expired);
    respondWith(401, "Session expired");

    await expect(api.get("/api/user/registrations")).rejects.toBeInstanceOf(AxiosError);

    expect(getToken()).toBeNull();
    expect(expired).toHaveBeenCalledTimes(1);
    window.removeEventListener(SESSION_EXPIRED_EVENT, expired);
  });

  it("does not log the user out when a login attempt fails with 401", async () => {
    saveSession(user, TOKEN);
    const expired = vi.fn();
    window.addEventListener(SESSION_EXPIRED_EVENT, expired);
    respondWith(401, "Invalid email or password");

    await expect(api.post("/api/login", {})).rejects.toBeInstanceOf(AxiosError);

    expect(getToken()).toBe(TOKEN);
    expect(expired).not.toHaveBeenCalled();
    window.removeEventListener(SESSION_EXPIRED_EVENT, expired);
  });

  it("leaves other errors alone", async () => {
    saveSession(user, TOKEN);
    respondWith(403, "Only hosts can perform this action");

    await expect(api.post("/api/addEvent", {})).rejects.toBeInstanceOf(AxiosError);

    expect(getToken()).toBe(TOKEN);
  });
});

describe("getErrorMessage", () => {
  const withResponse = (data) => ({ response: { status: 400, data } });

  it("uses a plain-string body", () => {
    expect(getErrorMessage(withResponse("Event is full"))).toBe("Event is full");
  });

  it("uses a { message } body", () => {
    expect(getErrorMessage(withResponse({ message: "Nope" }))).toBe("Nope");
  });

  it("explains a network failure", () => {
    expect(getErrorMessage({ message: "Network Error" })).toBe("Unable to reach the server");
  });

  it("falls back when the body is unusable", () => {
    expect(getErrorMessage(withResponse({}), "Fallback")).toBe("Fallback");
    expect(getErrorMessage(withResponse(""), "Fallback")).toBe("Fallback");
  });
});
