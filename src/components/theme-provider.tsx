"use client";

import * as React from "react";

const ThemeContext = React.createContext<{
  theme: "light" | "dark" | "system";
  setTheme: (theme: "light" | "dark" | "system") => void;
  resolvedTheme: "light" | "dark";
}>({
  theme: "system",
  setTheme: () => {},
  resolvedTheme: "dark",
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = React.useState<"light" | "dark" | "system">("dark");
  const [resolvedTheme, setResolvedTheme] = React.useState<"light" | "dark">("dark");

  const applyTheme = React.useCallback((t: "light" | "dark" | "system") => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    
    if (t === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      root.classList.add(systemTheme);
      setResolvedTheme(systemTheme);
    } else {
      root.classList.add(t);
      setResolvedTheme(t);
    }
  }, []);

  const setTheme = React.useCallback((newTheme: "light" | "dark" | "system") => {
    setThemeState(newTheme);
    localStorage.setItem("chatfirst-theme", newTheme);
    applyTheme(newTheme);
  }, [applyTheme]);

  React.useEffect(() => {
    const saved = localStorage.getItem("chatfirst-theme") as "light" | "dark" | "system" | null;
    const initialTheme = saved || "dark";
    setThemeState(initialTheme);
    applyTheme(initialTheme);

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (theme === "system") {
        applyTheme("system");
      }
    };
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [applyTheme, theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => React.useContext(ThemeContext);
