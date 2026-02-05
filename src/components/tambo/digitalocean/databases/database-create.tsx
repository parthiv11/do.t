"use client";

import * as React from "react";
import type { TamboComponent } from "@tambo-ai/react";
import { useTamboComponentState } from "@tambo-ai/react";
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

  // Use useTamboComponentState so AI can see and update state
  const [name, setName] = useTamboComponentState("name", defaultName, defaultName);
  const [engine, setEngine] = useTamboComponentState("engine", defaultEngine, defaultEngine);
  const [region, setRegion] = useTamboComponentState("region", defaultRegion, defaultRegion);
  const [size, setSize] = useTamboComponentState("size", defaultSize, defaultSize);
  const [submitRequested, _setSubmitRequested] = useTamboComponentState("submitRequested", false, false);
  const [loading, setLoading] = useTamboComponentState("loading", false, false);
  const [error, setError] = useTamboComponentState<string | null>("error", null, null);
  const [success, setSuccess] = useTamboComponentState("success", false, false);
  const [expandedSection, setExpandedSection] = React.useState<string | null>("engine");

  // Handle user clicking Create - calls API directly for dashboard functionality
  const handleCreate = async () => {
    if (!name?.trim()) {
      setError("Database name is required");
      return;
    }
    setError(null);
    setLoading(true);
    
    try {
      const res = await fetch("/api/digitalocean/databases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          engine,
          region,
          size,
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
            Your database <span className="text-white font-medium">{name}</span> is being provisioned.
          </p>
          <div className="bg-[#161b22] rounded-lg p-4 text-left text-sm space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">Engine</span>
              <span>{ENGINES.find((e) => e.value === engine)?.label}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Region</span>
              <span>{region}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Size</span>
              <span>{size}</span>
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
            value={name}
            onChange={(e) => setName(e.target.value)}
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
              <span>{ENGINES.find((e) => e.value === engine)?.label}</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${expandedSection === "engine" ? "rotate-180" : ""}`} />
            </div>
          </button>
          {expandedSection === "engine" && (
            <div className="grid grid-cols-2 gap-2">
              {ENGINES.map((e) => (
                <button
                  key={e.value}
                  onClick={() => setEngine(e.value)}
                  className={`px-4 py-3 rounded-md border text-left transition-colors ${
                    engine === e.value
                      ? "border-cyan-500 bg-cyan-500/10 text-white"
                      : "border-gray-600 bg-[#161b22] text-gray-300 hover:border-gray-500"
                  }`}
                >
                  <div className="font-medium">{e.label}</div>
                  <div className="text-xs text-gray-400">v{e.version}</div>
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
              <span>{REGIONS.find((r) => r.value === region)?.label}</span>
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
                      ? "border-cyan-500 bg-cyan-500/10 text-white"
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
              <span>{SIZES.find((s) => s.value === size)?.ram}</span>
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
                      ? "border-cyan-500 bg-cyan-500/10"
                      : "border-gray-600 bg-[#161b22] hover:border-gray-500"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium">{s.cpu}</span>
                      <span className="text-gray-400 mx-2">·</span>
                      <span className="text-gray-300">{s.ram}</span>
                      <span className="text-gray-400 mx-2">·</span>
                      <span className="text-gray-300">{s.storage}</span>
                    </div>
                    <span className="text-cyan-400 font-medium">{s.price}</span>
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
          {SIZES.find((s) => s.value === size)?.price}
        </div>
        <button
          onClick={() => void handleCreate()}
          disabled={loading || !name?.trim()}
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
    "Render a form to create a new managed database cluster. ALWAYS render this when user wants to create a database. Supports PostgreSQL (pg), MySQL, Redis, MongoDB. The AI can see and update form state including name, engine, region, size. The form calls the API directly when user clicks Create.",
  component: DatabaseCreate,
  propsSchema: z.object({
    title: z.string().optional(),
    defaultName: z.string().optional(),
    defaultEngine: z.string().optional().describe("pg, mysql, redis, or mongodb"),
    defaultRegion: z.string().optional(),
    defaultSize: z.string().optional(),
  }),
};
