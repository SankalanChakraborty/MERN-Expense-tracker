import app from "./app.js";
import connectDB from "./db/connectDB.js";

const REQUIRED_ENV = [
  "MONGO_URI",
  "JWT_SECRET_ACCESS_TOKEN",
  "JWT_SECRET_REFRESH_TOKEN",
];

// Fail at boot rather than at the first login attempt, so a misconfigured
// deploy is obvious in the logs instead of surfacing as a 500 to a user.
const missing = REQUIRED_ENV.filter((key) => !process.env[key]);
if (missing.length) {
  console.error(`Missing required environment variables: ${missing.join(", ")}`);
  process.exit(1);
}

if (process.env.NODE_ENV === "production") {
  // Auth cookies are set with `secure: true` in production; without HTTPS the
  // browser silently drops them and every request looks logged out.
  console.log("Running in production mode — auth cookies require HTTPS.");
}

const PORT = process.env.PORT || 8080;

// Listen FIRST, then connect. The Atlas handshake can take 10-30s on a cold
// free-tier cluster; awaiting it before listening leaves the port closed for
// that whole window, which shows up as ECONNREFUSED in the dev proxy rather
// than as a useful error. Mongoose buffers queries until the connection is
// ready, so requests arriving in the gap wait instead of failing.
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

connectDB();
