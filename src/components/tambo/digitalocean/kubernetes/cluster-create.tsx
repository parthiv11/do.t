"use client";

import * as React from "react";
import type { TamboComponent } from "@tambo-ai/react";
import { useTamboThreadInput } from "@tambo-ai/react";
import { z } from "zod";
import {
  Box,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
} from "lucide-react";

type ClusterCreateProps = {
  title?: string;
  defaultName?: string;
  defaultRegion?: string;
  defaultVersion?: string;
  defaultNodeCount?: number;
  defaultNodeSize?: string;
  onSuccess?: (data: { name: string; region: string; version: string; nodeCount: number; nodeSize: string }) => void;
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

const VERSIONS = [
  { value: "1.29.1-do.0", label: "1.29.1 (Latest)" },
  { value: "1.28.6-do.0", label: "1.28.6" },
  { value: "1.27.10-do.0", label: "1.27.10" },
];

const NODE_SIZES = [
  { value: "s-2vcpu-4gb", cpu: "2 vCPU", ram: "4 GB", price: "$24/mo" },
  { value: "s-4vcpu-8gb", cpu: "4 vCPU", ram: "8 GB", price: "$48/mo" },
  { value: "s-8vcpu-16gb", cpu: "8 vCPU", ram: "16 GB", price: "$96/mo" },
  { value: "s-16vcpu-32gb", cpu: "16 vCPU", ram: "32 GB", price: "$192/mo" },
];

const ClusterCreate: React.FC<ClusterCreateProps> = (props) => {
  const {
    title = "Create Kubernetes Cluster",
    defaultName = "",
    defaultRegion = "nyc1",
    defaultVersion = "1.29.1-do.0",
    defaultNodeCount = 3,
    defaultNodeSize = "s-2vcpu-4gb",
    onSuccess,
  } = props || {};

  const { setValue, submit } = useTamboThreadInput();

  const [form, setForm] = React.useState({
    name: defaultName,
    region: defaultRegion,
    version: defaultVersion,
    nodeCount: defaultNodeCount,
    nodeSize: defaultNodeSize,
  });

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);
  const [expandedSection, setExpandedSection] = React.useState<string | null>("region");

  // Update form when default props change (handles streaming)
  React.useEffect(() => {
    setForm((prev) => ({
      name: defaultName || prev.name,
      region: defaultRegion || prev.region,
      version: defaultVersion || prev.version,
      nodeCount: defaultNodeCount || prev.nodeCount,
      nodeSize: defaultNodeSize || prev.nodeSize,
    }));
  }, [defaultName, defaultRegion, defaultVersion, defaultNodeCount, defaultNodeSize]);

  const handleCreate = async () => {
    if (!form.name.trim()) {
      setError("Cluster name is required");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // API call would go here
      await new Promise((r) => setTimeout(r, 1500));
      setSuccess(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error creating cluster");
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
          <h3 className="text-xl font-semibold mb-2">Cluster Created!</h3>
          <p className="text-gray-400 mb-4">
            Your Kubernetes cluster <span className="text-white font-medium">{form.name}</span> is being provisioned.
          </p>
          <div className="bg-[#161b22] rounded-lg p-4 text-left text-sm space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">Region</span>
              <span>{form.region}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Version</span>
              <span>{form.version}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Nodes</span>
              <span>{form.nodeCount} × {form.nodeSize}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl bg-[#0d1117] border border-gray-700 rounded-lg overflow-hidden text-gray-100">
      <div className="px-6 py-4 border-b border-gray-700 flex items-center gap-3">
        <div className="w-10 h-10 rounded bg-purple-600 flex items-center justify-center">
          <Box className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">{title}</h2>
          <p className="text-sm text-gray-400">Configure your Kubernetes cluster</p>
        </div>
      </div>

      {error && (
        <div className="mx-6 mt-4 px-4 py-3 rounded-md bg-red-500/20 text-red-400 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      <div className="p-6 space-y-6">
        {/* Cluster Name */}
        <div>
          <label className="block text-sm font-medium mb-2">Cluster Name</label>
          <input
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="my-k8s-cluster"
            className="w-full px-4 py-3 rounded-md border border-gray-600 bg-[#161b22] text-white placeholder-gray-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none"
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
                      ? "border-purple-500 bg-purple-500/10 text-white"
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

        {/* Version */}
        <div>
          <button
            onClick={() => setExpandedSection(expandedSection === "version" ? null : "version")}
            className="w-full flex items-center justify-between text-sm font-medium mb-2"
          >
            <span>Kubernetes Version</span>
            <div className="flex items-center gap-2 text-gray-400">
              <span>{VERSIONS.find((v) => v.value === form.version)?.label || form.version}</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${expandedSection === "version" ? "rotate-180" : ""}`} />
            </div>
          </button>
          {expandedSection === "version" && (
            <div className="space-y-2">
              {VERSIONS.map((version) => (
                <button
                  key={version.value}
                  onClick={() => setForm((f) => ({ ...f, version: version.value }))}
                  className={`w-full px-4 py-3 rounded-md border text-left transition-colors ${
                    form.version === version.value
                      ? "border-purple-500 bg-purple-500/10"
                      : "border-gray-600 bg-[#161b22] hover:border-gray-500"
                  }`}
                >
                  {version.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Node Pool */}
        <div>
          <label className="block text-sm font-medium mb-2">Node Pool</label>
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <label className="block text-xs text-gray-400 mb-1">Node Count</label>
              <input
                type="number"
                min={1}
                max={100}
                value={form.nodeCount}
                onChange={(e) => setForm((f) => ({ ...f, nodeCount: parseInt(e.target.value) || 1 }))}
                className="w-full px-4 py-2 rounded-md border border-gray-600 bg-[#161b22] text-white focus:border-purple-500 outline-none"
              />
            </div>
          </div>
          <div className="space-y-2">
            {NODE_SIZES.map((size) => (
              <button
                key={size.value}
                onClick={() => setForm((f) => ({ ...f, nodeSize: size.value }))}
                className={`w-full px-4 py-3 rounded-md border text-left transition-colors ${
                  form.nodeSize === size.value
                    ? "border-purple-500 bg-purple-500/10"
                    : "border-gray-600 bg-[#161b22] hover:border-gray-500"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium">{size.cpu}</span>
                    <span className="text-gray-400 mx-2">·</span>
                    <span className="text-gray-300">{size.ram}</span>
                  </div>
                  <span className="text-purple-400 font-medium">{size.price}/node</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-700 flex items-center justify-between bg-[#161b22]">
        <div className="text-sm text-gray-400">
          Est. ${(parseInt(NODE_SIZES.find((s) => s.value === form.nodeSize)?.price?.replace(/\D/g, "") || "24") * form.nodeCount)}/mo
        </div>
        <button
          onClick={() => void handleCreate()}
          disabled={loading || !form.name.trim()}
          className="flex items-center gap-2 px-6 py-2.5 rounded-md bg-purple-600 hover:bg-purple-700 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          Create Cluster
        </button>
      </div>
    </div>
  );
};

export const clusterCreateComponent: TamboComponent = {
  name: "kubernetesClusterCreate",
  description:
    "Render a form to create a new Kubernetes cluster. ALWAYS render this when user wants to create a K8s/Kubernetes cluster. Pass user preferences as props.",
  component: ClusterCreate,
  propsSchema: z.object({
    title: z.string().optional(),
    defaultName: z.string().optional().describe("Pre-fill cluster name"),
    defaultRegion: z.string().optional().describe("Pre-select region"),
    defaultVersion: z.string().optional().describe("Pre-select K8s version"),
    defaultNodeCount: z.number().optional().describe("Pre-fill node count"),
    defaultNodeSize: z.string().optional().describe("Pre-select node size"),
    onSuccess: z.function().optional().describe("Callback when cluster is created. The AI will receive the creation details."),
  }),
};
