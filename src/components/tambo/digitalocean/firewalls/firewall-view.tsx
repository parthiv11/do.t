"use client";

import * as React from "react";
import type { TamboComponent } from "@tambo-ai/react";
import { z } from "zod";
import { Shield, CheckCircle2, Server, Plus, Trash2 } from "lucide-react";

type Rule = {
  protocol: string;
  ports: string;
  sources: string;
};

type FirewallViewProps = {
  firewallId?: string;
  firewallName?: string;
  status?: string;
  inboundRules?: Rule[];
  outboundRules?: Rule[];
  dropletIds?: number[];
  createdAt?: string;
};

const FirewallView: React.FC<FirewallViewProps> = (props) => {
  const {
    firewallId,
    firewallName = "my-firewall",
    status = "active",
    inboundRules = [],
    outboundRules = [],
    dropletIds = [],
    createdAt,
  } = props || {};

  return (
    <div className="w-full max-w-2xl bg-[#0d1117] border border-gray-700 rounded-lg overflow-hidden text-gray-100">
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-700 bg-[#161b22]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-red-600 flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">{firewallName}</h2>
              <div className="flex items-center gap-3 mt-1">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-green-500/20 text-green-400">
                  <CheckCircle2 className="w-4 h-4" />
                  {status}
                </span>
                {firewallId && <span className="text-sm text-gray-400">#{firewallId}</span>}
              </div>
            </div>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" />
            Add Rule
          </button>
        </div>
      </div>

      {/* Inbound Rules */}
      <div className="p-6 border-b border-gray-700">
        <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">
          Inbound Rules ({inboundRules.length})
        </h3>
        {inboundRules.length === 0 ? (
          <div className="text-center py-4 text-gray-500 text-sm">No inbound rules</div>
        ) : (
          <div className="bg-[#161b22] rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="px-4 py-2 text-left text-gray-400 font-medium">Protocol</th>
                  <th className="px-4 py-2 text-left text-gray-400 font-medium">Ports</th>
                  <th className="px-4 py-2 text-left text-gray-400 font-medium">Sources</th>
                  <th className="px-4 py-2"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/50">
                {inboundRules.map((rule, i) => (
                  <tr key={i} className="hover:bg-gray-800/50">
                    <td className="px-4 py-2">
                      <span className="px-2 py-0.5 rounded bg-gray-700 text-xs font-medium uppercase">{rule.protocol}</span>
                    </td>
                    <td className="px-4 py-2 font-mono text-gray-300">{rule.ports}</td>
                    <td className="px-4 py-2 font-mono text-gray-300">{rule.sources}</td>
                    <td className="px-4 py-2">
                      <button className="p-1 rounded hover:bg-red-600/20 text-gray-400 hover:text-red-400">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Outbound Rules */}
      <div className="p-6 border-b border-gray-700">
        <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">
          Outbound Rules ({outboundRules.length})
        </h3>
        {outboundRules.length === 0 ? (
          <div className="text-center py-4 text-gray-500 text-sm">All outbound traffic allowed</div>
        ) : (
          <div className="bg-[#161b22] rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="px-4 py-2 text-left text-gray-400 font-medium">Protocol</th>
                  <th className="px-4 py-2 text-left text-gray-400 font-medium">Ports</th>
                  <th className="px-4 py-2 text-left text-gray-400 font-medium">Destinations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/50">
                {outboundRules.map((rule, i) => (
                  <tr key={i}>
                    <td className="px-4 py-2">
                      <span className="px-2 py-0.5 rounded bg-gray-700 text-xs font-medium uppercase">{rule.protocol}</span>
                    </td>
                    <td className="px-4 py-2 font-mono text-gray-300">{rule.ports}</td>
                    <td className="px-4 py-2 font-mono text-gray-300">{rule.sources}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Attached Droplets */}
      <div className="p-6">
        <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">
          Attached Droplets ({dropletIds.length})
        </h3>
        {dropletIds.length === 0 ? (
          <div className="text-center py-4 text-gray-500 text-sm">No droplets attached</div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {dropletIds.map((id) => (
              <span key={id} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#161b22] text-sm">
                <Server className="w-4 h-4 text-blue-400" />
                Droplet #{id}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-700 bg-[#161b22] flex items-center justify-between">
        {createdAt && <span className="text-sm text-gray-400">Created {new Date(createdAt).toLocaleDateString()}</span>}
        <button className="flex items-center gap-2 px-4 py-2 rounded-md bg-red-600/20 text-red-400 hover:bg-red-600/30 text-sm font-medium transition-colors">
          <Trash2 className="w-4 h-4" />
          Delete
        </button>
      </div>
    </div>
  );
};

export const firewallViewComponent: TamboComponent = {
  name: "firewallView",
  description: "Render a detailed view of a firewall with rules and attached droplets. ALWAYS render this when user asks for firewall details.",
  component: FirewallView,
  propsSchema: z.object({
    firewallId: z.string().optional(),
    firewallName: z.string().optional(),
    status: z.string().optional(),
    inboundRules: z.array(z.object({
      protocol: z.string(),
      ports: z.string(),
      sources: z.string(),
    })).optional(),
    outboundRules: z.array(z.object({
      protocol: z.string(),
      ports: z.string(),
      sources: z.string(),
    })).optional(),
    dropletIds: z.array(z.number()).optional(),
    createdAt: z.string().optional(),
  }),
};
