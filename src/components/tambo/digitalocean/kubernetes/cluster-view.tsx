"use client";

import * as React from "react";
import type { TamboComponent } from "@tambo-ai/react";
import { z } from "zod";
import {
  Box,
  CheckCircle2,
  AlertCircle,
  Clock,
  Copy,
  ExternalLink,
  Globe,
  Cpu,
  Calendar,
  Tag,
  RotateCcw,
  Trash2,
  Loader2,
} from "lucide-react";

type ClusterViewProps = {
  clusterId?: string;
  clusterName?: string;
  region?: string;
  version?: string;
  nodeCount?: number;
  status?: string;
  endpoint?: string;
  createdAt?: string;
  tags?: string[];
};

function StatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase();
  if (normalized === "running" || normalized === "active") {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-green-500/20 text-green-400">
        <CheckCircle2 className="w-4 h-4" />
        Running
      </span>
    );
  }
  if (normalized === "provisioning" || normalized === "pending") {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-yellow-500/20 text-yellow-400">
        <Clock className="w-4 h-4" />
        {status}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-gray-500/20 text-gray-400">
      {status}
    </span>
  );
}

function InfoRow({ icon: Icon, label, value, copyable }: { icon: React.ElementType; label: string; value: string; copyable?: boolean }) {
  const [copied, setCopied] = React.useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-700/50 last:border-0">
      <div className="flex items-center gap-3 text-gray-400">
        <Icon className="w-4 h-4" />
        <span className="text-sm">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-white">{value}</span>
        {copyable && (
          <button onClick={handleCopy} className="p-1 rounded hover:bg-gray-700 text-gray-400 hover:text-white transition-colors">
            {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        )}
      </div>
    </div>
  );
}

const ClusterView: React.FC<ClusterViewProps> = (props) => {
  const {
    clusterId,
    clusterName = "my-cluster",
    region = "nyc1",
    version = "1.29.1",
    nodeCount = 3,
    status = "running",
    endpoint,
    createdAt,
    tags = [],
  } = props || {};

  const [loading, setLoading] = React.useState(false);
  const [actionFeedback, setActionFeedback] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (actionFeedback) {
      const timer = setTimeout(() => setActionFeedback(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [actionFeedback]);

  const handleUpgrade = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setActionFeedback("Upgrade initiated");
    setLoading(false);
  };

  return (
    <div className="w-full max-w-2xl bg-[#0d1117] border border-gray-700 rounded-lg overflow-hidden text-gray-100">
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-700 bg-[#161b22]">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-purple-600 flex items-center justify-center">
              <Box className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">{clusterName}</h2>
              <div className="flex items-center gap-3 mt-1">
                <StatusBadge status={status} />
                {clusterId && <span className="text-sm text-gray-400">#{clusterId}</span>}
              </div>
            </div>
          </div>
        </div>
      </div>

      {actionFeedback && (
        <div className="mx-6 mt-4 px-4 py-2 rounded-md bg-green-500/20 text-green-400 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          {actionFeedback}
        </div>
      )}

      {/* Details */}
      <div className="p-6">
        <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">Cluster Details</h3>
        <div className="bg-[#161b22] rounded-lg px-4">
          <InfoRow icon={Globe} label="Region" value={region} />
          <InfoRow icon={Cpu} label="Kubernetes Version" value={version} />
          <InfoRow icon={Box} label="Node Count" value={String(nodeCount)} />
          {endpoint && <InfoRow icon={Globe} label="API Endpoint" value={endpoint} copyable />}
          {createdAt && <InfoRow icon={Calendar} label="Created" value={new Date(createdAt).toLocaleDateString()} />}
          {tags.length > 0 && (
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3 text-gray-400">
                <Tag className="w-4 h-4" />
                <span className="text-sm">Tags</span>
              </div>
              <div className="flex gap-1.5 flex-wrap justify-end">
                {tags.map((tag) => (
                  <span key={tag} className="px-2 py-0.5 text-xs rounded bg-gray-700 text-gray-300">{tag}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Access */}
      {endpoint && (
        <div className="px-6 pb-6">
          <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">Quick Access</h3>
          <div className="bg-[#161b22] rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">kubectl config</p>
                <code className="text-xs text-gray-400 font-mono mt-1 block">doctl kubernetes cluster kubeconfig save {clusterName}</code>
              </div>
              <button
                onClick={() => navigator.clipboard.writeText(`doctl kubernetes cluster kubeconfig save ${clusterName}`)}
                className="p-2 rounded hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="px-6 py-4 border-t border-gray-700 bg-[#161b22] flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => void handleUpgrade()}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-md border border-gray-600 hover:bg-gray-700 text-sm font-medium disabled:opacity-50 transition-colors"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
            Upgrade
          </button>
          <a
            href="#"
            className="flex items-center gap-2 px-4 py-2 rounded-md border border-gray-600 hover:bg-gray-700 text-sm font-medium transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Dashboard
          </a>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-md bg-red-600/20 text-red-400 hover:bg-red-600/30 text-sm font-medium transition-colors">
          <Trash2 className="w-4 h-4" />
          Destroy
        </button>
      </div>
    </div>
  );
};

export const clusterViewComponent: TamboComponent = {
  name: "kubernetesClusterView",
  description:
    "Render a detailed view of a Kubernetes cluster with status, version, nodes, and action buttons. ALWAYS render this when user asks for details about a K8s cluster.",
  component: ClusterView,
  propsSchema: z.object({
    clusterId: z.string().optional(),
    clusterName: z.string().optional(),
    region: z.string().optional(),
    version: z.string().optional(),
    nodeCount: z.number().optional(),
    status: z.string().optional(),
    endpoint: z.string().optional(),
    createdAt: z.string().optional(),
    tags: z.array(z.string()).optional(),
  }),
};
