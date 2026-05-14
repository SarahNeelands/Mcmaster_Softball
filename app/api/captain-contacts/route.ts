import { mkdir, rm, stat, writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/server/adminAuth";

const uploadDir = path.join(process.cwd(), "public", "uploads", "captain-contacts");
const fileName = "captain-contacts.pdf";
const filePath = path.join(uploadDir, fileName);
const publicHref = `/uploads/captain-contacts/${fileName}`;

export async function GET() {
  try {
    await stat(filePath);
    return NextResponse.json({ available: true, href: publicHref }, { status: 200 });
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

    await mkdir(uploadDir, { recursive: true });
    await writeFile(filePath, Buffer.from(await file.arrayBuffer()));

    return NextResponse.json({ available: true, href: publicHref }, { status: 201 });
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

    await rm(filePath, { force: true });
    return NextResponse.json({ available: false, href: null }, { status: 200 });
  } catch (err) {
    console.error("DELETE /api/captain-contacts failed:", err);
    return NextResponse.json({ error: "Failed to remove captain contacts PDF" }, { status: 500 });
  }
}
