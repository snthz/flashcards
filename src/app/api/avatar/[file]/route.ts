import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/user";
import { isAvatarFile } from "@/lib/avatar";
import { readAvatar } from "@/lib/avatar/storage";
import { mimeTypeFor } from "@/lib/media";

export async function GET(_request: Request, { params }: { params: Promise<{ file: string }> }) {
  const user = await getCurrentUser();
  if (!user) return new NextResponse(null, { status: 401 });
  const { file } = await params;
  if (!isAvatarFile(file)) return new NextResponse(null, { status: 404 });
  const data = await readAvatar(user.id, file);
  if (!data) return new NextResponse(null, { status: 404 });
  return new NextResponse(new Uint8Array(data), {
    headers: {
      "Content-Type": mimeTypeFor(file),
      "Content-Length": String(data.byteLength),
      "Cache-Control": "private, max-age=31536000, immutable",
    },
  });
}
