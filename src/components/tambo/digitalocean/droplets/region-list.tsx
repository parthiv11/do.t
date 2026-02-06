"use client";

import * as React from "react";
import type { TamboComponent } from "@tambo-ai/react";
import { useTamboThreadInput } from "@tambo-ai/react";
import { z } from "zod";
import { useInfraStore } from "@/lib/infra-store";
import {
  Globe,
  MapPin,
  CheckCircle2,
  Loader2,
  Search,
  ChevronRight,
} from "lucide-react";

const REGIONS = [
  {
    slug: "nyc1",
    name: "New York City",
    country: "US",
    continent: "North America",
    flag: "🇺🇸",
    features: ["backups", "ipv6", "metadata", "storage", "vpcs"],
  },
  {
    slug: "nyc3",
    name: "New York City 3",
    country: "US",
    continent: "North America",
    flag: "🇺🇸",
    features: ["backups", "ipv6", "metadata", "storage", "vpcs"],
  },
  {
    slug: "ams2",
    name: "Amsterdam 2",
    country: "NL",
    continent: "Europe",
    flag: "🇳🇱",
    features: ["backups", "ipv6", "metadata", "vpcs"],
  },
  {
    slug: "ams3",
    name: "Amsterdam 3",
    country: "NL",
    continent: "Europe",
    flag: "🇳🇱",
    features: ["backups", "ipv6", "metadata", "storage", "vpcs"],
  },
  {
    slug: "sfo1",
    name: "San Francisco",
    country: "US",
    continent: "North America",
    flag: "🇺🇸",
    features: ["backups", "ipv6", "metadata", "vpcs"],
  },
  {
    slug: "sfo2",
    name: "San Francisco 2",
    country: "US",
    continent: "North America",
    flag: "🇺🇸",
    features: ["backups", "ipv6", "metadata", "storage", "vpcs"],
  },
  {
    slug: "sfo3",
    name: "San Francisco 3",
    country: "US",
    continent: "North America",
    flag: "🇺🇸",
    features: ["backups", "ipv6", "metadata", "storage", "vpcs"],
  },
  {
    slug: "sgp1",
    name: "Singapore",
    country: "SG",
    continent: "Asia",
    flag: "🇸🇬",
    features: ["backups", "ipv6", "metadata", "storage", "vpcs"],
  },
  {
    slug: "lon1",
    name: "London",
    country: "GB",
    continent: "Europe",
    flag: "🇬🇧",
    features: ["backups", "ipv6", "metadata", "storage", "vpcs"],
  },
  {
    slug: "fra1",
    name: "Frankfurt",
    country: "DE",
    continent: "Europe",
    flag: "🇩🇪",
    features: ["backups", "ipv6", "metadata", "storage", "vpcs"],
  },
  {
    slug: "tor1",
    name: "Toronto",
    country: "CA",
    continent: "North America",
    flag: "🇨🇦",
    features: ["backups", "ipv6", "metadata", "storage", "vpcs"],
  },
  {
    slug: "blr1",
    name: "Bangalore",
    country: "IN",
    continent: "Asia",
    flag: "🇮🇳",
    features: ["backups", "ipv6", "metadata", "storage", "vpcs"],
  },
  {
    slug: "syd1",
    name: "Sydney",
    country: "AU",
    continent: "Oceania",
    flag: "🇦🇺",
    features: ["backups", "ipv6", "metadata", "storage", "vpcs"],
  },
];

type RegionListProps = {
  selectionMode?: boolean;
  selectedSlug?: string;
};

const RegionList: React.FC<RegionListProps> = (props) => {
  const { selectionMode = false, selectedSlug } = props || {};
  const { setValue, submit: submitMessage } = useTamboThreadInput();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedRegion, setSelectedRegion] = React.useState<string | null>(
    selectedSlug || null
  );
  const [loading, setLoading] = React.useState(false);

  const filteredRegions = React.useMemo(() => {
    const query = searchQuery.toLowerCase();
    return REGIONS.filter(
      (r) =>
        r.name.toLowerCase().includes(query) ||
        r.slug.toLowerCase().includes(query) ||
        r.country.toLowerCase().includes(query) ||
        r.continent.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const groupedByContinent = React.useMemo(() => {
    const groups: Record<string, typeof REGIONS> = {};
    filteredRegions.forEach((r) => {
      if (!groups[r.continent]) groups[r.continent] = [];
      groups[r.continent].push(r);
    });
    return groups;
  }, [filteredRegions]);

  const handleSelect = async (slug: string) => {
    setSelectedRegion(slug);
    if (selectionMode) {
      setLoading(true);
      const region = REGIONS.find((r) => r.slug === slug);
      const message = `[REGION_SELECTED] slug=${slug} name=${region?.name || slug}`;
      setValue(message);
      await submitMessage({ streamResponse: true });
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    setValue("[REGION_LIST_REFRESH] Please list all available regions");
    await submitMessage({ streamResponse: true });
    setLoading(false);
  };

  return (
    <div className="w-full max-w-3xl bg-[#0d1117] border border-gray-700 rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-700 bg-[#161b22]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/20">
              <Globe className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Regions</h3>
              <p className="text-sm text-gray-400">
                {selectionMode
                  ? "Select a region for your droplet"
                  : "Available datacenter locations"}
              </p>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-gray-300 transition-colors disabled:opacity-50"
            title="Refresh regions"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Globe className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Search */}
        <div className="mt-4 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search regions..."
            className="w-full pl-10 pr-4 py-2 bg-[#0d1117] border border-gray-700 rounded-lg text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      <div className="p-4 max-h-[500px] overflow-y-auto">
        {Object.entries(groupedByContinent).map(([continent, regions]) => (
          <div key={continent} className="mb-6 last:mb-0">
            <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3 px-2">
              {continent}
            </h4>
            <div className="grid gap-2">
              {regions.map((region) => {
                const isSelected = selectedRegion === region.slug;
                return (
                  <button
                    key={region.slug}
                    onClick={() => handleSelect(region.slug)}
                    disabled={loading}
                    className={`flex items-center gap-4 p-3 rounded-lg border transition-all text-left ${
                      isSelected
                        ? "border-blue-500 bg-blue-500/10"
                        : "border-gray-700 hover:border-gray-600 hover:bg-gray-800"
                    } disabled:opacity-50`}
                  >
                    <span className="text-2xl">{region.flag}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-100">{region.name}</p>
                        {isSelected && (
                          <CheckCircle2 className="w-4 h-4 text-blue-400" />
                        )}
                      </div>
                      <p className="text-sm text-gray-500">{region.slug}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-1 rounded bg-gray-800 text-gray-400">
                        {region.country}
                      </span>
                      {region.features.includes("storage") && (
                        <span className="text-xs px-2 py-1 rounded bg-blue-500/20 text-blue-400">
                          Storage
                        </span>
                      )}
                    </div>
                    {selectionMode && (
                      <ChevronRight
                        className={`w-4 h-4 transition-colors ${
                          isSelected ? "text-blue-400" : "text-gray-600"
                        }`}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {filteredRegions.length === 0 && (
          <div className="text-center py-8">
            <MapPin className="w-8 h-8 text-gray-600 mx-auto mb-2" />
            <p className="text-gray-500">No regions found matching "{searchQuery}"</p>
          </div>
        )}
      </div>

      {selectionMode && selectedRegion && (
        <div className="px-6 py-4 border-t border-gray-700 bg-[#161b22]">
          <p className="text-sm text-gray-400">
            Selected: <span className="text-white font-medium">{selectedRegion}</span>
          </p>
        </div>
      )}
    </div>
  );
};

export const regionListComponent: TamboComponent = {
  name: "regionList",
  description:
    "Display and select from available DigitalOcean datacenter regions (NYC, AMS, SFO, SGP, LON, FRA, TOR, BLR, SYD). Grouped by continent. Use selectionMode=true when creating a droplet to let user pick a region.",
  component: RegionList,
  propsSchema: z.object({
    selectionMode: z
      .boolean()
      .optional()
      .describe("If true, allows selecting a region and sends to AI"),
    selectedSlug: z.string().optional().describe("Currently selected region slug"),
  }),
};
