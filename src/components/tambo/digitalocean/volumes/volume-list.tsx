"use client";

import * as React from "react";
import type { TamboComponent } from "@tambo-ai/react";
import { z } from "zod";
import { HardDrive, Loader2, CheckCircle2, RefreshCw, Plus } from "lucide-react";

type VolumeListProps = {
  title?: string;
  volumes?: Array<{
    id: string;
    name: string;
    size: number;
    region: string;
    status: string;
    attachedTo?: string;
  }>;
};

const VolumeList: React.FC<VolumeListProps> = (props) => {
  const { title = "Volumes", volumes = [] } = props || {};

  const [loading, setLoading] = React.useState(false);

  const refresh = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
  };

  return (
    <div className="w-full max-w-2xl bg-[#0d1117] border border-gray-700 rounded-lg overflow-hidden text-gray-100">
      <div className="px-6 py-4 border-b border-gray-700 bg-[#161b22] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-orange-600 flex items-center justify-center">
            <HardDrive className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">{title}</h2>
            <p className="text-sm text-gray-400">{volumes.length} volume{volumes.length !== 1 ? "s" : ""}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => void refresh()} disabled={loading} className="p-2 rounded-md hover:bg-gray-700 disabled:opacity-50 transition-colors">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-md bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" />
            Create
          </button>
        </div>
      </div>

      <div className="divide-y divide-gray-700/50">
        {loading && volumes.length === 0 ? (
          <div className="p-8 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-gray-500 mx-auto" />
          </div>
        ) : volumes.length === 0 ? (
          <div className="p-8 text-center">
            <HardDrive className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Volumes</h3>
            <p className="text-gray-400 text-sm">Create your first block storage volume</p>
          </div>
        ) : (
          volumes.map((volume) => (
            <div key={volume.id} className="px-6 py-4 hover:bg-gray-800/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <HardDrive className="w-5 h-5 text-orange-400" />
                  <div>
                    <div className="font-medium">{volume.name}</div>
                    <div className="text-sm text-gray-400">
                      {volume.size} GB · {volume.region}
                      {volume.attachedTo && <span> · attached to {volume.attachedTo}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                    volume.attachedTo ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400"
                  }`}>
                    <CheckCircle2 className="w-3 h-3" />
                    {volume.attachedTo ? "Attached" : "Available"}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export const volumeListComponent: TamboComponent = {
  name: "volumeList",
  description: "Render a list of block storage volumes. ALWAYS render this when user asks to see/list their volumes.",
  component: VolumeList,
  propsSchema: z.object({
    title: z.string().optional(),
    volumes: z.array(z.object({
      id: z.string(),
      name: z.string(),
      size: z.number(),
      region: z.string(),
      status: z.string(),
      attachedTo: z.string().optional(),
    })).optional(),
  }),
};
