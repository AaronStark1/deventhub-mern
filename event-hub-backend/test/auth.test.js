const { test, before, after, beforeEach } = require("node:test");
const assert = require("node:assert/strict");
const bcrypt = require("bcryptjs");
const h = require("./helpers");
const User = require("../models/userModel");

before(() => h.startTestServer());
after(() => h.stopTestServer());
beforeEach(() => h.clearDatabase());

const ann = { name: "Ann", email: "ann@example.com", password: "secret123" };

test("register stores a bcrypt hash, never the plaintext", async () => {
  const res = await h.request("POST", "/api/register", { body: ann });
  assert.equal(res.status, 201);

  const user = await User.findOne({ email: ann.email }).select("+password");
  assert.notEqual(user.password, ann.password);
  assert.ok(user.password.startsWith("$2"), "expected a bcrypt hash");
  assert.ok(await bcrypt.compare(ann.password, user.password));
  assert.equal(user.authProvider, "local");
});

test("register validates input and rejects duplicates", async () => {
  const missing = await h.request("POST", "/api/register", {
    body: { email: ann.email },
  });
  assert.equal(missing.status, 400);

  const badRole = await h.request("POST", "/api/register", {
    body: { ...ann, role: "admin" },
  });
  assert.equal(badRole.status, 400);

  assert.equal((await h.request("POST", "/api/register", { body: ann })).status, 201);
  const dup = await h.request("POST", "/api/register", { body: ann });
  assert.equal(dup.status, 409);
});

test("login returns a token and a user object without the password", async () => {
  const { token, user } = await h.registerAndLogin({ ...ann, role: "user" });

  assert.ok(token);
  assert.deepEqual(Object.keys(user).sort(), ["_id", "email", "name", "role"]);
  assert.equal(user.role, "user");

  // The token is accepted by a protected route.
  const me = await h.request("GET", "/api/user/registrations", { token });
  assert.equal(me.status, 200);
});

test("login gives the same 401 for an unknown email and a wrong password", async () => {
  await h.request("POST", "/api/register", { body: ann });

  const unknown = await h.request("POST", "/api/login", {
    body: { email: "nobody@example.com", password: "x" },
  });
  const wrong = await h.request("POST", "/api/login", {
    body: { email: ann.email, password: "wrong" },
  });

  assert.equal(unknown.status, 401);
  assert.equal(wrong.status, 401);
  assert.equal(unknown.data, wrong.data);
});

test("legacy plaintext password still logs in once and is upgraded to a hash", async () => {
  // Simulates a record written by the pre-bcrypt code.
  await User.create({
    name: "Old",
    email: "old@example.com",
    password: "plain-old",
    role: "user",
  });

  const first = await h.request("POST", "/api/login", {
    body: { email: "old@example.com", password: "plain-old" },
  });
  assert.equal(first.status, 200);

  const upgraded = await User.findOne({ email: "old@example.com" }).select("+password");
  assert.ok(upgraded.password.startsWith("$2"), "password should now be hashed");

  const again = await h.request("POST", "/api/login", {
    body: { email: "old@example.com", password: "plain-old" },
  });
  assert.equal(again.status, 200);

  const wrong = await h.request("POST", "/api/login", {
    body: { email: "old@example.com", password: "nope" },
  });
  assert.equal(wrong.status, 401);
});

test("google-only accounts cannot log in with a password", async () => {
  await User.create({
    name: "G",
    email: "g@example.com",
    role: "user",
    authProvider: "google",
  });

  const res = await h.request("POST", "/api/login", {
    body: { email: "g@example.com", password: "anything" },
  });
  assert.equal(res.status, 401);
});

test("user documents never serialise the password hash", async () => {
  const marker = "SUPERSECRETHASH";
  const created = await User.create({ ...ann, password: marker });
  const withPassword = await User.findById(created._id).select("+password");

  assert.equal(withPassword.password, marker, "sanity: field is loaded");
  assert.equal(JSON.stringify(withPassword).includes(marker), false);
});

test("protected routes reject missing, expired and tampered tokens", async () => {
  const jwt = require("jsonwebtoken");
  const expired = jwt.sign({ email: ann.email, role: "user" }, process.env.JWT_KEY, {
    expiresIn: -1,
  });

  assert.equal((await h.request("GET", "/api/user/registrations")).status, 401);
  assert.equal(
    (await h.request("GET", "/api/user/registrations", { token: expired })).status,
    401
  );
  assert.equal(
    (await h.request("GET", "/api/user/registrations", { token: expired + "x" })).status,
    401
  );
});

test("emails are trimmed and lower-cased so one person gets one account", async () => {
  const reg = await h.request("POST", "/api/register", {
    body: { ...ann, email: "  Ann@Example.COM " },
  });
  assert.equal(reg.status, 201);

  const login = await h.request("POST", "/api/login", {
    body: { email: "ANN@example.com", password: ann.password },
  });
  assert.equal(login.status, 200);
  assert.equal(login.data.user.email, "ann@example.com");

  // The JWT carries the normalised email, so ownership checks line up.
  const payload = JSON.parse(Buffer.from(login.data.token.split(".")[1], "base64url"));
  assert.equal(payload.email, "ann@example.com");

  const dup = await h.request("POST", "/api/register", {
    body: { ...ann, email: "ann@example.com" },
  });
  assert.equal(dup.status, 409);
});

test("a Google sub stored as a legacy password is not a usable credential", async () => {
  // The pre-bcrypt Google login stored the Google account id as `password`.
  const sub = "104385726012345678901";
  await User.create({ name: "G", email: "legacy-g@example.com", password: sub, role: "user" });

  const res = await h.request("POST", "/api/login", {
    body: { email: "legacy-g@example.com", password: sub },
  });
  assert.equal(res.status, 401);

  const stored = await User.findOne({ email: "legacy-g@example.com" }).select("+password");
  assert.equal(stored.password, sub, "must not be upgraded into a real credential");
});

test("non-string credentials are a 400, not a crash", async () => {
  await h.request("POST", "/api/register", { body: ann });

  const res = await h.request("POST", "/api/login", {
    body: { email: ann.email, password: { $ne: "" } },
  });
  assert.equal(res.status, 400);
});
