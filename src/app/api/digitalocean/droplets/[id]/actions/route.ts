import { NextResponse } from "next/server";
import { digitalOceanRequest, DigitalOceanApiError } from "@/lib/digitalocean-api";

// Helper to get token from request headers or env
function getTokenFromRequest(req: Request): string {
  const headerToken = req.headers.get("x-digitalocean-token");
  if (headerToken) return headerToken;
  
  const envToken = process.env.DIGITALOCEAN_TOKEN;
  if (envToken) return envToken;
  
  throw new Error("DigitalOcean token required. Provide it via x-digitalocean-token header or set DIGITALOCEAN_TOKEN env var.");
}

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const token = getTokenFromRequest(req);
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
      token,
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
