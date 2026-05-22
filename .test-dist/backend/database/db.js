"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = void 0;
const pg_1 = require("pg");
const connectionString = process.env.DATABASE_URL;
if (typeof connectionString !== "string" || connectionString.trim() === "") {
    throw new Error("DATABASE_URL is missing or empty");
}
exports.pool = global._pgPool ??
    new pg_1.Pool({
        connectionString,
    });
// Log connection info once, safely, without querying on the same client
let didLog = false;
exports.pool.on("connect", () => {
    if (didLog)
        return;
    didLog = true;
    exports.pool
        .query("select current_database() as db, current_user as usr, inet_server_addr() as addr, inet_server_port() as port")
        .then((r) => console.log("PG connected:", r.rows[0]))
        .catch(() => { });
});
exports.pool.on("error", (err) => {
    console.error("PG pool error:", err);
});
if (process.env.NODE_ENV !== "production")
    global._pgPool = exports.pool;
