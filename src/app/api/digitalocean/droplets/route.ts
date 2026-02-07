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

export async function GET(req: Request) {
  try {
    const token = getTokenFromRequest(req);
    const result = await digitalOceanRequest<{ droplets: unknown[] }>(
      token,
      "/droplets?per_page=200",
    );
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const status =
      error instanceof DigitalOceanApiError ? error.status : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST(req: Request) {
  try {
    const token = getTokenFromRequest(req);
    const body = (await req.json().catch(() => ({}))) as {
      name?: unknown;
      region?: unknown;
      size?: unknown;
      image?: unknown;
      tags?: unknown;
    };

    const name = typeof body.name === "string" ? body.name.trim() : "";
    if (!name) {
      return NextResponse.json(
        { error: "name is required" },
        { status: 400 },
      );
    }

    const payload = {
      name,
      region: typeof body.region === "string" && body.region ? body.region : "nyc1",
      size: typeof body.size === "string" && body.size ? body.size : "s-1vcpu-1gb",
      image:
        typeof body.image === "string" && body.image
          ? body.image
          : "ubuntu-24-04-x64",
      tags: Array.isArray(body.tags) ? body.tags.map(String) : undefined,
    };

    const result = await digitalOceanRequest<{ droplet: unknown }>(
      token,
      "/droplets",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
    );

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const status =
      error instanceof DigitalOceanApiError ? error.status : 500;
    // eslint-disable-next-line no-console
    console.error("POST /api/digitalocean/droplets error:", error);
    return NextResponse.json({ error: message, details: error instanceof DigitalOceanApiError ? error.body : undefined }, { status });
  }
}
