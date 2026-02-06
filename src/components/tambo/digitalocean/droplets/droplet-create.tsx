"use client";

import * as React from "react";
import type { TamboComponent } from "@tambo-ai/react";
import { useTamboComponentState, useTamboStreamStatus, useTamboThreadInput } from "@tambo-ai/react";
import { z } from "zod";
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

const DropletCreate: React.FC<DropletCreateProps> = (props) => {
  const {
    title = "Create Droplet",
    defaultName = "",
    defaultRegion = "nyc1",
    defaultSize = "s-1vcpu-1gb",
    defaultImage = "ubuntu-24-04-x64",
    defaultTags = [],
  } = props || {};

  // Use useTamboComponentState so AI can see and update state
  const [name, setName] = useTamboComponentState("name", defaultName, defaultName);
  const [region, setRegion] = useTamboComponentState("region", defaultRegion, defaultRegion);
  const [size, setSize] = useTamboComponentState("size", defaultSize, defaultSize);
  const [image, setImage] = useTamboComponentState("image", defaultImage, defaultImage);
  const [tags, setTags] = useTamboComponentState("tags", defaultTags.join(", "), defaultTags.join(", "));
  const [submitRequested, _setSubmitRequested] = useTamboComponentState("submitRequested", false, false);
  const [loading, setLoading] = useTamboComponentState("loading", false, false);
  const [error, setError] = useTamboComponentState<string | null>("error", null, null);
  const [success, setSuccess] = useTamboComponentState("success", false, false);
  const [expandedSection, setExpandedSection] = React.useState<string | null>("region");
  const { streamStatus } = useTamboStreamStatus();
  const isStreaming = streamStatus?.isStreaming ?? false;
  const { setValue, submit: submitMessage } = useTamboThreadInput();

  // Handle user clicking Create - sends message to AI/MCP to create droplet
  const handleCreate = async () => {
    if (!name?.trim()) {
      setError("Name is required");
      return;
    }
    setError(null);
    setLoading(true);
    
    try {
      // Send message to AI/MCP to create the droplet
      const imageLabel = IMAGES.find(i => i.value === image)?.label || image;
      const regionLabel = REGIONS.find(r => r.value === region)?.label || region;
      const sizeLabel = SIZES.find(s => s.value === size)?.label || size;
      setValue(`[FORM_SUBMITTED] Droplet creation form completed. Details: name="${name.trim()}", image=${imageLabel}, region=${regionLabel} (${region}), size=${sizeLabel} (${size}). Please create the droplet via MCP and confirm.`);
      await submitMessage({ streamResponse: true });
      setSuccess(true);
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
            Your droplet <span className="text-white font-medium">{name}</span> is being provisioned.
          </p>
          <div className="bg-[#161b22] rounded-lg p-4 text-left text-sm space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">Region</span>
              <span>{region}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Size</span>
              <span>{size}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Image</span>
              <span>{image}</span>
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
            value={name}
            onChange={(e) => setName(e.target.value)}
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
              <span>{REGIONS.find((r) => r.value === region)?.label || region}</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${expandedSection === "region" ? "rotate-180" : ""}`} />
            </div>
          </button>
          {expandedSection === "region" && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {REGIONS.map((r) => (
                <button
                  key={r.value}
                  onClick={() => setRegion(r.value)}
                  className={`px-3 py-2 rounded-md border text-left text-sm transition-colors ${
                    region === r.value
                      ? "border-blue-500 bg-blue-500/10 text-white"
                      : "border-gray-600 bg-[#161b22] text-gray-300 hover:border-gray-500"
                  }`}
                >
                  <span className="mr-2">{r.flag}</span>
                  {r.label}
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
              <span>{SIZES.find((s) => s.value === size)?.ram || size}</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${expandedSection === "size" ? "rotate-180" : ""}`} />
            </div>
          </button>
          {expandedSection === "size" && (
            <div className="space-y-2">
              {SIZES.map((s) => (
                <button
                  key={s.value}
                  onClick={() => setSize(s.value)}
                  className={`w-full px-4 py-3 rounded-md border text-left transition-colors ${
                    size === s.value
                      ? "border-blue-500 bg-blue-500/10"
                      : "border-gray-600 bg-[#161b22] hover:border-gray-500"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium">{s.cpu}</span>
                      <span className="text-gray-400 mx-2">·</span>
                      <span className="text-gray-300">{s.ram}</span>
                    </div>
                    <span className="text-blue-400 font-medium">{s.price}</span>
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
              <span>{IMAGES.find((i) => i.value === image)?.label || image}</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${expandedSection === "image" ? "rotate-180" : ""}`} />
            </div>
          </button>
          {expandedSection === "image" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {IMAGES.map((i) => (
                <button
                  key={i.value}
                  onClick={() => setImage(i.value)}
                  className={`px-4 py-3 rounded-md border text-left transition-colors ${
                    image === i.value
                      ? "border-blue-500 bg-blue-500/10"
                      : "border-gray-600 bg-[#161b22] hover:border-gray-500"
                  }`}
                >
                  <span className="mr-2">{i.icon}</span>
                  {i.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium mb-2">Tags (optional)</label>
          <input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="web, production"
            className="w-full px-4 py-3 rounded-md border border-gray-600 bg-[#161b22] text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
          />
        </div>
      </div>

      <div className="px-6 py-4 border-t border-gray-700 flex items-center justify-between bg-[#161b22]">
        <div className="text-sm text-gray-400">
          {SIZES.find((s) => s.value === size)?.price || ""}
        </div>
        <button
          onClick={() => void handleCreate()}
          disabled={loading || !name?.trim() || isStreaming}
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
    "Render a DigitalOcean-style form to create a new droplet. ONLY render this when the user initially asks to create a droplet AND the form hasn't been shown yet. Sizes: s-1vcpu-512mb-10gb (smallest), s-1vcpu-1gb, s-2vcpu-4gb. Regions: nyc1, sfo3, lon1, fra1, sgp1. The AI can see and update form state. Once user clicks Create, the component handles submission to MCP - do NOT re-render this component for the same creation request.",
  component: DropletCreate,
  propsSchema: z.object({
    title: z.string().optional(),
    defaultName: z.string().optional().describe("Pre-fill hostname"),
    defaultRegion: z.string().optional().describe("Pre-select region"),
    defaultSize: z.string().optional().describe("Pre-select size"),
    defaultImage: z.string().optional().describe("Pre-select image"),
    defaultTags: z.array(z.string()).optional(),
  }),
};
