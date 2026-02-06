"use client";

import * as React from "react";
import type { TamboComponent } from "@tambo-ai/react";
import { useTamboThreadInput } from "@tambo-ai/react";
import { z } from "zod";
import { useInfraStore } from "@/lib/infra-store";
import {
  Cpu,
  CheckCircle2,
  Loader2,
  Search,
  ChevronRight,
  Info,
  Terminal,
  AlertCircle,
} from "lucide-react";

// Common kernel options available on DigitalOcean
const COMMON_KERNELS = [
  { id: 1573, name: "DigitalOcean GrubLoader", version: "", isCurrent: true, description: "Default bootloader - auto-detects kernel" },
  { id: 1574, name: "Ubuntu 24.10", version: "6.8.0-45-generic", description: "Latest Ubuntu kernel" },
  { id: 1575, name: "Ubuntu 24.04 LTS", version: "6.8.0-41-generic", description: "LTS Ubuntu kernel" },
  { id: 1576, name: "Ubuntu 22.04 LTS", version: "5.15.0-119-generic", description: "Previous LTS kernel" },
  { id: 1577, name: "Ubuntu 20.04 LTS", version: "5.4.0-193-generic", description: "Legacy LTS kernel" },
  { id: 1578, name: "Debian 12", version: "6.1.0-23-amd64", description: "Debian Bookworm kernel" },
  { id: 1579, name: "Debian 11", version: "5.10.0-32-amd64", description: "Debian Bullseye kernel" },
  { id: 1580, name: "CentOS Stream 9", version: "5.14.0-503.el9.x86_64", description: "CentOS kernel" },
  { id: 1581, name: "Fedora 40", version: "6.8.5-301.fc40.x86_64", description: "Fedora kernel" },
  { id: 1582, name: "AlmaLinux 9", version: "5.14.0-427.el9.x86_64", description: "AlmaLinux kernel" },
  { id: 1583, name: "Rocky Linux 9", version: "5.14.0-427.el9.x86_64", description: "Rocky Linux kernel" },
];

type KernelListProps = {
  dropletId?: number;
  selectionMode?: boolean;
};

const KernelList: React.FC<KernelListProps> = (props) => {
  const { dropletId, selectionMode = false } = props || {};
  const { setValue, submit: submitMessage } = useTamboThreadInput();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedKernel, setSelectedKernel] = React.useState<number | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [currentKernel] = React.useState(1573); // Default GrubLoader

  const filteredKernels = React.useMemo(() => {
    const query = searchQuery.toLowerCase();
    return COMMON_KERNELS.filter(
      (k) =>
        k.name.toLowerCase().includes(query) ||
        k.version.toLowerCase().includes(query) ||
        k.description.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const handleSelect = async (kernelId: number, kernelName: string) => {
    setSelectedKernel(kernelId);
    if (selectionMode && dropletId) {
      setLoading(true);
      const message = `[CHANGE_KERNEL] droplet_id=${dropletId} kernel_id=${kernelId} kernel_name=${kernelName}`;
      setValue(message);
      await submitMessage({ streamResponse: true });
      setLoading(false);
    }
  };

  const handleGetKernels = async () => {
    if (!dropletId) {
      return;
    }
    setLoading(true);
    setValue(`[DROPLET_KERNELS] droplet_id=${dropletId}`);
    await submitMessage({ streamResponse: true });
    setLoading(false);
  };

  return (
    <div className="w-full max-w-2xl bg-[#0d1117] border border-gray-700 rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-700 bg-[#161b22]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-500/20">
              <Terminal className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Kernels</h3>
              <p className="text-sm text-gray-400">
                {selectionMode
                  ? "Select a kernel for your droplet"
                  : "Available system kernels"}
              </p>
            </div>
          </div>
          {dropletId && (
            <button
              onClick={handleGetKernels}
              disabled={loading}
              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Get Available"}
            </button>
          )}
        </div>

        {!dropletId && (
          <div className="mt-3 p-3 rounded bg-yellow-500/10 border border-yellow-500/20 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-yellow-400 mt-0.5" />
            <p className="text-sm text-yellow-400">
              Please provide a droplet_id to change kernels
            </p>
          </div>
        )}

        {/* Search */}
        <div className="mt-3 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search kernels..."
            className="w-full pl-10 pr-4 py-2 bg-[#0d1117] border border-gray-700 rounded-lg text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      <div className="p-4 max-h-[400px] overflow-y-auto">
        <div className="grid gap-2">
          {filteredKernels.map((kernel) => {
            const isSelected = selectedKernel === kernel.id;
            const isCurrent = currentKernel === kernel.id;
            return (
              <button
                key={kernel.id}
                onClick={() => handleSelect(kernel.id, kernel.name)}
                disabled={loading || !dropletId}
                className={`flex items-center gap-4 p-3 rounded-lg border transition-all text-left ${
                  isSelected
                    ? "border-blue-500 bg-blue-500/10"
                    : isCurrent
                    ? "border-green-500/50 bg-green-500/10"
                    : "border-gray-700 hover:border-gray-600 hover:bg-gray-800"
                } disabled:opacity-50`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <p className="font-medium text-gray-100">{kernel.name}</p>
                    {isCurrent && (
                      <span className="text-xs px-2 py-0.5 rounded bg-green-500/20 text-green-400">
                        Current
                      </span>
                    )}
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-blue-400" />}
                  </div>
                  {kernel.version && (
                    <p className="text-sm text-gray-500 font-mono">{kernel.version}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-0.5">{kernel.description}</p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-600">ID: {kernel.id}</span>
                  {selectionMode && (
                    <ChevronRight
                      className={`w-5 h-5 ${isSelected ? "text-blue-400" : "text-gray-600"}`}
                    />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {filteredKernels.length === 0 && (
          <div className="text-center py-8">
            <Info className="w-8 h-8 text-gray-600 mx-auto mb-2" />
            <p className="text-gray-500">No kernels found matching "{searchQuery}"</p>
          </div>
        )}
      </div>

      {selectionMode && selectedKernel && (
        <div className="px-6 py-4 border-t border-gray-700 bg-[#161b22]">
          <p className="text-sm text-gray-400">
            Selected: <span className="text-white font-medium">{selectedKernel}</span>
            {!dropletId && (
              <span className="text-yellow-400 ml-2">(droplet_id required)</span>
            )}
          </p>
        </div>
      )}
    </div>
  );
};

export const kernelListComponent: TamboComponent = {
  name: "kernelList",
  description:
    "Display and select available kernels for droplets (Ubuntu, Debian, CentOS, Fedora kernels). Use selectionMode=true with dropletId to change a droplet's kernel. Shows current kernel and available options.",
  component: KernelList,
  propsSchema: z.object({
    dropletId: z.number().optional().describe("Droplet ID to change kernel for"),
    selectionMode: z
      .boolean()
      .optional()
      .describe("If true, allows selecting a kernel and sends change request to AI"),
  }),
};
