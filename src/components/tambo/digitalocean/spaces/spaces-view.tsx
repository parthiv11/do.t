"use client";

import * as React from "react";
import type { TamboComponent } from "@tambo-ai/react";
import { useTamboComponentState, useTamboThreadInput } from "@tambo-ai/react";
import { z } from "zod";
import {
  HardDrive,
  Folder,
  FileText,
  Upload,
  Download,
  Trash2,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Copy,
  Globe,
  Database,
  RefreshCw,
} from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { cn } from "@/lib/utils";

type SpacesViewProps = {
  bucketName?: string;
  region?: string;
  endpoint?: string;
  totalObjects?: number;
  totalSize?: string;
};

type SpaceObject = {
  key: string;
  size: number;
  lastModified: string;
  type: "file" | "folder";
};

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

const SpacesView: React.FC<SpacesViewProps> = (props) => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const {
    bucketName = "my-bucket",
    region = "nyc3",
    endpoint = "digitaloceanspaces.com",
    totalObjects = 0,
    totalSize = "0 B",
  } = props || {};

  // Tambo state for AI visibility
  const [objects, setObjects] = useTamboComponentState<SpaceObject[]>("objects", [
    { key: "assets/logo.png", size: 24576, lastModified: "2024-01-15", type: "file" },
    { key: "assets/", size: 0, lastModified: "2024-01-15", type: "folder" },
    { key: "backups/database.sql", size: 1048576, lastModified: "2024-01-14", type: "file" },
    { key: "documents/report.pdf", size: 524288, lastModified: "2024-01-13", type: "file" },
  ]);
  const [selectedObject, setSelectedObject] = useTamboComponentState<string | null>("selectedObject", null);
  const [currentPath, setCurrentPath] = useTamboComponentState("currentPath", "/");
  const [loading, setLoading] = useTamboComponentState("loading", false);
  const [actionFeedback, setActionFeedback] = useTamboComponentState<string | null>("actionFeedback", null);
  const [uploadProgress, setUploadProgress] = useTamboComponentState<number | null>("uploadProgress", null);

  const { setValue, submit: submitMessage } = useTamboThreadInput();

  // Filter objects by current path
  const filteredObjects = React.useMemo(() => {
    const path = currentPath || "";
    return objects?.filter((obj) => {
      const objPath = obj.key.startsWith(path) ? obj.key.slice(path.length) : "";
      return objPath && !objPath.includes("/") || (objPath.includes("/") && objPath.split("/").length === 1);
    }) || [];
  }, [objects, currentPath]);

  const handleNavigate = (key: string, type: "file" | "folder") => {
    if (type === "folder") {
      setCurrentPath(key);
      setSelectedObject(null);
    } else {
      setSelectedObject(key);
    }
  };

  const handleUpload = async () => {
    setLoading(true);
    setUploadProgress(0);
    
    // Simulate upload progress
    for (let i = 0; i <= 100; i += 20) {
      await new Promise((r) => setTimeout(r, 200));
      setUploadProgress(i);
    }
    
    // Send message to AI to actually upload via MCP
    setValue(`[FORM_SUBMITTED] Upload file to Spaces bucket "${bucketName}" at path "${currentPath}". Please handle the upload via MCP and confirm.`);
    await submitMessage({ streamResponse: true });
    
    setUploadProgress(null);
    setLoading(false);
    setActionFeedback("Upload initiated - AI will confirm via MCP");
  };

  const handleDelete = async (key: string) => {
    if (!confirm(`Delete "${key}"?`)) return;
    
    setLoading(true);
    
    // Send message to AI to delete via MCP
    setValue(`[FORM_SUBMITTED] Delete object "${key}" from Spaces bucket "${bucketName}". Please confirm deletion via MCP.`);
    await submitMessage({ streamResponse: true });
    
    setLoading(false);
    setActionFeedback("Delete initiated - AI will confirm via MCP");
    setSelectedObject(null);
  };

  const handleRefresh = () => {
    setValue(`[FORM_SUBMITTED] Refresh Spaces bucket "${bucketName}" contents. Please fetch the latest object list via MCP and sync.`);
    void submitMessage({ streamResponse: true });
    setActionFeedback("Refreshing...");
  };

  const publicUrl = `https://${bucketName}.${region}.${endpoint}`;

  return (
    <div className={cn(
      "w-full max-w-3xl border rounded-lg overflow-hidden",
      isDark ? "bg-[#0d1117] border-gray-700 text-gray-100" : "bg-white border-gray-300 text-gray-900"
    )}>
      {/* Header */}
      <div className={cn(
        "px-6 py-5 border-b",
        isDark ? "border-gray-700 bg-[#161b22]" : "border-gray-300 bg-gray-50"
      )}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-purple-600 flex items-center justify-center">
              <HardDrive className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">{bucketName}</h2>
              <div className="flex items-center gap-2 mt-1">
                <Globe className={cn("w-3.5 h-3.5", isDark ? "text-gray-400" : "text-gray-500")} />
                <span className={cn("text-sm", isDark ? "text-gray-400" : "text-gray-500")}>{region}</span>
                <span className={isDark ? "text-gray-600" : "text-gray-300"}>|</span>
                <span className={cn("text-sm", isDark ? "text-gray-400" : "text-gray-500")}>{totalObjects} objects</span>
                <span className={isDark ? "text-gray-600" : "text-gray-300"}>|</span>
                <span className={cn("text-sm", isDark ? "text-gray-400" : "text-gray-500")}>{totalSize}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              disabled={loading}
              className={cn(
                "p-2 rounded transition-colors",
                isDark ? "hover:bg-gray-700 text-gray-400 hover:text-white" : "hover:bg-gray-200 text-gray-500 hover:text-gray-900"
              )}
              title="Refresh"
            >
              <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
            </button>
            <a
              href={publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                isDark ? "border border-gray-600 hover:bg-gray-700" : "border border-gray-300 hover:bg-gray-100"
              )}
            >
              <ExternalLink className="w-4 h-4" />
              Open
            </a>
          </div>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className={cn(
        "px-6 py-2 border-b flex items-center gap-2 text-sm",
        isDark ? "border-gray-700 bg-[#0d1117]" : "border-gray-300 bg-white"
      )}>
        <button
          onClick={() => setCurrentPath("/")}
          className={cn(
            "transition-colors",
            currentPath === "/" 
              ? (isDark ? "text-white" : "text-gray-900")
              : "text-blue-400"
          )}
        >
          {bucketName}
        </button>
        {currentPath && currentPath !== "/" && (
          <>
            <span className={isDark ? "text-gray-600" : "text-gray-300"}>/</span>
            <span className={isDark ? "text-white" : "text-gray-900"}>{(currentPath || "").split("/").filter(Boolean).pop()}</span>
          </>
        )}
      </div>

      {/* Feedback */}
      {actionFeedback && (
        <div className={cn(
          "mx-6 mt-4 px-4 py-2 rounded-md text-sm flex items-center gap-2",
          isDark ? "bg-emerald-500/20 text-emerald-400" : "bg-emerald-100 text-emerald-700"
        )}>
          <CheckCircle2 className="w-4 h-4" />
          {actionFeedback}
        </div>
      )}

      {/* Upload Progress */}
      {uploadProgress !== null && (
        <div className="mx-6 mt-4">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className={isDark ? "text-gray-400" : "text-gray-500"}>Uploading...</span>
            <span className={isDark ? "text-white" : "text-gray-900"}>{uploadProgress}%</span>
          </div>
          <div className={cn("h-2 rounded-full overflow-hidden", isDark ? "bg-gray-700" : "bg-gray-200")}>
            <div
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Object List */}
      <div className="p-6">
        <div className={cn("rounded-lg overflow-hidden", isDark ? "bg-[#161b22]" : "bg-gray-50")}>
          <table className="w-full">
            <thead className={isDark ? "bg-[#0d1117]" : "bg-white"}>
              <tr className={cn("text-left text-sm", isDark ? "text-gray-400" : "text-gray-500")}>
                <th className="py-2 px-4 font-medium">Name</th>
                <th className="py-2 px-4 font-medium">Size</th>
                <th className="py-2 px-4 font-medium">Modified</th>
                <th className="py-2 px-4 font-medium w-24">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredObjects.map((obj) => (
                <tr
                  key={obj.key}
                  onClick={() => handleNavigate(obj.key, obj.type)}
                  className={cn(
                    "border-t transition-colors cursor-pointer",
                    isDark ? "border-gray-700 hover:bg-[#21262d]" : "border-gray-300 hover:bg-gray-100",
                    selectedObject === obj.key && (isDark ? "bg-[#21262d]" : "bg-gray-100")
                  )}
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      {obj.type === "folder" ? (
                        <Folder className="w-4 h-4 text-yellow-500" />
                      ) : (
                        <FileText className="w-4 h-4 text-blue-400" />
                      )}
                      <span className={cn("text-sm", isDark ? "text-white" : "text-gray-900")}>
                        {obj.key.split("/").pop()}
                      </span>
                    </div>
                  </td>
                  <td className={cn("py-3 px-4 text-sm", isDark ? "text-gray-400" : "text-gray-500")}>
                    {obj.type === "file" ? formatBytes(obj.size) : "—"}
                  </td>
                  <td className={cn("py-3 px-4 text-sm", isDark ? "text-gray-400" : "text-gray-500")}>
                    {new Date(obj.lastModified).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1">
                      {obj.type === "file" && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigator.clipboard.writeText(`${publicUrl}/${obj.key}`);
                            }}
                            className={cn(
                              "p-1.5 rounded transition-colors",
                              isDark ? "hover:bg-gray-700 text-gray-400 hover:text-white" : "hover:bg-gray-200 text-gray-500 hover:text-gray-900"
                            )}
                            title="Copy URL"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <a
                            href={`${publicUrl}/${obj.key}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className={cn(
                              "p-1.5 rounded transition-colors",
                              isDark ? "hover:bg-gray-700 text-gray-400 hover:text-white" : "hover:bg-gray-200 text-gray-500 hover:text-gray-900"
                            )}
                            title="Open"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          void handleDelete(obj.key);
                        }}
                        disabled={loading}
                        className="p-1.5 rounded hover:bg-gray-700 text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredObjects.length === 0 && (
            <div className="py-12 text-center">
              <Folder className={cn("w-12 h-12 mx-auto mb-3", isDark ? "text-gray-600" : "text-gray-300")} />
              <p className={isDark ? "text-gray-400" : "text-gray-500"}>This folder is empty</p>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className={cn(
        "px-6 py-4 border-t flex items-center justify-between gap-3",
        isDark ? "border-gray-700 bg-[#161b22]" : "border-gray-300 bg-gray-50"
      )}>
        <button
          onClick={() => void handleUpload()}
          disabled={loading || uploadProgress !== null}
          className="flex items-center gap-2 px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium disabled:opacity-50 transition-colors"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          Upload Files
        </button>
        <div className={cn("text-sm", isDark ? "text-gray-400" : "text-gray-500")}>
          Selected: {selectedObject || "None"}
        </div>
      </div>
    </div>
  );
};

// Helper for className merging - using shared utils
// function cn(...classes: (string | boolean | undefined)[]) {
//   return classes.filter(Boolean).join(" ");
// }

export const spacesViewComponent: TamboComponent = {
  name: "spacesView",
  description:
    "Render an interactive Spaces (S3-compatible object storage) bucket browser with file/folder navigation, upload, delete, and copy URL actions. ALWAYS render this when user asks to view, browse, or manage Spaces bucket contents.",
  component: SpacesView,
  propsSchema: z.object({
    bucketName: z.string().optional().describe("Spaces bucket name"),
    region: z.string().optional().describe("Spaces region (e.g., nyc3)"),
    endpoint: z.string().optional().describe("Spaces endpoint"),
    totalObjects: z.number().optional().describe("Total number of objects"),
    totalSize: z.string().optional().describe("Total storage size (human readable)"),
  }),
};
