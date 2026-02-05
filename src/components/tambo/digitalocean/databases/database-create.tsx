"use client";

import * as React from "react";
import type { TamboComponent } from "@tambo-ai/react";
import { z } from "zod";
import {
  Database,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
} from "lucide-react";

type DatabaseCreateProps = {
  title?: string;
  defaultName?: string;
  defaultEngine?: string;
  defaultRegion?: string;
  defaultSize?: string;
};

const ENGINES = [
  { value: "pg", label: "PostgreSQL", version: "16" },
  { value: "mysql", label: "MySQL", version: "8" },
  { value: "redis", label: "Redis", version: "7" },
  { value: "mongodb", label: "MongoDB", version: "7" },
];

const REGIONS = [
  { value: "nyc1", label: "New York 1", flag: "🇺🇸" },
  { value: "sfo3", label: "San Francisco 3", flag: "🇺🇸" },
  { value: "ams3", label: "Amsterdam 3", flag: "🇳🇱" },
  { value: "sgp1", label: "Singapore 1", flag: "🇸🇬" },
  { value: "lon1", label: "London 1", flag: "🇬🇧" },
  { value: "fra1", label: "Frankfurt 1", flag: "🇩🇪" },
];

const SIZES = [
  { value: "db-s-1vcpu-1gb", cpu: "1 vCPU", ram: "1 GB", storage: "10 GB", price: "$15/mo" },
  { value: "db-s-1vcpu-2gb", cpu: "1 vCPU", ram: "2 GB", storage: "25 GB", price: "$30/mo" },
  { value: "db-s-2vcpu-4gb", cpu: "2 vCPU", ram: "4 GB", storage: "38 GB", price: "$60/mo" },
  { value: "db-s-4vcpu-8gb", cpu: "4 vCPU", ram: "8 GB", storage: "115 GB", price: "$120/mo" },
];

const DatabaseCreate: React.FC<DatabaseCreateProps> = (props) => {
  const {
    title = "Create Database Cluster",
    defaultName = "",
    defaultEngine = "pg",
    defaultRegion = "nyc1",
    defaultSize = "db-s-1vcpu-1gb",
  } = props || {};

  const [form, setForm] = React.useState({
    name: defaultName,
    engine: defaultEngine,
    region: defaultRegion,
    size: defaultSize,
  });

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);
  const [expandedSection, setExpandedSection] = React.useState<string | null>("engine");

  // Update form when default props change (handles streaming)
  React.useEffect(() => {
    setForm((prev) => ({
      name: defaultName || prev.name,
      engine: defaultEngine || prev.engine,
      region: defaultRegion || prev.region,
      size: defaultSize || prev.size,
    }));
  }, [defaultName, defaultEngine, defaultRegion, defaultSize]);

  const handleCreate = async () => {
    if (!form.name.trim()) {
      setError("Database name is required");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await new Promise((r) => setTimeout(r, 1500));
      setSuccess(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error creating database");
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
          <h3 className="text-xl font-semibold mb-2">Database Created!</h3>
          <p className="text-gray-400 mb-4">
            Your database <span className="text-white font-medium">{form.name}</span> is being provisioned.
          </p>
          <div className="bg-[#161b22] rounded-lg p-4 text-left text-sm space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">Engine</span>
              <span>{ENGINES.find((e) => e.value === form.engine)?.label}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Region</span>
              <span>{form.region}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Size</span>
              <span>{form.size}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl bg-[#0d1117] border border-gray-700 rounded-lg overflow-hidden text-gray-100">
      <div className="px-6 py-4 border-b border-gray-700 flex items-center gap-3">
        <div className="w-10 h-10 rounded bg-cyan-600 flex items-center justify-center">
          <Database className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">{title}</h2>
          <p className="text-sm text-gray-400">Configure your managed database</p>
        </div>
      </div>

      {error && (
        <div className="mx-6 mt-4 px-4 py-3 rounded-md bg-red-500/20 text-red-400 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      <div className="p-6 space-y-6">
        {/* Database Name */}
        <div>
          <label className="block text-sm font-medium mb-2">Database Name</label>
          <input
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="my-database"
            className="w-full px-4 py-3 rounded-md border border-gray-600 bg-[#161b22] text-white placeholder-gray-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none"
          />
        </div>

        {/* Engine */}
        <div>
          <button
            onClick={() => setExpandedSection(expandedSection === "engine" ? null : "engine")}
            className="w-full flex items-center justify-between text-sm font-medium mb-2"
          >
            <span>Database Engine</span>
            <div className="flex items-center gap-2 text-gray-400">
              <span>{ENGINES.find((e) => e.value === form.engine)?.label}</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${expandedSection === "engine" ? "rotate-180" : ""}`} />
            </div>
          </button>
          {expandedSection === "engine" && (
            <div className="grid grid-cols-2 gap-2">
              {ENGINES.map((engine) => (
                <button
                  key={engine.value}
                  onClick={() => setForm((f) => ({ ...f, engine: engine.value }))}
                  className={`px-4 py-3 rounded-md border text-left transition-colors ${
                    form.engine === engine.value
                      ? "border-cyan-500 bg-cyan-500/10 text-white"
                      : "border-gray-600 bg-[#161b22] text-gray-300 hover:border-gray-500"
                  }`}
                >
                  <div className="font-medium">{engine.label}</div>
                  <div className="text-xs text-gray-400">v{engine.version}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Region */}
        <div>
          <button
            onClick={() => setExpandedSection(expandedSection === "region" ? null : "region")}
            className="w-full flex items-center justify-between text-sm font-medium mb-2"
          >
            <span>Region</span>
            <div className="flex items-center gap-2 text-gray-400">
              <span>{REGIONS.find((r) => r.value === form.region)?.label}</span>
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
                      ? "border-cyan-500 bg-cyan-500/10 text-white"
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
              <span>{SIZES.find((s) => s.value === form.size)?.ram}</span>
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
                      ? "border-cyan-500 bg-cyan-500/10"
                      : "border-gray-600 bg-[#161b22] hover:border-gray-500"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium">{size.cpu}</span>
                      <span className="text-gray-400 mx-2">·</span>
                      <span className="text-gray-300">{size.ram}</span>
                      <span className="text-gray-400 mx-2">·</span>
                      <span className="text-gray-300">{size.storage}</span>
                    </div>
                    <span className="text-cyan-400 font-medium">{size.price}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-700 flex items-center justify-between bg-[#161b22]">
        <div className="text-sm text-gray-400">
          {SIZES.find((s) => s.value === form.size)?.price}
        </div>
        <button
          onClick={() => void handleCreate()}
          disabled={loading || !form.name.trim()}
          className="flex items-center gap-2 px-6 py-2.5 rounded-md bg-cyan-600 hover:bg-cyan-700 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          Create Database
        </button>
      </div>
    </div>
  );
};

export const databaseCreateComponent: TamboComponent = {
  name: "databaseCreate",
  description:
    "Render a form to create a new managed database cluster. ALWAYS render this when user wants to create a database. Supports PostgreSQL, MySQL, Redis, MongoDB.",
  component: DatabaseCreate,
  propsSchema: z.object({
    title: z.string().optional(),
    defaultName: z.string().optional(),
    defaultEngine: z.string().optional().describe("pg, mysql, redis, or mongodb"),
    defaultRegion: z.string().optional(),
    defaultSize: z.string().optional(),
  }),
};
