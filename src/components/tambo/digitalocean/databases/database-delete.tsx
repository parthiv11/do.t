"use client";

import * as React from "react";
import type { TamboComponent } from "@tambo-ai/react";
import { z } from "zod";
import { Database, Loader2, CheckCircle2, AlertCircle, AlertTriangle, Trash2 } from "lucide-react";

type DatabaseDeleteProps = {
  databaseId?: string;
  databaseName?: string;
  engine?: string;
};

const DatabaseDelete: React.FC<DatabaseDeleteProps> = (props) => {
  const { databaseId, databaseName, engine } = props || {};

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [deleted, setDeleted] = React.useState(false);
  const [confirmText, setConfirmText] = React.useState("");

  const displayName = databaseName || databaseId || "unknown";
  const canDelete = confirmText.toLowerCase() === displayName.toLowerCase();

  const handleDelete = async () => {
    if (!canDelete) return;
    setLoading(true);
    setError(null);
    try {
      await new Promise((r) => setTimeout(r, 1500));
      setDeleted(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error deleting database");
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
          <h3 className="text-xl font-semibold mb-2">Database Destroyed</h3>
          <p className="text-gray-400">The database has been permanently deleted.</p>
        </div>
      </div>
    );
  }

  if (!databaseId && !databaseName) {
    return (
      <div className="w-full max-w-md bg-[#0d1117] border border-gray-700 rounded-lg overflow-hidden text-gray-100">
        <div className="p-6 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-700/50 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Database Not Specified</h3>
          <p className="text-gray-400">Please specify a database ID or name to delete.</p>
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
            <h2 className="text-lg font-semibold text-red-400">Destroy Database</h2>
            <p className="text-sm text-gray-400">This action cannot be undone</p>
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
          <Database className="w-5 h-5 text-cyan-400" />
          <div>
            <div className="font-medium">{displayName}</div>
            <div className="text-sm text-gray-400">
              {engine && <span>{engine} · </span>}
              {databaseId && <span>ID: {databaseId}</span>}
            </div>
          </div>
        </div>

        <div className="text-sm text-gray-300 space-y-2">
          <p>This will permanently destroy the database and:</p>
          <ul className="list-disc list-inside text-gray-400 space-y-1">
            <li>All data will be permanently lost</li>
            <li>All backups will be deleted</li>
            <li>Connection strings will stop working</li>
          </ul>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Type <span className="text-red-400 font-mono">{displayName}</span> to confirm
          </label>
          <input
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={displayName}
            className="w-full px-4 py-3 rounded-md border border-gray-600 bg-[#161b22] text-white placeholder-gray-500 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none"
          />
        </div>
      </div>

      <div className="px-6 py-4 border-t border-gray-700 flex justify-end gap-3 bg-[#161b22]">
        <button
          onClick={() => void handleDelete()}
          disabled={loading || !canDelete}
          className="flex items-center gap-2 px-6 py-2.5 rounded-md bg-red-600 hover:bg-red-700 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          Destroy Database
        </button>
      </div>
    </div>
  );
};

export const databaseDeleteComponent: TamboComponent = {
  name: "databaseDelete",
  description: "Render a confirmation dialog to destroy a managed database. ALWAYS render this when user wants to delete a database.",
  component: DatabaseDelete,
  propsSchema: z.object({
    databaseId: z.string().optional(),
    databaseName: z.string().optional(),
    engine: z.string().optional(),
  }),
};
