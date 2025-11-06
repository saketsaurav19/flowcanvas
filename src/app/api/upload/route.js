// app/api/upload/route.js
import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Generate a random unique filename
    const ext = path.extname(file.name) || ".png";
    const fileName = `${randomUUID()}${ext}`;
    const filePath = path.join(process.cwd(), "public/uploads", fileName);

    // Save the file to /public/uploads
    await writeFile(filePath, buffer);

    // Return the public URL for the uploaded file
    const fileUrl = `/uploads/${fileName}`;

    return NextResponse.json({ success: true, url: fileUrl });
  } catch (error) {
    console.error("File upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
