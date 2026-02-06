"use client";

import * as React from "react";
import type { TamboComponent } from "@tambo-ai/react";
import { useTamboThreadInput } from "@tambo-ai/react";
import { z } from "zod";
import { useInfraStore } from "@/lib/infra-store";
import {
  HardDrive,
  CheckCircle2,
  Loader2,
  Search,
  ChevronRight,
  Info,
  Tag,
  Calendar,
  Server,
  Disc,
} from "lucide-react";

// Common DigitalOcean images
const BASE_IMAGES = [
  { id: 165626376, slug: "ubuntu-24-10-x64", name: "Ubuntu 24.10", distro: "Ubuntu", type: "base", description: "Latest Ubuntu with kernel 6.x" },
  { id: 165626377, slug: "ubuntu-24-04-x64", name: "Ubuntu 24.04 LTS", distro: "Ubuntu", type: "base", description: "Long-term support Ubuntu" },
  { id: 165626378, slug: "ubuntu-22-04-x64", name: "Ubuntu 22.04 LTS", distro: "Ubuntu", type: "base", description: "Previous LTS release" },
  { id: 165626379, slug: "ubuntu-20-04-x64", name: "Ubuntu 20.04 LTS", distro: "Ubuntu", type: "base", description: "Legacy LTS support" },
  { id: 165626380, slug: "debian-12-x64", name: "Debian 12", distro: "Debian", type: "base", description: "Stable and reliable" },
  { id: 165626381, slug: "debian-11-x64", name: "Debian 11", distro: "Debian", type: "base", description: "Previous stable release" },
  { id: 165626382, slug: "centos-stream-9-x64", name: "CentOS Stream 9", distro: "CentOS", type: "base", description: "Rolling release CentOS" },
  { id: 165626383, slug: "fedora-40-x64", name: "Fedora 40", distro: "Fedora", type: "base", description: "Latest features" },
  { id: 165626384, slug: "almalinux-9-x64", name: "AlmaLinux 9", distro: "AlmaLinux", type: "base", description: "RHEL-compatible" },
  { id: 165626385, slug: "rockylinux-9-x64", name: "Rocky Linux 9", distro: "Rocky Linux", type: "base", description: "RHEL-compatible" },
];

const APP_IMAGES = [
  { id: 165626400, slug: "docker-20-04", name: "Docker", distro: "Ubuntu", type: "app", description: "Docker pre-installed on Ubuntu 20.04" },
  { id: 165626401, slug: "lamp-20-04", name: "LAMP Stack", distro: "Ubuntu", type: "app", description: "Linux, Apache, MySQL, PHP" },
  { id: 165626402, slug: "lemp-20-04", name: "LEMP Stack", distro: "Ubuntu", type: "app", description: "Linux, Nginx, MySQL, PHP" },
  { id: 165626403, slug: "node-20-04", name: "Node.js", distro: "Ubuntu", type: "app", description: "Node.js and npm ready" },
  { id: 165626404, slug: "python-20-04", name: "Python", distro: "Ubuntu", type: "app", description: "Python with pip and virtualenv" },
  { id: 165626405, slug: "ruby-on-rails-20-04", name: "Ruby on Rails", distro: "Ubuntu", type: "app", description: "Rails development ready" },
  { id: 165626406, slug: "wordpress-20-04", name: "WordPress", distro: "Ubuntu", type: "app", description: "WordPress with LAMP stack" },
  { id: 165626407, slug: "ghost-20-04", name: "Ghost", distro: "Ubuntu", type: "app", description: "Ghost blogging platform" },
  { id: 165626408, slug: "mongodb-20-04", name: "MongoDB", distro: "Ubuntu", type: "app", description: "MongoDB database server" },
  { id: 165626409, slug: "mysql-20-04", name: "MySQL", distro: "Ubuntu", type: "app", description: "MySQL database server" },
  { id: 165626410, slug: "postgresql-20-04", name: "PostgreSQL", distro: "Ubuntu", type: "app", description: "PostgreSQL database server" },
  { id: 165626411, slug: "redis-20-04", name: "Redis", distro: "Ubuntu", type: "app", description: "Redis in-memory store" },
  { id: 165626412, slug: "nginx-20-04", name: "Nginx", distro: "Ubuntu", type: "app", description: "Nginx web server" },
];

type ImageListProps = {
  selectionMode?: boolean;
  selectedId?: number;
  showSnapshots?: boolean;
  showBackups?: boolean;
};

const DISTRO_COLORS: Record<string, string> = {
  Ubuntu: "bg-orange-500/20 text-orange-400",
  Debian: "bg-red-500/20 text-red-400",
  CentOS: "bg-purple-500/20 text-purple-400",
  Fedora: "bg-blue-500/20 text-blue-400",
  AlmaLinux: "bg-cyan-500/20 text-cyan-400",
  "Rocky Linux": "bg-green-500/20 text-green-400",
};

const ImageList: React.FC<ImageListProps> = (props) => {
  const { selectionMode = false, selectedId, showSnapshots = true, showBackups = true } = props || {};
  const { setValue, submit: submitMessage } = useTamboThreadInput();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedImage, setSelectedImage] = React.useState<number | null>(selectedId || null);
  const [loading, setLoading] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<"base" | "app" | "snapshots" | "backups">("base");

  const snapshots = useInfraStore((s) => s.snapshots);
  const backups = useInfraStore((s) => s.backups);

  const filteredImages = React.useMemo(() => {
    const query = searchQuery.toLowerCase();

    if (activeTab === "base") {
      return BASE_IMAGES.filter(
        (i) =>
          i.name.toLowerCase().includes(query) ||
          i.slug.toLowerCase().includes(query) ||
          i.distro.toLowerCase().includes(query)
      );
    }

    if (activeTab === "app") {
      return APP_IMAGES.filter(
        (i) =>
          i.name.toLowerCase().includes(query) ||
          i.slug.toLowerCase().includes(query) ||
          i.description.toLowerCase().includes(query)
      );
    }

    if (activeTab === "snapshots" && showSnapshots) {
      return snapshots.filter(
        (s) =>
          s.name.toLowerCase().includes(query) ||
          String(s.id).includes(query)
      );
    }

    if (activeTab === "backups" && showBackups) {
      return backups.filter(
        (b) =>
          b.name?.toLowerCase().includes(query) ||
          String(b.id).includes(query)
      );
    }

    return [];
  }, [searchQuery, activeTab, snapshots, backups, showSnapshots, showBackups]);

  const handleSelect = async (id: number, type: string, name: string) => {
    setSelectedImage(id);
    if (selectionMode) {
      setLoading(true);
      const message = `[IMAGE_SELECTED] id=${id} type=${type} name=${name}`;
      setValue(message);
      await submitMessage({ streamResponse: true });
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    let message = "";
    if (activeTab === "snapshots") {
      message = "[IMAGE_LIST_REFRESH] Please list my snapshots";
    } else if (activeTab === "backups") {
      message = "[IMAGE_LIST_REFRESH] Please list my backups";
    } else {
      message = "[IMAGE_LIST_REFRESH] Please list available images";
    }
    setValue(message);
    await submitMessage({ streamResponse: true });
    setLoading(false);
  };

  const formatDate = (date: string | undefined) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="w-full max-w-3xl bg-[#0d1117] border border-gray-700 rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-700 bg-[#161b22]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/20">
              <Disc className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Images</h3>
              <p className="text-sm text-gray-400">
                {selectionMode
                  ? "Select an image for your droplet"
                  : "Available OS images, snapshots, and backups"}
              </p>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-gray-300 transition-colors disabled:opacity-50"
            title="Refresh images"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Disc className="w-4 h-4" />}
          </button>
        </div>

        {/* Tabs */}
        <div className="mt-4 flex gap-1 p-1 bg-[#0d1117] rounded-lg">
          {[
            { key: "base", label: "Base OS", icon: Server },
            { key: "app", label: "1-Click Apps", icon: HardDrive },
            ...(showSnapshots ? [{ key: "snapshots", label: "Snapshots", icon: Disc }] : []),
            ...(showBackups ? [{ key: "backups", label: "Backups", icon: Calendar }] : []),
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === key
                  ? "bg-blue-600 text-white"
                  : "text-gray-400 hover:text-gray-300 hover:bg-gray-800"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="mt-3 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${activeTab}...`}
            className="w-full pl-10 pr-4 py-2 bg-[#0d1117] border border-gray-700 rounded-lg text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      <div className="p-4 max-h-[500px] overflow-y-auto">
        {activeTab === "base" || activeTab === "app" ? (
          <div className="grid gap-2">
            {filteredImages.map((image: any) => {
              const isSelected = selectedImage === image.id;
              const distroColor = DISTRO_COLORS[image.distro] || "bg-gray-700 text-gray-300";
              return (
                <button
                  key={image.id}
                  onClick={() => handleSelect(image.id, image.type, image.name)}
                  disabled={loading}
                  className={`flex items-center gap-4 p-3 rounded-lg border transition-all text-left ${
                    isSelected
                      ? "border-blue-500 bg-blue-500/10"
                      : "border-gray-700 hover:border-gray-600 hover:bg-gray-800"
                  } disabled:opacity-50`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <p className="font-medium text-gray-100">{image.name}</p>
                      <span className={`text-xs px-2 py-0.5 rounded ${distroColor}`}>
                        {image.distro}
                      </span>
                      {image.type === "app" && (
                        <span className="text-xs px-2 py-0.5 rounded bg-purple-500/20 text-purple-400">
                          App
                        </span>
                      )}
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-blue-400" />}
                    </div>
                    <p className="text-sm text-gray-500">{image.description}</p>
                    <p className="text-xs text-gray-600 mt-1">{image.slug}</p>
                  </div>
                  {selectionMode && (
                    <ChevronRight
                      className={`w-5 h-5 ${isSelected ? "text-blue-400" : "text-gray-600"}`}
                    />
                  )}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="grid gap-2">
            {filteredImages.length > 0 ? (
              filteredImages.map((image: any) => {
                const isSelected = selectedImage === image.id;
                return (
                  <button
                    key={image.id}
                    onClick={() => handleSelect(image.id, activeTab, image.name || `Snapshot ${image.id}`)}
                    disabled={loading}
                    className={`flex items-center gap-4 p-3 rounded-lg border transition-all text-left ${
                      isSelected
                        ? "border-blue-500 bg-blue-500/10"
                        : "border-gray-700 hover:border-gray-600 hover:bg-gray-800"
                    } disabled:opacity-50`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <p className="font-medium text-gray-100">{image.name || `Snapshot ${image.id}`}</p>
                        <span className="text-xs px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400">
                          {activeTab === "snapshots" ? "Snapshot" : "Backup"}
                        </span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-blue-400" />}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>ID: {image.id}</span>
                        {image.createdAt && <span>Created: {formatDate(image.createdAt)}</span>}
                        {image.size && <span>Size: {image.size} GB</span>}
                      </div>
                    </div>
                    {selectionMode && (
                      <ChevronRight
                        className={`w-5 h-5 ${isSelected ? "text-blue-400" : "text-gray-600"}`}
                      />
                    )}
                  </button>
                );
              })
            ) : (
              <div className="text-center py-8">
                <Info className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                <p className="text-gray-500">
                  No {activeTab} found. Create a snapshot first or use a base image.
                </p>
              </div>
            )}
          </div>
        )}

        {filteredImages.length === 0 && (activeTab === "base" || activeTab === "app") && (
          <div className="text-center py-8">
            <Info className="w-8 h-8 text-gray-600 mx-auto mb-2" />
            <p className="text-gray-500">No images found matching "{searchQuery}"</p>
          </div>
        )}
      </div>

      {selectionMode && selectedImage && (
        <div className="px-6 py-4 border-t border-gray-700 bg-[#161b22]">
          <p className="text-sm text-gray-400">
            Selected: <span className="text-white font-medium">{selectedImage}</span>
          </p>
        </div>
      )}
    </div>
  );
};

export const imageListComponent: TamboComponent = {
  name: "imageList",
  description:
    "Display and select from available DigitalOcean images: Base OS (Ubuntu, Debian, CentOS, Fedora, AlmaLinux, Rocky Linux), 1-Click Apps (Docker, LAMP, LEMP, Node.js, Python, Rails, WordPress, Ghost, MongoDB, MySQL, PostgreSQL, Redis, Nginx), Snapshots, and Backups. Use selectionMode=true when creating or rebuilding a droplet.",
  component: ImageList,
  propsSchema: z.object({
    selectionMode: z
      .boolean()
      .optional()
      .describe("If true, allows selecting an image and sends to AI"),
    selectedId: z.number().optional().describe("Currently selected image ID"),
    showSnapshots: z.boolean().optional().describe("Show snapshots tab (default: true)"),
    showBackups: z.boolean().optional().describe("Show backups tab (default: true)"),
  }),
};
