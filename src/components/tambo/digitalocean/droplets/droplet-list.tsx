"use client";

import * as React from "react";
import type { TamboComponent } from "@tambo-ai/react";
import { z } from "zod";
import { useInfraStore } from "@/lib/infra-store";
import {
  Server,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Power,
  RefreshCw,
  Plus,
} from "lucide-react";

type DropletListProps = {
  title?: string;
  showCreate?: boolean;
};

async function fetchDroplets() {
  const res = await fetch("/api/digitalocean/droplets", { cache: "no-store" });
  const text = await res.text();
  const body = text ? JSON.parse(text) : null;
  if (!res.ok) throw new Error(String(body?.error || `Failed (${res.status})`));
  const droplets = body?.droplets || [];
  return Array.isArray(droplets)
    ? droplets.map((d: Record<string, unknown>) => ({
        id: Number(d.id),
        name: String(d.name || ""),
        status: String(d.status || "unknown"),
        region: String(
          typeof d.region === "object" && d.region
            ? (d.region as Record<string, unknown>).slug || ""
            : ""
        ),
        size: String(d.size_slug || ""),
        ipv4:
          Array.isArray((d.networks as Record<string, unknown>)?.v4)
            ? ((d.networks as Record<string, unknown>).v4 as Array<Record<string, unknown>>).find(
                (n) => n.type === "public"
              )?.ip_address as string | undefined
            : undefined,
        tags: Array.isArray(d.tags) ? d.tags.map(String) : [],
        createdAt: typeof d.created_at === "string" ? d.created_at : undefined,
      }))
    : [];
}

function StatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase();
  if (normalized === "active") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
        <CheckCircle2 className="w-3 h-3" />
        Active
      </span>
    );
  }
  if (normalized === "new" || normalized === "starting") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400">
        <Clock className="w-3 h-3" />
        {status}
      </span>
    );
  }
  if (normalized === "off") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-500/20 text-gray-400">
        <Power className="w-3 h-3" />
        Off
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400">
      {status}
    </span>
  );
}

const DropletList: React.FC<DropletListProps> = (props) => {
  const { title = "Droplets", showCreate = true } = props || {};
  const droplets = useInfraStore((s) => s.droplets);
  const setDroplets = useInfraStore((s) => s.setDroplets);
  const lastRefreshedAt = useInfraStore((s) => s.lastRefreshedAt);

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const refresh = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchDroplets();
      setDroplets(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setLoading(false);
    }
  }, [setDroplets]);

  React.useEffect(() => {
    if (droplets.length === 0 && !loading && !error) {
      void refresh();
    }
  }, [droplets.length, loading, error, refresh]);

  return (
    <div className="w-full max-w-2xl bg-[#0d1117] border border-gray-700 rounded-lg overflow-hidden text-gray-100">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-700 bg-[#161b22] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-blue-600 flex items-center justify-center">
            <Server className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">{title}</h2>
            <p className="text-sm text-gray-400">
              {droplets.length} droplet{droplets.length !== 1 ? "s" : ""}
              {lastRefreshedAt && (
                <span className="ml-2">
                  · {new Date(lastRefreshedAt).toLocaleTimeString()}
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => void refresh()}
            disabled={loading}
            className="p-2 rounded-md hover:bg-gray-700 disabled:opacity-50 transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          {showCreate && (
            <button className="flex items-center gap-2 px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors">
              <Plus className="w-4 h-4" />
              Create
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="mx-6 mt-4 px-4 py-2 rounded-md bg-red-500/20 text-red-400 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* List */}
      <div className="divide-y divide-gray-700/50">
        {loading && droplets.length === 0 ? (
          <div className="p-8 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-gray-500 mx-auto" />
          </div>
        ) : droplets.length === 0 ? (
          <div className="p-8 text-center">
            <Server className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Droplets</h3>
            <p className="text-gray-400 text-sm">Create your first droplet to get started</p>
          </div>
        ) : (
          droplets.map((droplet) => (
            <div
              key={droplet.id}
              className="px-6 py-4 hover:bg-gray-800/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Server className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="font-medium">{droplet.name}</div>
                    <div className="text-sm text-gray-400">
                      {droplet.region} · {droplet.size}
                      {droplet.ipv4 && <span> · {droplet.ipv4}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={droplet.status} />
                  <span className="text-xs text-gray-500 font-mono">#{droplet.id}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export const dropletListComponent: TamboComponent = {
  name: "dropletList",
  description:
    "Render a list of all droplets with status badges. Shows name, region, size, IP, and status. ALWAYS render this when user asks to see/list/show their droplets.",
  component: DropletList,
  propsSchema: z.object({
    title: z.string().optional(),
    showCreate: z.boolean().optional(),
  }),
};
