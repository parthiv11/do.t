"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  useInfraStore,
  type DropletSummary,
  type KubernetesClusterSummary,
  type DatabaseSummary,
  type DomainSummary,
  type VolumeSummary,
  type FirewallSummary,
} from "@/lib/infra-store";
import { useTheme } from "@/components/theme-provider";
import { useTambo } from "@tambo-ai/react";
import { TokenInput, useStoredToken } from "@/components/token-input";
import {
  Server,
  RefreshCw,
  Plus,
  Trash2,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  X,
  Database,
  Globe,
  HardDrive,
  Shield,
  Box,
  MoreHorizontal,
  Copy,
  Moon,
  Sun,
  Monitor,
  Bot,
  Sparkles,
  Rocket,
  Key,
  LogOut,
} from "lucide-react";

type DODashboardProps = React.HTMLAttributes<HTMLDivElement>;

type NavItem = {
  id: string;
  label: string;
  icon: React.ElementType;
  count?: number;
  description?: string;
};

async function fetchDroplets(token: string): Promise<DropletSummary[]> {
  const res = await fetch("/api/digitalocean/droplets", {
    cache: "no-store",
    headers: {
      "x-digitalocean-token": token,
    },
  });
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

const RESOURCE_INFO: Record<string, { title: string; description: string; createLabel: string; implemented: boolean; comingSoonText: string }> = {
  kubernetes: {
    title: "Kubernetes Clusters",
    description: "Managed Kubernetes clusters for container orchestration. Deploy, manage, and scale containerized applications.",
    createLabel: "Create Cluster",
    implemented: false,
    comingSoonText: "Kubernetes support is planned for a future release. You'll be able to deploy and manage containerized applications with ease.",
  },
  databases: {
    title: "Managed Databases",
    description: "Fully managed database clusters with automated backups, scaling, and high availability.",
    createLabel: "Create Database",
    implemented: false,
    comingSoonText: "Managed Databases are on our roadmap. Soon you'll be able to provision PostgreSQL, MySQL, and Redis clusters.",
  },
  domains: {
    title: "Domains",
    description: "Manage DNS records for your domains. Point your domains to DigitalOcean resources.",
    createLabel: "Add Domain",
    implemented: false,
    comingSoonText: "Domain & DNS management is coming soon. You'll be able to manage DNS records directly from the dashboard.",
  },
  volumes: {
    title: "Volumes",
    description: "Block storage volumes that can be attached to Droplets. Persistent storage for your data.",
    createLabel: "Create Volume",
    implemented: false,
    comingSoonText: "Block Storage Volumes are planned for future release. Attach persistent storage to your droplets.",
  },
  firewalls: {
    title: "Firewalls",
    description: "Cloud firewalls to secure your infrastructure. Control inbound and outbound traffic.",
    createLabel: "Create Firewall",
    implemented: false,
    comingSoonText: "Cloud Firewalls are coming in a future update. Secure your infrastructure with ease.",
  },
};

function ResourcePlaceholder({ resourceType, icon: Icon }: { resourceType: string; icon: React.ElementType }) {
  const info = RESOURCE_INFO[resourceType] || {
    title: resourceType.charAt(0).toUpperCase() + resourceType.slice(1),
    description: "Manage your resources.",
    createLabel: "Create",
    implemented: true,
    comingSoonText: "",
  };

  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  // Show Coming Soon for unimplemented features
  if (info.implemented === false) {
    return (
      <>
        <div className={cn(
          "flex items-center justify-between px-6 py-4 border-b",
          isDark ? "border-slate-800/50" : "border-gray-200"
        )}>
          <div>
            <h1 className={cn("text-xl font-semibold", isDark ? "text-slate-100" : "text-gray-900")}>{info.title}</h1>
            <p className={cn("text-sm", isDark ? "text-slate-500" : "text-gray-500")}>Coming Soon</p>
          </div>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
          <div className={cn(
            "w-20 h-20 rounded-full flex items-center justify-center mb-6",
            isDark ? "bg-indigo-500/10" : "bg-indigo-100"
          )}>
            <Rocket className={cn("w-10 h-10", isDark ? "text-indigo-400" : "text-indigo-600")} />
          </div>
          <h2 className={cn("text-xl font-semibold mb-2", isDark ? "text-slate-100" : "text-gray-900")}>{info.title} - Coming Soon</h2>
          <p className={cn("mb-4 max-w-md", isDark ? "text-slate-400" : "text-gray-600")}>{info.comingSoonText}</p>
          <div className={cn(
            "px-4 py-2 rounded-full text-sm font-medium",
            isDark ? "bg-amber-500/10 text-amber-400" : "bg-amber-100 text-amber-600"
          )}>
            Planned for Future Release
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className={cn(
        "flex items-center justify-between px-6 py-4 border-b",
        isDark ? "border-slate-800/50" : "border-gray-200"
      )}>
        <div>
          <h1 className={cn("text-xl font-semibold", isDark ? "text-slate-100" : "text-gray-900")}>{info.title}</h1>
          <p className={cn("text-sm", isDark ? "text-slate-500" : "text-gray-500")}>0 resources</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium">
          <Plus className="w-4 h-4" />
          {info.createLabel}
        </button>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
        <div className={cn(
          "w-20 h-20 rounded-full flex items-center justify-center mb-6",
          isDark ? "bg-slate-800/50" : "bg-gray-100"
        )}>
          <Icon className={cn("w-10 h-10", isDark ? "text-slate-600" : "text-gray-400")} />
        </div>
        <h2 className={cn("text-xl font-semibold mb-2", isDark ? "text-slate-100" : "text-gray-900")}>No {info.title} Yet</h2>
        <p className={cn("mb-6 max-w-md", isDark ? "text-slate-400" : "text-gray-600")}>{info.description}</p>
        <button className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium">
          <Plus className="w-4 h-4" />
          {info.createLabel}
        </button>
      </div>
    </>
  );
}

function StatusBadge({ status }: { status: string }) {
  const getStatusStyles = (s: string) => {
    switch (s.toLowerCase()) {
      case "active":
      case "running":
      case "online":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "warning":
      case "pending":
      case "provisioning":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "error":
      case "failed":
      case "offline":
        return "bg-rose-500/10 text-rose-400 border-rose-500/20";
      default:
        return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    }
  };

  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border", getStatusStyles(status))}>
      <StatusDot status={status} />
      {status}
    </span>
  );
}

function StatusDot({ status }: { status: string }) {
  const getStatusColor = (s: string) => {
    switch (s.toLowerCase()) {
      case "active":
      case "running":
      case "online":
        return "bg-emerald-500";
      case "warning":
      case "pending":
      case "provisioning":
        return "bg-amber-500";
      case "error":
      case "failed":
      case "offline":
        return "bg-rose-500";
      default:
        return "bg-slate-400";
    }
  };

  return (
    <span className="relative flex h-2 w-2">
      <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", getStatusColor(status))}></span>
      <span className={cn("relative inline-flex rounded-full h-2 w-2", getStatusColor(status))}></span>
    </span>
  );
}

function ResourceListView<T>({
  title,
  icon: Icon,
  createLabel,
  items,
  columns,
  renderRow,
}: {
  title: string;
  icon: React.ElementType;
  createLabel: string;
  items: T[];
  columns: string[];
  renderRow: (item: T) => React.ReactNode;
}) {
  if (items.length === 0) {
    return (
      <ResourcePlaceholder
        resourceType={Object.keys(RESOURCE_INFO).find((k) => RESOURCE_INFO[k].title === title) || title.toLowerCase().replace(/\s+/g, "")}
        icon={Icon}
      />
    );
  }

  return (
    <>
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#21262d]">
        <div>
          <h1 className="text-xl font-semibold">{title}</h1>
          <p className="text-sm text-[#7d8590]">
            {items.length} resource{items.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium">
          <Plus className="w-4 h-4" />
          {createLabel}
        </button>
      </div>
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#30363d] text-left text-sm text-[#7d8590]">
                {columns.map((col) => (
                  <th key={col} className="py-3 px-4 font-medium">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((item) => renderRow(item))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function DropletRow({
  droplet,
  selected,
  onSelect,
  onReboot,
  onDelete,
  loading,
}: {
  droplet: DropletSummary;
  selected: boolean;
  onSelect: () => void;
  onReboot: () => void;
  onDelete: () => void;
  loading: boolean;
}) {
  const [showMenu, setShowMenu] = React.useState(false);
  const menuRef = React.useRef<HTMLTableCellElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    if (showMenu) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showMenu]);

  return (
    <tr className="group border-b border-slate-800/50 hover:bg-slate-800/30 transition-all duration-200">
      <td className="py-4 px-4">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={selected}
            onChange={onSelect}
            className="w-4 h-4 rounded border-slate-600 bg-slate-800/50 checked:bg-indigo-500 checked:border-indigo-500 transition-colors"
          />
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-500/20">
            <Server className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <div className="font-medium text-slate-200">{droplet.name}</div>
            <div className="text-xs text-slate-500">{droplet.ipv4 || "No public IP"}</div>
          </div>
        </div>
      </td>
      <td className="py-4 px-4">
        <div className="flex items-center gap-2">
          <Globe className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-sm text-slate-400">{droplet.region.toUpperCase()}</span>
        </div>
      </td>
      <td className="py-4 px-4">
        <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-800/50 border border-slate-700/50 text-xs text-slate-400">
          {droplet.size}
        </span>
      </td>
      <td className="py-4 px-4">
        <div className="flex flex-wrap gap-1.5">
          {droplet.tags.length > 0 ? (
            droplet.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-800/50 border border-slate-700/30 text-[10px] text-slate-400"
              >
                {tag}
              </span>
            ))
          ) : (
            <span className="text-xs text-slate-600">—</span>
          )}
          {droplet.tags.length > 3 && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-800/50 border border-slate-700/30 text-[10px] text-slate-500">
              +{droplet.tags.length - 3}
            </span>
          )}
        </div>
      </td>
      <td className="py-4 px-4">
        <StatusBadge status={droplet.status} />
      </td>
      <td className="py-4 px-4">
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            disabled={loading}
            className="p-2 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-slate-200 transition-colors disabled:opacity-50"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl shadow-black/50 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              {droplet.ipv4 && (
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(droplet.ipv4!);
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800/50 transition-colors"
                >
                  <Copy className="w-4 h-4 text-slate-500" />
                  Copy IP
                </button>
              )}
              <button
                onClick={() => { setShowMenu(false); onReboot(); }}
                disabled={loading}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-amber-400 hover:bg-amber-500/10 transition-colors disabled:opacity-50"
              >
                <RotateCcw className="w-4 h-4" />
                Reboot
              </button>
              <div className="h-px bg-slate-800" />
              <button
                onClick={() => { setShowMenu(false); onDelete(); }}
                disabled={loading}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-rose-400 hover:bg-rose-500/10 transition-colors disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                Destroy
              </button>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
}

function CreateDropletModal({
  open,
  onClose,
  onCreate,
  loading,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (params: { name: string; region: string; size: string; image: string; tags: string[] }) => void;
  loading: boolean;
}) {
  const [form, setForm] = React.useState({
    name: "",
    region: "nyc1",
    size: "s-1vcpu-1gb",
    image: "ubuntu-24-04-x64",
    tags: "",
  });

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl shadow-black/50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-500/20">
              <Plus className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-100">Create Droplet</h2>
              <p className="text-sm text-slate-500">Configure your new virtual machine</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-800/50 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g., web-server-01"
              className="w-full px-3 py-2.5 rounded-lg bg-slate-800/50 border border-slate-700/50 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Region</label>
              <select
                value={form.region}
                onChange={(e) => setForm((f) => ({ ...f, region: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-lg bg-slate-800/50 border border-slate-700/50 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all appearance-none cursor-pointer"
              >
                <option value="nyc1">New York (NYC1)</option>
                <option value="nyc3">New York (NYC3)</option>
                <option value="sfo3">San Francisco (SFO3)</option>
                <option value="ams3">Amsterdam (AMS3)</option>
                <option value="sgp1">Singapore (SGP1)</option>
                <option value="lon1">London (LON1)</option>
                <option value="fra1">Frankfurt (FRA1)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Size</label>
              <select
                value={form.size}
                onChange={(e) => setForm((f) => ({ ...f, size: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-lg bg-slate-800/50 border border-slate-700/50 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all appearance-none cursor-pointer"
              >
                <option value="s-1vcpu-1gb">1 vCPU / 1 GB</option>
                <option value="s-1vcpu-2gb">1 vCPU / 2 GB</option>
                <option value="s-2vcpu-2gb">2 vCPU / 2 GB</option>
                <option value="s-2vcpu-4gb">2 vCPU / 4 GB</option>
                <option value="s-4vcpu-8gb">4 vCPU / 8 GB</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Image</label>
            <select
              value={form.image}
              onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-lg bg-slate-800/50 border border-slate-700/50 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all appearance-none cursor-pointer"
            >
              <option value="ubuntu-24-04-x64">Ubuntu 24.04 LTS</option>
              <option value="ubuntu-22-04-x64">Ubuntu 22.04 LTS</option>
              <option value="debian-12-x64">Debian 12</option>
              <option value="centos-stream-9-x64">CentOS Stream 9</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Tags <span className="text-slate-500 font-normal">(comma-separated)</span>
            </label>
            <input
              type="text"
              value={form.tags}
              onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
              placeholder="e.g., production, web, api"
              className="w-full px-3 py-2.5 rounded-lg bg-slate-800/50 border border-slate-700/50 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
            />
          </div>
        </div>
        
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-800 bg-slate-900/50">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (!form.name.trim()) return;
              onCreate({
                name: form.name.trim(),
                region: form.region,
                size: form.size,
                image: form.image,
                tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
              });
            }}
            disabled={!form.name.trim() || loading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-400 hover:to-violet-400 text-white text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/25"
          >
            {loading && <RefreshCw className="w-4 h-4 animate-spin" />}
            Create Droplet
          </button>
        </div>
      </div>
    </div>
  );
}

function AIActionModal({
  open,
  onClose,
  type,
  data,
}: {
  open: boolean;
  onClose: () => void;
  type: "create" | "reboot" | "delete" | "bulk-delete" | null;
  data: unknown;
}) {
  if (!open || !type) return null;

  const getTitle = () => {
    switch (type) {
      case "create":
        return "Creating Droplet via AI";
      case "reboot":
        return "Rebooting Droplet via AI";
      case "delete":
        return "Destroying Droplet via AI";
      case "bulk-delete":
        return "Bulk Destroy via AI";
      default:
        return "AI Action";
    }
  };

  const getDescription = () => {
    switch (type) {
      case "create": {
        const d = data as { name: string; region: string; size: string; image: string };
        return `Requesting AI to create droplet "${d?.name}" in ${d?.region}...`;
      }
      case "reboot": {
        const d = data as { name: string; id: number };
        return `Requesting AI to reboot "${d?.name}" (ID: ${d?.id})...`;
      }
      case "delete": {
        const d = data as { name: string; id: number };
        return `Requesting AI to destroy "${d?.name}" (ID: ${d?.id})...`;
      }
      case "bulk-delete": {
        const d = data as { names: string; ids: number[] };
        return `Requesting AI to destroy ${d?.ids?.length} droplet(s)...`;
      }
      default:
        return "Processing AI request...";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-[#0d1117] border border-[#30363d] rounded-xl shadow-2xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#30363d]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
              <Bot className="w-4 h-4 text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-[#e6edf3]">{getTitle()}</h3>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-[#30363d] rounded-lg text-[#7d8590]">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center animate-pulse">
              <RefreshCw className="w-6 h-6 text-blue-400 animate-spin" />
            </div>
            <div>
              <p className="text-[#e6edf3] font-medium">{getDescription()}</p>
              <p className="text-sm text-[#7d8590] mt-1">
                The AI is handling this action via MCP. Check the chat for updates.
              </p>
            </div>
          </div>
          <div className="bg-[#161b22] rounded-lg p-4 border border-[#30363d]">
            <p className="text-xs text-[#7d8590] uppercase tracking-wide mb-2">Action Details</p>
            <pre className="text-xs text-[#e6edf3] overflow-auto max-h-32 whitespace-pre-wrap">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        </div>
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-[#30363d] bg-[#161b22] rounded-b-xl">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

const DODashboard: React.FC<DODashboardProps> = ({ className, ...props }) => {
  const droplets = useInfraStore((s) => s.droplets);
  const setDroplets = useInfraStore((s) => s.setDroplets);
  const selectedDropletIds = useInfraStore((s) => s.selectedDropletIds);
  const setSelectedDropletIds = useInfraStore((s) => s.setSelectedDropletIds);

  const [activeNav, setActiveNav] = React.useState("droplets");
  const [loading, setLoading] = React.useState(false);
  const [initialLoad, setInitialLoad] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [showCreate, setShowCreate] = React.useState(false);
  const [actionFeedback, setActionFeedback] = React.useState<string | null>(null);
  const [aiModalOpen, setAiModalOpen] = React.useState(false);
  const [aiModalType, setAiModalType] = React.useState<"create" | "reboot" | "delete" | "bulk-delete" | null>(null);
  const [aiModalData, setAiModalData] = React.useState<unknown>(null);
  const [showTokenInput, setShowTokenInput] = React.useState(false);

  const { token, setToken, clearToken, isReady } = useStoredToken();
  const { sendThreadMessage } = useTambo();

  const selectedSet = React.useMemo(() => new Set(selectedDropletIds), [selectedDropletIds]);

  const { theme, setTheme, resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const kubernetes = useInfraStore((s) => s.kubernetes);
  const databases = useInfraStore((s) => s.databases);
  const domains = useInfraStore((s) => s.domains);
  const volumes = useInfraStore((s) => s.volumes);
  const firewalls = useInfraStore((s) => s.firewalls);

  const navItems: NavItem[] = [
    { id: "droplets", label: "Droplets", icon: Server, count: droplets.length },
    { id: "kubernetes", label: "Kubernetes", icon: Box, count: kubernetes.length },
    { id: "databases", label: "Databases", icon: Database, count: databases.length },
    { id: "domains", label: "Domains", icon: Globe, count: domains.length },
    { id: "volumes", label: "Volumes", icon: HardDrive, count: volumes.length },
    { id: "firewalls", label: "Firewalls", icon: Shield, count: firewalls.length },
  ];

  const refresh = React.useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchDroplets(token);
      setDroplets(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error fetching droplets");
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  }, [setDroplets, token]);

  React.useEffect(() => {
    if (initialLoad && token) {
      void refresh();
    }
  }, [initialLoad, refresh, token]);

  // Show token input when no token is stored
  React.useEffect(() => {
    if (isReady && !token) {
      setShowTokenInput(true);
    }
  }, [isReady, token]);

  React.useEffect(() => {
    if (actionFeedback) {
      const timer = setTimeout(() => setActionFeedback(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [actionFeedback]);

  // Warn users when navigating away from the dashboard
  React.useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Only warn if there are pending operations (loading state or selected droplets)
      if (loading || selectedSet.size > 0) {
        e.preventDefault();
        e.returnValue = "You have pending operations. Are you sure you want to leave?";
        return e.returnValue;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [loading, selectedSet.size]);

  const toggleSelect = (id: number) => {
    const next = new Set(selectedSet);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedDropletIds(Array.from(next));
  };

  const selectAll = () => {
    if (selectedSet.size === droplets.length) {
      setSelectedDropletIds([]);
    } else {
      setSelectedDropletIds(droplets.map((d) => d.id));
    }
  };

  const handleCreate = async (params: { name: string; region: string; size: string; image: string; tags: string[] }) => {
    setAiModalType("create");
    setAiModalData(params);
    setAiModalOpen(true);
    setShowCreate(false);
    
    // Trigger actual MCP tool call via Tambo client
    try {
      await sendThreadMessage(
        `Creating droplet "${params.name}" via MCP tool call...`,
        { streamResponse: true }
      );
      setActionFeedback(`Triggered tool call to create "${params.name}"`);
    } catch {
      setActionFeedback(`Failed to trigger creation`);
    }
  };

  const handleReboot = async (id: number) => {
    const droplet = droplets.find((d) => d.id === id);
    if (!droplet) return;
    setAiModalType("reboot");
    setAiModalData({ id, name: droplet.name });
    setAiModalOpen(true);
    
    // Trigger rebootDroplet tool - AI will handle elicitation for confirmation
    try {
      await sendThreadMessage(
        `Reboot droplet "${droplet.name}" (ID: ${id}). This will interrupt running processes. Please call rebootDroplet and request my confirmation before proceeding.`,
        { streamResponse: true }
      );
      setActionFeedback(`Requested reboot of "${droplet.name}" - awaiting confirmation`);
    } catch {
      setActionFeedback(`Failed to request reboot`);
    }
  };

  const handleDelete = async (id: number) => {
    const droplet = droplets.find((d) => d.id === id);
    if (!droplet) return;
    setAiModalType("delete");
    setAiModalData({ id, name: droplet.name });
    setAiModalOpen(true);
    
    // Trigger deleteDroplet tool - AI will handle elicitation for confirmation
    try {
      await sendThreadMessage(
        `Delete droplet "${droplet.name}" (ID: ${id}). This action cannot be undone. Please call deleteDroplet and request my confirmation before proceeding.`,
        { streamResponse: true }
      );
      setActionFeedback(`Requested deletion of "${droplet.name}" - awaiting confirmation`);
    } catch {
      setActionFeedback(`Failed to request deletion`);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedSet.size === 0) return;
    const selectedDroplets = droplets.filter((d) => selectedSet.has(d.id));
    const names = selectedDroplets.map((d) => d.name).join(", ");
    setAiModalType("bulk-delete");
    setAiModalData({ ids: Array.from(selectedSet), names });
    setAiModalOpen(true);
    
    // Trigger deleteDroplet tool for each - AI will handle elicitation
    try {
      await sendThreadMessage(
        `Delete ${selectedSet.size} droplets: ${names}. This action cannot be undone. Please call deleteDroplet for each and request my confirmation before destroying each one.`,
        { streamResponse: true }
      );
      setActionFeedback(`Requested deletion of ${selectedSet.size} droplets - awaiting confirmation`);
    } catch {
      setActionFeedback(`Failed to request bulk deletion`);
    }
  };

  return (
    <div className={cn(
      "w-full h-full flex",
      isDark ? "bg-slate-950 text-slate-200" : "bg-gray-50 text-gray-900",
      className
    )} {...props}>
      {/* Sidebar */}
      <div className={cn(
        "w-64 flex-shrink-0 border-r flex flex-col",
        isDark ? "border-slate-800/50 bg-slate-900/50" : "border-gray-200 bg-white"
      )}>
        {/* Branding */}
        <div className={cn("p-5 border-b", isDark ? "border-slate-800/50" : "border-gray-200")}>
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 flex-shrink-0">
              <img
                src={theme === "light" ? "/light-theme-logo.png" : "/dark-theme-logo.png"}
                alt="DO.T"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <span className={cn(
                "text-lg font-bold bg-gradient-to-r bg-clip-text text-transparent",
                isDark ? "from-slate-100 to-slate-400" : "from-gray-900 to-gray-600"
              )}>DO.T</span>
              <p className={cn("text-[10px] font-medium", isDark ? "text-slate-500" : "text-gray-500")}>Chat-first DigitalOcean</p>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 py-3 px-3">
          <div className={cn("text-xs font-semibold uppercase tracking-wider px-3 mb-2", isDark ? "text-slate-500" : "text-gray-500")}>Infrastructure</div>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveNav(item.id)}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2.5 text-sm rounded-lg transition-all duration-200",
                activeNav === item.id
                  ? isDark
                    ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                    : "bg-indigo-50 text-indigo-600 border border-indigo-200"
                  : isDark
                    ? "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "p-1.5 rounded-md transition-colors",
                  activeNav === item.id
                    ? isDark ? "bg-indigo-500/20" : "bg-indigo-100"
                    : isDark ? "bg-slate-800/50" : "bg-gray-100"
                )}>
                  <item.icon className="w-4 h-4" />
                </div>
                {item.label}
              </div>
              {item.count !== undefined && item.count > 0 && (
                <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", isDark ? "bg-slate-800 text-slate-400" : "bg-gray-100 text-gray-600")}>
                  {item.count}
                </span>
              )}
            </button>
          ))}
        </nav>
        
        {/* Theme Toggle */}
        <div className={cn("p-4 border-t", isDark ? "border-slate-800/50" : "border-gray-200")}>
          <div className="flex items-center justify-between mb-3">
            <span className={cn("text-xs font-medium", isDark ? "text-slate-500" : "text-gray-500")}>Theme</span>
            <div className={cn("flex gap-1 p-1 rounded-lg", isDark ? "bg-slate-800/50" : "bg-gray-100")}>
              <button
                onClick={() => setTheme("light")}
                className={cn(
                  "p-1.5 rounded-md transition-all",
                  theme === "light" ? "bg-white text-amber-500 shadow-sm" : isDark ? "text-slate-500 hover:text-slate-300" : "text-gray-500 hover:text-gray-700"
                )}
                title="Light"
              >
                <Sun className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setTheme("dark")}
                className={cn(
                  "p-1.5 rounded-md transition-all",
                  theme === "dark" ? "bg-slate-700 text-indigo-400 shadow-sm" : isDark ? "text-slate-500 hover:text-slate-300" : "text-gray-500 hover:text-gray-700"
                )}
                title="Dark"
              >
                <Moon className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setTheme("system")}
                className={cn(
                  "p-1.5 rounded-md transition-all",
                  theme === "system" ? (isDark ? "bg-slate-700 text-slate-300" : "bg-gray-200 text-gray-700") + " shadow-sm" : isDark ? "text-slate-500 hover:text-slate-300" : "text-gray-500 hover:text-gray-700"
                )}
                title="System"
              >
                <Monitor className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          
          {/* Powered by */}
          <div className={cn("flex items-center justify-center gap-2 pt-3 border-t", isDark ? "border-slate-800/50" : "border-gray-200")}>
            <Sparkles className="w-3 h-3 text-indigo-500" />
            <span className={cn("text-[10px] font-medium", isDark ? "text-slate-500" : "text-gray-500")}>Powered by AI</span>
          </div>

          {/* Token Management */}
          {token && (
            <div className={cn("mt-3 pt-3 border-t", isDark ? "border-slate-800/50" : "border-gray-200")}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Key className={cn("w-3.5 h-3.5", isDark ? "text-emerald-400" : "text-emerald-600")} />
                  <span className={cn("text-xs font-medium", isDark ? "text-slate-400" : "text-gray-500")}>Token Active</span>
                </div>
                <button
                  onClick={() => {
                    clearToken();
                    setDroplets([]);
                  }}
                  className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors",
                    isDark 
                      ? "text-rose-400 hover:bg-rose-500/10" 
                      : "text-rose-600 hover:bg-rose-50"
                  )}
                  title="Clear token and logout"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Clear
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className={cn("flex-1 flex flex-col min-w-0", isDark ? "bg-slate-950" : "bg-gray-50")}>
        {/* Token Input Modal */}
        {showTokenInput && (
          <TokenInput
            onTokenSubmit={(newToken) => {
              setToken(newToken);
              setShowTokenInput(false);
              setInitialLoad(true);
            }}
            onClose={token ? () => setShowTokenInput(false) : undefined}
          />
        )}
        
        {activeNav === "droplets" ? (
          <>
            {/* Header */}
            <div className={cn("flex items-center justify-between px-8 py-5 border-b backdrop-blur-sm", isDark ? "border-slate-800/50 bg-slate-900/30" : "border-gray-200 bg-white/50")}>
              <div>
                <h1 className={cn("text-2xl font-bold", isDark ? "text-slate-100" : "text-gray-900")}>Droplets</h1>
                <p className={cn("text-sm mt-0.5", isDark ? "text-slate-500" : "text-gray-500")}>
                  {droplets.length} virtual machine{droplets.length !== 1 ? "s" : ""} running
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => void refresh()}
                  disabled={loading}
                  className={cn("p-2.5 rounded-xl transition-all disabled:opacity-50", isDark ? "hover:bg-slate-800/50 text-slate-400 hover:text-slate-200" : "hover:bg-gray-100 text-gray-500 hover:text-gray-700")}
                  title="Refresh"
                >
                  <RefreshCw className={cn("w-5 h-5", loading && "animate-spin")} />
                </button>
                <button
                  onClick={() => setShowCreate(true)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-400 hover:to-violet-400 text-white text-sm font-semibold transition-all shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40"
                >
                  <Plus className="w-4 h-4" />
                  Create Droplet
                </button>
              </div>
            </div>

            {/* Feedback */}
            {actionFeedback && (
              <div className={cn("mx-8 mt-5 px-4 py-3 rounded-xl text-sm flex items-center gap-2 animate-in slide-in-from-top-2 duration-200", isDark ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400" : "bg-emerald-50 border border-emerald-200 text-emerald-600")}>
                <CheckCircle2 className="w-4 h-4" />
                {actionFeedback}
              </div>
            )}

            {error && (
              <div className={cn("mx-8 mt-5 px-4 py-3 rounded-xl text-sm flex items-center gap-2 animate-in slide-in-from-top-2 duration-200", isDark ? "bg-rose-500/10 border border-rose-500/20 text-rose-400" : "bg-rose-50 border border-rose-200 text-rose-600")}>
                <AlertCircle className="w-4 h-4" />
                {error}
                <button onClick={() => setError(null)} className={cn("ml-auto transition-colors", isDark ? "hover:text-rose-300" : "hover:text-rose-500")}>
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Bulk actions */}
            {selectedSet.size > 0 && (
              <div className={cn("mx-8 mt-5 px-4 py-3 rounded-xl flex items-center justify-between animate-in slide-in-from-top-2 duration-200", isDark ? "bg-slate-900/50 border border-slate-800" : "bg-white border border-gray-200")}>
                <span className={cn("text-sm", isDark ? "text-slate-400" : "text-gray-500")}>
                  <span className={cn("font-medium", isDark ? "text-slate-200" : "text-gray-900")}>{selectedSet.size}</span> droplets selected
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleBulkDelete}
                    disabled={loading}
                    className={cn("flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-colors disabled:opacity-50 font-medium", isDark ? "text-rose-400 hover:bg-rose-500/10" : "text-rose-600 hover:bg-rose-50")}
                  >
                    <Trash2 className="w-4 h-4" />
                    Destroy
                  </button>
                </div>
              </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-auto p-8">
              {initialLoad && loading ? (
                <div className={cn("flex flex-col items-center justify-center h-full", isDark ? "text-slate-500" : "text-gray-500")}>
                  <div className="relative">
                    <div className={cn("w-12 h-12 rounded-full border-2 animate-spin", isDark ? "border-slate-700 border-t-indigo-500" : "border-gray-300 border-t-indigo-500")} />
                  </div>
                  <p className="mt-4 text-sm font-medium">Loading droplets...</p>
                </div>
              ) : droplets.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center px-6">
                  <div className={cn("w-24 h-24 rounded-2xl flex items-center justify-center mb-6 border p-4", isDark ? "bg-gradient-to-br from-slate-800 to-slate-900 border-slate-800/50" : "bg-gradient-to-br from-gray-100 to-gray-200 border-gray-200")}>
                    <img
                      src={theme === "light" ? "/light-theme-logo.png" : "/dark-theme-logo.png"}
                      alt="DO.T"
                      className="w-full h-full object-contain opacity-80"
                    />
                  </div>
                  <h2 className={cn("text-2xl font-bold mb-2", isDark ? "text-slate-200" : "text-gray-900")}>No Droplets Yet</h2>
                  <p className={cn("mb-8 max-w-md text-sm leading-relaxed", isDark ? "text-slate-500" : "text-gray-500")}>
                    Droplets are virtual machines that run on DigitalOcean&apos;s infrastructure. Create your first droplet to get started.
                  </p>
                  <button
                    onClick={() => setShowCreate(true)}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-400 hover:to-violet-400 text-white font-semibold transition-all shadow-lg shadow-indigo-500/25"
                  >
                    <Plus className="w-5 h-5" />
                    Create Droplet
                  </button>
                </div>
              ) : (
                <div className={cn("rounded-2xl border overflow-hidden", isDark ? "border-slate-800/50 bg-slate-900/30" : "border-gray-200 bg-white")}>
                  <table className="w-full">
                    <thead>
                      <tr className={cn("border-b text-left text-xs font-semibold uppercase tracking-wider", isDark ? "border-slate-800/50 text-slate-500" : "border-gray-200 text-gray-500")}>
                        <th className="py-4 px-6 w-16">
                          <input
                            type="checkbox"
                            checked={selectedSet.size === droplets.length && droplets.length > 0}
                            onChange={selectAll}
                            className={cn("w-4 h-4 rounded transition-colors cursor-pointer", isDark ? "border-slate-600 bg-slate-800/50 checked:bg-indigo-500 checked:border-indigo-500" : "border-gray-300 bg-gray-50 checked:bg-indigo-500 checked:border-indigo-500")}
                          />
                        </th>
                        <th className="py-4 px-6">Name</th>
                        <th className="py-4 px-6">Region</th>
                        <th className="py-4 px-6">Size</th>
                        <th className="py-4 px-6">Tags</th>
                        <th className="py-4 px-6">Status</th>
                        <th className="py-4 px-6 w-20"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {droplets.map((droplet) => (
                        <DropletRow
                          key={droplet.id}
                          droplet={droplet}
                          selected={selectedSet.has(droplet.id)}
                          onSelect={() => toggleSelect(droplet.id)}
                          onReboot={() => void handleReboot(droplet.id)}
                          onDelete={() => void handleDelete(droplet.id)}
                          loading={loading}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <CreateDropletModal
              open={showCreate}
              onClose={() => setShowCreate(false)}
              onCreate={handleCreate}
              loading={loading}
            />

            <AIActionModal
              open={aiModalOpen}
              onClose={() => setAiModalOpen(false)}
              type={aiModalType}
              data={aiModalData}
            />
          </>
        ) : activeNav === "kubernetes" ? (
          <ResourceListView
            title="Kubernetes Clusters"
            icon={Box}
            createLabel="Create Cluster"
            items={kubernetes}
            columns={["Name", "Region", "Version", "Nodes", "Status"]}
            renderRow={(cluster: KubernetesClusterSummary) => (
              <tr key={cluster.id} className="border-b border-[#30363d] hover:bg-[#161b22] transition-colors">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <StatusDot status={cluster.status} />
                    <span className="font-medium text-[#e6edf3]">{cluster.name}</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-sm text-[#7d8590]">{cluster.region.toUpperCase()}</td>
                <td className="py-3 px-4 text-sm text-[#7d8590]">v{cluster.version}</td>
                <td className="py-3 px-4 text-sm text-[#7d8590]">{cluster.nodeCount}</td>
                <td className="py-3 px-4"><StatusBadge status={cluster.status} /></td>
              </tr>
            )}
          />
        ) : activeNav === "databases" ? (
          <ResourceListView
            title="Managed Databases"
            icon={Database}
            createLabel="Create Database"
            items={databases}
            columns={["Name", "Engine", "Region", "Size", "Nodes", "Status"]}
            renderRow={(db: DatabaseSummary) => (
              <tr key={db.id} className="border-b border-[#30363d] hover:bg-[#161b22] transition-colors">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <StatusDot status={db.status} />
                    <span className="font-medium text-[#e6edf3]">{db.name}</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-sm text-[#7d8590]">{db.engine} {db.version}</td>
                <td className="py-3 px-4 text-sm text-[#7d8590]">{db.region.toUpperCase()}</td>
                <td className="py-3 px-4 text-sm text-[#7d8590]">{db.size}</td>
                <td className="py-3 px-4 text-sm text-[#7d8590]">{db.numNodes}</td>
                <td className="py-3 px-4"><StatusBadge status={db.status} /></td>
              </tr>
            )}
          />
        ) : activeNav === "domains" ? (
          <ResourceListView
            title="Domains"
            icon={Globe}
            createLabel="Add Domain"
            items={domains}
            columns={["Domain", "TTL", "Records"]}
            renderRow={(domain: DomainSummary) => (
              <tr key={domain.name} className="border-b border-[#30363d] hover:bg-[#161b22] transition-colors">
                <td className="py-3 px-4">
                  <span className="font-medium text-[#e6edf3]">{domain.name}</span>
                </td>
                <td className="py-3 px-4 text-sm text-[#7d8590]">{domain.ttl}s</td>
                <td className="py-3 px-4 text-sm text-[#7d8590]">{domain.recordCount}</td>
              </tr>
            )}
          />
        ) : activeNav === "volumes" ? (
          <ResourceListView
            title="Volumes"
            icon={HardDrive}
            createLabel="Create Volume"
            items={volumes}
            columns={["Name", "Region", "Size", "Filesystem", "Attached"]}
            renderRow={(vol: VolumeSummary) => (
              <tr key={vol.id} className="border-b border-[#30363d] hover:bg-[#161b22] transition-colors">
                <td className="py-3 px-4">
                  <span className="font-medium text-[#e6edf3]">{vol.name}</span>
                </td>
                <td className="py-3 px-4 text-sm text-[#7d8590]">{vol.region.toUpperCase()}</td>
                <td className="py-3 px-4 text-sm text-[#7d8590]">{vol.sizeGigabytes} GB</td>
                <td className="py-3 px-4 text-sm text-[#7d8590]">{vol.filesystemType || "—"}</td>
                <td className="py-3 px-4 text-sm text-[#7d8590]">{vol.dropletIds.length > 0 ? `${vol.dropletIds.length} droplet(s)` : "Unattached"}</td>
              </tr>
            )}
          />
        ) : activeNav === "firewalls" ? (
          <ResourceListView
            title="Firewalls"
            icon={Shield}
            createLabel="Create Firewall"
            items={firewalls}
            columns={["Name", "Status", "Inbound Rules", "Outbound Rules", "Droplets"]}
            renderRow={(fw: FirewallSummary) => (
              <tr key={fw.id} className="border-b border-[#30363d] hover:bg-[#161b22] transition-colors">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <StatusDot status={fw.status} />
                    <span className="font-medium text-[#e6edf3]">{fw.name}</span>
                  </div>
                </td>
                <td className="py-3 px-4"><StatusBadge status={fw.status} /></td>
                <td className="py-3 px-4 text-sm text-[#7d8590]">{fw.inboundRuleCount}</td>
                <td className="py-3 px-4 text-sm text-[#7d8590]">{fw.outboundRuleCount}</td>
                <td className="py-3 px-4 text-sm text-[#7d8590]">{fw.dropletIds.length}</td>
              </tr>
            )}
          />
        ) : (
          <ResourcePlaceholder
            resourceType={activeNav}
            icon={navItems.find((n) => n.id === activeNav)?.icon || Server}
          />
        )}
      </div>
    </div>
  );
};

export default DODashboard;
