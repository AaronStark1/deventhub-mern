const { test, before, after, beforeEach } = require("node:test");
const assert = require("node:assert/strict");
const h = require("./helpers");
const Event = require("../models/eventModel");

before(() => h.startTestServer());
after(() => h.stopTestServer());

let host, otherHost, user, otherUser;

beforeEach(async () => {
  await h.clearDatabase();
  const make = (name, role) =>
    h.registerAndLogin({ name, email: `${name}@example.com`, password: "pw", role });
  [host, otherHost, user, otherUser] = await Promise.all([
    make("host", "host"),
    make("otherhost", "host"),
    make("user", "user"),
    make("otheruser", "user"),
  ]);
});

const sampleEvent = (overrides = {}) => ({
  title: "React Meetup",
  description: "Talks and pizza",
  date: "2030-01-01",
  time: "10:00",
  location: "Kochi",
  isOnline: false,
  category: "Meetup",
  priceType: "free",
  capacity: 2,
  ...overrides,
});

async function createEvent(token, overrides) {
  const res = await h.request("POST", "/api/addEvent", {
    token,
    body: sampleEvent(overrides),
  });
  assert.equal(res.status, 201, `addEvent: ${JSON.stringify(res.data)}`);
  return res.data.event;
}

const register = (eventId, token) =>
  h.request("POST", `/api/events/${eventId}/confirm-registration`, { token });

test("only hosts can create events", async () => {
  const asUser = await h.request("POST", "/api/addEvent", {
    token: user.token,
    body: sampleEvent(),
  });
  assert.equal(asUser.status, 403);

  const asHost = await createEvent(host.token);
  assert.equal(asHost.hostEmail, "host@example.com");
});

test("public event responses hide attendee emails and the host's email", async () => {
  const ev = await createEvent(host.token);
  assert.equal((await register(ev._id, user.token)).status, 200);

  const list = await h.request("GET", "/api/getAllEvents");
  assert.equal(list.status, 200);
  const [pub] = list.data;
  assert.equal(pub.participants, undefined);
  assert.equal(pub.hostEmail, undefined);
  assert.equal(pub.participantCount, 1);
  assert.equal(pub.seatsLeft, 1);

  const single = await h.request("GET", `/api/getSingleEvent/${ev._id}`);
  assert.equal(single.status, 200);
  assert.equal(single.data.hostName, "host");
  assert.equal(single.data.participants, undefined);
  assert.equal(single.data.hostEmail, undefined);
});

test("seatsLeft is null when an event has no capacity limit", async () => {
  const ev = await createEvent(host.token, { capacity: undefined });
  const res = await h.request("GET", `/api/getSingleEvent/${ev._id}`);
  assert.equal(res.data.seatsLeft, null);
});

test("hosts can only update and delete their own events", async () => {
  const ev = await createEvent(host.token);

  const hijack = await h.request("PUT", `/api/updateEvent/${ev._id}`, {
    token: otherHost.token,
    body: { title: "Hijacked" },
  });
  assert.equal(hijack.status, 403);

  const own = await h.request("PUT", `/api/updateEvent/${ev._id}`, {
    token: host.token,
    body: { title: "Renamed" },
  });
  assert.equal(own.status, 200);
  assert.equal(own.data.event.title, "Renamed");

  assert.equal(
    (await h.request("DELETE", `/api/deleteEvent/${ev._id}`, { token: otherHost.token })).status,
    403
  );
  // Own event, but only cancelled events may be deleted.
  assert.equal(
    (await h.request("DELETE", `/api/deleteEvent/${ev._id}`, { token: host.token })).status,
    403
  );

  await h.request("PUT", `/api/updateEvent/${ev._id}`, {
    token: host.token,
    body: { status: "cancelled" },
  });
  assert.equal(
    (await h.request("DELETE", `/api/deleteEvent/${ev._id}`, { token: host.token })).status,
    200
  );
  assert.equal(await Event.findById(ev._id), null);
});

test("updateEvent no longer lets a host inject participants", async () => {
  const ev = await createEvent(host.token);
  const res = await h.request("PUT", `/api/updateEvent/${ev._id}`, {
    token: host.token,
    body: { addParticipant: "victim@example.com" },
  });
  assert.equal(res.status, 200);
  const fresh = await Event.findById(ev._id);
  assert.deepEqual(fresh.participants, []);
});

test("malformed id is a 404, malformed field is a 400", async () => {
  assert.equal((await h.request("GET", "/api/getSingleEvent/not-an-id")).status, 404);

  const ev = await createEvent(host.token);
  const bad = await h.request("PUT", `/api/updateEvent/${ev._id}`, {
    token: host.token,
    body: { capacity: "lots" },
  });
  assert.equal(bad.status, 400);
});

test("registration is user-only, idempotent, and respects status and capacity", async () => {
  const ev = await createEvent(host.token, { capacity: 2 });

  assert.equal((await register(ev._id, host.token)).status, 403);

  const first = await register(ev._id, user.token);
  assert.equal(first.status, 200);
  assert.equal(first.data.message, "Registration confirmed");

  const repeat = await register(ev._id, user.token);
  assert.equal(repeat.status, 200);
  assert.equal(repeat.data.alreadyRegistered, true);

  assert.equal((await register(ev._id, otherUser.token)).status, 200);

  const third = await h.registerAndLogin({
    name: "third",
    email: "third@example.com",
    password: "pw",
  });
  const full = await register(ev._id, third.token);
  assert.equal(full.status, 400);
  assert.equal(full.data, "Event is full");

  // A registered user still gets the idempotent answer once the event is full.
  assert.equal((await register(ev._id, user.token)).data.alreadyRegistered, true);

  await h.request("PUT", `/api/updateEvent/${ev._id}`, {
    token: host.token,
    body: { status: "cancelled", capacity: 10 },
  });
  const cancelled = await register(ev._id, third.token);
  assert.equal(cancelled.status, 400);
  assert.equal(cancelled.data, "Event is cancelled");
});

test("concurrent registrations never exceed capacity", async () => {
  const ev = await createEvent(host.token, { capacity: 3 });

  const attendees = await Promise.all(
    Array.from({ length: 8 }, (_, i) =>
      h.registerAndLogin({ name: `u${i}`, email: `u${i}@example.com`, password: "pw" })
    )
  );
  const results = await Promise.all(attendees.map((a) => register(ev._id, a.token)));

  const confirmed = results.filter(
    (r) => r.status === 200 && r.data.message === "Registration confirmed"
  );
  const rejected = results.filter((r) => r.status === 400 && r.data === "Event is full");
  assert.equal(confirmed.length, 3);
  assert.equal(rejected.length, 5);

  const fresh = await Event.findById(ev._id);
  assert.equal(fresh.participants.length, 3);
});

test("registrations endpoint returns only the caller's events, without attendee lists", async () => {
  const mine = await createEvent(host.token, { title: "Mine" });
  const theirs = await createEvent(host.token, { title: "Theirs" });
  await register(mine._id, user.token);
  await register(theirs._id, otherUser.token);

  const res = await h.request("GET", "/api/user/registrations", { token: user.token });
  assert.equal(res.status, 200);
  assert.deepEqual(
    res.data.map((e) => e.title),
    ["Mine"]
  );
  assert.equal(res.data[0].participants, undefined);

  assert.equal((await h.request("GET", "/api/user/registrations", { token: host.token })).status, 403);
});

test("ticket endpoint only serves registered attendees", async () => {
  const ev = await createEvent(host.token);

  assert.equal((await h.request("GET", `/api/events/${ev._id}/ticket`, { token: user.token })).status, 403);

  await register(ev._id, user.token);
  const ok = await h.request("GET", `/api/events/${ev._id}/ticket`, { token: user.token });
  assert.equal(ok.status, 200);
  assert.equal(ok.data.title, "React Meetup");
  assert.equal(ok.data.participants, undefined);

  assert.equal((await h.request("GET", `/api/events/${ev._id}/ticket`, { token: host.token })).status, 403);
  assert.equal((await h.request("GET", `/api/events/${ev._id}/ticket`)).status, 401);
});

test("hosts see attendees of their own events only", async () => {
  const ev = await createEvent(host.token);
  await createEvent(otherHost.token, { title: "Someone else's" });
  await register(ev._id, user.token);

  const res = await h.request("GET", "/api/host/events", { token: host.token });
  assert.equal(res.status, 200);
  assert.equal(res.data.length, 1);
  assert.deepEqual(res.data[0].participants, ["user@example.com"]);

  assert.equal((await h.request("GET", "/api/host/events", { token: user.token })).status, 403);
});

test("capacity must be a whole number of 1 or more; null clears it", async () => {
  for (const bad of [-1, 2.5, 0, "lots"]) {
    const res = await h.request("POST", "/api/addEvent", {
      token: host.token,
      body: sampleEvent({ capacity: bad, title: `cap ${bad}` }),
    });
    assert.equal(res.status, 400, `capacity ${bad} should be rejected`);
  }

  const ev = await createEvent(host.token, { capacity: 2 });
  const update = (capacity) =>
    h.request("PUT", `/api/updateEvent/${ev._id}`, { token: host.token, body: { capacity } });
  const seatsLeft = async () =>
    (await h.request("GET", `/api/getSingleEvent/${ev._id}`)).data.seatsLeft;

  assert.equal((await update(0)).status, 400);
  assert.equal((await update(null)).status, 200);
  assert.equal(await seatsLeft(), null);
  assert.equal((await update(5)).status, 200);
  assert.equal(await seatsLeft(), 5);
});

test("completed and past events cannot be registered for", async () => {
  const done = await createEvent(host.token, { title: "Done" });
  await h.request("PUT", `/api/updateEvent/${done._id}`, {
    token: host.token,
    body: { status: "completed" },
  });
  const completed = await register(done._id, user.token);
  assert.equal(completed.status, 400);
  assert.equal(completed.data, "Event is completed");

  const old = await createEvent(host.token, { title: "Old", date: "2020-01-01" });
  const past = await register(old._id, user.token);
  assert.equal(past.status, 400);
  assert.equal(past.data, "Event has already taken place");
});

test("a non-numeric limit is ignored rather than failing", async () => {
  await createEvent(host.token, { title: "One" });
  await createEvent(host.token, { title: "Two" });

  const all = await h.request("GET", "/api/getAllEvents?limit=abc");
  assert.equal(all.status, 200);
  assert.equal(all.data.length, 2);

  const one = await h.request("GET", "/api/getAllEvents?limit=1");
  assert.equal(one.data.length, 1);
});

test("checkout refuses seats the registration step would refuse", async () => {
  const ev = await createEvent(host.token, { priceType: "paid", price: 100, capacity: 1 });
  const checkout = (token) =>
    h.request("POST", "/api/create-checkout-session", { token, body: { eventId: ev._id } });

  await register(ev._id, user.token); // takes the only seat
  assert.equal((await checkout(user.token)).data, "Already registered");
  assert.equal((await checkout(otherUser.token)).data, "Event is full");
  assert.equal((await checkout(host.token)).status, 403);
  assert.equal((await h.request("POST", "/api/create-checkout-session", { token: user.token, body: { eventId: "nope" } })).status, 404);
});
