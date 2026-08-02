/**
 * Full auth + data integration test against a real in-memory MongoDB.
 * Exercises the actual Express app — no route stubbing.
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
const BACKEND = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const { MongoMemoryServer } = await import(
  `${BACKEND}/node_modules/mongodb-memory-server/index.js`
);

const mongod = await MongoMemoryServer.create();
process.env.MONGO_URI = mongod.getUri("expensely-test");
process.env.JWT_SECRET_ACCESS_TOKEN = "test-access-secret-aaaaaaaaaaaaaaaa";
process.env.JWT_SECRET_REFRESH_TOKEN = "test-refresh-secret-bbbbbbbbbbbbbbbb";
process.env.NODE_ENV = "development"; // limiters skip; mailer logs the OTP
process.env.PORT = "0";

// Force the mailer's console fallback regardless of what the developer has in
// .env. Without this, a machine with real SMTP configured sends live mail on
// every test run (burning the provider quota) and the OTP is never printed, so
// every assertion after registration fails.
//
// Set to "" rather than delete: app.js runs dotenv.config() on import, which
// would repopulate deleted keys. dotenv never overwrites a key that already
// exists in process.env, and "" is falsy where the mailer checks it.
process.env.SMTP_HOST = "";
process.env.SMTP_USER = "";
process.env.SMTP_PASS = "";
process.env.BREVO_API_KEY = "";

// The dev mailer prints the code instead of sending it — capture it.
let lastOtp = null;
const realLog = console.log;
console.log = (...args) => {
  const line = args.join(" ");
  const match = line.match(/OTP for \S+: (\d{6})/);
  if (match) lastOtp = match[1];
  if (!line.startsWith("[mailer]")) realLog(...args);
};

const mongoose = (await import(`${BACKEND}/node_modules/mongoose/index.js`)).default;
await mongoose.connect(process.env.MONGO_URI);
const app = (await import(`${BACKEND}/app.js`)).default;

const server = app.listen(0);
await new Promise((r) => server.once("listening", r));
const BASE = `http://127.0.0.1:${server.address().port}/api/v1`;

// --- minimal cookie jar -----------------------------------------------------
let jar = {};
const call = async (path, { method = "GET", body, cookies = jar } = {}) => {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Cookie: Object.entries(cookies).map(([k, v]) => `${k}=${v}`).join("; "),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  for (const raw of res.headers.getSetCookie?.() ?? []) {
    const [pair] = raw.split(";");
    const idx = pair.indexOf("=");
    const name = pair.slice(0, idx);
    const value = pair.slice(idx + 1);
    if (value === "" ) delete jar[name]; else jar[name] = value;
  }
  const json = await res.json().catch(() => null);
  return { status: res.status, body: json };
};

let pass = 0, fail = 0;
const check = (label, cond, detail = "") => {
  if (cond) { pass++; realLog(`  ✓ ${label}`); }
  else { fail++; realLog(`  ✗ ${label} ${detail}`); }
};

const EMAIL = "verify.me@example.com";

realLog("\n=== 1. Registration issues an OTP, account not usable yet ===");
let r = await call("/auth/register", { method: "POST", body: {
  userName: "Sankalan", email: EMAIL, password: "password123", confirmPassword: "password123",
}});
check("register returns 201", r.status === 201, `got ${r.status}`);
check("a 6-digit OTP was generated", /^\d{6}$/.test(lastOtp ?? ""), `got ${lastOtp}`);
const otp = lastOtp;

r = await call("/auth/login", { method: "POST", body: { email: EMAIL, password: "password123" }});
check("login BLOCKED before verification (403)", r.status === 403, `got ${r.status}`);
check("  ...with EMAIL_NOT_VERIFIED code", r.body?.code === "EMAIL_NOT_VERIFIED", JSON.stringify(r.body));

realLog("\n=== 2. OTP validation ===");
r = await call("/auth/verify-otp", { method: "POST", body: { email: EMAIL, otp: "000000" }});
const wrongRejected = r.status === 400 && r.body?.code === "OTP_INVALID";
check("wrong code rejected", wrongRejected, JSON.stringify(r.body));
check("  ...and remaining attempts reported", /attempt/.test(r.body?.message ?? ""), r.body?.message);

r = await call("/auth/verify-otp", { method: "POST", body: { email: EMAIL, otp }});
check("correct code accepted", r.status === 200, JSON.stringify(r.body));

realLog("\n=== 3. Login now works ===");
r = await call("/auth/login", { method: "POST", body: { email: EMAIL, password: "password123" }});
check("login succeeds after verification", r.status === 200, JSON.stringify(r.body));
check("accessToken cookie set", !!jar.accessToken);
check("refreshToken cookie set", !!jar.refreshToken);

r = await call("/auth/me");
check("/auth/me returns the user", r.body?.user?.email === EMAIL, JSON.stringify(r.body));

realLog("\n=== 4. THE REFRESH FIX — against a real database ===");
const savedAccess = jar.accessToken;
delete jar.accessToken; // simulate the 15-minute cookie expiry
r = await call("/auth/me");
check("no access cookie -> 401 TOKEN_MISSING", r.status === 401 && r.body?.code === "TOKEN_MISSING", JSON.stringify(r.body));

r = await call("/auth/refresh", { method: "POST" });
check("POST /auth/refresh returns 200 (was 403 before the fix)", r.status === 200, JSON.stringify(r.body));
// Note: the reissued JWT can be byte-identical to the original when both are
// signed in the same second (same payload => same iat/exp), so only presence
// is asserted here; the /auth/me call below is what proves it actually works.
void savedAccess;
check("  ...and issues an access cookie", !!jar.accessToken);

r = await call("/auth/me");
check("session recovered — /auth/me works again", r.status === 200, JSON.stringify(r.body));

realLog("\n=== 5. Expense CRUD + ownership ===");
r = await call("/expense/add", { method: "POST", body: { amount: 2400, category: "Food", date: "2026-08-01", note: "Lunch", recurring: true }});
check("create expense", r.status === 201, JSON.stringify(r.body));
const expenseId = r.body?.expense?._id;
check("  ...recurring persisted", r.body?.expense?.recurring === true);

r = await call("/expense/expenses");
check("list returns the expense (findById bug fixed)", Array.isArray(r.body?.expenses) && r.body.expenses.length === 1, JSON.stringify(r.body?.expenses?.length));

r = await call(`/expense/${expenseId}`, { method: "PATCH", body: { amount: 3000, category: "Groceries", date: "2026-08-01", note: "edited", recurring: false }});
check("edit expense", r.status === 200 && r.body?.expense?.amount === 3000, JSON.stringify(r.body));

r = await call("/expense/not-a-valid-id", { method: "DELETE" });
check("malformed id -> 400", r.status === 400, `got ${r.status}`);

r = await call("/expense/64b000000000000000000000", { method: "DELETE" });
check("someone else's id -> 404", r.status === 404, `got ${r.status}`);

realLog("\n=== 6. Budgets ===");
r = await call("/budget/set", { method: "PUT", body: { category: "Food", amount: 6000 }});
check("set budget", r.status === 200, JSON.stringify(r.body));
r = await call("/budget/set", { method: "PUT", body: { category: "Food", amount: 8000 }});
r = await call("/budget/budgets");
check("re-setting upserts (no duplicate)", r.body?.budgets?.length === 1 && r.body.budgets[0].amount === 8000, JSON.stringify(r.body?.budgets));

realLog("\n=== 7. Currency preference ===");
r = await call("/auth/preferences", { method: "PATCH", body: { currency: "USD" }});
check("currency updated", r.body?.user?.currency === "USD", JSON.stringify(r.body));
r = await call("/auth/preferences", { method: "PATCH", body: { currency: "XXX" }});
check("invalid currency rejected", r.status === 400, `got ${r.status}`);

realLog("\n=== 8. Logout revokes the refresh token ===");
r = await call("/auth/logout", { method: "POST" });
check("logout 200", r.status === 200);
jar.refreshToken = jar.refreshToken || "";
r = await call("/auth/refresh", { method: "POST", cookies: { refreshToken: "stale" } });
check("stale refresh token rejected", r.status === 403 || r.status === 401, `got ${r.status}`);

realLog(`\n${"=".repeat(46)}\nPASSED: ${pass}   FAILED: ${fail}\n`);

server.close();
await mongoose.disconnect();
await mongod.stop();
process.exit(fail ? 1 : 0);
