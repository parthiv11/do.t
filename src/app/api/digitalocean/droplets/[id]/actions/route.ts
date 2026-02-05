import { NextResponse } from "next/server";
import { digitalOceanRequest, DigitalOceanApiError } from "@/lib/digitalocean-api";

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await ctx.params;
    const dropletId = Number(id);
    if (!Number.isFinite(dropletId) || dropletId <= 0) {
      return NextResponse.json({ error: "Invalid droplet id" }, { status: 400 });
    }

    const body = (await req.json().catch(() => ({}))) as { type?: unknown };
    const type = typeof body.type === "string" ? body.type : "";
    if (!type) {
      return NextResponse.json({ error: "type is required" }, { status: 400 });
    }

    const result = await digitalOceanRequest<unknown>(
      `/droplets/${dropletId}/actions`,
      {
        method: "POST",
        body: JSON.stringify({ type }),
      },
    );

    return NextResponse.json(result, { status: 202 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const status = error instanceof DigitalOceanApiError ? error.status : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
