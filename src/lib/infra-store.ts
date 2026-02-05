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
};

type InfraState = {
  droplets: DropletSummary[];
  selectedDropletIds: number[];
  lastRefreshedAt: string | null;
  setDroplets: (droplets: DropletSummary[]) => void;
  setSelectedDropletIds: (ids: number[]) => void;
  clear: () => void;
};

export const useInfraStore = create<InfraState>((set) => ({
  droplets: [],
  selectedDropletIds: [],
  lastRefreshedAt: null,
  setDroplets: (droplets) =>
    set({
      droplets,
      lastRefreshedAt: new Date().toISOString(),
    }),
  setSelectedDropletIds: (ids) => set({ selectedDropletIds: ids }),
  clear: () => set({ droplets: [], selectedDropletIds: [], lastRefreshedAt: null }),
}));
