import { headers } from "next/headers";

export async function appOrigin() {
  const configured = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL;
  if (configured) return configured.replace(/\/+$/, "");
  if (process.env.NODE_ENV === "production") return null;
  const headerStore = await headers();
  const host = headerStore.get("host") ?? "localhost:3000";
  return `http://${host}`;
}
