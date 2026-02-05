"use client";

import * as React from "react";
import type { TamboComponent } from "@tambo-ai/react";
import { z } from "zod";
import { Shield, Loader2, CheckCircle2, RefreshCw, Plus } from "lucide-react";

type FirewallListProps = {
  title?: string;
  firewalls?: Array<{
    id: string;
    name: string;
    status: string;
    inboundRuleCount: number;
    dropletCount: number;
  }>;
};

const FirewallList: React.FC<FirewallListProps> = (props) => {
  const { title = "Firewalls", firewalls = [] } = props || {};

  const [loading, setLoading] = React.useState(false);

  const refresh = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
  };

  return (
    <div className="w-full max-w-2xl bg-[#0d1117] border border-gray-700 rounded-lg overflow-hidden text-gray-100">
      <div className="px-6 py-4 border-b border-gray-700 bg-[#161b22] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-red-600 flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">{title}</h2>
            <p className="text-sm text-gray-400">{firewalls.length} firewall{firewalls.length !== 1 ? "s" : ""}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => void refresh()} disabled={loading} className="p-2 rounded-md hover:bg-gray-700 disabled:opacity-50 transition-colors">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" />
            Create
          </button>
        </div>
      </div>

      <div className="divide-y divide-gray-700/50">
        {loading && firewalls.length === 0 ? (
          <div className="p-8 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-gray-500 mx-auto" />
          </div>
        ) : firewalls.length === 0 ? (
          <div className="p-8 text-center">
            <Shield className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Firewalls</h3>
            <p className="text-gray-400 text-sm">Create a firewall to protect your resources</p>
          </div>
        ) : (
          firewalls.map((fw) => (
            <div key={fw.id} className="px-6 py-4 hover:bg-gray-800/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-red-400" />
                  <div>
                    <div className="font-medium">{fw.name}</div>
                    <div className="text-sm text-gray-400">
                      {fw.inboundRuleCount} rules · {fw.dropletCount} droplets
                    </div>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                  <CheckCircle2 className="w-3 h-3" />
                  {fw.status}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export const firewallListComponent: TamboComponent = {
  name: "firewallList",
  description: "Render a list of firewalls. ALWAYS render this when user asks to see/list their firewalls.",
  component: FirewallList,
  propsSchema: z.object({
    title: z.string().optional(),
    firewalls: z.array(z.object({
      id: z.string(),
      name: z.string(),
      status: z.string(),
      inboundRuleCount: z.number(),
      dropletCount: z.number(),
    })).optional(),
  }),
};
