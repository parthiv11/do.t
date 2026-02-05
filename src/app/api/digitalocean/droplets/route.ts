import { NextResponse } from "next/server";
import { digitalOceanRequest, DigitalOceanApiError } from "@/lib/digitalocean-api";

export async function GET() {
  try {
    const result = await digitalOceanRequest<{ droplets: unknown[] }>(
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
    return NextResponse.json({ error: message }, { status });
  }
}
