"use client";

import { useInfraStore } from "@/lib/infra-store";

export const dropletSelectionContextHelper = () => {
  try {
    if (typeof window === "undefined") {
      return null;
    }

    const { droplets, selectedDropletIds } = useInfraStore.getState();
    if (!droplets || droplets.length === 0) {
      return "No droplets loaded. Use listDroplets to fetch droplets first.";
    }

    const lines: string[] = [];
    if (selectedDropletIds.length > 0) {
      const selected = selectedDropletIds
        .map((id) => droplets.find((d) => d.id === id))
        .filter((d): d is NonNullable<typeof d> => Boolean(d));
      lines.push(`Selected droplets (${selected.length}):`);
      selected.forEach((d) => {
        lines.push(`  - id: ${d.id}, name: "${d.name}", status: ${d.status}`);
      });
      lines.push("");
    }
    lines.push(`Droplets available (${droplets.length}):`);
    droplets.forEach((d) => {
      lines.push(`  - id: ${d.id}, name: "${d.name}", status: ${d.status}, region: ${d.region}, size: ${d.size}`);
    });
    lines.push("");
    lines.push(
      "To act on droplets: use deleteDroplet or rebootDroplet with the id, or select them in the UI and ask me to act on the selection.",
    );

    return lines.join("\n");
  } catch (error) {
    console.error("Error in dropletSelectionContextHelper:", error);
    return null;
  }
};
