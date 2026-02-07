"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "do.t_tambo_api_key_v1";

export function useStoredTamboApiKey() {
  const [apiKey, setApiKeyState] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Check localStorage on mount
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setApiKeyState(stored);
      }
      setIsReady(true);
    }
  }, []);

  const setApiKey = useCallback((key: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, key.trim());
      setApiKeyState(key.trim());
    }
  }, []);

  const clearApiKey = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
      setApiKeyState(null);
    }
  }, []);

  return {
    apiKey,
    setApiKey,
    clearApiKey,
    isReady,
    hasApiKey: !!apiKey,
  };
}

export function getStoredTamboApiKey(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STORAGE_KEY);
}
