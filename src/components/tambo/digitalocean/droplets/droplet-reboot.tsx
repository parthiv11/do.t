"use client";

import * as React from "react";
import type { TamboComponent } from "@tambo-ai/react";
import { useTamboComponentState, useTamboStreamStatus } from "@tambo-ai/react";
import { z } from "zod";
import { useInfraStore } from "@/lib/infra-store";
import { useTheme } from "@/components/theme-provider";
import { cn } from "@/lib/utils";
import {
  RotateCcw,
  Loader2,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Server,
} from "lucide-react";

type DropletRebootProps = {
  dropletId?: number;
  dropletName?: string;
  confirmed?: boolean;
};

async function rebootDropletApi(id: number): Promise<void> {
  const res = await fetch(`/api/digitalocean/droplets/${id}/actions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type: "reboot" }),
  });
  if (!res.ok) {
    const text = await res.text();
    const body = text ? JSON.parse(text) : null;
    throw new Error(String(body?.error || `Failed (${res.status})`));
  }
}

const DropletReboot: React.FC<DropletRebootProps> = (props) => {
  const { dropletId, dropletName, confirmed } = props || {};
  const droplets = useInfraStore((s) => s.droplets);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const droplet = React.useMemo(() => {
    if (dropletId) return droplets.find((d) => d.id === dropletId);
    if (dropletName) return droplets.find((d) => d.name.toLowerCase() === dropletName.toLowerCase());
    return undefined;
  }, [droplets, dropletId, dropletName]);

  const [loading, setLoading] = useTamboComponentState("loading", false, false);
  const [error, setError] = useTamboComponentState<string | null>("error", null, null);
  const [rebooted, setRebooted] = useTamboComponentState("rebooted", false, false);
  const { streamStatus } = useTamboStreamStatus();
  const isStreaming = streamStatus?.isStreaming ?? false;

  // MCP Elicitation: If not confirmed, show confirmation required state
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
            Please confirm reboot of droplet <span className="font-medium">{droplet?.name || "unknown"}</span>.
            Running processes will be interrupted.
          </p>
        </div>
      </div>
    );
  }

  const handleReboot = async () => {
    if (!droplet) return;
    setLoading(true);
    setError(null);
    try {
      await rebootDropletApi(droplet.id);
      setRebooted(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error rebooting droplet");
    } finally {
      setLoading(false);
    }
  };

  if (rebooted) {
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
          <h3 className="text-xl font-semibold mb-2">Reboot Initiated</h3>
          <p className={cn(isDark ? "text-gray-400" : "text-gray-600")}>
            The droplet <span className={cn("font-medium", isDark ? "text-white" : "text-gray-900")}>{droplet?.name}</span> is rebooting.
            This may take a few moments.
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

  return (
    <div className={cn(
      "w-full max-w-md border rounded-lg overflow-hidden",
      isDark ? "bg-[#0d1117] border-amber-900/50 text-gray-100" : "bg-white border-amber-200 text-gray-900"
    )}>
      <div className={cn(
        "px-6 py-4 border-b",
        isDark ? "border-gray-700 bg-amber-950/30" : "border-amber-200 bg-amber-50"
      )}>
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-10 h-10 rounded flex items-center justify-center",
            isDark ? "bg-amber-600/20" : "bg-amber-100"
          )}>
            <RotateCcw className={cn("w-5 h-5", isDark ? "text-amber-400" : "text-amber-600")} />
          </div>
          <div>
            <h2 className={cn("text-lg font-semibold", isDark ? "text-amber-400" : "text-amber-600")}>Reboot Droplet</h2>
            <p className={cn("text-sm", isDark ? "text-gray-400" : "text-gray-600")}>Graceful restart</p>
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
          <p>This will perform a graceful reboot of the droplet:</p>
          <ul className={cn("list-disc list-inside space-y-1", isDark ? "text-gray-400" : "text-gray-600")}>
            <li>Running processes will be stopped gracefully</li>
            <li>The droplet will restart with the same configuration</li>
            <li>This typically takes 1-2 minutes</li>
          </ul>
        </div>
      </div>

      <div className={cn(
        "px-6 py-4 border-t flex justify-end gap-3",
        isDark ? "border-gray-700 bg-[#161b22]" : "border-gray-200 bg-gray-50"
      )}>
        <button
          onClick={() => void handleReboot()}
          disabled={loading || isStreaming}
          className="flex items-center gap-2 px-6 py-2.5 rounded-md bg-amber-600 hover:bg-amber-700 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <RotateCcw className="w-4 h-4" />
          )}
          Reboot Droplet
        </button>
      </div>
    </div>
  );
};

export const dropletRebootComponent: TamboComponent = {
  name: "dropletReboot",
  description:
    "Render a confirmation dialog to reboot a droplet. Shows droplet details and a reboot button. ALWAYS render this when user wants to reboot/restart a droplet. Use confirmed=true prop for MCP elicitation.",
  component: DropletReboot,
  propsSchema: z.object({
    dropletId: z.number().optional().describe("Droplet ID to reboot"),
    dropletName: z.string().optional().describe("Droplet name to reboot"),
    confirmed: z.boolean().optional().describe("MCP elicitation confirmation flag - set to true after user confirms"),
  }),
};
