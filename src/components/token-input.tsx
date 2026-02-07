"use client";

import * as React from "react";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/theme-provider";
import { Shield, AlertTriangle, Eye, EyeOff, Key, CheckCircle2, X } from "lucide-react";

interface TokenInputProps {
  onTokenSubmit: (token: string) => void;
  onClose?: () => void;
}

export function TokenInput({ onTokenSubmit, onClose }: TokenInputProps) {
  const [token, setToken] = useState("");
  const [showToken, setShowToken] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  // Validate token format - useMemo instead of useEffect to avoid setState in effect
  const isValid = useMemo(() => {
    return token.length >= 32 && /^[a-zA-Z0-9_-]+$/.test(token);
  }, [token]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValid && agreed) {
      onTokenSubmit(token.trim());
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
        {/* Warning Header */}
        <div className={cn(
          "px-6 py-4 border-b flex items-center gap-3",
          isDark ? "border-amber-500/30 bg-amber-500/10" : "border-amber-200 bg-amber-50"
        )}>
          <AlertTriangle className={cn(
            "w-5 h-5 flex-shrink-0",
            isDark ? "text-amber-400" : "text-amber-600"
          )} />
          <div>
            <h2 className={cn(
              "font-semibold text-sm",
              isDark ? "text-amber-400" : "text-amber-700"
            )}>Security Notice</h2>
            <p className={cn(
              "text-xs",
              isDark ? "text-amber-400/80" : "text-amber-600"
            )}>Please read carefully before proceeding</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Security Warnings */}
          <div className={cn(
            "rounded-lg p-4 text-sm space-y-2",
            isDark ? "bg-slate-800/50 text-slate-300" : "bg-gray-50 text-gray-600"
          )}>
            <div className="flex items-start gap-2">
              <Shield className={cn(
                "w-4 h-4 mt-0.5 flex-shrink-0",
                isDark ? "text-emerald-400" : "text-emerald-600"
              )} />
              <span>Your token is stored <strong>only in your browser</strong> (localStorage) and never on our servers.</span>
            </div>
            <div className="flex items-start gap-2">
              <Shield className={cn(
                "w-4 h-4 mt-0.5 flex-shrink-0",
                isDark ? "text-emerald-400" : "text-emerald-600"
              )} />
              <span>All API requests are made directly from your browser to DigitalOcean.</span>
            </div>
            <div className="flex items-start gap-2">
              <AlertTriangle className={cn(
                "w-4 h-4 mt-0.5 flex-shrink-0",
                isDark ? "text-rose-400" : "text-rose-600"
              )} />
              <span>This token grants access to your DigitalOcean account. Keep it secure!</span>
            </div>
            <div className="flex items-start gap-2">
              <AlertTriangle className={cn(
                "w-4 h-4 mt-0.5 flex-shrink-0",
                isDark ? "text-rose-400" : "text-rose-600"
              )} />
              <span>Anyone with this token can create/delete resources in your account.</span>
            </div>
          </div>

          {/* Token Input */}
          <div>
            <label className={cn(
              "block text-sm font-medium mb-2",
              isDark ? "text-slate-200" : "text-gray-700"
            )}>
              DigitalOcean API Token
            </label>
            <div className="relative">
              <Key className={cn(
                "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4",
                isDark ? "text-slate-500" : "text-gray-400"
              )} />
              <input
                type={showToken ? "text" : "password"}
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="dop_v1_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                className={cn(
                  "w-full pl-10 pr-10 py-3 rounded-lg border outline-none focus:ring-2 font-mono text-sm",
                  isDark
                    ? "bg-slate-800 border-slate-600 text-slate-200 placeholder-slate-500 focus:border-blue-500 focus:ring-blue-500/20"
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20"
                )}
              />
              <button
                type="button"
                onClick={() => setShowToken(!showToken)}
                className={cn(
                  "absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded",
                  isDark ? "text-slate-500 hover:text-slate-300" : "text-gray-400 hover:text-gray-600"
                )}
              >
                {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {token && !isValid && (
              <p className={cn(
                "mt-1.5 text-xs flex items-center gap-1",
                isDark ? "text-rose-400" : "text-rose-600"
              )}>
                <X className="w-3 h-3" />
                Token should be at least 32 characters and alphanumeric
              </p>
            )}
            {isValid && (
              <p className={cn(
                "mt-1.5 text-xs flex items-center gap-1",
                isDark ? "text-emerald-400" : "text-emerald-600"
              )}>
                <CheckCircle2 className="w-3 h-3" />
                Token format looks valid
              </p>
            )}
          </div>

          {/* Agreement Checkbox */}
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className={cn(
                "mt-0.5 w-4 h-4 rounded border",
                isDark
                  ? "border-slate-600 bg-slate-800 checked:bg-blue-600"
                  : "border-gray-300 bg-white checked:bg-blue-600"
              )}
            />
            <span className={cn(
              "text-sm",
              isDark ? "text-slate-300" : "text-gray-600"
            )}>
              I understand the security risks and agree that my token will be stored in my browser&apos;s localStorage. I can revoke this token anytime from my DigitalOcean dashboard.
            </span>
          </label>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className={cn(
                  "px-4 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isDark
                    ? "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                )}
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={!isValid || !agreed}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all",
                isValid && agreed
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : isDark
                    ? "bg-slate-700 text-slate-500 cursor-not-allowed"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
              )}
            >
              <Shield className="w-4 h-4" />
              Save Token & Continue
            </button>
          </div>

          {/* Get Token Link */}
          <p className={cn(
            "text-xs text-center",
            isDark ? "text-slate-500" : "text-gray-500"
          )}>
            Don&apos;t have a token?{" "}
            <a
              href="https://cloud.digitalocean.com/account/api/tokens"
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "underline hover:no-underline",
                isDark ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-700"
              )}
            >
              Create one in your DigitalOcean dashboard
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}

// Hook to manage token in localStorage
const TOKEN_KEY = "do.t_token_v1";

export function useStoredToken() {
  const [token, setTokenState] = React.useState<string | null>(null);
  const [isReady, setIsReady] = React.useState(false);

  React.useEffect(() => {
    const stored = localStorage.getItem(TOKEN_KEY);
    setTokenState(stored);
    setIsReady(true);
  }, []);

  const setToken = React.useCallback((newToken: string | null) => {
    if (newToken) {
      localStorage.setItem(TOKEN_KEY, newToken);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
    setTokenState(newToken);
  }, []);

  const clearToken = React.useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setTokenState(null);
  }, []);

  return { token, setToken, clearToken, isReady };
}

// Helper to get token for API calls
export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}
