import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { NextResponse } from "next/server";

const uploadDir = path.join(process.cwd(), "public", "uploads", "rules");

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Missing image file" }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "File must be an image" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const extension = path.extname(file.name) || ".png";
    const fileName = `${randomUUID()}${extension}`;

    await mkdir(uploadDir, { recursive: true });
    await writeFile(path.join(uploadDir, fileName), buffer);

    return NextResponse.json(
      { src: `/uploads/rules/${fileName}`, alt: file.name.replace(path.extname(file.name), "") },
      { status: 201 }
    );
  } catch (err: unknown) {
    console.error("POST /api/rule-images failed:", err);
    return NextResponse.json(
      { error: "Failed to upload rule image" },
      { status: 500 }
    );
  }
}
