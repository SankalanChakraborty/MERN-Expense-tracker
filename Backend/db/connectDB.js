import mongoose from "mongoose";

const connectDB = async () => {
  try {
    console.log("Connecting to MongoDB…");
    const started = Date.now();
    await mongoose.connect(process.env.MONGO_URI, {
      // Surface an unreachable cluster in ~10s instead of the 30s default, so a
      // wrong URI or a missing Atlas IP allowlist entry is obvious quickly.
      serverSelectionTimeoutMS: 10000,
    });
    console.log(`Connected to DB (${Date.now() - started}ms)`);
  } catch (error) {
    console.error("Error connecting to MongoDB:", error.message);
    if (error.name === "MongooseServerSelectionError") {
      console.error(
        "Hint: check MONGO_URI, and that your current IP is allowed under " +
          "Atlas > Network Access (use 0.0.0.0/0 for Render).",
      );
    }
    process.exit(1);
  }
};

export default connectDB;
