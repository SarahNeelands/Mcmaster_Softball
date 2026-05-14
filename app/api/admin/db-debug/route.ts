import { NextResponse } from "next/server";
import { pool } from "@/backend/database/db";
import { isAdminRequest } from "@/lib/server/adminAuth";

export const dynamic = "force-dynamic";

function getDatabaseUrlSummary() {
  const raw = process.env.DATABASE_URL;
  if (!raw) {
    return { configured: false };
  }

  try {
    const url = new URL(raw);
    return {
      configured: true,
      protocol: url.protocol.replace(":", ""),
      host: url.hostname,
      port: url.port || null,
      database: url.pathname.replace(/^\//, "") || null,
      username: url.username || null,
    };
  } catch {
    return {
      configured: true,
      unparsable: true,
    };
  }
}

export async function GET() {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [{ rows: connectionRows }, { rows: seasonRows }] = await Promise.all([
    pool.query(
      `select
         current_database() as db,
         current_user as usr,
         inet_server_addr() as addr,
         inet_server_port() as port`
    ),
    pool.query(
      `select id, name, admin_only, score_notifications_enabled, start_date, end_date, editing_status
       from seasons
       order by start_date desc
       limit 10`
    ),
  ]);

  return NextResponse.json(
    {
      databaseUrl: getDatabaseUrlSummary(),
      connection: connectionRows[0] ?? null,
      seasons: seasonRows,
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    }
  );
}
