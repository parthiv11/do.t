"use client";
import { useMcpServers } from "@/components/tambo/mcp-config-modal";
import { MessageThreadFull } from "@/components/tambo/message-thread-full";
import DODashboard from "@/components/ui/do-dashboard";
import { components, tools } from "@/lib/tambo";
import { infraContextHelper } from "@/lib/infra-context-helper";
import { dropletSelectionContextHelper } from "@/lib/droplet-selection-context";
import { usePersistentContextKey } from "@/hooks/usePersistentContextKey";
import { TamboProvider } from "@tambo-ai/react";
import { TamboMcpProvider, McpServerInfo, MCPTransport } from "@tambo-ai/react/mcp";
import { useState } from "react";
import { PanelLeftIcon, PanelRightIcon } from "lucide-react";

export default function Home() {
  const clientMcpServers = useMcpServers();
  const [showPanel, setShowPanel] = useState(true);
  const contextKey = usePersistentContextKey();

  // Server-side DigitalOcean MCP services from Tambo Cloud
  const doMcpToken = process.env.NEXT_PUBLIC_DO_MCP_TOKEN || "";
  
  const serverSideMcps: McpServerInfo[] = [
    {
      name: "droplets",
      url: "https://droplets.mcp.digitalocean.com/mcp",
      transport: MCPTransport.HTTP,
      serverKey: "droplets",
      customHeaders: doMcpToken ? { Authorization: `Bearer ${doMcpToken}` } : undefined,
    },
    {
      name: "databases",
      url: "https://databases.mcp.digitalocean.com/mcp",
      transport: MCPTransport.HTTP,
      serverKey: "databases",
      customHeaders: doMcpToken ? { Authorization: `Bearer ${doMcpToken}` } : undefined,
    },
    {
      name: "doks",
      url: "https://doks.mcp.digitalocean.com/mcp",
      transport: MCPTransport.HTTP,
      serverKey: "doks",
      customHeaders: doMcpToken ? { Authorization: `Bearer ${doMcpToken}` } : undefined,
    },
    {
      name: "networking",
      url: "https://networking.mcp.digitalocean.com/mcp",
      transport: MCPTransport.HTTP,
      serverKey: "networking",
      customHeaders: doMcpToken ? { Authorization: `Bearer ${doMcpToken}` } : undefined,
    },
    {
      name: "spaces",
      url: "https://spaces.mcp.digitalocean.com/mcp",
      transport: MCPTransport.HTTP,
      serverKey: "spaces",
      customHeaders: doMcpToken ? { Authorization: `Bearer ${doMcpToken}` } : undefined,
    },
    {
      name: "apps",
      url: "https://apps.mcp.digitalocean.com/mcp",
      transport: MCPTransport.HTTP,
      serverKey: "apps",
      customHeaders: doMcpToken ? { Authorization: `Bearer ${doMcpToken}` } : undefined,
    },
    {
      name: "accounts",
      url: "https://accounts.mcp.digitalocean.com/mcp",
      transport: MCPTransport.HTTP,
      serverKey: "accounts",
      customHeaders: doMcpToken ? { Authorization: `Bearer ${doMcpToken}` } : undefined,
    },
    {
      name: "insights",
      url: "https://insights.mcp.digitalocean.com/mcp",
      transport: MCPTransport.HTTP,
      serverKey: "insights",
      customHeaders: doMcpToken ? { Authorization: `Bearer ${doMcpToken}` } : undefined,
    },
    {
      name: "marketplace",
      url: "https://marketplace.mcp.digitalocean.com/mcp",
      transport: MCPTransport.HTTP,
      serverKey: "marketplace",
      customHeaders: doMcpToken ? { Authorization: `Bearer ${doMcpToken}` } : undefined,
    },
  ];

  // Combine server-side and client-side MCP servers
  const mcpServers = [...serverSideMcps, ...clientMcpServers];

  return (
    <div className="h-screen flex flex-col overflow-hidden relative">
      <TamboProvider
        apiKey={process.env.NEXT_PUBLIC_TAMBO_API_KEY!}
        tamboUrl={process.env.NEXT_PUBLIC_TAMBO_URL!}
        components={components}
        tools={tools}
        contextHelpers={{
          infra: infraContextHelper,
          dropletSelection: dropletSelectionContextHelper,
        }}
      >
        <TamboMcpProvider mcpServers={mcpServers}>
          <button
            onClick={() => setShowPanel(!showPanel)}
            className="md:hidden fixed top-4 right-4 z-50 p-2 rounded-lg bg-accent hover:bg-accent/80 shadow-lg border border-border"
            aria-label={showPanel ? "Show chat" : "Show dashboard"}
          >
            {showPanel ? <PanelLeftIcon className="h-5 w-5" /> : <PanelRightIcon className="h-5 w-5" />}
          </button>

          <div className="flex h-full overflow-hidden">
            <div className={`${showPanel ? 'hidden md:flex' : 'flex'} flex-1 overflow-hidden`}>
              {contextKey ? <MessageThreadFull contextKey={contextKey} /> : null}
            </div>

            <div className={`${showPanel ? 'flex' : 'hidden md:flex'} w-full md:w-[60%] overflow-auto`}>
              <DODashboard className="h-full" />
            </div>
          </div>
        </TamboMcpProvider>
      </TamboProvider>
    </div>
  );
}
