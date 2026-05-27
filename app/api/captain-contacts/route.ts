import { rm, stat } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import {
  deleteSiteAsset,
  getSiteAsset,
  upsertSiteAsset,
} from "@/backend/repo/site_assets_repo";
import { isAdminRequest } from "@/lib/server/adminAuth";

const assetKey = "captain_contacts_pdf";
const legacyFilePath = path.join(
  process.cwd(),
  "public",
  "uploads",
  "captain-contacts",
  "captain-contacts.pdf"
);

function buildHref(updatedAt: Date | number | string) {
  const version =
    updatedAt instanceof Date ? updatedAt.getTime() : new Date(updatedAt).getTime() || Date.now();
  return `/api/captain-contacts/file?v=${version}`;
}

export async function GET() {
  const asset = await getSiteAsset(assetKey);
  if (asset) {
    return NextResponse.json(
      { available: true, href: buildHref(asset.updated_at) },
      { status: 200 }
    );
  }

  try {
    const legacyFile = await stat(legacyFilePath);
    return NextResponse.json(
      { available: true, href: buildHref(legacyFile.mtime) },
      { status: 200 }
    );
  } catch {
    return NextResponse.json({ available: false, href: null }, { status: 200 });
  }
}

export async function POST(request: Request) {
  try {
    if (!(await isAdminRequest())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Missing PDF file" }, { status: 400 });
    }

    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      return NextResponse.json({ error: "File must be a PDF" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    await upsertSiteAsset({
      assetKey,
      fileName: file.name || "captain-contacts.pdf",
      contentType: "application/pdf",
      data: buffer,
    });

    return NextResponse.json(
      { available: true, href: buildHref(Date.now()) },
      { status: 201 }
    );
  } catch (err) {
    console.error("POST /api/captain-contacts failed:", err);
    return NextResponse.json({ error: "Failed to upload captain contacts PDF" }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    if (!(await isAdminRequest())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await deleteSiteAsset(assetKey);
    await rm(legacyFilePath, { force: true });
    return NextResponse.json({ available: false, href: null }, { status: 200 });
  } catch (err) {
    console.error("DELETE /api/captain-contacts failed:", err);
    return NextResponse.json({ error: "Failed to remove captain contacts PDF" }, { status: 500 });
  }
}
