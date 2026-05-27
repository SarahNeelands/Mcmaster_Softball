import { readFile, stat } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { getSiteAsset } from "@/backend/repo/site_assets_repo";

const assetKey = "captain_contacts_pdf";
const legacyFilePath = path.join(
  process.cwd(),
  "public",
  "uploads",
  "captain-contacts",
  "captain-contacts.pdf"
);

export async function GET() {
  const asset = await getSiteAsset(assetKey);
  if (asset) {
    return new NextResponse(asset.data, {
      status: 200,
      headers: {
        "Content-Type": asset.content_type,
        "Content-Disposition": `attachment; filename="${asset.file_name}"`,
        "Cache-Control": "no-store",
      },
    });
  }

  try {
    await stat(legacyFilePath);
    const legacyData = await readFile(legacyFilePath);
    return new NextResponse(legacyData, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="captain-contacts.pdf"',
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return NextResponse.json({ error: "Captain contacts PDF not found" }, { status: 404 });
  }
}
