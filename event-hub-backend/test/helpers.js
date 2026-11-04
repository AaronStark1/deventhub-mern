// Shared setup: an in-memory MongoDB, the app on a random port, and a tiny
// request helper. Each test file calls startTestServer/stopTestServer itself.
const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

process.env.JWT_KEY = process.env.JWT_KEY || "test-jwt-key";
process.env.STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || "sk_test_dummy";
process.env.GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "dummy-client-id";

const app = require("../app");

let mongod;
let server;
let baseUrl;

async function startTestServer() {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
  await new Promise((resolve) => {
    server = app.listen(0, resolve);
  });
  baseUrl = `http://127.0.0.1:${server.address().port}`;
  return baseUrl;
}

async function stopTestServer() {
  await new Promise((resolve) => server.close(resolve));
  await mongoose.disconnect();
  await mongod.stop();
}

async function clearDatabase() {
  await mongoose.connection.dropDatabase();
}

async function request(method, path, { body, token } = {}) {
  const headers = {};
  if (body !== undefined) headers["content-type"] = "application/json";
  if (token) headers.authorization = `Bearer ${token}`;

  const res = await fetch(baseUrl + path, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }
  return { status: res.status, data };
}

const tokenFor = ({ email, role }) =>
  jwt.sign({ email, role }, process.env.JWT_KEY, { expiresIn: "1h" });

// Registers through the API and logs in; returns { token, user }.
async function registerAndLogin({ name, email, password, role = "user" }) {
  const reg = await request("POST", "/api/register", {
    body: { name, email, password, role },
  });
  if (reg.status !== 201) {
    throw new Error(`register failed: ${reg.status} ${reg.data}`);
  }
  const res = await request("POST", "/api/login", { body: { email, password } });
  if (res.status !== 200) {
    throw new Error(`login failed: ${res.status} ${res.data}`);
  }
  return res.data;
}

module.exports = {
  startTestServer,
  stopTestServer,
  clearDatabase,
  request,
  tokenFor,
  registerAndLogin,
};
