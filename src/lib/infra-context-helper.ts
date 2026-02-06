"use client";

import { useInfraStore } from "@/lib/infra-store";

function formatInfraStateAsMarkdown(): string | null {
  const { droplets, kubernetes, databases, domains, volumes, firewalls, lastRefreshedAt } = useInfraStore.getState();

  const hasAny = droplets.length > 0 || kubernetes.length > 0 || databases.length > 0 || domains.length > 0 || volumes.length > 0 || firewalls.length > 0;

  if (!hasAny) {
    return "Infra: no resources loaded yet. Use listDroplets or MCP tools to fetch.";
  }

  const lines: string[] = [];
  lines.push("Infra (DigitalOcean)");
  if (lastRefreshedAt) {
    lines.push(`Last refreshed: ${lastRefreshedAt}`);
  }

  if (droplets.length > 0) {
    lines.push("");
    lines.push(`Droplets (${droplets.length}):`);
    lines.push("");
    lines.push("| id | name | status | region | size | ipv4 | tags |");
    lines.push("|---:|------|--------|--------|------|------|------|");
    for (const d of droplets) {
      const tags = d.tags.length > 0 ? d.tags.join(",") : "";
      lines.push(
        `| ${d.id} | ${escapePipes(d.name)} | ${escapePipes(d.status)} | ${escapePipes(d.region)} | ${escapePipes(d.size)} | ${escapePipes(d.ipv4 ?? "")} | ${escapePipes(tags)} |`,
      );
    }
  }

  if (kubernetes.length > 0) {
    lines.push("");
    lines.push(`Kubernetes Clusters (${kubernetes.length}):`);
    lines.push("");
    lines.push("| id | name | region | version | nodes | status |");
    lines.push("|---:|------|--------|---------|------:|--------|");
    for (const k of kubernetes) {
      lines.push(`| ${escapePipes(k.id)} | ${escapePipes(k.name)} | ${escapePipes(k.region)} | ${escapePipes(k.version)} | ${k.nodeCount} | ${escapePipes(k.status)} |`);
    }
  }

  if (databases.length > 0) {
    lines.push("");
    lines.push(`Databases (${databases.length}):`);
    lines.push("");
    lines.push("| id | name | engine | region | size | status | nodes |");
    lines.push("|---:|------|--------|--------|------|--------|------:|");
    for (const db of databases) {
      lines.push(`| ${escapePipes(db.id)} | ${escapePipes(db.name)} | ${escapePipes(db.engine)} | ${escapePipes(db.region)} | ${escapePipes(db.size)} | ${escapePipes(db.status)} | ${db.numNodes} |`);
    }
  }

  if (domains.length > 0) {
    lines.push("");
    lines.push(`Domains (${domains.length}):`);
    lines.push("");
    lines.push("| name | ttl | records |");
    lines.push("|------|----:|--------:|");
    for (const d of domains) {
      lines.push(`| ${escapePipes(d.name)} | ${d.ttl} | ${d.recordCount} |`);
    }
  }

  if (volumes.length > 0) {
    lines.push("");
    lines.push(`Volumes (${volumes.length}):`);
    lines.push("");
    lines.push("| id | name | region | size (GB) | filesystem |");
    lines.push("|---:|------|--------|----------:|------------|");
    for (const v of volumes) {
      lines.push(`| ${escapePipes(v.id)} | ${escapePipes(v.name)} | ${escapePipes(v.region)} | ${v.sizeGigabytes} | ${escapePipes(v.filesystemType)} |`);
    }
  }

  if (firewalls.length > 0) {
    lines.push("");
    lines.push(`Firewalls (${firewalls.length}):`);
    lines.push("");
    lines.push("| id | name | status | inbound | outbound | droplets |");
    lines.push("|---:|------|--------|--------:|---------:|---------:|");
    for (const f of firewalls) {
      lines.push(`| ${escapePipes(f.id)} | ${escapePipes(f.name)} | ${escapePipes(f.status)} | ${f.inboundRuleCount} | ${f.outboundRuleCount} | ${f.dropletIds.length} |`);
    }
  }

  lines.push("");
  lines.push("Before creating or deleting: list resources first to confirm current state. After MCP operations, use sync tools to update the dashboard.");

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
