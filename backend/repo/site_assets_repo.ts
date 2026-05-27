import { pool } from "@/backend/database/db";

export type SiteAssetRecord = {
  asset_key: string;
  file_name: string;
  content_type: string;
  data: Buffer;
  updated_at: Date;
};

async function ensureSiteAssetsTable() {
  await pool.query(
    `CREATE TABLE IF NOT EXISTS site_assets (
      asset_key TEXT PRIMARY KEY,
      file_name TEXT NOT NULL,
      content_type TEXT NOT NULL,
      data BYTEA NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`
  );
}

export async function getSiteAsset(assetKey: string): Promise<SiteAssetRecord | null> {
  await ensureSiteAssetsTable();

  const { rows } = await pool.query<SiteAssetRecord>(
    `SELECT asset_key, file_name, content_type, data, updated_at
     FROM site_assets
     WHERE asset_key = $1`,
    [assetKey]
  );

  return rows[0] ?? null;
}

export async function upsertSiteAsset(input: {
  assetKey: string;
  fileName: string;
  contentType: string;
  data: Buffer;
}) {
  await ensureSiteAssetsTable();

  await pool.query(
    `INSERT INTO site_assets (asset_key, file_name, content_type, data)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (asset_key)
     DO UPDATE SET
       file_name = EXCLUDED.file_name,
       content_type = EXCLUDED.content_type,
       data = EXCLUDED.data,
       updated_at = NOW()`,
    [input.assetKey, input.fileName, input.contentType, input.data]
  );
}

export async function deleteSiteAsset(assetKey: string) {
  await ensureSiteAssetsTable();
  await pool.query("DELETE FROM site_assets WHERE asset_key = $1", [assetKey]);
}
