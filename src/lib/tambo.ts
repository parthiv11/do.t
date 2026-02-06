/**
 * @file tambo.ts
 * @description Central configuration file for Tambo components and tools
 *
 * This file serves as the central place to register your Tambo components and tools.
 * It exports arrays that will be used by the TamboProvider.
 *
 * Read more about Tambo at https://tambo.co/docs
 */

import type { TamboComponent } from "@tambo-ai/react";
import { TamboTool } from "@tambo-ai/react";
import { digitalOceanTools } from "@/tools/digitalocean-tools";
import { syncTools } from "@/tools/sync-tools";
import {
  // Droplets
  dropletCreateComponent,
  dropletDeleteComponent,
  dropletRebootComponent,
  dropletViewComponent,
  dropletListComponent,
  // Kubernetes
  clusterCreateComponent,
  clusterDeleteComponent,
  clusterViewComponent,
  clusterListComponent,
  // Databases
  databaseCreateComponent,
  databaseDeleteComponent,
  databaseViewComponent,
  databaseListComponent,
  // Domains
  domainCreateComponent,
  domainDeleteComponent,
  domainViewComponent,
  domainListComponent,
  // Volumes
  volumeCreateComponent,
  volumeDeleteComponent,
  volumeViewComponent,
  volumeListComponent,
  // Firewalls
  firewallCreateComponent,
  firewallDeleteComponent,
  firewallViewComponent,
  firewallListComponent,
} from "@/components/tambo/digitalocean";

/**
 * tools
 *
 * This array contains all the Tambo tools that are registered for use within the application.
 * Each tool is defined with its name, description, and expected props. The tools
 * can be controlled by AI to dynamically interact with DigitalOcean infrastructure.
 */

export const tools: TamboTool[] = [
  // Local API tools temporarily disabled - using MCP only
  // ...digitalOceanTools,
  ...syncTools,
];

/**
 * components
 *
 * This array contains all the Tambo components that are registered for use within the application.
 */
export const components: TamboComponent[] = [
  // Droplets
  dropletCreateComponent,
  dropletDeleteComponent,
  dropletRebootComponent,
  dropletViewComponent,
  dropletListComponent,
  // Kubernetes
  clusterCreateComponent,
  clusterDeleteComponent,
  clusterViewComponent,
  clusterListComponent,
  // Databases
  databaseCreateComponent,
  databaseDeleteComponent,
  databaseViewComponent,
  databaseListComponent,
  // Domains
  domainCreateComponent,
  domainDeleteComponent,
  domainViewComponent,
  domainListComponent,
  // Volumes
  volumeCreateComponent,
  volumeDeleteComponent,
  volumeViewComponent,
  volumeListComponent,
  // Firewalls
  firewallCreateComponent,
  firewallDeleteComponent,
  firewallViewComponent,
  firewallListComponent,
];
