"use client";

import * as React from "react";
import type { TamboComponent } from "@tambo-ai/react";
import { z } from "zod";
import { Globe, Loader2, RefreshCw, Plus } from "lucide-react";

type DomainListProps = {
  title?: string;
  domains?: Array<{
    name: string;
    recordCount: number;
  }>;
};

const DomainList: React.FC<DomainListProps> = (props) => {
  const { title = "Domains", domains = [] } = props || {};

  const [loading, setLoading] = React.useState(false);

  const refresh = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
  };

  return (
    <div className="w-full max-w-2xl bg-[#0d1117] border border-gray-700 rounded-lg overflow-hidden text-gray-100">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-700 bg-[#161b22] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-green-600 flex items-center justify-center">
            <Globe className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">{title}</h2>
            <p className="text-sm text-gray-400">{domains.length} domain{domains.length !== 1 ? "s" : ""}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => void refresh()} disabled={loading} className="p-2 rounded-md hover:bg-gray-700 disabled:opacity-50 transition-colors">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-md bg-green-600 hover:bg-green-700 text-white text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" />
            Add Domain
          </button>
        </div>
      </div>

      {/* List */}
      <div className="divide-y divide-gray-700/50">
        {loading && domains.length === 0 ? (
          <div className="p-8 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-gray-500 mx-auto" />
          </div>
        ) : domains.length === 0 ? (
          <div className="p-8 text-center">
            <Globe className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Domains</h3>
            <p className="text-gray-400 text-sm">Add your first domain to manage DNS</p>
          </div>
        ) : (
          domains.map((domain) => (
            <div key={domain.name} className="px-6 py-4 hover:bg-gray-800/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-green-400" />
                  <div>
                    <div className="font-medium">{domain.name}</div>
                    <div className="text-sm text-gray-400">{domain.recordCount} records</div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export const domainListComponent: TamboComponent = {
  name: "domainList",
  description: "Render a list of domains. ALWAYS render this when user asks to see/list their domains.",
  component: DomainList,
  propsSchema: z.object({
    title: z.string().optional(),
    domains: z.array(z.object({
      name: z.string(),
      recordCount: z.number(),
    })).optional(),
  }),
};
