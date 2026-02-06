"use client";

import * as React from "react";
import type { TamboComponent } from "@tambo-ai/react";
import { useTamboComponentState, useTamboStreamStatus } from "@tambo-ai/react";
import { z } from "zod";
import { useInfraStore } from "@/lib/infra-store";
import {
  RotateCcw,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Server,
} from "lucide-react";

type DropletRebootProps = {
  dropletId?: number;
  dropletName?: string;
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
  const { dropletId, dropletName } = props || {};
  const droplets = useInfraStore((s) => s.droplets);

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
      <div className="w-full max-w-md bg-[#0d1117] border border-gray-700 rounded-lg overflow-hidden text-gray-100">
        <div className="p-6 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-green-400" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Reboot Initiated</h3>
          <p className="text-gray-400">
            The droplet <span className="text-white font-medium">{droplet?.name}</span> is rebooting.
            This may take a few moments.
          </p>
        </div>
      </div>
    );
  }

  if (!droplet) {
    return (
      <div className="w-full max-w-md bg-[#0d1117] border border-gray-700 rounded-lg overflow-hidden text-gray-100">
        <div className="p-6 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-700/50 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Droplet Not Found</h3>
          <p className="text-gray-400">
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
    <div className="w-full max-w-md bg-[#0d1117] border border-gray-700 rounded-lg overflow-hidden text-gray-100">
      <div className="px-6 py-4 border-b border-gray-700 bg-[#161b22]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-yellow-600/20 flex items-center justify-center">
            <RotateCcw className="w-5 h-5 text-yellow-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Reboot Droplet</h2>
            <p className="text-sm text-gray-400">Graceful restart</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="mx-6 mt-4 px-4 py-3 rounded-md bg-red-500/20 text-red-400 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      <div className="p-6 space-y-4">
        <div className="flex items-center gap-3 p-4 bg-[#161b22] rounded-lg">
          <Server className="w-5 h-5 text-gray-400" />
          <div>
            <div className="font-medium">{droplet.name}</div>
            <div className="text-sm text-gray-400">
              {droplet.region} · {droplet.size} · #{droplet.id}
            </div>
          </div>
        </div>

        <div className="text-sm text-gray-300 space-y-2">
          <p>This will perform a graceful reboot of the droplet:</p>
          <ul className="list-disc list-inside text-gray-400 space-y-1">
            <li>Running processes will be stopped gracefully</li>
            <li>The droplet will restart with the same configuration</li>
            <li>This typically takes 1-2 minutes</li>
          </ul>
        </div>
      </div>

      <div className="px-6 py-4 border-t border-gray-700 flex justify-end gap-3 bg-[#161b22]">
        <button
          onClick={() => void handleReboot()}
          disabled={loading || isStreaming}
          className="flex items-center gap-2 px-6 py-2.5 rounded-md bg-yellow-600 hover:bg-yellow-700 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
    "Render a confirmation dialog to reboot a droplet. Shows droplet details and a reboot button. ALWAYS render this when user wants to reboot/restart a droplet.",
  component: DropletReboot,
  propsSchema: z.object({
    dropletId: z.number().optional().describe("Droplet ID to reboot"),
    dropletName: z.string().optional().describe("Droplet name to reboot"),
  }),
};
