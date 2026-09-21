import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/user";
import { readMediaFile } from "@/lib/media";

export async function GET(_request: Request, { params }: { params: Promise<{ name: string }> }) {
  const user = await getCurrentUser();
  if (!user) return new NextResponse(null, { status: 401 });
  const { name } = await params;
  let decoded = name;
  try {
    decoded = decodeURIComponent(name);
  } catch {
    decoded = name;
  }
  const media = await prisma.media.findUnique({ where: { userId_name: { userId: user.id, name: decoded } } });
  if (!media) return new NextResponse(null, { status: 404 });
  const data = await readMediaFile(media.path);
  if (!data) return new NextResponse(null, { status: 404 });
  return new NextResponse(new Uint8Array(data), {
    headers: {
      "Content-Type": media.mimeType,
      "Content-Length": String(data.byteLength),
      "Cache-Control": "private, max-age=31536000, immutable",
      ETag: media.sha1 ? `"${media.sha1}"` : `"${media.id}"`,
    },
  });
}
