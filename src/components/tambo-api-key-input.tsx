"use client";

import * as React from "react";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/theme-provider";
import { Key, AlertTriangle, Eye, EyeOff, CheckCircle2, X, Sparkles } from "lucide-react";

interface TamboApiKeyInputProps {
  onApiKeySubmit: (apiKey: string) => void;
  onClose?: () => void;
}

export function TamboApiKeyInput({ onApiKeySubmit, onClose }: TamboApiKeyInputProps) {
  const [apiKey, setApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  // Tambo API keys start with "tambo_" and are typically longer
  const isValid = useMemo(() => {
    return apiKey.length >= 20 && /^tambo_[a-zA-Z0-9_-]+$/.test(apiKey);
  }, [apiKey]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValid && agreed) {
      onApiKeySubmit(apiKey.trim());
    }
  };

  return (
    <div className={cn(
      "fixed inset-0 z-50 flex items-center justify-center p-4",
      isDark ? "bg-slate-950/80" : "bg-gray-900/50"
    )}>
      <div className={cn(
        "relative w-full max-w-md rounded-2xl border shadow-2xl overflow-hidden",
        isDark 
          ? "bg-slate-900 border-slate-700" 
          : "bg-white border-gray-200"
      )}>
        {/* Header */}
        <div className={cn(
          "px-6 py-4 border-b flex items-center gap-3",
          isDark ? "border-indigo-500/30 bg-indigo-500/10" : "border-indigo-200 bg-indigo-50"
        )}>
          <Sparkles className={cn(
            "w-5 h-5",
            isDark ? "text-indigo-400" : "text-indigo-600"
          )} />
          <div>
            <h2 className={cn(
              "text-lg font-semibold",
              isDark ? "text-slate-100" : "text-gray-900"
            )}>Tambo API Key Required</h2>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className={cn(
                "ml-auto p-2 rounded-lg transition-colors",
                isDark ? "hover:bg-slate-800 text-slate-400" : "hover:bg-gray-100 text-gray-500"
              )}
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Info */}
          <p className={cn(
            "text-sm",
            isDark ? "text-slate-400" : "text-gray-600"
          )}>
            To use the AI features, you need a Tambo API key. Your key will be stored only in your browser&apos;s localStorage.
          </p>

          {/* API Key Input */}
          <div className="space-y-2">
            <label className={cn(
              "text-sm font-medium",
              isDark ? "text-slate-300" : "text-gray-700"
            )}>
              API Key
            </label>
            <div className="relative">
              <Key className={cn(
                "absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5",
                isDark ? "text-slate-500" : "text-gray-400"
              )} />
              <input
                type={showApiKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="tambo_..."
                className={cn(
                  "w-full pl-10 pr-12 py-3 rounded-lg border text-sm transition-colors",
                  isDark 
                    ? "bg-slate-800/50 border-slate-700 text-slate-200 placeholder:text-slate-500 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30"
                    : "bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                )}
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className={cn(
                  "absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-md transition-colors",
                  isDark ? "hover:bg-slate-700 text-slate-400" : "hover:bg-gray-200 text-gray-500"
                )}
              >
                {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {apiKey && !isValid && (
              <p className={cn(
                "text-xs flex items-center gap-1.5",
                isDark ? "text-rose-400" : "text-rose-600"
              )}>
                <AlertTriangle className="w-3.5 h-3.5" />
                Key should start with &quot;tambo_&quot; and be at least 20 characters
              </p>
            )}
          </div>

          {/* Agreement */}
          <label className={cn(
            "flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors",
            isDark 
              ? "bg-slate-800/30 border-slate-700 hover:bg-slate-800/50"
              : "bg-gray-50 border-gray-200 hover:bg-gray-100"
          )}>
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className={cn(
              "text-xs leading-relaxed",
              isDark ? "text-slate-400" : "text-gray-600"
            )}>
              I understand this key grants access to AI features and will be stored in my browser&apos;s localStorage. I can clear it anytime.
            </span>
          </label>

          {/* Actions */}
          <button
            type="submit"
            disabled={!isValid || !agreed}
            className={cn(
              "w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all",
              !isValid || !agreed
                ? isDark 
                  ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
                : isDark
                  ? "bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30 border border-indigo-500/30"
                  : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border border-indigo-200"
            )}
          >
            <CheckCircle2 className="w-4 h-4" />
            Save API Key & Continue
          </button>

          {/* Help link */}
          <p className={cn(
            "text-xs text-center",
            isDark ? "text-slate-500" : "text-gray-500"
          )}>
            Don&apos;t have a key?{" "}
            <a 
              href="https://tambo.co/cli-auth" 
              target="_blank" 
              rel="noopener noreferrer"
              className={cn(
                "underline hover:no-underline",
                isDark ? "text-indigo-400 hover:text-indigo-300" : "text-indigo-600 hover:text-indigo-500"
              )}
            >
              Get one from Tambo
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}
