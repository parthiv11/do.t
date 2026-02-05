"use client";

import { z } from "zod";
import { useInfraStore, type DropletSummary } from "@/lib/infra-store";

type ApiResult<T> =
  | { success: true; data: T; message?: string }
  | { success: false; error: string };

type DigitalOceanDroplet = {
  id?: number;
  name?: string;
  status?: string;
  region?: { slug?: string };
  size_slug?: string;
  tags?: string[];
  created_at?: string;
  networks?: {
    v4?: Array<{ type?: string; ip_address?: string }>;
  };
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

async function apiFetch<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const res = await fetch(input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  const text = await res.text();
  const body = text ? safeJsonParse(text) : null;

  if (!res.ok) {
    const error =
      typeof body === "object" && body && "error" in body
        ? String((body as { error?: unknown }).error)
        : `Request failed (${res.status})`;
    throw new Error(error);
  }

  return body as T;
}

function safeJsonParse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

const toDropletSummary = (d: DigitalOceanDroplet): DropletSummary => {
  const networks = d.networks?.v4;
  const ipv4 = Array.isArray(networks)
    ? networks.find((n) => n?.type === "public")?.ip_address
    : undefined;

  return {
    id: Number(d?.id),
    name: String(d?.name ?? ""),
    status: String(d?.status ?? "unknown"),
    region: String(d?.region?.slug ?? ""),
    size: String(d?.size_slug ?? ""),
    ipv4: typeof ipv4 === "string" ? ipv4 : undefined,
    tags: Array.isArray(d?.tags) ? d.tags.map(String) : [],
    createdAt: typeof d?.created_at === "string" ? d.created_at : undefined,
  };
};

const listDroplets = async (): Promise<ApiResult<{ droplets: DropletSummary[] }>> => {
  try {
    const result = await apiFetch<{ droplets: unknown }>("/api/digitalocean/droplets");
    const raw = isRecord(result) ? result.droplets : undefined;
    const droplets = Array.isArray(raw)
      ? raw.map((d) => toDropletSummary(d as DigitalOceanDroplet))
      : [];

    useInfraStore.getState().setDroplets(droplets);

    return {
      success: true,
      data: { droplets },
      message: `Loaded ${droplets.length} droplet(s).`,
    };
  } catch (error) {
    console.error("Error in listDroplets:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};

const rebootDroplet = async (params: {
  id: number;
}): Promise<ApiResult<{ id: number }>> => {
  try {
    await apiFetch<unknown>(`/api/digitalocean/droplets/${params.id}/actions`, {
      method: "POST",
      body: JSON.stringify({ type: "reboot" }),
    });

    return {
      success: true,
      data: { id: params.id },
      message: `Reboot requested for droplet ${params.id}.`,
    };
  } catch (error) {
    console.error("Error in rebootDroplet:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};

const createDroplet = async (params: {
  name: string;
  region?: string;
  size?: string;
  image?: string;
  tags?: string[];
}): Promise<ApiResult<{ droplet?: DropletSummary }>> => {
  try {
    const result = await apiFetch<{ droplet: unknown }>("/api/digitalocean/droplets", {
      method: "POST",
      body: JSON.stringify(params),
    });

    const droplet = toDropletSummary(result.droplet as DigitalOceanDroplet);
    const { droplets } = useInfraStore.getState();
    useInfraStore.getState().setDroplets([droplet, ...droplets]);

    return {
      success: true,
      data: { droplet },
      message: `Created droplet ${droplet.name} (${droplet.id}).`,
    };
  } catch (error) {
    console.error("Error in createDroplet:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};

const deleteDroplet = async (params: {
  id: number;
}): Promise<ApiResult<{ id: number }>> => {
  try {
    await apiFetch<unknown>(`/api/digitalocean/droplets/${params.id}`, {
      method: "DELETE",
    });

    const { droplets } = useInfraStore.getState();
    useInfraStore
      .getState()
      .setDroplets(droplets.filter((d) => d.id !== params.id));

    return {
      success: true,
      data: { id: params.id },
      message: `Deleted droplet ${params.id}.`,
    };
  } catch (error) {
    console.error("Error in deleteDroplet:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};

export const listDropletsTool = {
  name: "listDroplets",
  description: "List DigitalOcean droplets and sync them into the infra canvas.",
  tool: listDroplets,
  toolSchema: z
    .function()
    .args()
    .returns(
      z.union([
        z.object({
          success: z.literal(true),
          data: z.object({
            droplets: z.array(
              z.object({
                id: z.number(),
                name: z.string(),
                region: z.string(),
                size: z.string(),
                status: z.string(),
                ipv4: z.string().optional(),
                tags: z.array(z.string()),
                createdAt: z.string().optional(),
              }),
            ),
          }),
          message: z.string().optional(),
        }),
        z.object({
          success: z.literal(false),
          error: z.string(),
        }),
      ]),
    ),
};

export const createDropletTool = {
  name: "createDroplet",
  description:
    "Create a new DigitalOcean droplet. Defaults: region=nyc1, size=s-1vcpu-1gb, image=ubuntu-24-04-x64.",
  tool: createDroplet,
  toolSchema: z
    .function()
    .args(
      z.object({
        name: z.string().describe("Droplet name (DNS-ish string is best)"),
        region: z
          .string()
          .optional()
          .describe("Region slug, e.g. nyc1, sfo3, fra1"),
        size: z
          .string()
          .optional()
          .describe("Size slug, e.g. s-1vcpu-1gb"),
        image: z
          .string()
          .optional()
          .describe("Image slug, e.g. ubuntu-24-04-x64"),
        tags: z.array(z.string()).optional().describe("Optional tags"),
      }),
    )
    .returns(
      z.union([
        z.object({
          success: z.literal(true),
          data: z.object({
            droplet: z
              .object({
                id: z.number(),
                name: z.string(),
                region: z.string(),
                size: z.string(),
                status: z.string(),
                ipv4: z.string().optional(),
                tags: z.array(z.string()),
                createdAt: z.string().optional(),
              })
              .optional(),
          }),
          message: z.string().optional(),
        }),
        z.object({
          success: z.literal(false),
          error: z.string(),
        }),
      ]),
    ),
};

export const deleteDropletTool = {
  name: "deleteDroplet",
  description:
    "Delete a DigitalOcean droplet by id. Always listDroplets first to confirm the id.",
  tool: deleteDroplet,
  toolSchema: z
    .function()
    .args(
      z.object({
        id: z.number().describe("Droplet id"),
      }),
    )
    .returns(
      z.union([
        z.object({
          success: z.literal(true),
          data: z.object({
            id: z.number(),
          }),
          message: z.string().optional(),
        }),
        z.object({
          success: z.literal(false),
          error: z.string(),
        }),
      ]),
    ),
};

export const rebootDropletTool = {
  name: "rebootDroplet",
  description:
    "Reboot a DigitalOcean droplet by id. This triggers a reboot action and returns immediately.",
  tool: rebootDroplet,
  toolSchema: z
    .function()
    .args(
      z.object({
        id: z.number().describe("Droplet id"),
      }),
    )
    .returns(
      z.union([
        z.object({
          success: z.literal(true),
          data: z.object({
            id: z.number(),
          }),
          message: z.string().optional(),
        }),
        z.object({
          success: z.literal(false),
          error: z.string(),
        }),
      ]),
    ),
};

export const digitalOceanTools = [
  listDropletsTool,
  createDropletTool,
  deleteDropletTool,
  rebootDropletTool,
];
