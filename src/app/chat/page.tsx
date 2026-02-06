"use client";
import { MessageThreadFull } from "@/components/tambo/message-thread-full";
import DODashboard from "@/components/ui/do-dashboard";
import { components, tools } from "@/lib/tambo";
import { infraContextHelper } from "@/lib/infra-context-helper";
import { dropletSelectionContextHelper } from "@/lib/droplet-selection-context";
import { usePersistentContextKey } from "@/hooks/usePersistentContextKey";
import { TamboProvider } from "@tambo-ai/react";
import { useState } from "react";
import { PanelLeftIcon, PanelRightIcon } from "lucide-react";

export default function Home() {
  const [showPanel, setShowPanel] = useState(true);
  const contextKey = usePersistentContextKey();

  // MCP servers are configured server-side in Tambo Cloud dashboard
  // No client-side MCP configuration needed

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
      </TamboProvider>
    </div>
  );
}
