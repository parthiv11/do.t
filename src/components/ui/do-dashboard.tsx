"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useInfraStore, type DropletSummary } from "@/lib/infra-store";
import { useTheme } from "@/components/theme-provider";
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
} from "lucide-react";

type DODashboardProps = React.HTMLAttributes<HTMLDivElement>;

type NavItem = {
  id: string;
  label: string;
  icon: React.ElementType;
  count?: number;
};

async function fetchDroplets(): Promise<DropletSummary[]> {
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

async function createDropletApi(params: {
  name: string;
  region: string;
  size: string;
  image: string;
  tags?: string[];
}): Promise<DropletSummary> {
  const res = await fetch("/api/digitalocean/droplets", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  const text = await res.text();
  const body = text ? JSON.parse(text) : null;
  if (!res.ok) throw new Error(String(body?.error || `Failed (${res.status})`));
  const d = body?.droplet;
  return {
    id: Number(d?.id),
    name: String(d?.name || ""),
    status: String(d?.status || "new"),
    region: String(typeof d?.region === "object" && d?.region ? d.region.slug || "" : ""),
    size: String(d?.size_slug || ""),
    ipv4: undefined,
    tags: Array.isArray(d?.tags) ? d.tags.map(String) : [],
    createdAt: typeof d?.created_at === "string" ? d.created_at : undefined,
  };
}

async function deleteDropletApi(id: number): Promise<void> {
  const res = await fetch(`/api/digitalocean/droplets/${id}`, { method: "DELETE" });
  if (!res.ok) {
    const text = await res.text();
    const body = text ? JSON.parse(text) : null;
    throw new Error(String(body?.error || `Failed (${res.status})`));
  }
}

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

const RESOURCE_INFO: Record<string, { title: string; description: string; createLabel: string }> = {
  kubernetes: {
    title: "Kubernetes Clusters",
    description: "Managed Kubernetes clusters for container orchestration. Deploy, manage, and scale containerized applications.",
    createLabel: "Create Cluster",
  },
  databases: {
    title: "Managed Databases",
    description: "Fully managed database clusters with automated backups, scaling, and high availability.",
    createLabel: "Create Database",
  },
  domains: {
    title: "Domains",
    description: "Manage DNS records for your domains. Point your domains to DigitalOcean resources.",
    createLabel: "Add Domain",
  },
  volumes: {
    title: "Volumes",
    description: "Block storage volumes that can be attached to Droplets. Persistent storage for your data.",
    createLabel: "Create Volume",
  },
  firewalls: {
    title: "Firewalls",
    description: "Cloud firewalls to secure your infrastructure. Control inbound and outbound traffic.",
    createLabel: "Create Firewall",
  },
};

function ResourcePlaceholder({ resourceType, icon: Icon }: { resourceType: string; icon: React.ElementType }) {
  const info = RESOURCE_INFO[resourceType] || {
    title: resourceType.charAt(0).toUpperCase() + resourceType.slice(1),
    description: "Manage your resources.",
    createLabel: "Create",
  };

  return (
    <>
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#21262d]">
        <div>
          <h1 className="text-xl font-semibold">{info.title}</h1>
          <p className="text-sm text-[#7d8590]">0 resources</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium">
          <Plus className="w-4 h-4" />
          {info.createLabel}
        </button>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
        <div className="w-20 h-20 rounded-full bg-[#161b22] flex items-center justify-center mb-6">
          <Icon className="w-10 h-10 text-[#30363d]" />
        </div>
        <h2 className="text-xl font-semibold mb-2">No {info.title} Yet</h2>
        <p className="text-[#7d8590] mb-6 max-w-md">{info.description}</p>
        <button className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium">
          <Plus className="w-4 h-4" />
          {info.createLabel}
        </button>
      </div>
    </>
  );
}

function StatusDot({ status }: { status: string }) {
  const normalized = status.toLowerCase();
  if (normalized === "active") {
    return <span className="w-2.5 h-2.5 rounded-full bg-green-500" title="Active" />;
  }
  if (normalized === "new" || normalized === "starting") {
    return <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 animate-pulse" title={status} />;
  }
  if (normalized === "off") {
    return <span className="w-2.5 h-2.5 rounded-full bg-gray-500" title="Off" />;
  }
  return <span className="w-2.5 h-2.5 rounded-full bg-blue-500" title={status} />;
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
    <tr className={cn("border-b border-[#30363d] hover:bg-[#161b22] transition-colors", selected && "bg-[#1f2937]")}>
      <td className="py-3 px-4 w-10">
        <input
          type="checkbox"
          checked={selected}
          onChange={onSelect}
          className="w-4 h-4 rounded border-[#30363d] bg-transparent"
        />
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          <StatusDot status={droplet.status} />
          <div>
            <div className="font-medium text-[#e6edf3] hover:text-blue-400 cursor-pointer">
              {droplet.name}
            </div>
            <div className="text-xs text-[#7d8590]">
              {droplet.ipv4 || "No public IP"}
            </div>
          </div>
        </div>
      </td>
      <td className="py-3 px-4 text-sm text-[#7d8590]">{droplet.region.toUpperCase()}</td>
      <td className="py-3 px-4 text-sm text-[#7d8590]">{droplet.size}</td>
      <td className="py-3 px-4">
        {droplet.tags.length > 0 ? (
          <div className="flex gap-1 flex-wrap">
            {droplet.tags.slice(0, 2).map((tag) => (
              <span key={tag} className="px-2 py-0.5 text-xs rounded-full bg-[#30363d] text-[#7d8590]">
                {tag}
              </span>
            ))}
            {droplet.tags.length > 2 && (
              <span className="text-xs text-[#7d8590]">+{droplet.tags.length - 2}</span>
            )}
          </div>
        ) : (
          <span className="text-xs text-[#484f58]">—</span>
        )}
      </td>
      <td className="py-3 px-4 text-right relative" ref={menuRef}>
        <button
          onClick={() => setShowMenu(!showMenu)}
          disabled={loading}
          className="p-1.5 rounded hover:bg-[#30363d] text-[#7d8590] hover:text-[#e6edf3] disabled:opacity-50"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>
        {showMenu && (
          <div className="absolute right-4 top-full mt-1 z-20 bg-[#161b22] border border-[#30363d] rounded-lg shadow-xl min-w-[160px] py-1">
            {droplet.ipv4 && (
              <button
                onClick={() => {
                  navigator.clipboard.writeText(droplet.ipv4!);
                  setShowMenu(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#e6edf3] hover:bg-[#30363d]"
              >
                <Copy className="w-4 h-4" />
                Copy IP
              </button>
            )}
            <button
              onClick={() => { setShowMenu(false); onReboot(); }}
              disabled={loading}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#e6edf3] hover:bg-[#30363d] disabled:opacity-50"
            >
              <RotateCcw className="w-4 h-4" />
              Reboot
            </button>
            <button
              onClick={() => { setShowMenu(false); onDelete(); }}
              disabled={loading}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-[#30363d] disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              Destroy
            </button>
          </div>
        )}
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-[#0d1117] border border-[#30363d] rounded-xl shadow-2xl w-full max-w-lg mx-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#30363d]">
          <h3 className="text-lg font-semibold text-[#e6edf3]">Create Droplet</h3>
          <button onClick={onClose} className="p-1.5 hover:bg-[#30363d] rounded-lg text-[#7d8590]">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-[#e6edf3] mb-2">Hostname</label>
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="my-droplet"
              className="w-full px-4 py-2.5 rounded-lg border border-[#30363d] bg-[#0d1117] text-[#e6edf3] placeholder-[#484f58] focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#e6edf3] mb-2">Region</label>
              <select
                value={form.region}
                onChange={(e) => setForm((f) => ({ ...f, region: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-lg border border-[#30363d] bg-[#0d1117] text-[#e6edf3]"
              >
                <option value="nyc1">New York 1</option>
                <option value="nyc3">New York 3</option>
                <option value="sfo3">San Francisco 3</option>
                <option value="ams3">Amsterdam 3</option>
                <option value="sgp1">Singapore 1</option>
                <option value="lon1">London 1</option>
                <option value="fra1">Frankfurt 1</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#e6edf3] mb-2">Size</label>
              <select
                value={form.size}
                onChange={(e) => setForm((f) => ({ ...f, size: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-lg border border-[#30363d] bg-[#0d1117] text-[#e6edf3]"
              >
                <option value="s-1vcpu-1gb">1 vCPU / 1 GB - $6/mo</option>
                <option value="s-1vcpu-2gb">1 vCPU / 2 GB - $12/mo</option>
                <option value="s-2vcpu-2gb">2 vCPU / 2 GB - $18/mo</option>
                <option value="s-2vcpu-4gb">2 vCPU / 4 GB - $24/mo</option>
                <option value="s-4vcpu-8gb">4 vCPU / 8 GB - $48/mo</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#e6edf3] mb-2">Image</label>
            <select
              value={form.image}
              onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-lg border border-[#30363d] bg-[#0d1117] text-[#e6edf3]"
            >
              <option value="ubuntu-24-04-x64">Ubuntu 24.04 LTS</option>
              <option value="ubuntu-22-04-x64">Ubuntu 22.04 LTS</option>
              <option value="debian-12-x64">Debian 12</option>
              <option value="centos-stream-9-x64">CentOS Stream 9</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#e6edf3] mb-2">Tags</label>
            <input
              value={form.tags}
              onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
              placeholder="web, production (comma-separated)"
              className="w-full px-4 py-2.5 rounded-lg border border-[#30363d] bg-[#0d1117] text-[#e6edf3] placeholder-[#484f58] focus:border-blue-500 outline-none"
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-[#30363d] bg-[#161b22] rounded-b-xl">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg border border-[#30363d] text-[#e6edf3] hover:bg-[#30363d]"
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
            className="px-5 py-2 text-sm rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium disabled:opacity-50 flex items-center gap-2"
          >
            {loading && <RefreshCw className="w-4 h-4 animate-spin" />}
            Create Droplet
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

  const selectedSet = React.useMemo(() => new Set(selectedDropletIds), [selectedDropletIds]);

  const { theme, setTheme } = useTheme();

  const navItems: NavItem[] = [
    { id: "droplets", label: "Droplets", icon: Server, count: droplets.length },
    { id: "kubernetes", label: "Kubernetes", icon: Box, count: 0 },
    { id: "databases", label: "Databases", icon: Database, count: 0 },
    { id: "domains", label: "Domains", icon: Globe, count: 0 },
    { id: "volumes", label: "Volumes", icon: HardDrive, count: 0 },
    { id: "firewalls", label: "Firewalls", icon: Shield, count: 0 },
  ];

  const refresh = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchDroplets();
      setDroplets(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error fetching droplets");
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  }, [setDroplets]);

  React.useEffect(() => {
    if (initialLoad) {
      void refresh();
    }
  }, [initialLoad, refresh]);

  React.useEffect(() => {
    if (actionFeedback) {
      const timer = setTimeout(() => setActionFeedback(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [actionFeedback]);

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
    setLoading(true);
    try {
      const created = await createDropletApi(params);
      setDroplets([created, ...droplets]);
      setShowCreate(false);
      setActionFeedback(`Created "${created.name}"`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setLoading(false);
    }
  };

  const handleReboot = async (id: number) => {
    const droplet = droplets.find((d) => d.id === id);
    if (!confirm(`Reboot "${droplet?.name}"?`)) return;
    setLoading(true);
    try {
      await rebootDropletApi(id);
      setActionFeedback(`Rebooting "${droplet?.name}"...`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    const droplet = droplets.find((d) => d.id === id);
    if (!confirm(`Destroy "${droplet?.name}"? This cannot be undone.`)) return;
    setLoading(true);
    try {
      await deleteDropletApi(id);
      setDroplets(droplets.filter((d) => d.id !== id));
      setSelectedDropletIds(selectedDropletIds.filter((sid) => sid !== id));
      setActionFeedback(`Destroyed "${droplet?.name}"`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedSet.size === 0) return;
    if (!confirm(`Destroy ${selectedSet.size} droplet(s)? This cannot be undone.`)) return;
    setLoading(true);
    try {
      await Promise.all(Array.from(selectedSet).map((id) => deleteDropletApi(id)));
      setDroplets(droplets.filter((d) => !selectedSet.has(d.id)));
      setSelectedDropletIds([]);
      setActionFeedback(`Destroyed ${selectedSet.size} droplet(s)`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn("w-full h-full flex bg-[#0d1117] text-[#e6edf3]", className)} {...props}>
      {/* Sidebar */}
      <div className="w-56 flex-shrink-0 border-r border-[#21262d] bg-[#010409] flex flex-col">
        {/* Branding */}
        <div className="p-4 border-b border-[#21262d]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden">
              <img src="/logo.png" alt="DO.T" className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-sm leading-tight">DO.T</span>
              <span className="text-[10px] text-[#7d8590] leading-tight">Chat-first DigitalOcean</span>
            </div>
          </div>
        </div>
        <nav className="flex-1 py-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveNav(item.id)}
              className={cn(
                "w-full flex items-center justify-between px-4 py-2 text-sm transition-colors",
                activeNav === item.id
                  ? "bg-[#21262d] text-[#e6edf3] border-l-2 border-blue-500"
                  : "text-[#7d8590] hover:text-[#e6edf3] hover:bg-[#161b22]"
              )}
            >
              <div className="flex items-center gap-3">
                <item.icon className="w-4 h-4" />
                {item.label}
              </div>
              {item.count !== undefined && item.count > 0 && (
                <span className="text-xs bg-[#30363d] px-1.5 py-0.5 rounded">{item.count}</span>
              )}
            </button>
          ))}
        </nav>
        
        {/* Theme Toggle */}
        <div className="p-4 border-t border-[#21262d]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-[#7d8590]">Theme</span>
            <div className="flex gap-1">
              <button
                onClick={() => setTheme("light")}
                className={cn(
                  "p-1.5 rounded transition-colors",
                  theme === "light" ? "bg-[#30363d] text-white" : "text-[#7d8590] hover:text-white"
                )}
                title="Light"
              >
                <Sun className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setTheme("dark")}
                className={cn(
                  "p-1.5 rounded transition-colors",
                  theme === "dark" ? "bg-[#30363d] text-white" : "text-[#7d8590] hover:text-white"
                )}
                title="Dark"
              >
                <Moon className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setTheme("system")}
                className={cn(
                  "p-1.5 rounded transition-colors",
                  theme === "system" ? "bg-[#30363d] text-white" : "text-[#7d8590] hover:text-white"
                )}
                title="System"
              >
                <Monitor className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          
          {/* Powered by Tambo */}
          <div className="flex items-center gap-2 pt-3 border-t border-[#21262d]">
            <span className="text-[10px] text-[#7d8590]">Powered by</span>
            <a 
              href="https://tambo.co" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[10px] text-blue-400 hover:text-blue-300 transition-colors"
            >
              Tambo AI
            </a>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {activeNav === "droplets" ? (
          <>
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#21262d]">
              <div>
                <h1 className="text-xl font-semibold">Droplets</h1>
                <p className="text-sm text-[#7d8590]">
                  {droplets.length} droplet{droplets.length !== 1 ? "s" : ""}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => void refresh()}
                  disabled={loading}
                  className="p-2 rounded-lg hover:bg-[#21262d] text-[#7d8590] hover:text-[#e6edf3] disabled:opacity-50"
                >
                  <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
                </button>
                <button
                  onClick={() => setShowCreate(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Create Droplet
                </button>
              </div>
            </div>

            {/* Feedback */}
            {actionFeedback && (
              <div className="mx-6 mt-4 px-4 py-2.5 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                {actionFeedback}
              </div>
            )}

            {error && (
              <div className="mx-6 mt-4 px-4 py-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {error}
                <button onClick={() => setError(null)} className="ml-auto hover:text-red-300">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Bulk actions */}
            {selectedSet.size > 0 && (
              <div className="mx-6 mt-4 px-4 py-2.5 rounded-lg bg-[#161b22] border border-[#30363d] flex items-center justify-between">
                <span className="text-sm text-[#7d8590]">{selectedSet.size} selected</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleBulkDelete}
                    disabled={loading}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg text-red-400 hover:bg-red-500/10 disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                    Destroy
                  </button>
                </div>
              </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-auto">
              {initialLoad && loading ? (
                <div className="flex flex-col items-center justify-center h-full text-[#7d8590]">
                  <RefreshCw className="w-8 h-8 animate-spin mb-4" />
                  <p>Loading droplets...</p>
                </div>
              ) : droplets.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center px-6">
                  <div className="w-20 h-20 rounded-full bg-[#161b22] flex items-center justify-center mb-6">
                    <Server className="w-10 h-10 text-[#30363d]" />
                  </div>
                  <h2 className="text-xl font-semibold mb-2">No Droplets Yet</h2>
                  <p className="text-[#7d8590] mb-6 max-w-md">
                    Droplets are virtual machines that run on DigitalOcean&apos;s infrastructure. Create your first droplet to get started.
                  </p>
                  <button
                    onClick={() => setShowCreate(true)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    Create Droplet
                  </button>
                </div>
              ) : (
                <div className="p-6">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#30363d] text-left text-sm text-[#7d8590]">
                        <th className="py-3 px-4 w-10">
                          <input
                            type="checkbox"
                            checked={selectedSet.size === droplets.length && droplets.length > 0}
                            onChange={selectAll}
                            className="w-4 h-4 rounded border-[#30363d] bg-transparent"
                          />
                        </th>
                        <th className="py-3 px-4 font-medium">Name</th>
                        <th className="py-3 px-4 font-medium">Region</th>
                        <th className="py-3 px-4 font-medium">Size</th>
                        <th className="py-3 px-4 font-medium">Tags</th>
                        <th className="py-3 px-4 w-16"></th>
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
          </>
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
