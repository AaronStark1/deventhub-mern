require("dotenv").config();
require("./config/db");

const app = require("./app");

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Event Hub server running on port ${PORT}`);
});
