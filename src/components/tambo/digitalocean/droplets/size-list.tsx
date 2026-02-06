"use client";

import * as React from "react";
import type { TamboComponent } from "@tambo-ai/react";
import { useTamboThreadInput } from "@tambo-ai/react";
import { z } from "zod";
import {
  Cpu,
  HardDrive,
  MemoryStick,
  DollarSign,
  CheckCircle2,
  Loader2,
  Search,
  ChevronRight,
  Info,
} from "lucide-react";

const SIZES = [
  {
    slug: "s-1vcpu-512mb-10gb",
    memory: 512,
    vcpus: 1,
    disk: 10,
    transfer: 0.5,
    priceMonthly: 4.0,
    priceHourly: 0.00595,
    description: "Basic - Good for testing",
    category: "basic",
  },
  {
    slug: "s-1vcpu-1gb",
    memory: 1024,
    vcpus: 1,
    disk: 25,
    transfer: 1,
    priceMonthly: 6.0,
    priceHourly: 0.00893,
    description: "Basic - Personal projects",
    category: "basic",
  },
  {
    slug: "s-1vcpu-2gb",
    memory: 2048,
    vcpus: 1,
    disk: 50,
    transfer: 2,
    priceMonthly: 12.0,
    priceHourly: 0.01786,
    description: "Basic - Small apps",
    category: "basic",
  },
  {
    slug: "s-2vcpu-2gb",
    memory: 2048,
    vcpus: 2,
    disk: 60,
    transfer: 3,
    priceMonthly: 18.0,
    priceHourly: 0.02679,
    description: "General Purpose - Small teams",
    category: "general",
  },
  {
    slug: "s-2vcpu-4gb",
    memory: 4096,
    vcpus: 2,
    disk: 80,
    transfer: 4,
    priceMonthly: 24.0,
    priceHourly: 0.03571,
    description: "General Purpose - Web apps",
    category: "general",
  },
  {
    slug: "s-4vcpu-8gb",
    memory: 8192,
    vcpus: 4,
    disk: 160,
    transfer: 5,
    priceMonthly: 48.0,
    priceHourly: 0.07143,
    description: "General Purpose - Medium apps",
    category: "general",
  },
  {
    slug: "s-4vcpu-16gb-amd",
    memory: 16384,
    vcpus: 4,
    disk: 100,
    transfer: 5,
    priceMonthly: 60.0,
    priceHourly: 0.08929,
    description: "AMD CPU - Memory intensive",
    category: "cpu-optimized",
  },
  {
    slug: "c-2",
    memory: 4096,
    vcpus: 2,
    disk: 25,
    transfer: 4,
    priceMonthly: 42.0,
    priceHourly: 0.0625,
    description: "CPU Optimized - Compute heavy",
    category: "cpu-optimized",
  },
  {
    slug: "c-4",
    memory: 8192,
    vcpus: 4,
    disk: 50,
    transfer: 5,
    priceMonthly: 84.0,
    priceHourly: 0.125,
    description: "CPU Optimized - High compute",
    category: "cpu-optimized",
  },
  {
    slug: "g-2vcpu-8gb",
    memory: 8192,
    vcpus: 2,
    disk: 25,
    transfer: 4,
    priceMonthly: 63.0,
    priceHourly: 0.09375,
    description: "Memory Optimized - Databases",
    category: "memory-optimized",
  },
  {
    slug: "g-4vcpu-16gb",
    memory: 16384,
    vcpus: 4,
    disk: 50,
    transfer: 5,
    priceMonthly: 126.0,
    priceHourly: 0.1875,
    description: "Memory Optimized - Caching",
    category: "memory-optimized",
  },
  {
    slug: "so1_5-2vcpu-16gb",
    memory: 16384,
    vcpus: 2,
    disk: 300,
    transfer: 5,
    priceMonthly: 42.0,
    priceHourly: 0.0625,
    description: "Storage Optimized - Big data",
    category: "storage-optimized",
  },
  {
    slug: "so1_5-4vcpu-32gb",
    memory: 32768,
    vcpus: 4,
    disk: 600,
    transfer: 6,
    priceMonthly: 84.0,
    priceHourly: 0.125,
    description: "Storage Optimized - Analytics",
    category: "storage-optimized",
  },
  {
    slug: "m3-8vcpu-64gb",
    memory: 65536,
    vcpus: 8,
    disk: 500,
    transfer: 7,
    priceMonthly: 280.0,
    priceHourly: 0.41667,
    description: "Premium AMD - Enterprise",
    category: "premium",
  },
  {
    slug: "m3-16vcpu-128gb",
    memory: 131072,
    vcpus: 16,
    disk: 500,
    transfer: 8,
    priceMonthly: 560.0,
    priceHourly: 0.83333,
    description: "Premium AMD - Large scale",
    category: "premium",
  },
];

const CATEGORIES: Record<string, { label: string; color: string }> = {
  basic: { label: "Basic", color: "bg-gray-700 text-gray-300" },
  general: { label: "General Purpose", color: "bg-blue-500/20 text-blue-400" },
  "cpu-optimized": { label: "CPU Optimized", color: "bg-purple-500/20 text-purple-400" },
  "memory-optimized": { label: "Memory Optimized", color: "bg-green-500/20 text-green-400" },
  "storage-optimized": { label: "Storage Optimized", color: "bg-yellow-500/20 text-yellow-400" },
  premium: { label: "Premium", color: "bg-pink-500/20 text-pink-400" },
};

type SizeListProps = {
  selectionMode?: boolean;
  selectedSlug?: string;
};

const SizeList: React.FC<SizeListProps> = (props) => {
  const { selectionMode = false, selectedSlug } = props || {};
  const { setValue, submit: submitMessage } = useTamboThreadInput();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedSize, setSelectedSize] = React.useState<string | null>(selectedSlug || null);
  const [loading, setLoading] = React.useState(false);
  const [activeCategory, setActiveCategory] = React.useState<string | null>(null);

  const filteredSizes = React.useMemo(() => {
    let sizes = SIZES;
    if (activeCategory) {
      sizes = sizes.filter((s) => s.category === activeCategory);
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      sizes = sizes.filter(
        (s) =>
          s.slug.toLowerCase().includes(query) ||
          s.description.toLowerCase().includes(query) ||
          s.category.toLowerCase().includes(query)
      );
    }
    return sizes;
  }, [searchQuery, activeCategory]);

  const categories = React.useMemo(() => {
    const cats = new Set(SIZES.map((s) => s.category));
    return Array.from(cats);
  }, []);

  const handleSelect = async (slug: string) => {
    setSelectedSize(slug);
    if (selectionMode) {
      setLoading(true);
      const size = SIZES.find((s) => s.slug === slug);
      const message = `[SIZE_SELECTED] slug=${slug} memory=${size?.memory}MB vcpus=${size?.vcpus} disk=${size?.disk}GB`;
      setValue(message);
      await submitMessage({ streamResponse: true });
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    setValue("[SIZE_LIST_REFRESH] Please list all available droplet sizes");
    await submitMessage({ streamResponse: true });
    setLoading(false);
  };

  const formatMemory = (mb: number) => {
    if (mb >= 1024) return `${mb / 1024} GB`;
    return `${mb} MB`;
  };

  return (
    <div className="w-full max-w-4xl bg-[#0d1117] border border-gray-700 rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-700 bg-[#161b22]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/20">
              <Cpu className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Droplet Sizes</h3>
              <p className="text-sm text-gray-400">
                {selectionMode ? "Select a size for your droplet" : "Available configurations"}
              </p>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-gray-300 transition-colors disabled:opacity-50"
            title="Refresh sizes"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Cpu className="w-4 h-4" />}
          </button>
        </div>

        {/* Category Filter */}
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={() => setActiveCategory(null)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              activeCategory === null ? "bg-blue-500 text-white" : "bg-gray-800 text-gray-400"
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat === activeCategory ? null : cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                cat === activeCategory ? "bg-blue-500 text-white" : CATEGORIES[cat].color
              }`}
            >
              {CATEGORIES[cat].label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="mt-3 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search sizes..."
            className="w-full pl-10 pr-4 py-2 bg-[#0d1117] border border-gray-700 rounded-lg text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      <div className="p-4 max-h-[600px] overflow-y-auto">
        <div className="grid gap-3">
          {filteredSizes.map((size) => {
            const isSelected = selectedSize === size.slug;
            const category = CATEGORIES[size.category];
            return (
              <button
                key={size.slug}
                onClick={() => handleSelect(size.slug)}
                disabled={loading}
                className={`flex items-center gap-4 p-4 rounded-lg border transition-all text-left ${
                  isSelected
                    ? "border-blue-500 bg-blue-500/10"
                    : "border-gray-700 hover:border-gray-600 hover:bg-gray-800"
                } disabled:opacity-50`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <p className="font-medium text-gray-100">{size.slug}</p>
                    <span className={`text-xs px-2 py-0.5 rounded ${category.color}`}>
                      {category.label}
                    </span>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-blue-400" />}
                  </div>
                  <p className="text-sm text-gray-500">{size.description}</p>
                </div>

                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Cpu className="w-4 h-4" />
                    <span>{size.vcpus} vCPU</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400">
                    <MemoryStick className="w-4 h-4" />
                    <span>{formatMemory(size.memory)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400">
                    <HardDrive className="w-4 h-4" />
                    <span>{size.disk} GB SSD</span>
                  </div>
                  <div className="flex items-center gap-2 text-green-400">
                    <DollarSign className="w-4 h-4" />
                    <span className="font-medium">${size.priceMonthly}/mo</span>
                  </div>
                </div>

                {selectionMode && (
                  <ChevronRight
                    className={`w-5 h-5 ${isSelected ? "text-blue-400" : "text-gray-600"}`}
                  />
                )}
              </button>
            );
          })}
        </div>

        {filteredSizes.length === 0 && (
          <div className="text-center py-8">
            <Info className="w-8 h-8 text-gray-600 mx-auto mb-2" />
            <p className="text-gray-500">No sizes found matching "{searchQuery}"</p>
          </div>
        )}
      </div>

      {selectionMode && selectedSize && (
        <div className="px-6 py-4 border-t border-gray-700 bg-[#161b22]">
          <p className="text-sm text-gray-400">
            Selected: <span className="text-white font-medium">{selectedSize}</span>
          </p>
        </div>
      )}
    </div>
  );
};

export const sizeListComponent: TamboComponent = {
  name: "sizeList",
  description:
    "Display and select from available DigitalOcean droplet sizes (s-1vcpu-1gb, s-2vcpu-4gb, c-4, g-4vcpu-16gb, etc). Shows vCPUs, memory, disk, pricing. Categories: Basic, General Purpose, CPU Optimized, Memory Optimized, Storage Optimized, Premium. Use selectionMode=true when creating a droplet.",
  component: SizeList,
  propsSchema: z.object({
    selectionMode: z
      .boolean()
      .optional()
      .describe("If true, allows selecting a size and sends to AI"),
    selectedSlug: z.string().optional().describe("Currently selected size slug"),
  }),
};
