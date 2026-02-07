"use client";

import * as React from "react";
import type { TamboElicitationRequest, TamboElicitationResponse } from "@tambo-ai/react/mcp";
import { useTheme } from "@/components/theme-provider";
import { cn } from "@/lib/utils";
import { Server, ChevronDown } from "lucide-react";

const REGIONS = [
  { value: "nyc1", label: "New York 1", flag: "🇺🇸" },
  { value: "nyc3", label: "New York 3", flag: "🇺🇸" },
  { value: "sfo3", label: "San Francisco 3", flag: "🇺🇸" },
  { value: "ams3", label: "Amsterdam 3", flag: "🇳🇱" },
  { value: "sgp1", label: "Singapore 1", flag: "🇸🇬" },
  { value: "lon1", label: "London 1", flag: "🇬🇧" },
  { value: "fra1", label: "Frankfurt 1", flag: "🇩🇪" },
  { value: "tor1", label: "Toronto 1", flag: "🇨🇦" },
  { value: "blr1", label: "Bangalore 1", flag: "🇮🇳" },
  { value: "syd1", label: "Sydney 1", flag: "🇦🇺" },
];

const SIZES = [
  { value: "s-1vcpu-512mb-10gb", label: "Basic", cpu: "1 vCPU", ram: "512 MB", price: "$4/mo" },
  { value: "s-1vcpu-1gb", label: "Basic", cpu: "1 vCPU", ram: "1 GB", price: "$6/mo" },
  { value: "s-1vcpu-2gb", label: "Basic", cpu: "1 vCPU", ram: "2 GB", price: "$12/mo" },
  { value: "s-2vcpu-2gb", label: "Basic", cpu: "2 vCPU", ram: "2 GB", price: "$18/mo" },
  { value: "s-2vcpu-4gb", label: "Basic", cpu: "2 vCPU", ram: "4 GB", price: "$24/mo" },
  { value: "s-4vcpu-8gb", label: "Basic", cpu: "4 vCPU", ram: "8 GB", price: "$48/mo" },
  { value: "s-8vcpu-16gb", label: "Basic", cpu: "8 vCPU", ram: "16 GB", price: "$96/mo" },
];

const IMAGES = [
  { value: "ubuntu-24-04-x64", label: "Ubuntu 24.04 LTS", icon: "🐧" },
  { value: "ubuntu-22-04-x64", label: "Ubuntu 22.04 LTS", icon: "🐧" },
  { value: "debian-12-x64", label: "Debian 12", icon: "🐧" },
  { value: "centos-stream-9-x64", label: "CentOS Stream 9", icon: "🐧" },
  { value: "fedora-40-x64", label: "Fedora 40", icon: "🐧" },
  { value: "rockylinux-9-x64", label: "Rocky Linux 9", icon: "🐧" },
];

const DEFAULT_REGION = "nyc1";
const DEFAULT_SIZE = "s-1vcpu-1gb";
const DEFAULT_IMAGE = "ubuntu-24-04-x64";

/**
 * Returns true if the elicitation request is for droplet creation (schema has name + region/size/image).
 * For the AI to show the create form via elicitation, send an elicitation with requestedSchema.properties:
 * - name (string, required)
 * - region (string, optional, default e.g. "nyc1")
 * - size (string, optional, default e.g. "s-1vcpu-1gb")
 * - image (string, optional, default e.g. "ubuntu-24-04-x64")
 * - tags (string, optional)
 */
export function isDropletCreateElicitation(
  request: TamboElicitationRequest | null,
): boolean {
  if (!request?.requestedSchema?.properties) return false;
  const props = request.requestedSchema.properties;
  const hasName = "name" in props && props.name?.type === "string";
  const hasDropletField =
    "region" in props || "size" in props || "image" in props;
  return !!(hasName && hasDropletField);
}

function getDefault(
  request: TamboElicitationRequest,
  key: string,
  fallback: string,
): string {
  const schema = request.requestedSchema.properties[key];
  if (schema && "default" in schema && typeof schema.default === "string")
    return schema.default;
  return fallback;
}

export interface DropletCreateElicitationFormProps {
  request: TamboElicitationRequest;
  onResponse: (response: TamboElicitationResponse) => void;
  className?: string;
}

/**
 * Rich droplet create form shown when the AI sends an elicitation for droplet creation.
 * Submits structured content via onResponse so the AI can call createDroplet with confirmed: true.
 */
export const DropletCreateElicitationForm: React.FC<
  DropletCreateElicitationFormProps
> = ({ request, onResponse, className }) => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const [name, setName] = React.useState(() =>
    getDefault(request, "name", ""),
  );
  const [region, setRegion] = React.useState(() =>
    getDefault(request, "region", DEFAULT_REGION),
  );
  const [size, setSize] = React.useState(() =>
    getDefault(request, "size", DEFAULT_SIZE),
  );
  const [image, setImage] = React.useState(() =>
    getDefault(request, "image", DEFAULT_IMAGE),
  );
  const [tags, setTags] = React.useState(() =>
    getDefault(request, "tags", ""),
  );
  const [error, setError] = React.useState<string | null>(null);
  const [expandedSection, setExpandedSection] = React.useState<string | null>(
    "region",
  );

  const handleCreate = () => {
    const trimmedName = name?.trim();
    if (!trimmedName) {
      setError("Name is required");
      return;
    }
    setError(null);
    const tagList =
      typeof tags === "string" && tags
        ? tags.split(",").map((t) => t.trim()).filter(Boolean)
        : [];
    onResponse({
      action: "accept",
      content: {
        name: trimmedName,
        region,
        size,
        image,
        ...(tagList.length > 0 && { tags: tagList }),
      },
    });
  };

  const handleCancel = () => {
    onResponse({ action: "cancel" });
  };

  return (
    <div
      className={cn(
        "flex flex-col rounded-xl bg-background border border-border overflow-hidden max-h-[70vh]",
        className,
      )}
    >
      <div
        className={cn(
          "px-4 py-3 border-b flex items-center gap-3 shrink-0",
          "border-border",
        )}
      >
        <div className="w-9 h-9 rounded bg-blue-600 flex items-center justify-center">
          <Server className="w-4 h-4 text-white" />
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-foreground">
            Create Droplet
          </h3>
          <p className="text-xs text-muted-foreground truncate">
            {request.message || "Configure your new droplet"}
          </p>
        </div>
      </div>

      {error && (
        <div
          className={cn(
            "mx-4 mt-3 px-3 py-2 rounded-md text-sm flex items-center gap-2 shrink-0",
            "bg-destructive/10 text-destructive",
          )}
        >
          {error}
        </div>
      )}

      <div className="p-4 space-y-4 overflow-y-auto min-h-0">
        <div>
          <label className="block text-sm font-medium mb-1.5 text-foreground">
            Hostname
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="my-droplet"
            className={cn(
              "w-full px-3 py-2 rounded-md border text-sm outline-none focus:ring-1",
              isDark
                ? "border-border bg-muted text-foreground placeholder:text-muted-foreground focus:border-blue-500 focus:ring-blue-500"
                : "border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-blue-500 focus:ring-blue-500",
            )}
          />
        </div>

        <div>
          <button
            type="button"
            onClick={() =>
              setExpandedSection(expandedSection === "region" ? null : "region")
            }
            className="w-full flex items-center justify-between text-sm font-medium mb-1.5 text-foreground"
          >
            <span>Region</span>
            <span className={cn("text-muted-foreground flex items-center gap-1")}>
              {REGIONS.find((r) => r.value === region)?.label ?? region}
              <ChevronDown
                className={cn(
                  "w-4 h-4 transition-transform",
                  expandedSection === "region" && "rotate-180",
                )}
              />
            </span>
          </button>
          {expandedSection === "region" && (
            <div className="grid grid-cols-2 gap-2">
              {REGIONS.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setRegion(r.value)}
                  className={cn(
                    "px-3 py-2 rounded-md border text-left text-sm transition-colors",
                    region === r.value
                      ? "border-blue-500 bg-blue-500/10 text-blue-600 dark:text-white"
                      : "border-border bg-muted/50 text-foreground hover:bg-muted",
                  )}
                >
                  <span className="mr-2">{r.flag}</span>
                  {r.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <button
            type="button"
            onClick={() =>
              setExpandedSection(expandedSection === "size" ? null : "size")
            }
            className="w-full flex items-center justify-between text-sm font-medium mb-1.5 text-foreground"
          >
            <span>Size</span>
            <span className={cn("text-muted-foreground flex items-center gap-1")}>
              {SIZES.find((s) => s.value === size)?.ram ?? size}
              <ChevronDown
                className={cn(
                  "w-4 h-4 transition-transform",
                  expandedSection === "size" && "rotate-180",
                )}
              />
            </span>
          </button>
          {expandedSection === "size" && (
            <div className="space-y-1.5">
              {SIZES.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setSize(s.value)}
                  className={cn(
                    "w-full px-3 py-2 rounded-md border text-left text-sm transition-colors",
                    size === s.value
                      ? "border-blue-500 bg-blue-500/10"
                      : "border-border bg-muted/50 hover:bg-muted",
                  )}
                >
                  <div className="flex justify-between items-center">
                    <span>
                      {s.cpu} · {s.ram}
                    </span>
                    <span className="text-blue-500 font-medium">{s.price}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <button
            type="button"
            onClick={() =>
              setExpandedSection(expandedSection === "image" ? null : "image")
            }
            className="w-full flex items-center justify-between text-sm font-medium mb-1.5 text-foreground"
          >
            <span>Image</span>
            <span className={cn("text-muted-foreground flex items-center gap-1")}>
              {IMAGES.find((i) => i.value === image)?.label ?? image}
              <ChevronDown
                className={cn(
                  "w-4 h-4 transition-transform",
                  expandedSection === "image" && "rotate-180",
                )}
              />
            </span>
          </button>
          {expandedSection === "image" && (
            <div className="grid grid-cols-2 gap-2">
              {IMAGES.map((i) => (
                <button
                  key={i.value}
                  type="button"
                  onClick={() => setImage(i.value)}
                  className={cn(
                    "px-3 py-2 rounded-md border text-left text-sm transition-colors",
                    image === i.value
                      ? "border-blue-500 bg-blue-500/10"
                      : "border-border bg-muted/50 hover:bg-muted",
                  )}
                >
                  <span className="mr-2">{i.icon}</span>
                  {i.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5 text-foreground">
            Tags (optional)
          </label>
          <input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="web, production"
            className={cn(
              "w-full px-3 py-2 rounded-md border text-sm outline-none focus:ring-1",
              "border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-blue-500 focus:ring-blue-500",
            )}
          />
        </div>
      </div>

      <div
        className={cn(
          "px-4 py-3 border-t flex items-center justify-between gap-2 shrink-0",
          "border-border bg-muted/30",
        )}
      >
        <span className="text-sm text-muted-foreground">
          {SIZES.find((s) => s.value === size)?.price ?? ""}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 text-sm rounded-lg border border-border bg-background text-foreground hover:bg-muted transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleCreate}
            disabled={!name?.trim()}
            className="px-5 py-2 text-sm rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Create Droplet
          </button>
        </div>
      </div>
    </div>
  );
};
