"use client";

import * as React from "react";
import type { TamboComponent } from "@tambo-ai/react";
import { z } from "zod";
import { Database, Loader2, CheckCircle2, Clock, RefreshCw, Plus } from "lucide-react";

type DatabaseListProps = {
  title?: string;
  databases?: Array<{
    id: string;
    name: string;
    engine: string;
    version: string;
    region: string;
    status: string;
  }>;
};

function StatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase();
  if (normalized === "online" || normalized === "active") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
        <CheckCircle2 className="w-3 h-3" />
        Online
      </span>
    );
  }
  if (normalized === "creating" || normalized === "pending") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400">
        <Clock className="w-3 h-3" />
        {status}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-500/20 text-gray-400">
      {status}
    </span>
  );
}

const DatabaseList: React.FC<DatabaseListProps> = (props) => {
  const { title = "Managed Databases", databases = [] } = props || {};

  const [loading, setLoading] = React.useState(false);

  const refresh = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
  };

  return (
    <div className="w-full max-w-2xl bg-[#0d1117] border border-gray-700 rounded-lg overflow-hidden text-gray-100">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-700 bg-[#161b22] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-cyan-600 flex items-center justify-center">
            <Database className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">{title}</h2>
            <p className="text-sm text-gray-400">{databases.length} database{databases.length !== 1 ? "s" : ""}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => void refresh()} disabled={loading} className="p-2 rounded-md hover:bg-gray-700 disabled:opacity-50 transition-colors">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-md bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" />
            Create
          </button>
        </div>
      </div>

      {/* List */}
      <div className="divide-y divide-gray-700/50">
        {loading && databases.length === 0 ? (
          <div className="p-8 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-gray-500 mx-auto" />
          </div>
        ) : databases.length === 0 ? (
          <div className="p-8 text-center">
            <Database className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Databases</h3>
            <p className="text-gray-400 text-sm">Create your first managed database to get started</p>
          </div>
        ) : (
          databases.map((db) => (
            <div key={db.id} className="px-6 py-4 hover:bg-gray-800/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Database className="w-5 h-5 text-cyan-400" />
                  <div>
                    <div className="font-medium">{db.name}</div>
                    <div className="text-sm text-gray-400">{db.engine} {db.version} · {db.region}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={db.status} />
                  <span className="text-xs text-gray-500 font-mono">#{db.id}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export const databaseListComponent: TamboComponent = {
  name: "databaseList",
  description: "Render a list of managed databases with status badges. ALWAYS render this when user asks to see/list their databases.",
  component: DatabaseList,
  propsSchema: z.object({
    title: z.string().optional(),
    databases: z.array(z.object({
      id: z.string(),
      name: z.string(),
      engine: z.string(),
      version: z.string(),
      region: z.string(),
      status: z.string(),
    })).optional(),
  }),
};
