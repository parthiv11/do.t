"use client";

import * as React from "react";
import type { TamboComponent } from "@tambo-ai/react";
import { z } from "zod";
import { useTheme } from "@/components/theme-provider";
import { cn } from "@/lib/utils";
import { Database, CheckCircle2, Clock, Copy, Globe, Cpu, Calendar, Tag, Trash2, Loader2, Key } from "lucide-react";

type DatabaseViewProps = {
  databaseId?: string;
  databaseName?: string;
  engine?: string;
  version?: string;
  region?: string;
  size?: string;
  status?: string;
  host?: string;
  port?: number;
  username?: string;
  createdAt?: string;
  tags?: string[];
};

function StatusBadge({ status, isDark }: { status: string; isDark: boolean }) {
  const normalized = status.toLowerCase();
  if (normalized === "online" || normalized === "active") {
    return (
      <span className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium",
        isDark ? "bg-emerald-500/20 text-emerald-400" : "bg-emerald-100 text-emerald-700"
      )}>
        <CheckCircle2 className="w-4 h-4" />
        Online
      </span>
    );
  }
  if (normalized === "creating" || normalized === "pending") {
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
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium",
      isDark ? "bg-slate-500/20 text-slate-400" : "bg-gray-200 text-gray-600"
    )}>
      {status}
    </span>
  );
}

function InfoRow({ icon: Icon, label, value, copyable, secret, isDark }: { icon: React.ElementType; label: string; value: string; copyable?: boolean; secret?: boolean; isDark: boolean }) {
  const [copied, setCopied] = React.useState(false);
  const [revealed, setRevealed] = React.useState(false);
  
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
          "text-sm font-medium font-mono",
          isDark ? "text-slate-100" : "text-gray-900"
        )}>
          {secret && !revealed ? "••••••••" : value}
        </span>
        {secret && (
          <button 
            onClick={() => setRevealed(!revealed)} 
            className={cn(
              "p-1 rounded transition-colors",
              isDark 
                ? "hover:bg-slate-700 text-slate-400 hover:text-slate-100" 
                : "hover:bg-gray-200 text-gray-500 hover:text-gray-900"
            )}
          >
            <Key className="w-3.5 h-3.5" />
          </button>
        )}
        {copyable && (
          <button 
            onClick={handleCopy} 
            className={cn(
              "p-1 rounded transition-colors",
              isDark 
                ? "hover:bg-slate-700 text-slate-400 hover:text-slate-100" 
                : "hover:bg-gray-200 text-gray-500 hover:text-gray-900"
            )}
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

const DatabaseView: React.FC<DatabaseViewProps> = (props) => {
  const {
    databaseId,
    databaseName = "my-database",
    engine = "PostgreSQL",
    version = "16",
    region = "nyc1",
    size = "db-s-1vcpu-1gb",
    status = "online",
    host,
    port = 25060,
    username = "doadmin",
    createdAt,
    tags = [],
  } = props || {};

  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const [loading, setLoading] = React.useState(false);
  const [actionFeedback, setActionFeedback] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (actionFeedback) {
      const timer = setTimeout(() => setActionFeedback(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [actionFeedback]);

  const handleRestart = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setActionFeedback("Restart initiated");
    setLoading(false);
  };

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
            <div className="w-12 h-12 rounded-lg bg-cyan-600 flex items-center justify-center">
              <Database className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">{databaseName}</h2>
              <div className="flex items-center gap-3 mt-1">
                <StatusBadge status={status} isDark={isDark} />
                <span className={cn("text-sm", isDark ? "text-slate-400" : "text-gray-500")}>{engine} {version}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {actionFeedback && (
        <div className={cn(
          "mx-6 mt-4 px-4 py-2 rounded-md text-sm flex items-center gap-2",
          isDark ? "bg-emerald-500/20 text-emerald-400" : "bg-emerald-100 text-emerald-700"
        )}>
          <CheckCircle2 className="w-4 h-4" />
          {actionFeedback}
        </div>
      )}

      {/* Details */}
      <div className="p-6">
        <h3 className={cn(
          "text-sm font-medium uppercase tracking-wider mb-3",
          isDark ? "text-slate-400" : "text-gray-500"
        )}>Connection Details</h3>
        <div className={cn(
          "rounded-lg px-4",
          isDark ? "bg-slate-800/50" : "bg-gray-50"
        )}>
          {host && <InfoRow icon={Globe} label="Host" value={host} copyable isDark={isDark} />}
          <InfoRow icon={Globe} label="Port" value={String(port)} copyable isDark={isDark} />
          <InfoRow icon={Key} label="Username" value={username} copyable isDark={isDark} />
          <InfoRow icon={Globe} label="Region" value={region} isDark={isDark} />
          <InfoRow icon={Cpu} label="Size" value={size} isDark={isDark} />
          {databaseId && <InfoRow icon={Database} label="Database ID" value={databaseId} copyable isDark={isDark} />}
          {createdAt && <InfoRow icon={Calendar} label="Created" value={new Date(createdAt).toLocaleDateString()} isDark={isDark} />}
          {tags.length > 0 && (
            <div className="flex items-center justify-between py-3">
              <div className={cn(
                "flex items-center gap-3",
                isDark ? "text-slate-400" : "text-gray-500"
              )}>
                <Tag className="w-4 h-4" />
                <span className="text-sm">Tags</span>
              </div>
              <div className="flex gap-1.5 flex-wrap justify-end">
                {tags.map((tag) => (
                  <span key={tag} className={cn(
                    "px-2 py-0.5 text-xs rounded",
                    isDark ? "bg-slate-700 text-slate-300" : "bg-gray-200 text-gray-700"
                  )}>{tag}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Connection String */}
      {host && (
        <div className="px-6 pb-6">
          <h3 className={cn(
            "text-sm font-medium uppercase tracking-wider mb-3",
            isDark ? "text-slate-400" : "text-gray-500"
          )}>Connection String</h3>
          <div className={cn(
            "rounded-lg p-4",
            isDark ? "bg-slate-800/50" : "bg-gray-50"
          )}>
            <div className="flex items-center justify-between">
              <code className={cn(
                "text-xs font-mono break-all",
                isDark ? "text-slate-400" : "text-gray-500"
              )}>
                postgresql://{username}:****@{host}:{port}/defaultdb?sslmode=require
              </code>
              <button
                onClick={() => navigator.clipboard.writeText(`postgresql://${username}:PASSWORD@${host}:${port}/defaultdb?sslmode=require`)}
                className={cn(
                  "p-2 rounded transition-colors ml-2 flex-shrink-0",
                  isDark 
                    ? "hover:bg-slate-700 text-slate-400 hover:text-slate-100" 
                    : "hover:bg-gray-200 text-gray-500 hover:text-gray-900"
                )}
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
        <button
          onClick={() => void handleRestart()}
          disabled={loading}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-md border text-sm font-medium disabled:opacity-50 transition-colors",
            isDark 
              ? "border-slate-600 hover:bg-slate-700" 
              : "border-gray-300 hover:bg-gray-200"
          )}
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          Restart
        </button>
        <button className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors",
          isDark 
            ? "bg-rose-500/20 text-rose-400 hover:bg-rose-500/30" 
            : "bg-rose-100 text-rose-700 hover:bg-rose-200"
        )}>
          <Trash2 className="w-4 h-4" />
          Destroy
        </button>
      </div>
    </div>
  );
};

export const databaseViewComponent: TamboComponent = {
  name: "databaseView",
  description: "Render a detailed view of a managed database with connection details and actions. ALWAYS render this when user asks for database details.",
  component: DatabaseView,
  propsSchema: z.object({
    databaseId: z.string().optional(),
    databaseName: z.string().optional(),
    engine: z.string().optional(),
    version: z.string().optional(),
    region: z.string().optional(),
    size: z.string().optional(),
    status: z.string().optional(),
    host: z.string().optional(),
    port: z.number().optional(),
    username: z.string().optional(),
    createdAt: z.string().optional(),
    tags: z.array(z.string()).optional(),
  }),
};
