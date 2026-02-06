"use client";

import * as React from "react";
import type { TamboComponent } from "@tambo-ai/react";
import { useTamboThreadInput } from "@tambo-ai/react";
import { z } from "zod";
import { useInfraStore } from "@/lib/infra-store";
import {
  Power,
  PowerOff,
  RefreshCw,
  RotateCcw,
  Camera,
  Maximize2,
  Hammer,
  Play,
  Square,
  Zap,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
} from "lucide-react";

type DropletActionsProps = {
  dropletId?: number;
  dropletName?: string;
  action?:
    | "power-on"
    | "power-off"
    | "shutdown"
    | "power-cycle"
    | "reboot"
    | "resize"
    | "rebuild"
    | "snapshot"
    | "restore"
    | "password-reset"
    | "rename"
    | "enable-ipv6"
    | "enable-private-networking"
    | "disable-backups"
    | "enable-backups";
  sizeSlug?: string;
  imageId?: number;
  snapshotName?: string;
  backupId?: number;
  newName?: string;
};

interface ActionConfig {
  key: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  variant: "default" | "warning" | "danger" | "primary";
  confirmMessage: string;
  mcpAction: string;
}

const ACTIONS: Record<string, ActionConfig> = {
  "power-on": {
    key: "power-on",
    label: "Power On",
    description: "Start the droplet",
    icon: Play,
    variant: "primary",
    confirmMessage: "Power on this droplet?",
    mcpAction: "power-on-droplet",
  },
  "power-off": {
    key: "power-off",
    label: "Power Off",
    description: "Force power off (hard shutdown)",
    icon: PowerOff,
    variant: "danger",
    confirmMessage:
      "Force power off? This is like pulling the power cable and may cause data loss.",
    mcpAction: "power-off-droplet",
  },
  shutdown: {
    key: "shutdown",
    label: "Shutdown",
    description: "Graceful shutdown via ACPI",
    icon: Square,
    variant: "warning",
    confirmMessage: "Shutdown the droplet gracefully?",
    mcpAction: "shutdown-droplet",
  },
  "power-cycle": {
    key: "power-cycle",
    label: "Power Cycle",
    description: "Hard reboot (force restart)",
    icon: Zap,
    variant: "danger",
    confirmMessage:
      "Power cycle? This is a hard reboot and may cause data loss.",
    mcpAction: "power-cycle-droplet",
  },
  reboot: {
    key: "reboot",
    label: "Reboot",
    description: "Graceful reboot via ACPI",
    icon: RefreshCw,
    variant: "default",
    confirmMessage: "Reboot the droplet?",
    mcpAction: "reboot-droplet",
  },
  resize: {
    key: "resize",
    label: "Resize",
    description: "Change droplet size (requires shutdown first)",
    icon: Maximize2,
    variant: "warning",
    confirmMessage: "Resize the droplet? This requires a shutdown first.",
    mcpAction: "resize-droplet",
  },
  rebuild: {
    key: "rebuild",
    label: "Rebuild",
    description: "Rebuild droplet from an image",
    icon: Hammer,
    variant: "danger",
    confirmMessage:
      "Rebuild the droplet? This will destroy all data and rebuild from the selected image.",
    mcpAction: "rebuild-droplet",
  },
  snapshot: {
    key: "snapshot",
    label: "Snapshot",
    description: "Create a point-in-time backup",
    icon: Camera,
    variant: "default",
    confirmMessage: "Create a snapshot of this droplet?",
    mcpAction: "snapshot-droplet",
  },
  restore: {
    key: "restore",
    label: "Restore",
    description: "Restore from backup/snapshot",
    icon: RotateCcw,
    variant: "warning",
    confirmMessage: "Restore the droplet from backup?",
    mcpAction: "restore-droplet",
  },
  "password-reset": {
    key: "password-reset",
    label: "Reset Password",
    description: "Reset root password (emailed)",
    icon: RotateCcw,
    variant: "warning",
    confirmMessage: "Reset the root password? A new password will be emailed.",
    mcpAction: "reset-droplet-password",
  },
  rename: {
    key: "rename",
    label: "Rename",
    description: "Change droplet hostname",
    icon: RefreshCw,
    variant: "default",
    confirmMessage: "Rename the droplet?",
    mcpAction: "rename-droplet",
  },
  "enable-ipv6": {
    key: "enable-ipv6",
    label: "Enable IPv6",
    description: "Add IPv6 networking",
    icon: GlobeIcon,
    variant: "primary",
    confirmMessage: "Enable IPv6 networking?",
    mcpAction: "enable-ipv6-droplet",
  },
  "enable-private-networking": {
    key: "enable-private-networking",
    label: "Private Network",
    description: "Enable private networking",
    icon: GlobeIcon,
    variant: "primary",
    confirmMessage: "Enable private networking?",
    mcpAction: "droplet-enable-private-net",
  },
  "disable-backups": {
    key: "disable-backups",
    label: "Disable Backups",
    description: "Turn off automatic backups",
    icon: Camera,
    variant: "warning",
    confirmMessage: "Disable automatic backups?",
    mcpAction: "disable-backups-droplet",
  },
  "enable-backups": {
    key: "enable-backups",
    label: "Enable Backups",
    description: "Turn on automatic backups",
    icon: Camera,
    variant: "primary",
    confirmMessage: "Enable automatic backups? (Additional charges apply)",
    mcpAction: "enable-backups-droplet",
  },
};

function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

const DropletActions: React.FC<DropletActionsProps> = (props) => {
  const {
    dropletId,
    dropletName,
    action,
    sizeSlug,
    imageId,
    snapshotName,
    backupId,
    newName,
  } = props || {};

  const droplets = useInfraStore((s) => s.droplets);
  const { setValue, submit: submitMessage } = useTamboThreadInput();
  const [loading, setLoading] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [showMore, setShowMore] = React.useState(false);

  const droplet = React.useMemo(() => {
    if (dropletId) return droplets.find((d) => d.id === dropletId);
    if (dropletName)
      return droplets.find(
        (d) => d.name.toLowerCase() === dropletName.toLowerCase()
      );
    return undefined;
  }, [droplets, dropletId, dropletName]);

  const handleAction = async (actionKey: string, config: ActionConfig) => {
    if (!droplet) {
      setError("No droplet specified");
      return;
    }

    if (!confirm(config.confirmMessage)) return;

    setLoading(actionKey);
    setError(null);
    setSuccess(null);

    try {
      let message = `[${config.mcpAction.toUpperCase()}] `;
      message += `droplet_id=${droplet.id}`;

      if (actionKey === "resize" && sizeSlug) {
        message += ` size=${sizeSlug}`;
      }
      if (actionKey === "rebuild" && imageId) {
        message += ` image=${imageId}`;
      }
      if (actionKey === "snapshot" && snapshotName) {
        message += ` name=${snapshotName}`;
      }
      if (actionKey === "restore" && backupId) {
        message += ` backup_id=${backupId}`;
      }
      if (actionKey === "rename" && newName) {
        message += ` new_name=${newName}`;
      }

      setValue(message);
      await submitMessage({ streamResponse: true });
      setSuccess(`${config.label} initiated for ${droplet.name}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to execute action");
    } finally {
      setLoading(null);
    }
  };

  if (!droplet && (dropletId || dropletName)) {
    return (
      <div className="w-full max-w-2xl bg-[#0d1117] border border-gray-700 rounded-lg p-6 text-center">
        <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
        <p className="text-gray-400">
          Droplet not found: {dropletId || dropletName}
        </p>
      </div>
    );
  }

  if (action && ACTIONS[action]) {
    const config = ACTIONS[action];
    const Icon = config.icon;

    return (
      <div className="w-full max-w-md bg-[#0d1117] border border-gray-700 rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-700 bg-[#161b22]">
          <h3 className="font-medium text-white flex items-center gap-2">
            <Icon className="w-4 h-4" />
            {config.label}
          </h3>
        </div>

        <div className="p-4">
          {error && (
            <div className="mb-3 px-3 py-2 rounded bg-red-500/20 text-red-400 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          {success && (
            <div className="mb-3 px-3 py-2 rounded bg-green-500/20 text-green-400 text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              {success}
            </div>
          )}

          <p className="text-sm text-gray-400 mb-4">{config.description}</p>

          {action === "resize" && !sizeSlug && (
            <div className="mb-4 p-3 rounded bg-yellow-500/10 border border-yellow-500/20">
              <p className="text-sm text-yellow-400">
                Please provide a size_slug to resize to. Example: s-2vcpu-2gb
              </p>
            </div>
          )}

          {action === "rebuild" && !imageId && (
            <div className="mb-4 p-3 rounded bg-yellow-500/10 border border-yellow-500/20">
              <p className="text-sm text-yellow-400">
                Please provide an image_id to rebuild from.
              </p>
            </div>
          )}

          <button
            onClick={() => handleAction(action, config)}
            disabled={
              loading === action ||
              (action === "resize" && !sizeSlug) ||
              (action === "rebuild" && !imageId)
            }
            className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              config.variant === "danger"
                ? "bg-red-600/20 text-red-400 hover:bg-red-600/30"
                : config.variant === "warning"
                ? "bg-yellow-600/20 text-yellow-400 hover:bg-yellow-600/30"
                : config.variant === "primary"
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gray-700 text-gray-100 hover:bg-gray-600"
            } disabled:opacity-50`}
          >
            {loading === action ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Icon className="w-4 h-4" />
            )}
            {loading === action ? "Processing..." : config.label}
          </button>
        </div>
      </div>
    );
  }

  const primaryActions = ["reboot", "shutdown", "snapshot", "resize"];
  const secondaryActions = [
    "power-on",
    "power-off",
    "power-cycle",
    "rebuild",
    "restore",
    "password-reset",
    "rename",
  ];
  const networkActions = [
    "enable-ipv6",
    "enable-private-networking",
  ];
  const backupActions = ["enable-backups", "disable-backups"];

  return (
    <div className="w-full max-w-2xl bg-[#0d1117] border border-gray-700 rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-700 bg-[#161b22]">
        <h3 className="font-semibold text-white flex items-center gap-2">
          <Power className="w-5 h-5" />
          Droplet Actions
        </h3>
        {droplet && (
          <p className="text-sm text-gray-400 mt-1">
            Actions for <span className="text-white font-medium">{droplet.name}</span>
          </p>
        )}
      </div>

      <div className="p-6 space-y-6">
        {error && (
          <div className="px-4 py-2 rounded bg-red-500/20 text-red-400 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        {success && (
          <div className="px-4 py-2 rounded bg-green-500/20 text-green-400 text-sm flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            {success}
          </div>
        )}

        {!droplet && (
          <div className="p-4 rounded bg-yellow-500/10 border border-yellow-500/20 text-center">
            <p className="text-sm text-yellow-400">
              Please specify a droplet_id or droplet_name to see available actions.
            </p>
          </div>
        )}

        {droplet && (
          <>
            {/* Primary Actions */}
            <div>
              <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
                Common Actions
              </h4>
              <div className="grid grid-cols-2 gap-3">
                {primaryActions.map((key) => {
                  const config = ACTIONS[key];
                  const Icon = config.icon;
                  return (
                    <button
                      key={key}
                      onClick={() => handleAction(key, config)}
                      disabled={loading === key}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg border border-gray-700 hover:bg-gray-800 text-left transition-colors disabled:opacity-50"
                    >
                      <div
                        className={`p-2 rounded ${
                          config.variant === "danger"
                            ? "bg-red-500/20"
                            : config.variant === "warning"
                            ? "bg-yellow-500/20"
                            : config.variant === "primary"
                            ? "bg-blue-500/20"
                            : "bg-gray-700"
                        }`}
                      >
                        {loading === key ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Icon
                            className={`w-4 h-4 ${
                              config.variant === "danger"
                                ? "text-red-400"
                                : config.variant === "warning"
                                ? "text-yellow-400"
                                : config.variant === "primary"
                                ? "text-blue-400"
                                : "text-gray-400"
                            }`}
                          />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-100">
                          {config.label}
                        </p>
                        <p className="text-xs text-gray-500">
                          {config.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Network Actions */}
            <div>
              <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
                Network
              </h4>
              <div className="grid grid-cols-2 gap-3">
                {networkActions.map((key) => {
                  const config = ACTIONS[key];
                  const Icon = config.icon;
                  return (
                    <button
                      key={key}
                      onClick={() => handleAction(key, config)}
                      disabled={loading === key}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg border border-gray-700 hover:bg-gray-800 text-left transition-colors disabled:opacity-50"
                    >
                      <div className="p-2 rounded bg-blue-500/20">
                        {loading === key ? (
                          <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                        ) : (
                          <Icon className="w-4 h-4 text-blue-400" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-100">
                          {config.label}
                        </p>
                        <p className="text-xs text-gray-500">
                          {config.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Backup Actions */}
            <div>
              <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
                Backups
              </h4>
              <div className="grid grid-cols-2 gap-3">
                {backupActions.map((key) => {
                  const config = ACTIONS[key];
                  const Icon = config.icon;
                  return (
                    <button
                      key={key}
                      onClick={() => handleAction(key, config)}
                      disabled={loading === key}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg border border-gray-700 hover:bg-gray-800 text-left transition-colors disabled:opacity-50"
                    >
                      <div
                        className={`p-2 rounded ${
                          config.variant === "warning"
                            ? "bg-yellow-500/20"
                            : "bg-blue-500/20"
                        }`}
                      >
                        {loading === key ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Icon
                            className={`w-4 h-4 ${
                              config.variant === "warning"
                                ? "text-yellow-400"
                                : "text-blue-400"
                            }`}
                          />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-100">
                          {config.label}
                        </p>
                        <p className="text-xs text-gray-500">
                          {config.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* More Actions Toggle */}
            <div className="border-t border-gray-700 pt-4">
              <button
                onClick={() => setShowMore(!showMore)}
                className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-300 transition-colors"
              >
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    showMore ? "rotate-180" : ""
                  }`}
                />
                {showMore ? "Show less" : "More actions"}
              </button>

              {showMore && (
                <div className="mt-4 grid grid-cols-2 gap-3">
                  {secondaryActions.map((key) => {
                    const config = ACTIONS[key];
                    const Icon = config.icon;
                    return (
                      <button
                        key={key}
                        onClick={() => handleAction(key, config)}
                        disabled={loading === key}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg border border-gray-700 hover:bg-gray-800 text-left transition-colors disabled:opacity-50"
                      >
                        <div
                          className={`p-2 rounded ${
                            config.variant === "danger"
                              ? "bg-red-500/20"
                              : config.variant === "warning"
                              ? "bg-yellow-500/20"
                              : "bg-gray-700"
                          }`}
                        >
                          {loading === key ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Icon
                              className={`w-4 h-4 ${
                                config.variant === "danger"
                                  ? "text-red-400"
                                  : config.variant === "warning"
                                  ? "text-yellow-400"
                                  : "text-gray-400"
                              }`}
                            />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-100">
                            {config.label}
                          </p>
                          <p className="text-xs text-gray-500">
                            {config.description}
                            </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export const dropletActionsComponent: TamboComponent = {
  name: "dropletActions",
  description:
    "Interactive panel to perform various actions on a droplet: reboot, shutdown, power on/off, resize, rebuild, snapshot, restore, password reset, rename, enable IPv6/private networking, enable/disable backups. Use for ANY droplet management action the user requests.",
  component: DropletActions,
  propsSchema: z.object({
    dropletId: z.number().optional().describe("Droplet ID to perform action on"),
    dropletName: z.string().optional().describe("Droplet name to perform action on"),
    action: z
      .enum([
        "power-on",
        "power-off",
        "shutdown",
        "power-cycle",
        "reboot",
        "resize",
        "rebuild",
        "snapshot",
        "restore",
        "password-reset",
        "rename",
        "enable-ipv6",
        "enable-private-networking",
        "disable-backups",
        "enable-backups",
      ])
      .optional()
      .describe("Specific action to perform (optional, shows all actions if not specified)"),
    sizeSlug: z.string().optional().describe("Size slug for resize action (e.g., s-2vcpu-2gb)"),
    imageId: z.number().optional().describe("Image ID for rebuild action"),
    snapshotName: z.string().optional().describe("Name for new snapshot"),
    backupId: z.number().optional().describe("Backup ID for restore action"),
    newName: z.string().optional().describe("New name for rename action"),
  }),
};
