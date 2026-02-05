"use client";

import * as React from "react";
import type { TamboComponent } from "@tambo-ai/react";
import { z } from "zod";
import { HardDrive, CheckCircle2, Globe, Calendar, Tag, Trash2, Link, Unlink, Loader2, Server } from "lucide-react";

type VolumeViewProps = {
  volumeId?: string;
  volumeName?: string;
  size?: number;
  region?: string;
  filesystem?: string;
  status?: string;
  attachedTo?: string;
  createdAt?: string;
  tags?: string[];
};

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-700/50 last:border-0">
      <div className="flex items-center gap-3 text-gray-400">
        <Icon className="w-4 h-4" />
        <span className="text-sm">{label}</span>
      </div>
      <span className="text-sm font-medium text-white">{value}</span>
    </div>
  );
}

const VolumeView: React.FC<VolumeViewProps> = (props) => {
  const {
    volumeId,
    volumeName = "my-volume",
    size = 100,
    region = "nyc1",
    filesystem = "ext4",
    status = "available",
    attachedTo,
    createdAt,
    tags = [],
  } = props || {};

  const [loading, setLoading] = React.useState(false);
  const [actionFeedback, setActionFeedback] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (actionFeedback) {
      const timer = setTimeout(() => setActionFeedback(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [actionFeedback]);

  const handleAttach = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setActionFeedback("Volume attached");
    setLoading(false);
  };

  const handleDetach = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setActionFeedback("Volume detached");
    setLoading(false);
  };

  const isAttached = !!attachedTo;

  return (
    <div className="w-full max-w-2xl bg-[#0d1117] border border-gray-700 rounded-lg overflow-hidden text-gray-100">
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-700 bg-[#161b22]">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-orange-600 flex items-center justify-center">
              <HardDrive className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">{volumeName}</h2>
              <div className="flex items-center gap-3 mt-1">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${
                  isAttached ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400"
                }`}>
                  <CheckCircle2 className="w-4 h-4" />
                  {isAttached ? "Attached" : "Available"}
                </span>
                <span className="text-sm text-gray-400">{size} GB</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {actionFeedback && (
        <div className="mx-6 mt-4 px-4 py-2 rounded-md bg-green-500/20 text-green-400 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          {actionFeedback}
        </div>
      )}

      {/* Details */}
      <div className="p-6">
        <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">Volume Details</h3>
        <div className="bg-[#161b22] rounded-lg px-4">
          <InfoRow icon={HardDrive} label="Size" value={`${size} GB`} />
          <InfoRow icon={Globe} label="Region" value={region} />
          <InfoRow icon={HardDrive} label="Filesystem" value={filesystem} />
          {volumeId && <InfoRow icon={HardDrive} label="Volume ID" value={volumeId} />}
          {attachedTo && (
            <div className="flex items-center justify-between py-3 border-b border-gray-700/50">
              <div className="flex items-center gap-3 text-gray-400">
                <Server className="w-4 h-4" />
                <span className="text-sm">Attached To</span>
              </div>
              <span className="text-sm font-medium text-green-400">{attachedTo}</span>
            </div>
          )}
          {createdAt && <InfoRow icon={Calendar} label="Created" value={new Date(createdAt).toLocaleDateString()} />}
          {tags.length > 0 && (
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3 text-gray-400">
                <Tag className="w-4 h-4" />
                <span className="text-sm">Tags</span>
              </div>
              <div className="flex gap-1.5 flex-wrap justify-end">
                {tags.map((tag) => (
                  <span key={tag} className="px-2 py-0.5 text-xs rounded bg-gray-700 text-gray-300">{tag}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mount Instructions */}
      <div className="px-6 pb-6">
        <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">Mount Command</h3>
        <div className="bg-[#161b22] rounded-lg p-4">
          <code className="text-xs text-gray-400 font-mono">
            sudo mount -o discard,defaults /dev/disk/by-id/scsi-0DO_Volume_{volumeName} /mnt/{volumeName}
          </code>
        </div>
      </div>

      {/* Actions */}
      <div className="px-6 py-4 border-t border-gray-700 bg-[#161b22] flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {isAttached ? (
            <button
              onClick={() => void handleDetach()}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 rounded-md border border-gray-600 hover:bg-gray-700 text-sm font-medium disabled:opacity-50 transition-colors"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Unlink className="w-4 h-4" />}
              Detach
            </button>
          ) : (
            <button
              onClick={() => void handleAttach()}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 rounded-md border border-gray-600 hover:bg-gray-700 text-sm font-medium disabled:opacity-50 transition-colors"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Link className="w-4 h-4" />}
              Attach
            </button>
          )}
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-md bg-red-600/20 text-red-400 hover:bg-red-600/30 text-sm font-medium transition-colors">
          <Trash2 className="w-4 h-4" />
          Destroy
        </button>
      </div>
    </div>
  );
};

export const volumeViewComponent: TamboComponent = {
  name: "volumeView",
  description: "Render a detailed view of a block storage volume with attach/detach actions. ALWAYS render this when user asks for volume details.",
  component: VolumeView,
  propsSchema: z.object({
    volumeId: z.string().optional(),
    volumeName: z.string().optional(),
    size: z.number().optional(),
    region: z.string().optional(),
    filesystem: z.string().optional(),
    status: z.string().optional(),
    attachedTo: z.string().optional().describe("Droplet name if attached"),
    createdAt: z.string().optional(),
    tags: z.array(z.string()).optional(),
  }),
};
