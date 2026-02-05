"use client";

import { useInfraStore } from "@/lib/infra-store";

function formatInfraStateAsMarkdown(): string | null {
  const { droplets, lastRefreshedAt } = useInfraStore.getState();

  if (!droplets || droplets.length === 0) {
    return "Infra: no droplets loaded yet. Use listDroplets to fetch.";
  }

  const lines: string[] = [];
  lines.push("Infra (DigitalOcean)");
  if (lastRefreshedAt) {
    lines.push(`Last refreshed: ${lastRefreshedAt}`);
  }
  lines.push("");
  lines.push("Droplets:");
  lines.push("");
  lines.push("| id | name | status | region | size | ipv4 | tags |");
  lines.push("|---:|------|--------|--------|------|------|------|");

  for (const d of droplets) {
    const tags = d.tags.length > 0 ? d.tags.join(",") : "";
    lines.push(
      `| ${d.id} | ${escapePipes(d.name)} | ${escapePipes(d.status)} | ${escapePipes(d.region)} | ${escapePipes(d.size)} | ${escapePipes(d.ipv4 ?? "")} | ${escapePipes(tags)} |`,
    );
  }

  lines.push("");
  lines.push("Before creating or deleting: listDroplets first to confirm current state.");

  return lines.join("\n");
}

function escapePipes(value: string): string {
  return value.replaceAll("|", "\\|");
}

export const infraContextHelper = () => {
  try {
    if (typeof window === "undefined") {
      return null;
    }

    return formatInfraStateAsMarkdown();
  } catch (error) {
    console.error("Error in infraContextHelper:", error);
    return null;
  }
};
