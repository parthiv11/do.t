"use client";

import * as React from "react";
import type { TamboComponent } from "@tambo-ai/react";
import { z } from "zod";
import {
  Box,
  Loader2,
  CheckCircle2,
  Clock,
  RefreshCw,
  Plus,
} from "lucide-react";

type ClusterListProps = {
  title?: string;
  clusters?: Array<{
    id: string;
    name: string;
    region: string;
    version: string;
    nodeCount: number;
    status: string;
  }>;
};

function StatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase();
  if (normalized === "running" || normalized === "active") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
        <CheckCircle2 className="w-3 h-3" />
        Running
      </span>
    );
  }
  if (normalized === "provisioning" || normalized === "pending") {
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

const ClusterList: React.FC<ClusterListProps> = (props) => {
  const { title = "Kubernetes Clusters", clusters = [] } = props || {};

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
          <div className="w-10 h-10 rounded bg-purple-600 flex items-center justify-center">
            <Box className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">{title}</h2>
            <p className="text-sm text-gray-400">{clusters.length} cluster{clusters.length !== 1 ? "s" : ""}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => void refresh()}
            disabled={loading}
            className="p-2 rounded-md hover:bg-gray-700 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-md bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" />
            Create
          </button>
        </div>
      </div>

      {/* List */}
      <div className="divide-y divide-gray-700/50">
        {loading && clusters.length === 0 ? (
          <div className="p-8 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-gray-500 mx-auto" />
          </div>
        ) : clusters.length === 0 ? (
          <div className="p-8 text-center">
            <Box className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Clusters</h3>
            <p className="text-gray-400 text-sm">Create your first Kubernetes cluster to get started</p>
          </div>
        ) : (
          clusters.map((cluster) => (
            <div key={cluster.id} className="px-6 py-4 hover:bg-gray-800/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Box className="w-5 h-5 text-purple-400" />
                  <div>
                    <div className="font-medium">{cluster.name}</div>
                    <div className="text-sm text-gray-400">
                      {cluster.region} · v{cluster.version} · {cluster.nodeCount} nodes
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={cluster.status} />
                  <span className="text-xs text-gray-500 font-mono">#{cluster.id}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export const clusterListComponent: TamboComponent = {
  name: "kubernetesClusterList",
  description:
    "Render a list of Kubernetes clusters with status badges. ALWAYS render this when user asks to see/list their K8s clusters.",
  component: ClusterList,
  propsSchema: z.object({
    title: z.string().optional(),
    clusters: z.array(z.object({
      id: z.string(),
      name: z.string(),
      region: z.string(),
      version: z.string(),
      nodeCount: z.number(),
      status: z.string(),
    })).optional(),
  }),
};
