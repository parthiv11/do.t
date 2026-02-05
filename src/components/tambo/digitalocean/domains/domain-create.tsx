"use client";

import * as React from "react";
import type { TamboComponent } from "@tambo-ai/react";
import { useTamboComponentState } from "@tambo-ai/react";
import { z } from "zod";
import { Globe, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

type DomainCreateProps = {
  title?: string;
  defaultName?: string;
  defaultIpAddress?: string;
};

const DomainCreate: React.FC<DomainCreateProps> = (props) => {
  const { title = "Add Domain", defaultName = "", defaultIpAddress = "" } = props || {};

  // Use useTamboComponentState so AI can see and update state
  const [name, setName] = useTamboComponentState("name", defaultName, defaultName);
  const [ipAddress, setIpAddress] = useTamboComponentState("ipAddress", defaultIpAddress, defaultIpAddress);
  const [submitRequested, _setSubmitRequested] = useTamboComponentState("submitRequested", false, false);
  const [loading, setLoading] = useTamboComponentState("loading", false, false);
  const [error, setError] = useTamboComponentState<string | null>("error", null, null);
  const [success, setSuccess] = useTamboComponentState("success", false, false);

  // Handle user clicking Create - calls API directly for dashboard functionality
  const handleCreate = async () => {
    if (!name?.trim()) {
      setError("Domain name is required");
      return;
    }
    setError(null);
    setLoading(true);
    
    try {
      const res = await fetch("/api/digitalocean/domains", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          ipAddress,
        }),
      });
      
      const text = await res.text();
      const body = text ? JSON.parse(text) : null;
      
      if (!res.ok) {
        const errorMsg = body?.error || `Failed (${res.status})`;
        const details = body?.details ? JSON.stringify(body.details) : "";
        throw new Error(details ? `${errorMsg}: ${details}` : errorMsg);
      }
      
      setSuccess(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error adding domain");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="w-full max-w-md bg-[#0d1117] border border-gray-700 rounded-lg overflow-hidden text-gray-100">
        <div className="p-6 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-green-400" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Domain Added!</h3>
          <p className="text-gray-400">
            <span className="text-white font-medium">{name}</span> has been added to your account.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md bg-[#0d1117] border border-gray-700 rounded-lg overflow-hidden text-gray-100">
      <div className="px-6 py-4 border-b border-gray-700 flex items-center gap-3">
        <div className="w-10 h-10 rounded bg-green-600 flex items-center justify-center">
          <Globe className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">{title}</h2>
          <p className="text-sm text-gray-400">Add a domain to manage DNS</p>
        </div>
      </div>

      {error && (
        <div className="mx-6 mt-4 px-4 py-3 rounded-md bg-red-500/20 text-red-400 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      <div className="p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Domain Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="example.com"
            className="w-full px-4 py-3 rounded-md border border-gray-600 bg-[#161b22] text-white placeholder-gray-500 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">IP Address (optional)</label>
          <input
            value={ipAddress}
            onChange={(e) => setIpAddress(e.target.value)}
            placeholder="192.168.1.1"
            className="w-full px-4 py-3 rounded-md border border-gray-600 bg-[#161b22] text-white placeholder-gray-500 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none"
          />
          <p className="mt-1 text-xs text-gray-500">Creates an A record pointing to this IP</p>
        </div>
      </div>

      <div className="px-6 py-4 border-t border-gray-700 flex justify-end bg-[#161b22]">
        <button
          onClick={() => void handleCreate()}
          disabled={loading || !name?.trim()}
          className="flex items-center gap-2 px-6 py-2.5 rounded-md bg-green-600 hover:bg-green-700 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          Add Domain
        </button>
      </div>
    </div>
  );
};

export const domainCreateComponent: TamboComponent = {
  name: "domainCreate",
  description: "Render a form to add a new domain for DNS management. ALWAYS render this when user wants to add a domain. The AI can see and update form state including name, ipAddress. The form calls the API directly when user clicks Create.",
  component: DomainCreate,
  propsSchema: z.object({
    title: z.string().optional(),
    defaultName: z.string().optional(),
    defaultIpAddress: z.string().optional(),
  }),
};
