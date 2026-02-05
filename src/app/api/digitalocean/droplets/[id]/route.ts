import { NextResponse } from "next/server";
import { digitalOceanRequest, DigitalOceanApiError } from "@/lib/digitalocean-api";

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await ctx.params;
    const dropletId = Number(id);
    if (!Number.isFinite(dropletId) || dropletId <= 0) {
      return NextResponse.json(
        { error: "Invalid droplet id" },
        { status: 400 },
      );
    }

    await digitalOceanRequest<unknown>(`/droplets/${dropletId}`, {
      method: "DELETE",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const status =
      error instanceof DigitalOceanApiError ? error.status : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
