"use client";
import { useMcpServers } from "@/components/tambo/mcp-config-modal";
import { MessageThreadFull } from "@/components/tambo/message-thread-full";
import DODashboard from "@/components/ui/do-dashboard";
import { ApiKeyCheck } from "@/components/ApiKeyCheck";
import { components, tools } from "@/lib/tambo";
import { infraContextHelper } from "@/lib/infra-context-helper";
import { dropletSelectionContextHelper } from "@/lib/droplet-selection-context";
import { usePersistentContextKey } from "@/hooks/usePersistentContextKey";
import { TamboProvider } from "@tambo-ai/react";
import { TamboMcpProvider } from "@tambo-ai/react/mcp";
import { useState } from "react";
import { PanelLeftIcon, PanelRightIcon } from "lucide-react";

export default function Home() {
  const mcpServers = useMcpServers();
  const [showPanel, setShowPanel] = useState(true);
  const contextKey = usePersistentContextKey();

  return (
    <ApiKeyCheck>
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

              <div className={`${showPanel ? 'flex' : 'hidden md:flex'} min-h-0 min-w-0 flex-1 md:flex-none md:w-[60%] overflow-hidden`}>
                <DODashboard className="h-full" />
              </div>
            </div>
          </TamboMcpProvider>
        </TamboProvider>
      </div>
    </ApiKeyCheck>
  );
}
