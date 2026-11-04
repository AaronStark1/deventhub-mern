import { beforeEach, describe, expect, it } from "vitest";
import {
  clearSession,
  getToken,
  isTokenExpired,
  loadSession,
  saveSession,
} from "./session";

// Unsigned JWT-shaped token: the client only reads `exp`, never verifies.
const makeToken = (claims) => {
  const b64 = (obj) => btoa(JSON.stringify(obj)).replace(/=+$/, "");
  return `${b64({ alg: "HS256", typ: "JWT" })}.${b64(claims)}.signature`;
};

const user = { _id: "1", name: "Ann", email: "ann@example.com", role: "user" };
const inAnHour = Math.floor(Date.now() / 1000) + 3600;
const anHourAgo = Math.floor(Date.now() / 1000) - 3600;

beforeEach(() => {
  localStorage.clear();
});

describe("isTokenExpired", () => {
  it("is false for a token that expires in the future", () => {
    expect(isTokenExpired(makeToken({ exp: inAnHour }))).toBe(false);
  });

  it("is true for a token that has expired", () => {
    expect(isTokenExpired(makeToken({ exp: anHourAgo }))).toBe(true);
  });

  it("treats garbage as expired", () => {
    expect(isTokenExpired("not-a-token")).toBe(true);
    expect(isTokenExpired("")).toBe(true);
  });
});

describe("loadSession", () => {
  it("returns the stored user when the token is still valid", () => {
    saveSession(user, makeToken({ exp: inAnHour }));
    expect(loadSession()).toEqual(user);
  });

  it("returns null and clears storage when the token has expired", () => {
    saveSession(user, makeToken({ exp: anHourAgo }));
    expect(loadSession()).toBeNull();
    expect(getToken()).toBeNull();
    expect(localStorage.getItem("user")).toBeNull();
  });

  it("returns null and clears storage when the stored user is corrupt", () => {
    localStorage.setItem("token", makeToken({ exp: inAnHour }));
    localStorage.setItem("user", "{not json");
    expect(loadSession()).toBeNull();
    expect(getToken()).toBeNull();
  });

  it("returns null when there is a user but no token", () => {
    localStorage.setItem("user", JSON.stringify(user));
    expect(loadSession()).toBeNull();
    expect(localStorage.getItem("user")).toBeNull();
  });
});

describe("clearSession", () => {
  it("removes both keys", () => {
    saveSession(user, makeToken({ exp: inAnHour }));
    clearSession();
    expect(getToken()).toBeNull();
    expect(localStorage.getItem("user")).toBeNull();
  });
});
