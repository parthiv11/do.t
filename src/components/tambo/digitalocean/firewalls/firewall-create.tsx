"use client";

import * as React from "react";
import type { TamboComponent } from "@tambo-ai/react";
import { useTamboComponentState } from "@tambo-ai/react";
import { z } from "zod";
import { Shield, Loader2, CheckCircle2, AlertCircle, Plus, Trash2 } from "lucide-react";

type FirewallCreateProps = {
  title?: string;
  defaultName?: string;
};

type Rule = {
  id: string;
  protocol: string;
  ports: string;
  sources: string;
};

const FirewallCreate: React.FC<FirewallCreateProps> = (props) => {
  const { title = "Create Firewall", defaultName = "" } = props || {};

  // Use useTamboComponentState so AI can see and update state
  const [name, setName] = useTamboComponentState("name", defaultName, defaultName);
  const [submitRequested, setSubmitRequested] = useTamboComponentState("submitRequested", false, false);
  const [loading, setLoading] = useTamboComponentState("loading", false, false);
  const [error, setError] = useTamboComponentState<string | null>("error", null, null);
  const [success, setSuccess] = useTamboComponentState("success", false, false);
  const [inboundRules, setInboundRules] = React.useState<Rule[]>([
    { id: "1", protocol: "tcp", ports: "22", sources: "0.0.0.0/0" },
    { id: "2", protocol: "tcp", ports: "80", sources: "0.0.0.0/0" },
    { id: "3", protocol: "tcp", ports: "443", sources: "0.0.0.0/0" },
  ]);

  // Update inboundRules in component state only (not exposed to AI)
  const addRule = () => {
    setInboundRules((prev) => [...prev, { id: Date.now().toString(), protocol: "tcp", ports: "", sources: "0.0.0.0/0" }]);
  };

  const removeRule = (id: string) => {
    setInboundRules((prev) => prev.filter((r) => r.id !== id));
  };

  const updateRule = (id: string, field: keyof Rule, value: string) => {
    setInboundRules((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  };

  // Handle user clicking Create - AI will see submitRequested and call MCP tool
  const handleCreate = () => {
    if (!name?.trim()) {
      setError("Firewall name is required");
      return;
    }
    setError(null);
    setSubmitRequested(true);
  };

  // AI calls this via MCP to set loading state
  const setSubmitting = (value: boolean) => {
    setLoading(value);
  };

  // AI calls this via MCP after successful creation
  const markSuccess = () => {
    setSubmitRequested(false);
    setLoading(false);
    setSuccess(true);
  };

  // AI calls this via MCP on error
  const markError = (message: string) => {
    setSubmitRequested(false);
    setLoading(false);
    setError(message);
  };

  if (success) {
    return (
      <div className="w-full max-w-md bg-[#0d1117] border border-gray-700 rounded-lg overflow-hidden text-gray-100">
        <div className="p-6 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-green-400" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Firewall Created!</h3>
          <p className="text-gray-400">
            <span className="text-white font-medium">{name}</span> with {inboundRules.length} inbound rules.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl bg-[#0d1117] border border-gray-700 rounded-lg overflow-hidden text-gray-100">
      <div className="px-6 py-4 border-b border-gray-700 flex items-center gap-3">
        <div className="w-10 h-10 rounded bg-red-600 flex items-center justify-center">
          <Shield className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">{title}</h2>
          <p className="text-sm text-gray-400">Configure firewall rules</p>
        </div>
      </div>

      {error && (
        <div className="mx-6 mt-4 px-4 py-3 rounded-md bg-red-500/20 text-red-400 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      <div className="p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Firewall Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="my-firewall"
            className="w-full px-4 py-3 rounded-md border border-gray-600 bg-[#161b22] text-white placeholder-gray-500 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium">Inbound Rules</label>
            <button
              onClick={addRule}
              className="flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300"
            >
              <Plus className="w-4 h-4" />
              Add Rule
            </button>
          </div>
          <div className="space-y-2">
            {inboundRules.map((rule) => (
              <div key={rule.id} className="flex items-center gap-2 p-3 bg-[#161b22] rounded-lg">
                <select
                  value={rule.protocol}
                  onChange={(e) => updateRule(rule.id, "protocol", e.target.value)}
                  className="px-2 py-1.5 rounded border border-gray-600 bg-[#0d1117] text-sm"
                >
                  <option value="tcp">TCP</option>
                  <option value="udp">UDP</option>
                  <option value="icmp">ICMP</option>
                </select>
                <input
                  value={rule.ports}
                  onChange={(e) => updateRule(rule.id, "ports", e.target.value)}
                  placeholder="Port(s)"
                  className="flex-1 px-3 py-1.5 rounded border border-gray-600 bg-[#0d1117] text-sm"
                />
                <input
                  value={rule.sources}
                  onChange={(e) => updateRule(rule.id, "sources", e.target.value)}
                  placeholder="Sources"
                  className="flex-1 px-3 py-1.5 rounded border border-gray-600 bg-[#0d1117] text-sm font-mono"
                />
                <button
                  onClick={() => removeRule(rule.id)}
                  className="p-1.5 rounded hover:bg-red-600/20 text-gray-400 hover:text-red-400"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="px-6 py-4 border-t border-gray-700 flex justify-end bg-[#161b22]">
        <button
          onClick={handleCreate}
          disabled={loading || !name?.trim() || submitRequested}
          className="flex items-center gap-2 px-6 py-2.5 rounded-md bg-red-600 hover:bg-red-700 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {submitRequested ? "Waiting for AI..." : "Create Firewall"}
        </button>
      </div>
    </div>
  );
};

export const firewallCreateComponent: TamboComponent = {
  name: "firewallCreate",
  description: "Render a form to create a new firewall with inbound rules. ALWAYS render this when user wants to create a firewall. The AI can see and update form state including name. When submitRequested is true, the AI MUST call the createFirewall MCP tool with the form values (name, inboundRules as array of {protocol, ports, sources}). After calling the tool, set loading=true during the call, then set success=true or error=message based on result.",
  component: FirewallCreate,
  propsSchema: z.object({
    title: z.string().optional(),
    defaultName: z.string().optional(),
  }),
};
