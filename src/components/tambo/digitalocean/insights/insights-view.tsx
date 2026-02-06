"use client";

import * as React from "react";
import type { TamboComponent } from "@tambo-ai/react";
import { useTamboComponentState, useTamboThreadInput } from "@tambo-ai/react";
import { z } from "zod";
import {
  BarChart3,
  Activity,
  Cpu,
  HardDrive,
  Globe,
  Clock,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Download,
  Filter,
  Server,
  Database,
  Droplets,
  Zap,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";

type InsightsViewProps = {
  resourceType?: "droplet" | "database" | "kubernetes" | "spaces" | "overview";
  resourceId?: string;
  resourceName?: string;
  timeRange?: "1h" | "24h" | "7d" | "30d";
};

type Metric = {
  name: string;
  value: number;
  unit: string;
  trend: "up" | "down" | "flat";
  change: number;
  timestamp: string;
};

type Alert = {
  id: string;
  severity: "critical" | "warning" | "info";
  message: string;
  timestamp: string;
  resolved: boolean;
};

const InsightsView: React.FC<InsightsViewProps> = (props) => {
  const {
    resourceType = "overview",
    resourceId,
    resourceName,
    timeRange = "24h",
  } = props || {};

  // Tambo state for AI visibility
  const [metrics, setMetrics] = useTamboComponentState<Metric[]>("metrics", [
    { name: "CPU Usage", value: 45.2, unit: "%", trend: "up", change: 5.3, timestamp: new Date().toISOString() },
    { name: "Memory", value: 68.5, unit: "%", trend: "flat", change: 0, timestamp: new Date().toISOString() },
    { name: "Disk I/O", value: 23.1, unit: "MB/s", trend: "down", change: -12.4, timestamp: new Date().toISOString() },
    { name: "Network In", value: 156.3, unit: "KB/s", trend: "up", change: 23.1, timestamp: new Date().toISOString() },
    { name: "Network Out", value: 89.7, unit: "KB/s", trend: "flat", change: 2.1, timestamp: new Date().toISOString() },
  ]);
  const [alerts, setAlerts] = useTamboComponentState<Alert[]>("alerts", [
    { id: "1", severity: "warning", message: "High CPU usage detected on droplet-01", timestamp: new Date().toISOString(), resolved: false },
    { id: "2", severity: "info", message: "Database backup completed successfully", timestamp: new Date(Date.now() - 3600000).toISOString(), resolved: true },
  ]);
  const [selectedTimeRange, setSelectedTimeRange] = useTamboComponentState("selectedTimeRange", timeRange);
  const [loading, setLoading] = useTamboComponentState("loading", false);
  const [showResolvedAlerts, setShowResolvedAlerts] = useTamboComponentState("showResolvedAlerts", false);

  const { setValue, submit: submitMessage } = useTamboThreadInput();

  const handleRefresh = async () => {
    setLoading(true);
    
    // Send message to AI to fetch fresh metrics via MCP
    const resourceDesc = resourceType === "overview" 
      ? "account overview" 
      : `${resourceType} "${resourceName || resourceId}"`;
    
    setValue(`[FORM_SUBMITTED] Refresh insights/monitoring data for ${resourceDesc} over ${selectedTimeRange}. Please fetch latest metrics via MCP and update the dashboard.`);
    await submitMessage({ streamResponse: true });
    
    setLoading(false);
  };

  const handleExport = () => {
    const data = {
      resourceType,
      resourceId,
      resourceName,
      timeRange: selectedTimeRange,
      metrics,
      alerts,
      exportedAt: new Date().toISOString(),
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `insights-${resourceType}-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getResourceIcon = () => {
    switch (resourceType) {
      case "droplet": return Server;
      case "database": return Database;
      case "kubernetes": return Droplets;
      case "spaces": return HardDrive;
      default: return Activity;
    }
  };

  const ResourceIcon = getResourceIcon();

  return (
    <div className="w-full max-w-4xl bg-[#0d1117] border border-gray-700 rounded-lg overflow-hidden text-gray-100">
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-700 bg-[#161b22]">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-emerald-600 flex items-center justify-center">
              <ResourceIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold capitalize">
                {resourceType === "overview" ? "Account Overview" : `${resourceType} Insights`}
              </h2>
              {resourceName && (
                <p className="text-sm text-gray-400 mt-1">{resourceName}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value as typeof timeRange)}
              className="px-3 py-2 rounded-md bg-[#0d1117] border border-gray-700 text-sm text-white focus:outline-none focus:border-blue-500"
            >
              <option value="1h">Last 1 hour</option>
              <option value="24h">Last 24 hours</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
            </select>
            <button
              onClick={() => void handleRefresh()}
              disabled={loading}
              className="p-2 rounded hover:bg-gray-700 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
              title="Refresh"
            >
              <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
            </button>
            <button
              onClick={handleExport}
              className="p-2 rounded hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
              title="Export data"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Alerts Section */}
      {alerts?.some(a => !a.resolved) && (
        <div className="px-6 py-4 border-b border-gray-700 bg-[#161b22]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Active Alerts ({alerts?.filter(a => !a.resolved).length})
            </h3>
            <button
              onClick={() => setShowResolvedAlerts(!showResolvedAlerts)}
              className="text-xs text-blue-400 hover:text-blue-300"
            >
              {showResolvedAlerts ? "Hide resolved" : "Show resolved"}
            </button>
          </div>
          <div className="space-y-2">
            {alerts?.filter(a => showResolvedAlerts || !a.resolved).map((alert) => (
                <div
                  key={alert.id}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg text-sm",
                    alert.severity === "critical" && "bg-red-500/10 border border-red-500/20 text-red-400",
                    alert.severity === "warning" && "bg-yellow-500/10 border border-yellow-500/20 text-yellow-400",
                    alert.severity === "info" && "bg-blue-500/10 border border-blue-500/20 text-blue-400",
                    alert.resolved && "opacity-50"
                  )}
                >
                  {alert.severity === "critical" && <AlertTriangle className="w-4 h-4 flex-shrink-0" />}
                  {alert.severity === "warning" && <AlertTriangle className="w-4 h-4 flex-shrink-0" />}
                  {alert.severity === "info" && <CheckCircle2 className="w-4 h-4 flex-shrink-0" />}
                  <span className={cn(alert.resolved && "line-through")}>{alert.message}</span>
                  <span className="text-xs opacity-70 ml-auto">
                    {new Date(alert.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="p-6">
        <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
          <BarChart3 className="w-4 h-4" />
          Performance Metrics
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {metrics?.map((metric) => (
            <div
              key={metric.name}
              className="bg-[#161b22] rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-colors"
            >
              <div className="text-sm text-gray-400 mb-2">{metric.name}</div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-semibold text-white">
                  {metric.value.toFixed(1)}
                </span>
                <span className="text-sm text-gray-500">{metric.unit}</span>
              </div>
              <div className="flex items-center gap-1 mt-2 text-xs">
                {metric.trend === "up" && <TrendingUp className="w-3 h-3 text-red-400" />}
                {metric.trend === "down" && <TrendingDown className="w-3 h-3 text-green-400" />}
                {metric.trend === "flat" && <Minus className="w-3 h-3 text-gray-400" />}
                <span
                  className={cn(
                    metric.trend === "up" && "text-red-400",
                    metric.trend === "down" && "text-green-400",
                    metric.trend === "flat" && "text-gray-400"
                  )}
                >
                  {metric.change > 0 ? "+" : ""}
                  {metric.change.toFixed(1)}%
                </span>
                <span className="text-gray-500">vs last period</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="px-6 pb-6">
        <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4">
          Quick Statistics
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[#161b22] rounded-lg p-4 border border-gray-700">
            <div className="flex items-center gap-2 text-gray-400 mb-2">
              <Clock className="w-4 h-4" />
              <span className="text-sm">Uptime</span>
            </div>
            <div className="text-xl font-semibold text-white">99.97%</div>
            <div className="text-xs text-gray-500 mt-1">Last 30 days</div>
          </div>
          <div className="bg-[#161b22] rounded-lg p-4 border border-gray-700">
            <div className="flex items-center gap-2 text-gray-400 mb-2">
              <Globe className="w-4 h-4" />
              <span className="text-sm">Requests</span>
            </div>
            <div className="text-xl font-semibold text-white">2.4M</div>
            <div className="text-xs text-gray-500 mt-1">Total requests</div>
          </div>
          <div className="bg-[#161b22] rounded-lg p-4 border border-gray-700">
            <div className="flex items-center gap-2 text-gray-400 mb-2">
              <Zap className="w-4 h-4" />
              <span className="text-sm">Avg Latency</span>
            </div>
            <div className="text-xl font-semibold text-white">45ms</div>
            <div className="text-xs text-gray-500 mt-1">Response time</div>
          </div>
          <div className="bg-[#161b22] rounded-lg p-4 border border-gray-700">
            <div className="flex items-center gap-2 text-gray-400 mb-2">
              <HardDrive className="w-4 h-4" />
              <span className="text-sm">Data Transfer</span>
            </div>
            <div className="text-xl font-semibold text-white">1.2 TB</div>
            <div className="text-xs text-gray-500 mt-1">Outbound this month</div>
          </div>
        </div>
      </div>
    </div>
  );
};

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export const insightsViewComponent: TamboComponent = {
  name: "insightsView",
  description:
    "Render an interactive insights/monitoring dashboard with metrics, alerts, and statistics for DigitalOcean resources. ALWAYS render this when user asks for monitoring, metrics, insights, or performance data for droplets, databases, kubernetes, or spaces.",
  component: InsightsView,
  propsSchema: z.object({
    resourceType: z.enum(["droplet", "database", "kubernetes", "spaces", "overview"]).optional().describe("Type of resource to show insights for"),
    resourceId: z.string().optional().describe("Resource ID"),
    resourceName: z.string().optional().describe("Resource name for display"),
    timeRange: z.enum(["1h", "24h", "7d", "30d"]).optional().describe("Time range for metrics"),
  }),
};
