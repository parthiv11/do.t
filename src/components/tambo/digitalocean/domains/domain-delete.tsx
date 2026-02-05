"use client";

import * as React from "react";
import type { TamboComponent } from "@tambo-ai/react";
import { z } from "zod";
import { Globe, Loader2, CheckCircle2, AlertCircle, AlertTriangle, Trash2 } from "lucide-react";

type DomainDeleteProps = {
  domainName?: string;
};

const DomainDelete: React.FC<DomainDeleteProps> = (props) => {
  const { domainName } = props || {};

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [deleted, setDeleted] = React.useState(false);
  const [confirmText, setConfirmText] = React.useState("");

  const canDelete = domainName && confirmText.toLowerCase() === domainName.toLowerCase();

  const handleDelete = async () => {
    if (!canDelete) return;
    setLoading(true);
    setError(null);
    try {
      await new Promise((r) => setTimeout(r, 1500));
      setDeleted(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error deleting domain");
    } finally {
      setLoading(false);
    }
  };

  if (deleted) {
    return (
      <div className="w-full max-w-md bg-[#0d1117] border border-gray-700 rounded-lg overflow-hidden text-gray-100">
        <div className="p-6 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-green-400" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Domain Removed</h3>
          <p className="text-gray-400">The domain has been removed from your account.</p>
        </div>
      </div>
    );
  }

  if (!domainName) {
    return (
      <div className="w-full max-w-md bg-[#0d1117] border border-gray-700 rounded-lg overflow-hidden text-gray-100">
        <div className="p-6 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-700/50 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Domain Not Specified</h3>
          <p className="text-gray-400">Please specify a domain name to delete.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md bg-[#0d1117] border border-red-900/50 rounded-lg overflow-hidden text-gray-100">
      <div className="px-6 py-4 border-b border-gray-700 bg-red-950/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-red-600/20 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-red-400">Remove Domain</h2>
            <p className="text-sm text-gray-400">This will delete all DNS records</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="mx-6 mt-4 px-4 py-3 rounded-md bg-red-500/20 text-red-400 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      <div className="p-6 space-y-4">
        <div className="flex items-center gap-3 p-4 bg-[#161b22] rounded-lg">
          <Globe className="w-5 h-5 text-green-400" />
          <div className="font-medium">{domainName}</div>
        </div>

        <div className="text-sm text-gray-300 space-y-2">
          <p>This will permanently remove the domain and:</p>
          <ul className="list-disc list-inside text-gray-400 space-y-1">
            <li>All DNS records will be deleted</li>
            <li>DNS resolution will stop working</li>
          </ul>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Type <span className="text-red-400 font-mono">{domainName}</span> to confirm
          </label>
          <input
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={domainName}
            className="w-full px-4 py-3 rounded-md border border-gray-600 bg-[#161b22] text-white placeholder-gray-500 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none"
          />
        </div>
      </div>

      <div className="px-6 py-4 border-t border-gray-700 flex justify-end bg-[#161b22]">
        <button
          onClick={() => void handleDelete()}
          disabled={loading || !canDelete}
          className="flex items-center gap-2 px-6 py-2.5 rounded-md bg-red-600 hover:bg-red-700 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          Remove Domain
        </button>
      </div>
    </div>
  );
};

export const domainDeleteComponent: TamboComponent = {
  name: "domainDelete",
  description: "Render a confirmation dialog to remove a domain. ALWAYS render this when user wants to delete a domain.",
  component: DomainDelete,
  propsSchema: z.object({
    domainName: z.string().optional(),
  }),
};
