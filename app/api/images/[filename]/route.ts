import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const PICTURES_DIR = path.join(process.cwd(), "database", "pictures");

export async function GET(request: Request, { params }: { params: Promise<{ filename: string }> }) {
  const { filename } = await params;

  if (!filename) {
    return NextResponse.json({ error: "Filename is required" }, { status: 400 });
  }

  const filePath = path.join(PICTURES_DIR, filename);

  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: "Image not found" }, { status: 404 });
  }

  const fileBuffer = fs.readFileSync(filePath);

  // Determine content type
  const ext = path.extname(filename).toLowerCase();
  let contentType = "image/jpeg";
  if (ext === ".png") contentType = "image/png";
  if (ext === ".gif") contentType = "image/gif";
  if (ext === ".webp") contentType = "image/webp";
  if (ext === ".svg") contentType = "image/svg+xml";

  return new NextResponse(fileBuffer, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
