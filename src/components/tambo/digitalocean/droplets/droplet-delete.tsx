"use client";

import * as React from "react";
import type { TamboComponent } from "@tambo-ai/react";
import { useTamboComponentState, useTamboStreamStatus } from "@tambo-ai/react";
import { z } from "zod";
import { useInfraStore } from "@/lib/infra-store";
import { useTheme } from "@/components/theme-provider";
import { cn } from "@/lib/utils";
import {
  Trash2,
  Loader2,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Server,
} from "lucide-react";

type DropletDeleteProps = {
  dropletId?: number;
  dropletName?: string;
  confirmed?: boolean;
};

async function deleteDropletApi(id: number): Promise<void> {
  const res = await fetch(`/api/digitalocean/droplets/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const text = await res.text();
    const body = text ? JSON.parse(text) : null;
    throw new Error(String(body?.error || `Failed (${res.status})`));
  }
}

const DropletDelete: React.FC<DropletDeleteProps> = (props) => {
  const { dropletId, dropletName, confirmed } = props || {};
  const droplets = useInfraStore((s) => s.droplets);
  const setDroplets = useInfraStore((s) => s.setDroplets);
  const setSelectedDropletIds = useInfraStore((s) => s.setSelectedDropletIds);
  const selectedDropletIds = useInfraStore((s) => s.selectedDropletIds);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const droplet = React.useMemo(() => {
    if (dropletId) return droplets.find((d) => d.id === dropletId);
    if (dropletName) return droplets.find((d) => d.name.toLowerCase() === dropletName.toLowerCase());
    return undefined;
  }, [droplets, dropletId, dropletName]);

  const [loading, setLoading] = useTamboComponentState("loading", false, false);
  const [error, setError] = useTamboComponentState<string | null>("error", null, null);
  const [deleted, setDeleted] = useTamboComponentState("deleted", false, false);
  const [confirmText, setConfirmText] = useTamboComponentState("confirmText", "", "");
  const { streamStatus } = useTamboStreamStatus();
  const isStreaming = streamStatus?.isStreaming ?? false;

  // MCP Elicitation: If not confirmed, show error to trigger elicitation
  if (confirmed === false) {
    return (
      <div className={cn(
        "w-full max-w-md border rounded-lg overflow-hidden",
        isDark ? "bg-[#0d1117] border-gray-700 text-gray-100" : "bg-white border-gray-200 text-gray-900"
      )}>
        <div className="p-6 text-center">
          <div className={cn(
            "w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center",
            isDark ? "bg-amber-500/20" : "bg-amber-100"
          )}>
            <AlertTriangle className={cn("w-8 h-8", isDark ? "text-amber-400" : "text-amber-600")} />
          </div>
          <h3 className="text-xl font-semibold mb-2">Confirmation Required</h3>
          <p className={cn(isDark ? "text-gray-400" : "text-gray-600")}>
            Please confirm deletion of droplet <span className="font-medium">{droplet?.name || "unknown"}</span>.
            This action cannot be undone.
          </p>
        </div>
      </div>
    );
  }

  const handleDelete = async () => {
    if (!droplet) return;
    setLoading(true);
    setError(null);
    try {
      await deleteDropletApi(droplet.id);
      setDroplets(droplets.filter((d) => d.id !== droplet.id));
      setSelectedDropletIds(selectedDropletIds.filter((id) => id !== droplet.id));
      setDeleted(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error deleting droplet");
    } finally {
      setLoading(false);
    }
  };

  if (deleted) {
    return (
      <div className={cn(
        "w-full max-w-md border rounded-lg overflow-hidden",
        isDark ? "bg-[#0d1117] border-gray-700 text-gray-100" : "bg-white border-gray-200 text-gray-900"
      )}>
        <div className="p-6 text-center">
          <div className={cn(
            "w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center",
            isDark ? "bg-emerald-500/20" : "bg-emerald-100"
          )}>
            <CheckCircle2 className={cn("w-8 h-8", isDark ? "text-emerald-400" : "text-emerald-600")} />
          </div>
          <h3 className="text-xl font-semibold mb-2">Droplet Destroyed</h3>
          <p className={cn(isDark ? "text-gray-400" : "text-gray-600")}>
            The droplet has been permanently deleted.
          </p>
        </div>
      </div>
    );
  }

  if (!droplet) {
    return (
      <div className={cn(
        "w-full max-w-md border rounded-lg overflow-hidden",
        isDark ? "bg-[#0d1117] border-gray-700 text-gray-100" : "bg-white border-gray-200 text-gray-900"
      )}>
        <div className="p-6 text-center">
          <div className={cn(
            "w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center",
            isDark ? "bg-gray-700/50" : "bg-gray-100"
          )}>
            <AlertCircle className={cn("w-8 h-8", isDark ? "text-gray-400" : "text-gray-600")} />
          </div>
          <h3 className="text-xl font-semibold mb-2">Droplet Not Found</h3>
          <p className={cn(isDark ? "text-gray-400" : "text-gray-600")}>
            {dropletId
              ? `No droplet found with ID ${dropletId}`
              : dropletName
              ? `No droplet found with name "${dropletName}"`
              : "No droplet specified"}
          </p>
        </div>
      </div>
    );
  }

  const canDelete = (confirmText ?? "").toLowerCase() === droplet.name.toLowerCase();

  return (
    <div className={cn(
      "w-full max-w-md border rounded-lg overflow-hidden",
      isDark ? "bg-[#0d1117] border-red-900/50 text-gray-100" : "bg-white border-rose-200 text-gray-900"
    )}>
      <div className={cn(
        "px-6 py-4 border-b",
        isDark ? "border-gray-700 bg-red-950/30" : "border-rose-200 bg-rose-50"
      )}>
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-10 h-10 rounded flex items-center justify-center",
            isDark ? "bg-red-600/20" : "bg-rose-100"
          )}>
            <AlertTriangle className={cn("w-5 h-5", isDark ? "text-red-400" : "text-rose-600")} />
          </div>
          <div>
            <h2 className={cn("text-lg font-semibold", isDark ? "text-red-400" : "text-rose-600")}>Destroy Droplet</h2>
            <p className={cn("text-sm", isDark ? "text-gray-400" : "text-gray-600")}>This action cannot be undone</p>
          </div>
        </div>
      </div>

      {error && (
        <div className={cn(
          "mx-6 mt-4 px-4 py-3 rounded-md text-sm flex items-center gap-2",
          isDark ? "bg-red-500/20 text-red-400" : "bg-rose-50 text-rose-600"
        )}>
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      <div className="p-6 space-y-4">
        <div className={cn(
          "flex items-center gap-3 p-4 rounded-lg",
          isDark ? "bg-[#161b22]" : "bg-gray-50"
        )}>
          <Server className={cn("w-5 h-5", isDark ? "text-gray-400" : "text-gray-500")} />
          <div>
            <div className="font-medium">{droplet.name}</div>
            <div className={cn("text-sm", isDark ? "text-gray-400" : "text-gray-500")}>
              {droplet.region} · {droplet.size} · #{droplet.id}
            </div>
          </div>
        </div>

        <div className={cn("text-sm space-y-2", isDark ? "text-gray-300" : "text-gray-700")}>
          <p>This will permanently destroy the droplet and all associated data:</p>
          <ul className={cn("list-disc list-inside space-y-1", isDark ? "text-gray-400" : "text-gray-600")}>
            <li>All data on the droplet will be lost</li>
            <li>Any backups will be deleted</li>
            <li>The IP address will be released</li>
          </ul>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Type <span className={cn("font-mono", isDark ? "text-red-400" : "text-rose-600")}>{droplet.name}</span> to confirm
          </label>
          <input
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={droplet.name}
            className={cn(
              "w-full px-4 py-3 rounded-md border outline-none focus:ring-1",
              isDark
                ? "border-gray-600 bg-[#161b22] text-white placeholder-gray-500 focus:border-red-500 focus:ring-red-500"
                : "border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:border-rose-500 focus:ring-rose-500"
            )}
          />
        </div>
      </div>

      <div className={cn(
        "px-6 py-4 border-t flex justify-end gap-3",
        isDark ? "border-gray-700 bg-[#161b22]" : "border-gray-200 bg-gray-50"
      )}>
        <button
          onClick={() => void handleDelete()}
          disabled={loading || !canDelete || isStreaming}
          className="flex items-center gap-2 px-6 py-2.5 rounded-md bg-red-600 hover:bg-red-700 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Trash2 className="w-4 h-4" />
          )}
          Destroy Droplet
        </button>
      </div>
    </div>
  );
};

export const dropletDeleteComponent: TamboComponent = {
  name: "dropletDelete",
  description:
    "Render a confirmation dialog to destroy/delete a droplet. Shows droplet details and requires typing the name to confirm. ALWAYS render this when user wants to delete a droplet. Use confirmed=true prop for MCP elicitation.",
  component: DropletDelete,
  propsSchema: z.object({
    dropletId: z.number().optional().describe("Droplet ID to delete"),
    dropletName: z.string().optional().describe("Droplet name to delete"),
    confirmed: z.boolean().optional().describe("MCP elicitation confirmation flag - set to true after user confirms"),
  }),
};
