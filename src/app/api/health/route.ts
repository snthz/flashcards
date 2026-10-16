import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json(
    {
      status: "ok",
      revision: process.env.APP_REVISION ?? "dev",
      uptime: Math.round(process.uptime()),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
