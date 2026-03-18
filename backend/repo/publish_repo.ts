import { PoolClient } from "pg";
import { pool } from "../database/db";

const publishTables = [
  "teams",
  "announcements",
  "matches",
  "rules",
  "series",
  "divisions",
  "standings",
] as const;

type PublishTable = (typeof publishTables)[number];
type StatusColumn = "editing_status" | "edit_status" | null;

async function GetStatusColumn(
  client: PoolClient,
  tableName: PublishTable
): Promise<StatusColumn> {
  const { rows } = await client.query<{ column_name: string }>(
    `SELECT column_name
     FROM information_schema.columns
     WHERE table_name = $1
       AND column_name IN ('editing_status', 'edit_status')`,
    [tableName]
  );

  if (rows.some((row) => row.column_name === "editing_status")) {
    return "editing_status";
  }

  if (rows.some((row) => row.column_name === "edit_status")) {
    return "edit_status";
  }

  return null;
}

export async function DeleteAll() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    for (const tableName of publishTables) {
      const statusColumn = await GetStatusColumn(client, tableName);
      if (!statusColumn) continue;

      await client.query(
        `DELETE FROM ${tableName} WHERE ${statusColumn} = 'deleted'`
      );
    }

    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export async function PublishAll() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    for (const tableName of publishTables) {
      const statusColumn = await GetStatusColumn(client, tableName);
      if (!statusColumn) continue;

      await client.query(
        `UPDATE ${tableName}
         SET ${statusColumn} = 'published'
         WHERE ${statusColumn} = 'draft'`
      );
    }

    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
