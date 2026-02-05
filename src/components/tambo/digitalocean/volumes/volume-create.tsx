"use client";

import * as React from "react";
import type { TamboComponent } from "@tambo-ai/react";
import { useTamboComponentState } from "@tambo-ai/react";
import { z } from "zod";
import { HardDrive, Loader2, CheckCircle2, AlertCircle, ChevronDown } from "lucide-react";

type VolumeCreateProps = {
  title?: string;
  defaultName?: string;
  defaultSize?: number;
  defaultRegion?: string;
  defaultFilesystem?: string;
};

const REGIONS = [
  { value: "nyc1", label: "New York 1", flag: "🇺🇸" },
  { value: "nyc3", label: "New York 3", flag: "🇺🇸" },
  { value: "sfo3", label: "San Francisco 3", flag: "🇺🇸" },
  { value: "ams3", label: "Amsterdam 3", flag: "🇳🇱" },
  { value: "sgp1", label: "Singapore 1", flag: "🇸🇬" },
  { value: "lon1", label: "London 1", flag: "🇬🇧" },
  { value: "fra1", label: "Frankfurt 1", flag: "🇩🇪" },
];

const FILESYSTEMS = [
  { value: "ext4", label: "ext4", description: "Linux default" },
  { value: "xfs", label: "XFS", description: "High performance" },
];

const VolumeCreate: React.FC<VolumeCreateProps> = (props) => {
  const {
    title = "Create Volume",
    defaultName = "",
    defaultSize = 100,
    defaultRegion = "nyc1",
    defaultFilesystem = "ext4",
  } = props || {};

  // Use useTamboComponentState so AI can see and update state
  const [name, setName] = useTamboComponentState("name", defaultName, defaultName);
  const [size, setSize] = useTamboComponentState("size", defaultSize, defaultSize);
  const [region, setRegion] = useTamboComponentState("region", defaultRegion, defaultRegion);
  const [filesystem, setFilesystem] = useTamboComponentState("filesystem", defaultFilesystem, defaultFilesystem);
  const [submitRequested, _setSubmitRequested] = useTamboComponentState("submitRequested", false, false);
  const [loading, setLoading] = useTamboComponentState("loading", false, false);
  const [error, setError] = useTamboComponentState<string | null>("error", null, null);
  const [success, setSuccess] = useTamboComponentState("success", false, false);
  const [expandedSection, setExpandedSection] = React.useState<string | null>("region");

  const pricePerMonth = ((size || 100) * 0.10).toFixed(2);

  // Handle user clicking Create - calls API directly for dashboard functionality
  const handleCreate = async () => {
    if (!name?.trim()) {
      setError("Volume name is required");
      return;
    }
    setError(null);
    setLoading(true);
    
    try {
      const res = await fetch("/api/digitalocean/volumes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          size,
          region,
          filesystem,
        }),
      });
      
      const text = await res.text();
      const body = text ? JSON.parse(text) : null;
      
      if (!res.ok) {
        const errorMsg = body?.error || `Failed (${res.status})`;
        const details = body?.details ? JSON.stringify(body.details) : "";
        throw new Error(details ? `${errorMsg}: ${details}` : errorMsg);
      }
      
      setSuccess(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error creating volume");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="w-full max-w-md bg-[#0d1117] border border-gray-700 rounded-lg overflow-hidden text-gray-100">
        <div className="p-6 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-green-400" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Volume Created!</h3>
          <p className="text-gray-400 mb-4">
            <span className="text-white font-medium">{name}</span> ({size} GB) is ready.
          </p>
          <div className="bg-[#161b22] rounded-lg p-4 text-left text-sm space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">Region</span>
              <span>{region}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Filesystem</span>
              <span>{filesystem}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Cost</span>
              <span>${pricePerMonth}/mo</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md bg-[#0d1117] border border-gray-700 rounded-lg overflow-hidden text-gray-100">
      <div className="px-6 py-4 border-b border-gray-700 flex items-center gap-3">
        <div className="w-10 h-10 rounded bg-orange-600 flex items-center justify-center">
          <HardDrive className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">{title}</h2>
          <p className="text-sm text-gray-400">Block storage volume</p>
        </div>
      </div>

      {error && (
        <div className="mx-6 mt-4 px-4 py-3 rounded-md bg-red-500/20 text-red-400 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      <div className="p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Volume Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="my-volume"
            className="w-full px-4 py-3 rounded-md border border-gray-600 bg-[#161b22] text-white placeholder-gray-500 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Size (GB)</label>
          <input
            type="number"
            min={1}
            max={16384}
            value={size}
            onChange={(e) => setSize(parseInt(e.target.value) || 1)}
            className="w-full px-4 py-3 rounded-md border border-gray-600 bg-[#161b22] text-white focus:border-orange-500 outline-none"
          />
          <p className="mt-1 text-xs text-gray-500">$0.10/GB/month · ${pricePerMonth}/mo</p>
        </div>

        <div>
          <button
            onClick={() => setExpandedSection(expandedSection === "region" ? null : "region")}
            className="w-full flex items-center justify-between text-sm font-medium mb-2"
          >
            <span>Region</span>
            <div className="flex items-center gap-2 text-gray-400">
              <span>{REGIONS.find((r) => r.value === region)?.label}</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${expandedSection === "region" ? "rotate-180" : ""}`} />
            </div>
          </button>
          {expandedSection === "region" && (
            <div className="grid grid-cols-2 gap-2">
              {REGIONS.map((r) => (
                <button
                  key={r.value}
                  onClick={() => setRegion(r.value)}
                  className={`px-3 py-2 rounded-md border text-left text-sm transition-colors ${
                    region === r.value
                      ? "border-orange-500 bg-orange-500/10 text-white"
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

        <div>
          <label className="block text-sm font-medium mb-2">Filesystem</label>
          <div className="grid grid-cols-2 gap-2">
            {FILESYSTEMS.map((fs) => (
              <button
                key={fs.value}
                onClick={() => setFilesystem(fs.value)}
                className={`px-4 py-3 rounded-md border text-left transition-colors ${
                  filesystem === fs.value
                    ? "border-orange-500 bg-orange-500/10"
                    : "border-gray-600 bg-[#161b22] hover:border-gray-500"
                }`}
              >
                <div className="font-medium">{fs.label}</div>
                <div className="text-xs text-gray-400">{fs.description}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="px-6 py-4 border-t border-gray-700 flex items-center justify-between bg-[#161b22]">
        <div className="text-sm text-gray-400">${pricePerMonth}/mo</div>
        <button
          onClick={() => void handleCreate()}
          disabled={loading || !name?.trim()}
          className="flex items-center gap-2 px-6 py-2.5 rounded-md bg-orange-600 hover:bg-orange-700 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          Create Volume
        </button>
      </div>
    </div>
  );
};

export const volumeCreateComponent: TamboComponent = {
  name: "volumeCreate",
  description: "Render a form to create a new block storage volume. ALWAYS render this when user wants to create a volume. The AI can see and update form state including name, size, region, filesystem. The form calls the API directly when user clicks Create.",
  component: VolumeCreate,
  propsSchema: z.object({
    title: z.string().optional(),
    defaultName: z.string().optional(),
    defaultSize: z.number().optional().describe("Size in GB"),
    defaultRegion: z.string().optional(),
    defaultFilesystem: z.string().optional().describe("ext4 or xfs"),
  }),
};
