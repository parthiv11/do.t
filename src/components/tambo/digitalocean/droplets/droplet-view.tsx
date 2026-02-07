"use client";

import * as React from "react";
import type { TamboComponent } from "@tambo-ai/react";
import { useTamboStreamStatus, useTamboThreadInput } from "@tambo-ai/react";
import { z } from "zod";
import { useInfraStore } from "@/lib/infra-store";
import { useTheme } from "@/components/theme-provider";
import { cn } from "@/lib/utils";
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

function StatusBadge({ status, isDark }: { status: string; isDark: boolean }) {
  const normalized = status.toLowerCase();
  if (normalized === "active") {
    return (
      <span className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium",
        isDark ? "bg-emerald-500/20 text-emerald-400" : "bg-emerald-100 text-emerald-700"
      )}>
        <CheckCircle2 className="w-4 h-4" />
        Active
      </span>
    );
  }
  if (normalized === "new" || normalized === "starting") {
    return (
      <span className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium",
        isDark ? "bg-amber-500/20 text-amber-400" : "bg-amber-100 text-amber-700"
      )}>
        <Clock className="w-4 h-4" />
        {status}
      </span>
    );
  }
  if (normalized === "off" || normalized === "archive") {
    return (
      <span className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium",
        isDark ? "bg-slate-500/20 text-slate-400" : "bg-gray-200 text-gray-600"
      )}>
        <Power className="w-4 h-4" />
        {status}
      </span>
    );
  }
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium",
      isDark ? "bg-blue-500/20 text-blue-400" : "bg-blue-100 text-blue-700"
    )}>
      {status}
    </span>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
  copyable,
  isDark,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  copyable?: boolean;
  isDark: boolean;
}) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn(
      "flex items-center justify-between py-3 border-b last:border-0",
      isDark ? "border-slate-700/50" : "border-gray-200"
    )}>
      <div className={cn(
        "flex items-center gap-3",
        isDark ? "text-slate-400" : "text-gray-500"
      )}>
        <Icon className="w-4 h-4" />
        <span className="text-sm">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className={cn(
          "text-sm font-medium",
          isDark ? "text-slate-100" : "text-gray-900"
        )}>{value}</span>
        {copyable && (
          <button
            onClick={handleCopy}
            className={cn(
              "p-1 rounded transition-colors",
              isDark 
                ? "hover:bg-slate-700 text-slate-400 hover:text-slate-100" 
                : "hover:bg-gray-200 text-gray-500 hover:text-gray-900"
            )}
            title="Copy"
          >
            {copied ? (
              <CheckCircle2 className={cn("w-3.5 h-3.5", isDark ? "text-emerald-400" : "text-emerald-600")} />
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
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

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
      <div className={cn(
        "w-full max-w-2xl border rounded-lg overflow-hidden p-6 text-center",
        isDark ? "bg-slate-900 border-slate-700 text-slate-100" : "bg-white border-gray-200 text-gray-900"
      )}>
        <div className={cn(
          "w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center",
          isDark ? "bg-slate-800/50" : "bg-gray-100"
        )}>
          <Trash2 className={cn("w-8 h-8", isDark ? "text-slate-400" : "text-gray-500")} />
        </div>
        <h3 className="text-xl font-semibold mb-2">Droplet Destroyed</h3>
        <p className={isDark ? "text-slate-400" : "text-gray-500"}>The droplet has been permanently deleted.</p>
      </div>
    );
  }

  if (!droplet) {
    return (
      <div className={cn(
        "w-full max-w-2xl border rounded-lg overflow-hidden p-8",
        isDark ? "bg-slate-900 border-slate-700 text-slate-100" : "bg-white border-gray-200 text-gray-900"
      )}>
        <div className="flex flex-col items-center text-center">
          <div className={cn(
            "w-20 h-20 rounded-full flex items-center justify-center mb-5",
            isDark ? "bg-slate-800" : "bg-gray-100"
          )}>
            <AlertCircle className={cn("w-10 h-10", isDark ? "text-slate-400" : "text-gray-500")} />
          </div>
          <h3 className={cn("text-xl font-semibold mb-2", isDark ? "text-slate-100" : "text-gray-900")}>
            Droplet Not Found
          </h3>
          <p className={cn("mb-6 max-w-md", isDark ? "text-slate-400" : "text-gray-500")}>
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
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                isDark ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"
              )}
            >
              <Server className="w-4 h-4" />
              List Droplets
            </button>
            <span className={isDark ? "text-slate-500" : "text-gray-400"}>or</span>
            <button
              onClick={() => {
                setValue("Create a new droplet");
                void submitMessage({ streamResponse: true });
              }}
              className={cn(
                "text-sm font-medium transition-colors",
                isDark ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-500"
              )}
            >
              Create new
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "w-full max-w-2xl border rounded-lg overflow-hidden",
      isDark ? "bg-slate-900 border-slate-700 text-slate-100" : "bg-white border-gray-200 text-gray-900"
    )}>
      {/* Header */}
      <div className={cn(
        "px-6 py-5 border-b",
        isDark ? "border-slate-700 bg-slate-800/50" : "border-gray-200 bg-gray-50"
      )}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-blue-600 flex items-center justify-center">
              <Server className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">{droplet.name}</h2>
              <div className="flex items-center gap-3 mt-1">
                <StatusBadge status={droplet.status} isDark={isDark} />
                <span className={cn("text-sm", isDark ? "text-slate-400" : "text-gray-500")}>#{droplet.id}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feedback */}
      {actionFeedback && (
        <div className={cn(
          "mx-6 mt-4 px-4 py-2 rounded-md text-sm flex items-center gap-2",
          isDark ? "bg-emerald-500/20 text-emerald-400" : "bg-emerald-100 text-emerald-700"
        )}>
          <CheckCircle2 className="w-4 h-4" />
          {actionFeedback}
        </div>
      )}

      {error && (
        <div className={cn(
          "mx-6 mt-4 px-4 py-2 rounded-md text-sm flex items-center gap-2",
          isDark ? "bg-rose-500/20 text-rose-400" : "bg-rose-100 text-rose-700"
        )}>
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* Details */}
      <div className="p-6">
        <h3 className={cn(
          "text-sm font-medium uppercase tracking-wider mb-3",
          isDark ? "text-slate-400" : "text-gray-500"
        )}>
          Droplet Details
        </h3>
        <div className={cn(
          "rounded-lg px-4",
          isDark ? "bg-slate-800/50" : "bg-gray-50"
        )}>
          {droplet.ipv4 && (
            <InfoRow icon={Globe} label="IPv4 Address" value={droplet.ipv4} copyable isDark={isDark} />
          )}
          <InfoRow icon={Globe} label="Region" value={droplet.region} isDark={isDark} />
          <InfoRow icon={Cpu} label="Size" value={droplet.size} isDark={isDark} />
          <InfoRow icon={HardDrive} label="Droplet ID" value={String(droplet.id)} copyable isDark={isDark} />
          {droplet.createdAt && (
            <InfoRow
              icon={Calendar}
              label="Created"
              value={new Date(droplet.createdAt).toLocaleDateString()}
              isDark={isDark}
            />
          )}
          {droplet.tags.length > 0 && (
            <div className="flex items-center justify-between py-3">
              <div className={cn(
                "flex items-center gap-3",
                isDark ? "text-slate-400" : "text-gray-500"
              )}>
                <Tag className="w-4 h-4" />
                <span className="text-sm">Tags</span>
              </div>
              <div className="flex gap-1.5 flex-wrap justify-end">
                {droplet.tags.map((tag) => (
                  <span key={tag} className={cn(
                    "px-2 py-0.5 text-xs rounded",
                    isDark ? "bg-slate-700 text-slate-300" : "bg-gray-200 text-gray-700"
                  )}>
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
          <h3 className={cn(
            "text-sm font-medium uppercase tracking-wider mb-3",
            isDark ? "text-slate-400" : "text-gray-500"
          )}>
            Quick Access
          </h3>
          <div className={cn(
            "rounded-lg p-4",
            isDark ? "bg-slate-800/50" : "bg-gray-50"
          )}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">SSH Connection</p>
                <code className={cn(
                  "text-xs font-mono mt-1 block",
                  isDark ? "text-slate-400" : "text-gray-500"
                )}>
                  ssh root@{droplet.ipv4}
                </code>
              </div>
              <button
                onClick={() => navigator.clipboard.writeText(`ssh root@${droplet.ipv4}`)}
                className={cn(
                  "p-2 rounded transition-colors",
                  isDark 
                    ? "hover:bg-slate-700 text-slate-400 hover:text-slate-100" 
                    : "hover:bg-gray-200 text-gray-500 hover:text-gray-900"
                )}
                title="Copy SSH command"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className={cn(
        "px-6 py-4 border-t flex items-center justify-between gap-3",
        isDark ? "border-slate-700 bg-slate-800/50" : "border-gray-200 bg-gray-50"
      )}>
        <div className="flex items-center gap-2">
          <button
            onClick={() => void handleReboot()}
            disabled={loading || isStreaming}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-md border text-sm font-medium disabled:opacity-50 transition-colors",
              isDark 
                ? "border-slate-600 hover:bg-slate-700" 
                : "border-gray-300 hover:bg-gray-200"
            )}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
            Reboot
          </button>
          {droplet.ipv4 && (
            <a
              href={`http://${droplet.ipv4}`}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-md border text-sm font-medium transition-colors",
                isDark 
                  ? "border-slate-600 hover:bg-slate-700" 
                  : "border-gray-300 hover:bg-gray-200"
              )}
            >
              <ExternalLink className="w-4 h-4" />
              Open
            </a>
          )}
        </div>
        <button
          onClick={() => void handleDelete()}
          disabled={loading || isStreaming}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50 transition-colors",
            isDark 
              ? "bg-rose-500/20 text-rose-400 hover:bg-rose-500/30" 
              : "bg-rose-100 text-rose-700 hover:bg-rose-200"
          )}
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
