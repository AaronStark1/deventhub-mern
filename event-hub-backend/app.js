// The Express app, separate from the server so tests can mount it on an
// in-memory database without opening a port or touching config/db.
const express = require("express");
const cors = require("cors");
const route = require("./router/route");

const app = express();

app.use(cors());
app.use(express.json());
app.use(route);

app.get("/", (req, res) => {
  res.send("Welcome to Event Hub server 🚀");
});

module.exports = app;
