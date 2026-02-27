import { Pool } from "pg";

declare global {
  // eslint-disable-next-line no-var
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

if (process.env.NODE_ENV !== "production") global._pgPool = pool;