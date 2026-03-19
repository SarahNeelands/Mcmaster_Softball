import { Pool } from "pg";

declare global {
  var _pgPool: Pool | undefined;
}

const connectionString = process.env.DATABASE_URL;

if (typeof connectionString !== "string" || connectionString.trim() === "") {
  throw new Error("DATABASE_URL is missing or empty");
}

export const pool =
  global._pgPool ??
  new Pool({
    connectionString,
  });

// Log connection info once, safely, without querying on the same client
let didLog = false;
pool.on("connect", () => {
  if (didLog) return;
  didLog = true;

  pool
    .query(
      "select current_database() as db, current_user as usr, inet_server_addr() as addr, inet_server_port() as port"
    )
    .then((r) => console.log("PG connected:", r.rows[0]))
    .catch(() => {});
});

pool.on("error", (err) => {
  console.error("PG pool error:", err);
});

if (process.env.NODE_ENV !== "production") global._pgPool = pool;
