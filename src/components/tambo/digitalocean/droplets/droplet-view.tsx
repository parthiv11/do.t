"use client";

import * as React from "react";
import type { TamboComponent } from "@tambo-ai/react";
import { useTamboStreamStatus, useTamboThreadInput } from "@tambo-ai/react";
import { z } from "zod";
import { useInfraStore } from "@/lib/infra-store";
import {
  Server,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Clock,
  RotateCcw,
  Trash2,
  Power,
  Copy,
  ExternalLink,
  Globe,
  Cpu,
  HardDrive,
  Calendar,
  Tag,
} from "lucide-react";

type DropletViewProps = {
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

function StatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase();
  if (normalized === "active") {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-green-500/20 text-green-400">
        <CheckCircle2 className="w-4 h-4" />
        Active
      </span>
    );
  }
  if (normalized === "new" || normalized === "starting") {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-yellow-500/20 text-yellow-400">
        <Clock className="w-4 h-4" />
        {status}
      </span>
    );
  }
  if (normalized === "off" || normalized === "archive") {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-gray-500/20 text-gray-400">
        <Power className="w-4 h-4" />
        {status}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-blue-500/20 text-blue-400">
      {status}
    </span>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
  copyable,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  copyable?: boolean;
}) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-700/50 last:border-0">
      <div className="flex items-center gap-3 text-gray-400">
        <Icon className="w-4 h-4" />
        <span className="text-sm">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-white">{value}</span>
        {copyable && (
          <button
            onClick={handleCopy}
            className="p-1 rounded hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
            title="Copy"
          >
            {copied ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}

const DropletView: React.FC<DropletViewProps> = (props) => {
  const { dropletId, dropletName } = props || {};
  const droplets = useInfraStore((s) => s.droplets);
  const setDroplets = useInfraStore((s) => s.setDroplets);

  const droplet = React.useMemo(() => {
    if (dropletId) return droplets.find((d) => d.id === dropletId);
    if (dropletName) return droplets.find((d) => d.name.toLowerCase() === dropletName.toLowerCase());
    return undefined;
  }, [droplets, dropletId, dropletName]);

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [actionFeedback, setActionFeedback] = React.useState<string | null>(null);
  const [deleted, setDeleted] = React.useState(false);
  const { streamStatus } = useTamboStreamStatus();
  const isStreaming = streamStatus?.isStreaming ?? false;
  const { setValue, submit: submitMessage } = useTamboThreadInput();

  React.useEffect(() => {
    if (actionFeedback) {
      const timer = setTimeout(() => setActionFeedback(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [actionFeedback]);

  const handleReboot = async () => {
    if (!droplet) return;
    if (!confirm(`Reboot droplet "${droplet.name}"?`)) return;
    setLoading(true);
    setError(null);
    try {
      await rebootDropletApi(droplet.id);
      setActionFeedback("Reboot initiated");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!droplet) return;
    if (!confirm(`Destroy droplet "${droplet.name}"? This cannot be undone.`)) return;
    setLoading(true);
    setError(null);
    try {
      await deleteDropletApi(droplet.id);
      setDroplets(droplets.filter((d) => d.id !== droplet.id));
      setDeleted(true);
      setActionFeedback("Droplet destroyed");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setLoading(false);
    }
  };

  if (deleted) {
    return (
      <div className="w-full max-w-2xl bg-[#0d1117] border border-gray-700 rounded-lg overflow-hidden text-gray-100 p-6 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-700/50 flex items-center justify-center">
          <Trash2 className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Droplet Destroyed</h3>
        <p className="text-gray-400">The droplet has been permanently deleted.</p>
      </div>
    );
  }

  if (!droplet) {
    return (
      <div className="w-full max-w-2xl bg-[#0d1117] border border-gray-700 rounded-lg overflow-hidden text-gray-100 p-8">
        <div className="flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-full bg-[#21262d] flex items-center justify-center mb-5">
            <AlertCircle className="w-10 h-10 text-[#7d8590]" />
          </div>
          <h3 className="text-xl font-semibold mb-2 text-white">
            Droplet Not Found
          </h3>
          <p className="text-[#7d8590] mb-6 max-w-md">
            {dropletId
              ? `No droplet found with ID ${dropletId}. It may have been deleted, or is still initializing.`
              : dropletName
              ? `No droplet found with name "${dropletName}". It may have been renamed, deleted, or not yet created.`
              : "No droplet specified. Please provide a droplet ID or name."}
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setValue("List all my droplets");
                void submitMessage({ streamResponse: true });
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors"
            >
              <Server className="w-4 h-4" />
              List Droplets
            </button>
            <span className="text-[#7d8590] text-sm">or</span>
            <button
              onClick={() => {
                setValue("Create a new droplet");
                void submitMessage({ streamResponse: true });
              }}
              className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
            >
              Create new
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl bg-[#0d1117] border border-gray-700 rounded-lg overflow-hidden text-gray-100">
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-700 bg-[#161b22]">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-blue-600 flex items-center justify-center">
              <Server className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">{droplet.name}</h2>
              <div className="flex items-center gap-3 mt-1">
                <StatusBadge status={droplet.status} />
                <span className="text-sm text-gray-400">#{droplet.id}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feedback */}
      {actionFeedback && (
        <div className="mx-6 mt-4 px-4 py-2 rounded-md bg-green-500/20 text-green-400 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          {actionFeedback}
        </div>
      )}

      {error && (
        <div className="mx-6 mt-4 px-4 py-2 rounded-md bg-red-500/20 text-red-400 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* Details */}
      <div className="p-6">
        <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">
          Droplet Details
        </h3>
        <div className="bg-[#161b22] rounded-lg px-4">
          {droplet.ipv4 && (
            <InfoRow icon={Globe} label="IPv4 Address" value={droplet.ipv4} copyable />
          )}
          <InfoRow icon={Globe} label="Region" value={droplet.region} />
          <InfoRow icon={Cpu} label="Size" value={droplet.size} />
          <InfoRow icon={HardDrive} label="Droplet ID" value={String(droplet.id)} copyable />
          {droplet.createdAt && (
            <InfoRow
              icon={Calendar}
              label="Created"
              value={new Date(droplet.createdAt).toLocaleDateString()}
            />
          )}
          {droplet.tags.length > 0 && (
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3 text-gray-400">
                <Tag className="w-4 h-4" />
                <span className="text-sm">Tags</span>
              </div>
              <div className="flex gap-1.5 flex-wrap justify-end">
                {droplet.tags.map((tag) => (
                  <span key={tag} className="px-2 py-0.5 text-xs rounded bg-gray-700 text-gray-300">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Access */}
      {droplet.ipv4 && (
        <div className="px-6 pb-6">
          <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">
            Quick Access
          </h3>
          <div className="bg-[#161b22] rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">SSH Connection</p>
                <code className="text-xs text-gray-400 font-mono mt-1 block">
                  ssh root@{droplet.ipv4}
                </code>
              </div>
              <button
                onClick={() => navigator.clipboard.writeText(`ssh root@${droplet.ipv4}`)}
                className="p-2 rounded hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
                title="Copy SSH command"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="px-6 py-4 border-t border-gray-700 bg-[#161b22] flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => void handleReboot()}
            disabled={loading || isStreaming}
            className="flex items-center gap-2 px-4 py-2 rounded-md border border-gray-600 hover:bg-gray-700 text-sm font-medium disabled:opacity-50 transition-colors"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
            Reboot
          </button>
          {droplet.ipv4 && (
            <a
              href={`http://${droplet.ipv4}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-md border border-gray-600 hover:bg-gray-700 text-sm font-medium transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Open
            </a>
          )}
        </div>
        <button
          onClick={() => void handleDelete()}
          disabled={loading || isStreaming}
          className="flex items-center gap-2 px-4 py-2 rounded-md bg-red-600/20 text-red-400 hover:bg-red-600/30 text-sm font-medium disabled:opacity-50 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          Destroy
        </button>
      </div>
    </div>
  );
};

export const dropletViewComponent: TamboComponent = {
  name: "dropletView",
  description:
    "Render a detailed view of a droplet with status, specs, IP, SSH command, and action buttons (reboot, destroy, open). ALWAYS render this when user asks for details about a specific droplet.",
  component: DropletView,
  propsSchema: z.object({
    dropletId: z.number().optional().describe("Droplet ID to view"),
    dropletName: z.string().optional().describe("Droplet name to view"),
  }),
};
