"use client";

import * as React from "react";
import type { TamboComponent } from "@tambo-ai/react";
import { z } from "zod";
import { useInfraStore, type DropletSummary } from "@/lib/infra-store";
import {
  Server,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
} from "lucide-react";

type DropletCreateProps = {
  title?: string;
  defaultName?: string;
  defaultRegion?: string;
  defaultSize?: string;
  defaultImage?: string;
  defaultTags?: string[];
  onSuccess?: (data: DropletSummary) => void;
};

const REGIONS = [
  { value: "nyc1", label: "New York 1", flag: "🇺🇸" },
  { value: "nyc3", label: "New York 3", flag: "🇺🇸" },
  { value: "sfo3", label: "San Francisco 3", flag: "🇺🇸" },
  { value: "ams3", label: "Amsterdam 3", flag: "🇳🇱" },
  { value: "sgp1", label: "Singapore 1", flag: "🇸🇬" },
  { value: "lon1", label: "London 1", flag: "🇬🇧" },
  { value: "fra1", label: "Frankfurt 1", flag: "🇩🇪" },
  { value: "tor1", label: "Toronto 1", flag: "🇨🇦" },
  { value: "blr1", label: "Bangalore 1", flag: "🇮🇳" },
  { value: "syd1", label: "Sydney 1", flag: "🇦🇺" },
];

const SIZES = [
  { value: "s-1vcpu-512mb-10gb", label: "Basic", cpu: "1 vCPU", ram: "512 MB", price: "$4/mo" },
  { value: "s-1vcpu-1gb", label: "Basic", cpu: "1 vCPU", ram: "1 GB", price: "$6/mo" },
  { value: "s-1vcpu-2gb", label: "Basic", cpu: "1 vCPU", ram: "2 GB", price: "$12/mo" },
  { value: "s-2vcpu-2gb", label: "Basic", cpu: "2 vCPU", ram: "2 GB", price: "$18/mo" },
  { value: "s-2vcpu-4gb", label: "Basic", cpu: "2 vCPU", ram: "4 GB", price: "$24/mo" },
  { value: "s-4vcpu-8gb", label: "Basic", cpu: "4 vCPU", ram: "8 GB", price: "$48/mo" },
  { value: "s-8vcpu-16gb", label: "Basic", cpu: "8 vCPU", ram: "16 GB", price: "$96/mo" },
];

const IMAGES = [
  { value: "ubuntu-24-04-x64", label: "Ubuntu 24.04 LTS", icon: "🐧" },
  { value: "ubuntu-22-04-x64", label: "Ubuntu 22.04 LTS", icon: "🐧" },
  { value: "debian-12-x64", label: "Debian 12", icon: "🐧" },
  { value: "centos-stream-9-x64", label: "CentOS Stream 9", icon: "🐧" },
  { value: "fedora-40-x64", label: "Fedora 40", icon: "🐧" },
  { value: "rockylinux-9-x64", label: "Rocky Linux 9", icon: "🐧" },
];

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

const DropletCreate: React.FC<DropletCreateProps> = (props) => {
  const {
    title = "Create Droplet",
    defaultName = "",
    defaultRegion = "nyc1",
    defaultSize = "s-1vcpu-1gb",
    defaultImage = "ubuntu-24-04-x64",
    defaultTags = [],
    onSuccess,
  } = props || {};

  const setDroplets = useInfraStore((s) => s.setDroplets);
  const droplets = useInfraStore((s) => s.droplets);

  const [form, setForm] = React.useState({
    name: defaultName,
    region: defaultRegion,
    size: defaultSize,
    image: defaultImage,
    tags: defaultTags.join(", "),
  });

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<DropletSummary | null>(null);
  const [expandedSection, setExpandedSection] = React.useState<string | null>("region");

  // Update form when default props change (handles streaming)
  React.useEffect(() => {
    setForm((prev) => ({
      name: defaultName || prev.name,
      region: defaultRegion || prev.region,
      size: defaultSize || prev.size,
      image: defaultImage || prev.image,
      tags: defaultTags?.join(", ") || prev.tags,
    }));
  }, [defaultName, defaultRegion, defaultSize, defaultImage, defaultTags]);

  const handleCreate = async () => {
    if (!form.name.trim()) {
      setError("Name is required");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const created = await createDropletApi({
        name: form.name.trim(),
        region: form.region,
        size: form.size,
        image: form.image,
        tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      });
      setDroplets([created, ...droplets]);
      setSuccess(created);
      onSuccess?.(created);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error creating droplet");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="w-full max-w-2xl bg-[#0d1117] border border-gray-700 rounded-lg overflow-hidden text-gray-100">
        <div className="p-6 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-green-400" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Droplet Created!</h3>
          <p className="text-gray-400 mb-4">
            Your droplet <span className="text-white font-medium">{success.name}</span> is being provisioned.
          </p>
          <div className="bg-[#161b22] rounded-lg p-4 text-left text-sm space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">ID</span>
              <span className="font-mono">{success.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Region</span>
              <span>{success.region}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Size</span>
              <span>{success.size}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Status</span>
              <span className="text-yellow-400">{success.status}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl bg-[#0d1117] border border-gray-700 rounded-lg overflow-hidden text-gray-100">
      <div className="px-6 py-4 border-b border-gray-700 flex items-center gap-3">
        <div className="w-10 h-10 rounded bg-blue-600 flex items-center justify-center">
          <Server className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">{title}</h2>
          <p className="text-sm text-gray-400">Configure your new Droplet</p>
        </div>
      </div>

      {error && (
        <div className="mx-6 mt-4 px-4 py-3 rounded-md bg-red-500/20 text-red-400 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      <div className="p-6 space-y-6">
        {/* Hostname */}
        <div>
          <label className="block text-sm font-medium mb-2">Hostname</label>
          <input
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="my-droplet"
            className="w-full px-4 py-3 rounded-md border border-gray-600 bg-[#161b22] text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
          />
        </div>

        {/* Region */}
        <div>
          <button
            onClick={() => setExpandedSection(expandedSection === "region" ? null : "region")}
            className="w-full flex items-center justify-between text-sm font-medium mb-2"
          >
            <span>Region</span>
            <div className="flex items-center gap-2 text-gray-400">
              <span>{REGIONS.find((r) => r.value === form.region)?.label || form.region}</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${expandedSection === "region" ? "rotate-180" : ""}`} />
            </div>
          </button>
          {expandedSection === "region" && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {REGIONS.map((region) => (
                <button
                  key={region.value}
                  onClick={() => setForm((f) => ({ ...f, region: region.value }))}
                  className={`px-3 py-2 rounded-md border text-left text-sm transition-colors ${
                    form.region === region.value
                      ? "border-blue-500 bg-blue-500/10 text-white"
                      : "border-gray-600 bg-[#161b22] text-gray-300 hover:border-gray-500"
                  }`}
                >
                  <span className="mr-2">{region.flag}</span>
                  {region.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Size */}
        <div>
          <button
            onClick={() => setExpandedSection(expandedSection === "size" ? null : "size")}
            className="w-full flex items-center justify-between text-sm font-medium mb-2"
          >
            <span>Size</span>
            <div className="flex items-center gap-2 text-gray-400">
              <span>{SIZES.find((s) => s.value === form.size)?.ram || form.size}</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${expandedSection === "size" ? "rotate-180" : ""}`} />
            </div>
          </button>
          {expandedSection === "size" && (
            <div className="space-y-2">
              {SIZES.map((size) => (
                <button
                  key={size.value}
                  onClick={() => setForm((f) => ({ ...f, size: size.value }))}
                  className={`w-full px-4 py-3 rounded-md border text-left transition-colors ${
                    form.size === size.value
                      ? "border-blue-500 bg-blue-500/10"
                      : "border-gray-600 bg-[#161b22] hover:border-gray-500"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium">{size.cpu}</span>
                      <span className="text-gray-400 mx-2">·</span>
                      <span className="text-gray-300">{size.ram}</span>
                    </div>
                    <span className="text-blue-400 font-medium">{size.price}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Image */}
        <div>
          <button
            onClick={() => setExpandedSection(expandedSection === "image" ? null : "image")}
            className="w-full flex items-center justify-between text-sm font-medium mb-2"
          >
            <span>Image</span>
            <div className="flex items-center gap-2 text-gray-400">
              <span>{IMAGES.find((i) => i.value === form.image)?.label || form.image}</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${expandedSection === "image" ? "rotate-180" : ""}`} />
            </div>
          </button>
          {expandedSection === "image" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {IMAGES.map((image) => (
                <button
                  key={image.value}
                  onClick={() => setForm((f) => ({ ...f, image: image.value }))}
                  className={`px-4 py-3 rounded-md border text-left transition-colors ${
                    form.image === image.value
                      ? "border-blue-500 bg-blue-500/10"
                      : "border-gray-600 bg-[#161b22] hover:border-gray-500"
                  }`}
                >
                  <span className="mr-2">{image.icon}</span>
                  {image.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium mb-2">Tags (optional)</label>
          <input
            value={form.tags}
            onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
            placeholder="web, production"
            className="w-full px-4 py-3 rounded-md border border-gray-600 bg-[#161b22] text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
          />
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-700 flex items-center justify-between bg-[#161b22]">
        <div className="text-sm text-gray-400">
          {SIZES.find((s) => s.value === form.size)?.price || ""}
        </div>
        <button
          onClick={() => void handleCreate()}
          disabled={loading || !form.name.trim()}
          className="flex items-center gap-2 px-6 py-2.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          Create Droplet
        </button>
      </div>
    </div>
  );
};

export const dropletCreateComponent: TamboComponent = {
  name: "dropletCreate",
  description:
    "Render a DigitalOcean-style form to create a new droplet. ALWAYS render this immediately when user wants to create a droplet. Pass user preferences as props. Sizes: s-1vcpu-512mb-10gb (smallest), s-1vcpu-1gb, s-2vcpu-4gb. Regions: nyc1, sfo3, lon1, fra1, sgp1.",
  component: DropletCreate,
  propsSchema: z.object({
    title: z.string().optional(),
    defaultName: z.string().optional().describe("Pre-fill hostname"),
    defaultRegion: z.string().optional().describe("Pre-select region"),
    defaultSize: z.string().optional().describe("Pre-select size"),
    defaultImage: z.string().optional().describe("Pre-select image"),
    defaultTags: z.array(z.string()).optional(),
    onSuccess: z.function().optional().describe("Callback when droplet is created. The AI will receive the creation details."),
  }),
};
