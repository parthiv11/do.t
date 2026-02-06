"use client";

import { z } from "zod";
import { useInfraStore } from "@/lib/infra-store";

/**
 * Sync tools allow the AI to push MCP results into the Zustand infra store,
 * keeping the DO dashboard in sync with data fetched via MCP servers.
 *
 * Flow: User asks question → AI calls MCP tool → gets results →
 *       AI calls sync tool → Zustand store updates → Dashboard re-renders
 */

const syncKubernetes = (params: {
  clusters: Array<{
    id: string;
    name: string;
    region: string;
    version: string;
    nodeCount: number;
    status: string;
    createdAt?: string;
  }>;
}) => {
  useInfraStore.getState().setKubernetes(params.clusters);
  return {
    success: true,
    message: `Synced ${params.clusters.length} Kubernetes cluster(s) to dashboard.`,
  };
};

const syncDatabases = (params: {
  databases: Array<{
    id: string;
    name: string;
    engine: string;
    version: string;
    region: string;
    size: string;
    status: string;
    numNodes: number;
    createdAt?: string;
  }>;
}) => {
  useInfraStore.getState().setDatabases(params.databases);
  return {
    success: true,
    message: `Synced ${params.databases.length} database(s) to dashboard.`,
  };
};

const syncDomains = (params: {
  domains: Array<{
    name: string;
    ttl: number;
    recordCount: number;
  }>;
}) => {
  useInfraStore.getState().setDomains(params.domains);
  return {
    success: true,
    message: `Synced ${params.domains.length} domain(s) to dashboard.`,
  };
};

const syncVolumes = (params: {
  volumes: Array<{
    id: string;
    name: string;
    region: string;
    sizeGigabytes: number;
    dropletIds: number[];
    filesystemType: string;
    createdAt?: string;
  }>;
}) => {
  useInfraStore.getState().setVolumes(params.volumes);
  return {
    success: true,
    message: `Synced ${params.volumes.length} volume(s) to dashboard.`,
  };
};

const syncFirewalls = (params: {
  firewalls: Array<{
    id: string;
    name: string;
    status: string;
    dropletIds: number[];
    inboundRuleCount: number;
    outboundRuleCount: number;
    createdAt?: string;
  }>;
}) => {
  useInfraStore.getState().setFirewalls(params.firewalls);
  return {
    success: true,
    message: `Synced ${params.firewalls.length} firewall(s) to dashboard.`,
  };
};

const syncResultSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

export const syncKubernetesTool = {
  name: "syncKubernetes",
  description:
    "Sync Kubernetes cluster data into the dashboard. ALWAYS call this after fetching clusters from MCP to keep the dashboard up to date.",
  tool: syncKubernetes,
  toolSchema: z
    .function()
    .args(
      z.object({
        clusters: z.array(
          z.object({
            id: z.string(),
            name: z.string(),
            region: z.string(),
            version: z.string(),
            nodeCount: z.number(),
            status: z.string(),
            createdAt: z.string().optional(),
          }),
        ),
      }),
    )
    .returns(syncResultSchema),
};

export const syncDatabasesTool = {
  name: "syncDatabases",
  description:
    "Sync managed database data into the dashboard. ALWAYS call this after fetching databases from MCP to keep the dashboard up to date.",
  tool: syncDatabases,
  toolSchema: z
    .function()
    .args(
      z.object({
        databases: z.array(
          z.object({
            id: z.string(),
            name: z.string(),
            engine: z.string(),
            version: z.string(),
            region: z.string(),
            size: z.string(),
            status: z.string(),
            numNodes: z.number(),
            createdAt: z.string().optional(),
          }),
        ),
      }),
    )
    .returns(syncResultSchema),
};

export const syncDomainsTool = {
  name: "syncDomains",
  description:
    "Sync domain data into the dashboard. ALWAYS call this after fetching domains from MCP to keep the dashboard up to date.",
  tool: syncDomains,
  toolSchema: z
    .function()
    .args(
      z.object({
        domains: z.array(
          z.object({
            name: z.string(),
            ttl: z.number(),
            recordCount: z.number(),
          }),
        ),
      }),
    )
    .returns(syncResultSchema),
};

export const syncVolumesTool = {
  name: "syncVolumes",
  description:
    "Sync block storage volume data into the dashboard. ALWAYS call this after fetching volumes from MCP to keep the dashboard up to date.",
  tool: syncVolumes,
  toolSchema: z
    .function()
    .args(
      z.object({
        volumes: z.array(
          z.object({
            id: z.string(),
            name: z.string(),
            region: z.string(),
            sizeGigabytes: z.number(),
            dropletIds: z.array(z.number()),
            filesystemType: z.string(),
            createdAt: z.string().optional(),
          }),
        ),
      }),
    )
    .returns(syncResultSchema),
};

export const syncFirewallsTool = {
  name: "syncFirewalls",
  description:
    "Sync firewall data into the dashboard. ALWAYS call this after fetching firewalls from MCP to keep the dashboard up to date.",
  tool: syncFirewalls,
  toolSchema: z
    .function()
    .args(
      z.object({
        firewalls: z.array(
          z.object({
            id: z.string(),
            name: z.string(),
            status: z.string(),
            dropletIds: z.array(z.number()),
            inboundRuleCount: z.number(),
            outboundRuleCount: z.number(),
            createdAt: z.string().optional(),
          }),
        ),
      }),
    )
    .returns(syncResultSchema),
};

export const syncTools = [
  syncKubernetesTool,
  syncDatabasesTool,
  syncDomainsTool,
  syncVolumesTool,
  syncFirewallsTool,
];
