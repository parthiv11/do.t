"use client";

import * as React from "react";
import type { TamboComponent } from "@tambo-ai/react";
import { z } from "zod";
import { useInfraStore } from "@/lib/infra-store";
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
  const { dropletId, dropletName } = props || {};
  const droplets = useInfraStore((s) => s.droplets);
  const setDroplets = useInfraStore((s) => s.setDroplets);
  const setSelectedDropletIds = useInfraStore((s) => s.setSelectedDropletIds);
  const selectedDropletIds = useInfraStore((s) => s.selectedDropletIds);

  const droplet = React.useMemo(() => {
    if (dropletId) return droplets.find((d) => d.id === dropletId);
    if (dropletName) return droplets.find((d) => d.name.toLowerCase() === dropletName.toLowerCase());
    return undefined;
  }, [droplets, dropletId, dropletName]);

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [deleted, setDeleted] = React.useState(false);
  const [confirmText, setConfirmText] = React.useState("");

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
      <div className="w-full max-w-md bg-[#0d1117] border border-gray-700 rounded-lg overflow-hidden text-gray-100">
        <div className="p-6 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-green-400" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Droplet Destroyed</h3>
          <p className="text-gray-400">
            The droplet has been permanently deleted.
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

  const canDelete = confirmText.toLowerCase() === droplet.name.toLowerCase();

  return (
    <div className="w-full max-w-md bg-[#0d1117] border border-red-900/50 rounded-lg overflow-hidden text-gray-100">
      <div className="px-6 py-4 border-b border-gray-700 bg-red-950/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-red-600/20 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-red-400">Destroy Droplet</h2>
            <p className="text-sm text-gray-400">This action cannot be undone</p>
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
          <p>This will permanently destroy the droplet and all associated data:</p>
          <ul className="list-disc list-inside text-gray-400 space-y-1">
            <li>All data on the droplet will be lost</li>
            <li>Any backups will be deleted</li>
            <li>The IP address will be released</li>
          </ul>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Type <span className="text-red-400 font-mono">{droplet.name}</span> to confirm
          </label>
          <input
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={droplet.name}
            className="w-full px-4 py-3 rounded-md border border-gray-600 bg-[#161b22] text-white placeholder-gray-500 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none"
          />
        </div>
      </div>

      <div className="px-6 py-4 border-t border-gray-700 flex justify-end gap-3 bg-[#161b22]">
        <button
          onClick={() => void handleDelete()}
          disabled={loading || !canDelete}
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
    "Render a confirmation dialog to destroy/delete a droplet. Shows droplet details and requires typing the name to confirm. ALWAYS render this when user wants to delete a droplet.",
  component: DropletDelete,
  propsSchema: z.object({
    dropletId: z.number().optional().describe("Droplet ID to delete"),
    dropletName: z.string().optional().describe("Droplet name to delete"),
  }),
};
