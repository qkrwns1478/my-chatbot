import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import crypto from "crypto";

const PICTURES_DIR = path.join(process.cwd(), "database", "pictures");

// Ensure pictures directory exists
if (!fs.existsSync(PICTURES_DIR)) {
  fs.mkdirSync(PICTURES_DIR, { recursive: true });
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const image = formData.get("image") as File | null;

    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await image.arrayBuffer());

    // Generate a unique filename
    const ext = image.name.split(".").pop() || "jpg";
    const filename = `${crypto.randomUUID()}.${ext}`;
    const filePath = path.join(PICTURES_DIR, filename);

    fs.writeFileSync(filePath, buffer);

    return NextResponse.json({ url: `/api/images/${filename}` });
  } catch (error) {
    console.error("Failed to upload image", error);
    return NextResponse.json({ error: "Failed to upload image" }, { status: 500 });
  }
}
