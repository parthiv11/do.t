"use client";

import { create } from "zustand";

export type DropletSummary = {
  id: number;
  name: string;
  region: string;
  size: string;
  status: string;
  ipv4?: string;
  tags: string[];
  createdAt?: string;
  price?: number;
};

export type KubernetesClusterSummary = {
  id: string;
  name: string;
  region: string;
  version: string;
  nodeCount: number;
  status: string;
  createdAt?: string;
};

export type DatabaseSummary = {
  id: string;
  name: string;
  engine: string;
  version: string;
  region: string;
  size: string;
  status: string;
  numNodes: number;
  createdAt?: string;
};

export type DomainSummary = {
  name: string;
  ttl: number;
  recordCount: number;
};

export type VolumeSummary = {
  id: string;
  name: string;
  region: string;
  sizeGigabytes: number;
  dropletIds: number[];
  filesystemType: string;
  createdAt?: string;
};

export type FirewallSummary = {
  id: string;
  name: string;
  status: string;
  dropletIds: number[];
  inboundRuleCount: number;
  outboundRuleCount: number;
  createdAt?: string;
};

export type SnapshotSummary = {
  id: string;
  name: string;
  createdAt: string;
  size?: number;
  regions?: string[];
  minDiskSize?: number;
};

export type BackupSummary = {
  id: string;
  name?: string;
  createdAt?: string;
  size?: number;
  dropletId?: number;
};

type InfraState = {
  droplets: DropletSummary[];
  selectedDropletIds: number[];
  kubernetes: KubernetesClusterSummary[];
  databases: DatabaseSummary[];
  domains: DomainSummary[];
  volumes: VolumeSummary[];
  firewalls: FirewallSummary[];
  snapshots: SnapshotSummary[];
  backups: BackupSummary[];
  lastRefreshedAt: string | null;
  setDroplets: (droplets: DropletSummary[]) => void;
  setSelectedDropletIds: (ids: number[]) => void;
  setKubernetes: (clusters: KubernetesClusterSummary[]) => void;
  setDatabases: (databases: DatabaseSummary[]) => void;
  setDomains: (domains: DomainSummary[]) => void;
  setVolumes: (volumes: VolumeSummary[]) => void;
  setFirewalls: (firewalls: FirewallSummary[]) => void;
  setSnapshots: (snapshots: SnapshotSummary[]) => void;
  setBackups: (backups: BackupSummary[]) => void;
  clear: () => void;
};

export const useInfraStore = create<InfraState>((set) => ({
  droplets: [],
  selectedDropletIds: [],
  kubernetes: [],
  databases: [],
  domains: [],
  volumes: [],
  firewalls: [],
  snapshots: [],
  backups: [],
  lastRefreshedAt: null,
  setDroplets: (droplets) =>
    set({
      droplets,
      lastRefreshedAt: new Date().toISOString(),
    }),
  setSelectedDropletIds: (ids) => set({ selectedDropletIds: ids }),
  setKubernetes: (kubernetes) =>
    set({ kubernetes, lastRefreshedAt: new Date().toISOString() }),
  setDatabases: (databases) =>
    set({ databases, lastRefreshedAt: new Date().toISOString() }),
  setDomains: (domains) =>
    set({ domains, lastRefreshedAt: new Date().toISOString() }),
  setVolumes: (volumes) =>
    set({ volumes, lastRefreshedAt: new Date().toISOString() }),
  setFirewalls: (firewalls) =>
    set({ firewalls, lastRefreshedAt: new Date().toISOString() }),
  setSnapshots: (snapshots) =>
    set({ snapshots, lastRefreshedAt: new Date().toISOString() }),
  setBackups: (backups) =>
    set({ backups, lastRefreshedAt: new Date().toISOString() }),
  clear: () =>
    set({
      droplets: [],
      selectedDropletIds: [],
      kubernetes: [],
      databases: [],
      domains: [],
      volumes: [],
      firewalls: [],
      snapshots: [],
      backups: [],
      lastRefreshedAt: null,
    }),
}));
