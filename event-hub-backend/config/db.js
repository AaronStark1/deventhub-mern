const mongoose = require("mongoose");

async function initDB() {
  const uri = process.env.MONGODB_URI;

  if (uri) {
    try {
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 2000 });
      console.log(`MongoDB connected (${uri})`);
      return;
    } catch (err) {
      if (process.env.NODE_ENV === "production") {
        console.error("MongoDB connection error:", err);
        process.exit(1);
      }
      console.warn(
        `⚠️  Could not connect to configured MONGODB_URI (${err.message}).`
      );
    }
  }

  // Development fallback: automatically start an in-memory MongoDB
  try {
    const { MongoMemoryServer } = require("mongodb-memory-server");
    console.log("ℹ️  Starting in-memory MongoDB for local development...");
    const mongod = await MongoMemoryServer.create();
    const memoryUri = mongod.getUri();
    await mongoose.connect(memoryUri);
    console.log(`MongoDB connected (in-memory at ${memoryUri})`);

    const cleanup = async () => {
      try {
        await mongoose.disconnect();
        await mongod.stop();
      } finally {
        process.exit(0);
      }
    };

    process.once("SIGINT", cleanup);
    process.once("SIGTERM", cleanup);
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }
}

initDB();
