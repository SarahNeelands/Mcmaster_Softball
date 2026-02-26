import { pool } from "../database/db";


export async function DeleteAll() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    await client.query("DELETE FROM teams WHERE editing_status = 'deleted'");
    await client.query("DELETE FROM announcements WHERE editing_status = 'deleted'");
    await client.query("DELETE FROM matches WHERE editing_status = 'deleted'");
    await client.query("DELETE FROM rules WHERE editing_status = 'deleted'");
    await client.query("DELETE FROM divisions WHERE editing_status = 'deleted'");
    await client.query("DELETE FROM standings WHERE editing_status = 'deleted'");

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

    await client.query("UPDATE teams SET editing_status = 'published' WHERE editing_status = 'draft'");
    await client.query("UPDATE announcements SET editing_status = 'published' WHERE editing_status = 'draft'");
    await client.query("UPDATE matches SET editing_status = 'published' WHERE editing_status = 'draft'");
    await client.query("UPDATE rules SET editing_status = 'published' WHERE editing_status = 'draft'");
    await client.query("UPDATE divisions SET editing_status = 'published' WHERE editing_status = 'draft'");
    await client.query("UPDATE standings SET editing_status = 'published' WHERE editing_status = 'draft'");

    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}