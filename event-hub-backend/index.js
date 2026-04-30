require("dotenv").config();
const express = require("express");
const cors = require("cors");
require("./config/db.js");

const route = require("./router/route.js");

const eventHubServer = express();

eventHubServer.use(cors());
eventHubServer.use(express.json());

eventHubServer.use(route);

eventHubServer.get("/", (req, res) => {
  res.send("Welcome to Event Hub server 🚀");
});

const PORT = process.env.PORT || 3000;

eventHubServer.listen(PORT, () => {
  console.log(`Event Hub server running on port ${PORT}`);
});
