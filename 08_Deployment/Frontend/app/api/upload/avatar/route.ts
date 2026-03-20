import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Must be an image" }, { status: 400 });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Extract extension safely
    const ext = file.name.split(".").pop() || "png";
    const uniqueId = crypto.randomBytes(8).toString("hex");
    const fileName = `${session.user.id}-${uniqueId}.${ext}`;

    // Ensure uploads directory exists
    const uploadsDir = path.join(process.cwd(), "public", "uploads", "avatars");
    await fs.mkdir(uploadsDir, { recursive: true });

    // Write file
    const filePath = path.join(uploadsDir, fileName);
    await fs.writeFile(filePath, buffer);

    // Get the public URL path
    const fileUrl = `/uploads/avatars/${fileName}`;

    // Update User record in database
    await prisma.user.update({
      where: { id: session.user.id },
      data: { image: fileUrl },
    });

    return NextResponse.json({ success: true, url: fileUrl });
  } catch (error) {
    console.error("Avatar upload error:", error);
    return NextResponse.json({ error: "Failed to upload avatar" }, { status: 500 });
  }
}
