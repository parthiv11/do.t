"use client";
import { useMcpServers } from "@/components/tambo/mcp-config-modal";
import { MessageThreadFull } from "@/components/tambo/message-thread-full";
import DODashboard from "@/components/ui/do-dashboard";
import { TamboApiKeyInput } from "@/components/tambo-api-key-input";
import { components, tools } from "@/lib/tambo";
import { infraContextHelper } from "@/lib/infra-context-helper";
import { dropletSelectionContextHelper } from "@/lib/droplet-selection-context";
import { usePersistentContextKey } from "@/hooks/usePersistentContextKey";
import { useStoredTamboApiKey } from "@/hooks/use-stored-tambo-api-key";
import { TamboProvider } from "@tambo-ai/react";
import { TamboMcpProvider } from "@tambo-ai/react/mcp";
import { useState, useMemo, useEffect } from "react";
import { PanelLeftIcon, PanelRightIcon } from "lucide-react";

export default function Home() {
  const mcpServers = useMcpServers();
  const [showPanel, setShowPanel] = useState(true);
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const { apiKey: storedApiKey, setApiKey, isReady: apiKeyStorageReady } = useStoredTamboApiKey();
  const contextKey = usePersistentContextKey();

  // Use env var or stored key
  const effectiveApiKey = useMemo(() => {
    return process.env.NEXT_PUBLIC_TAMBO_API_KEY || storedApiKey || "";
  }, [storedApiKey]);

  const apiKeyReady = !!effectiveApiKey;

  // Show API key input when storage is ready but no key is available
  useEffect(() => {
    if (apiKeyStorageReady && !apiKeyReady) {
      setShowApiKeyInput(true);
    }
  }, [apiKeyStorageReady, apiKeyReady]);

  const handleApiKeySubmit = (key: string) => {
    setApiKey(key);
    setShowApiKeyInput(false);
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden relative">
      {/* API Key Input Modal */}
      {showApiKeyInput && !apiKeyReady && (
        <TamboApiKeyInput
          onApiKeySubmit={handleApiKeySubmit}
        />
      )}

      {apiKeyReady ? (
        <TamboProvider
          apiKey={effectiveApiKey}
          tamboUrl={process.env.NEXT_PUBLIC_TAMBO_URL || "https://api.tambo.co"}
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
                <DODashboard className="h-full" apiKeyReady={apiKeyReady} />
              </div>
            </div>
          </TamboMcpProvider>
        </TamboProvider>
      ) : (
        /* Show placeholder when no API key */
        <div className="flex-1 flex items-center justify-center bg-slate-950">
          <div className="text-center">
            <p className="text-slate-400">Waiting for Tambo API key...</p>
          </div>
        </div>
      )}
    </div>
  );
}
