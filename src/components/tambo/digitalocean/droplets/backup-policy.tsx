"use client";

import * as React from "react";
import type { TamboComponent } from "@tambo-ai/react";
import { useTamboThreadInput } from "@tambo-ai/react";
import { z } from "zod";
import { useInfraStore } from "@/lib/infra-store";
import {
  Calendar,
  Clock,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Camera,
  Ban,
  DollarSign,
  Info,
  ChevronRight,
} from "lucide-react";

type BackupPolicyProps = {
  dropletId?: number;
  dropletName?: string;
  currentPolicy?: {
    enabled: boolean;
    window?: string;
    retention?: number;
  };
};

const BACKUP_WINDOWS = [
  { value: "0", label: "00:00 UTC" },
  { value: "4", label: "04:00 UTC" },
  { value: "8", label: "08:00 UTC" },
  { value: "12", label: "12:00 UTC" },
  { value: "16", label: "16:00 UTC" },
  { value: "20", label: "20:00 UTC" },
];

const BackupPolicy: React.FC<BackupPolicyProps> = (props) => {
  const { dropletId, dropletName, currentPolicy } = props || {};
  const droplets = useInfraStore((s) => s.droplets);
  const { setValue, submit: submitMessage } = useTamboThreadInput();

  const [enabled, setEnabled] = React.useState(currentPolicy?.enabled ?? false);
  const [window, setWindow] = React.useState(currentPolicy?.window || "0");
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const droplet = React.useMemo(() => {
    if (dropletId) return droplets.find((d) => d.id === dropletId);
    if (dropletName)
      return droplets.find((d) => d.name.toLowerCase() === dropletName.toLowerCase());
    return undefined;
  }, [droplets, dropletId, dropletName]);

  React.useEffect(() => {
    if (currentPolicy) {
      setEnabled(currentPolicy.enabled);
      if (currentPolicy.window) setWindow(currentPolicy.window);
    }
  }, [currentPolicy]);

  const handleToggleBackups = async (newEnabled: boolean) => {
    if (!droplet) {
      setError("No droplet specified");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const action = newEnabled ? "enable-backups-droplet" : "disable-backups-droplet";
      const message = `[${action.toUpperCase()}] droplet_id=${droplet.id}`;
      setValue(message);
      await submitMessage({ streamResponse: true });
      setEnabled(newEnabled);
      setSuccess(
        newEnabled
          ? `Backups enabled for ${droplet.name}`
          : `Backups disabled for ${droplet.name}`
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update backup policy");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateWindow = async () => {
    if (!droplet) {
      setError("No droplet specified");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const message = `[DROPLET_BACKUP_POLICY] droplet_id=${droplet.id} window=${window}`;
      setValue(message);
      await submitMessage({ streamResponse: true });
      setSuccess(`Backup window updated for ${droplet.name}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update backup window");
    } finally {
      setLoading(false);
    }
  };

  if (!droplet && (dropletId || dropletName)) {
    return (
      <div className="w-full max-w-lg bg-[#0d1117] border border-gray-700 rounded-lg p-6 text-center">
        <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
        <p className="text-gray-400">
          Droplet not found: {dropletId || dropletName}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg bg-[#0d1117] border border-gray-700 rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-700 bg-[#161b22]">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-500/20">
            <Camera className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Backup Policy</h3>
            {droplet && (
              <p className="text-sm text-gray-400">
                for <span className="text-white">{droplet.name}</span>
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {error && (
          <div className="px-4 py-3 rounded-lg bg-red-500/20 text-red-400 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        {success && (
          <div className="px-4 py-3 rounded-lg bg-green-500/20 text-green-400 text-sm flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            {success}
          </div>
        )}

        {!droplet && (
          <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-start gap-3">
            <Info className="w-5 h-5 text-yellow-400 mt-0.5" />
            <div>
              <p className="text-sm text-yellow-400 font-medium">No droplet specified</p>
              <p className="text-sm text-yellow-400/80 mt-1">
                Provide droplet_id or droplet_name to manage backup policy
              </p>
            </div>
          </div>
        )}

        {/* Enable/Disable Backups */}
        <div className="flex items-center justify-between p-4 rounded-lg bg-[#161b22] border border-gray-700">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${enabled ? "bg-green-500/20" : "bg-gray-700"}`}>
              {enabled ? (
                <Camera className="w-5 h-5 text-green-400" />
              ) : (
                <Ban className="w-5 h-5 text-gray-400" />
              )}
            </div>
            <div>
              <p className="font-medium text-gray-100">
                {enabled ? "Backups Enabled" : "Backups Disabled"}
              </p>
              <p className="text-sm text-gray-500">
                {enabled
                  ? "Weekly automated backups"
                  : "Enable to protect your data"}
              </p>
            </div>
          </div>
          <button
            onClick={() => handleToggleBackups(!enabled)}
            disabled={loading || !droplet}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              enabled
                ? "bg-red-600/20 text-red-400 hover:bg-red-600/30"
                : "bg-blue-600 text-white hover:bg-blue-700"
            } disabled:opacity-50`}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : enabled ? (
              "Disable"
            ) : (
              "Enable"
            )}
          </button>
        </div>

        {/* Backup Window */}
        {enabled && (
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Backup Window
            </label>
            <p className="text-sm text-gray-500">
              Choose when backups are created (UTC)
            </p>
            <div className="grid grid-cols-3 gap-2">
              {BACKUP_WINDOWS.map((w) => (
                <button
                  key={w.value}
                  onClick={() => setWindow(w.value)}
                  disabled={loading || !droplet}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    window === w.value
                      ? "bg-blue-600 text-white"
                      : "bg-[#161b22] text-gray-400 hover:bg-gray-800 border border-gray-700"
                  } disabled:opacity-50`}
                >
                  {w.label}
                </button>
              ))}
            </div>
            <button
              onClick={handleUpdateWindow}
              disabled={loading || !droplet || !enabled}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-100 text-sm font-medium transition-colors disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Update Window"}
            </button>
          </div>
        )}

        {/* Pricing Info */}
        <div className="p-4 rounded-lg bg-[#161b22] border border-gray-700">
          <div className="flex items-start gap-3">
            <DollarSign className="w-5 h-5 text-green-400" />
            <div>
              <p className="font-medium text-gray-100">Pricing</p>
              <p className="text-sm text-gray-500 mt-1">
                Backups cost 20% of the droplet's monthly price. For example, a $24/mo
                droplet adds $4.80/mo for backups.
              </p>
              {droplet && (
                <p className="text-sm text-green-400 mt-2">
                  Estimated cost: ~${((droplet.price || 24) * 0.2).toFixed(2)}/mo
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="flex items-start gap-2 text-sm text-gray-500">
          <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <p>
            Backups are taken weekly and retained for 4 weeks. Each backup is a
            complete snapshot of your droplet's disk at the time of backup.
          </p>
        </div>
      </div>
    </div>
  );
};

export const backupPolicyComponent: TamboComponent = {
  name: "backupPolicy",
  description:
    "Manage backup policy for a droplet: enable/disable automated weekly backups, set backup window (UTC time), view pricing. Backups cost 20% of droplet price. Retention is 4 weeks. Use for backup configuration requests.",
  component: BackupPolicy,
  propsSchema: z.object({
    dropletId: z.number().optional().describe("Droplet ID to manage backups for"),
    dropletName: z.string().optional().describe("Droplet name to manage backups for"),
    currentPolicy: z
      .object({
        enabled: z.boolean(),
        window: z.string().optional(),
        retention: z.number().optional(),
      })
      .optional()
      .describe("Current backup policy settings"),
  }),
};
