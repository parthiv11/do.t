"use client";

import * as React from "react";
import type { TamboComponent } from "@tambo-ai/react";
import { z } from "zod";
import { Globe, CheckCircle2, Copy, Plus, Trash2 } from "lucide-react";

type DnsRecord = {
  id: string;
  type: string;
  name: string;
  data: string;
  ttl: number;
};

type DomainViewProps = {
  domainName?: string;
  records?: DnsRecord[];
  ttl?: number;
};

const DomainView: React.FC<DomainViewProps> = (props) => {
  const { domainName = "example.com", records = [], ttl = 1800 } = props || {};

  return (
    <div className="w-full max-w-2xl bg-[#0d1117] border border-gray-700 rounded-lg overflow-hidden text-gray-100">
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-700 bg-[#161b22]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-green-600 flex items-center justify-center">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">{domainName}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                  <CheckCircle2 className="w-3 h-3" />
                  Active
                </span>
                <span className="text-sm text-gray-400">TTL: {ttl}s</span>
              </div>
            </div>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-md bg-green-600 hover:bg-green-700 text-white text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" />
            Add Record
          </button>
        </div>
      </div>

      {/* Nameservers */}
      <div className="p-6 border-b border-gray-700">
        <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">Nameservers</h3>
        <div className="bg-[#161b22] rounded-lg p-4 space-y-2">
          {["ns1.digitalocean.com", "ns2.digitalocean.com", "ns3.digitalocean.com"].map((ns) => (
            <div key={ns} className="flex items-center justify-between">
              <code className="text-sm font-mono text-gray-300">{ns}</code>
              <button
                onClick={() => navigator.clipboard.writeText(ns)}
                className="p-1 rounded hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* DNS Records */}
      <div className="p-6">
        <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">DNS Records</h3>
        {records.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Globe className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No DNS records yet</p>
          </div>
        ) : (
          <div className="bg-[#161b22] rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="px-4 py-3 text-left text-gray-400 font-medium">Type</th>
                  <th className="px-4 py-3 text-left text-gray-400 font-medium">Name</th>
                  <th className="px-4 py-3 text-left text-gray-400 font-medium">Value</th>
                  <th className="px-4 py-3 text-left text-gray-400 font-medium">TTL</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/50">
                {records.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-800/50">
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded bg-gray-700 text-xs font-medium">{record.type}</span>
                    </td>
                    <td className="px-4 py-3 font-mono text-gray-300">{record.name}</td>
                    <td className="px-4 py-3 font-mono text-gray-300 truncate max-w-[200px]">{record.data}</td>
                    <td className="px-4 py-3 text-gray-400">{record.ttl}s</td>
                    <td className="px-4 py-3">
                      <button className="p-1 rounded hover:bg-red-600/20 text-gray-400 hover:text-red-400 transition-colors">
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
    </div>
  );
};

export const domainViewComponent: TamboComponent = {
  name: "domainView",
  description: "Render a detailed view of a domain with DNS records and nameservers. ALWAYS render this when user asks for domain details.",
  component: DomainView,
  propsSchema: z.object({
    domainName: z.string().optional(),
    records: z.array(z.object({
      id: z.string(),
      type: z.string(),
      name: z.string(),
      data: z.string(),
      ttl: z.number(),
    })).optional(),
    ttl: z.number().optional(),
  }),
};
