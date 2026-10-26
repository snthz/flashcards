import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/user";
import { matchesImageType, sha1, UPLOAD_TYPES, writeMediaFile } from "@/lib/media";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "unauthorized" }, { status: 401 });
  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return Response.json({ error: "missing" }, { status: 400 });
  const type = UPLOAD_TYPES[file.type];
  if (!type) return Response.json({ error: "unsupported" }, { status: 415 });
  if (file.size > type.maxBytes) return Response.json({ error: "too_large" }, { status: 413 });
  const bytes = new Uint8Array(await file.arrayBuffer());
  if (type.kind === "image" && !matchesImageType(file.type, bytes)) return Response.json({ error: "unsupported" }, { status: 415 });

  const digest = sha1(bytes);
  const name = `${type.kind}-${digest.slice(0, 16)}${type.ext}`;
  const existing = await prisma.media.findUnique({ where: { userId_name: { userId: user.id, name } }, select: { sha1: true } });
  if (existing?.sha1 !== digest) {
    const path = await writeMediaFile(user.id, name, bytes);
    await prisma.media.upsert({
      where: { userId_name: { userId: user.id, name } },
      create: { userId: user.id, name, path, size: bytes.length, sha1: digest, mimeType: file.type },
      update: { path, size: bytes.length, sha1: digest, mimeType: file.type },
    });
  }
  return Response.json({ name, kind: type.kind, url: `/api/media/${encodeURIComponent(name)}` });
}
