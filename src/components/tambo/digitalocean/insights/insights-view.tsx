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
import { useTheme } from "@/components/theme-provider";
import { cn } from "@/lib/utils";

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
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const {
    resourceType = "overview",
    resourceId,
    resourceName,
    timeRange = "24h",
  } = props || {};

  // Tambo state for AI visibility - use static timestamps to avoid impure calls during render
  const now = "2024-01-01T00:00:00.000Z";
  const oneHourAgo = "2023-12-31T23:00:00.000Z";
  const [metrics, setMetrics] = useTamboComponentState<Metric[]>("metrics", [
    { name: "CPU Usage", value: 45.2, unit: "%", trend: "up", change: 5.3, timestamp: now },
    { name: "Memory", value: 68.5, unit: "%", trend: "flat", change: 0, timestamp: now },
    { name: "Disk I/O", value: 23.1, unit: "MB/s", trend: "down", change: -12.4, timestamp: now },
    { name: "Network In", value: 156.3, unit: "KB/s", trend: "up", change: 23.1, timestamp: now },
    { name: "Network Out", value: 89.7, unit: "KB/s", trend: "flat", change: 2.1, timestamp: now },
  ]);
  const [alerts, setAlerts] = useTamboComponentState<Alert[]>("alerts", [
    { id: "1", severity: "warning", message: "High CPU usage detected on droplet-01", timestamp: now, resolved: false },
    { id: "2", severity: "info", message: "Database backup completed successfully", timestamp: oneHourAgo, resolved: true },
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
      case "droplet": return <Server className="w-6 h-6 text-white" />;
      case "database": return <Database className="w-6 h-6 text-white" />;
      case "kubernetes": return <Droplets className="w-6 h-6 text-white" />;
      case "spaces": return <HardDrive className="w-6 h-6 text-white" />;
      default: return <Activity className="w-6 h-6 text-white" />;
    }
  };

  return (
    <div className={cn(
      "w-full max-w-4xl border rounded-lg overflow-hidden",
      isDark ? "bg-[#0d1117] border-gray-700 text-gray-100" : "bg-white border-gray-300 text-gray-900"
    )}>
      {/* Header */}
      <div className={cn(
        "px-6 py-5 border-b",
        isDark ? "border-gray-700 bg-[#161b22]" : "border-gray-300 bg-gray-50"
      )}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-emerald-600 flex items-center justify-center">
              {getResourceIcon()}
            </div>
            <div>
              <h2 className="text-xl font-semibold capitalize">
                {resourceType === "overview" ? "Account Overview" : `${resourceType} Insights`}
              </h2>
              {resourceName && (
                <p className={cn("text-sm mt-1", isDark ? "text-gray-400" : "text-gray-500")}>{resourceName}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value as typeof timeRange)}
              className={cn(
                "px-3 py-2 rounded-md border text-sm focus:outline-none focus:border-blue-500",
                isDark ? "bg-[#0d1117] border-gray-700 text-white" : "bg-white border-gray-300 text-gray-900"
              )}
            >
              <option value="1h">Last 1 hour</option>
              <option value="24h">Last 24 hours</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
            </select>
            <button
              onClick={() => void handleRefresh()}
              disabled={loading}
              className={cn(
                "p-2 rounded transition-colors disabled:opacity-50",
                isDark ? "hover:bg-gray-700 text-gray-400 hover:text-white" : "hover:bg-gray-200 text-gray-500 hover:text-gray-900"
              )}
              title="Refresh"
            >
              <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
            </button>
            <button
              onClick={handleExport}
              className={cn(
                "p-2 rounded transition-colors",
                isDark ? "hover:bg-gray-700 text-gray-400 hover:text-white" : "hover:bg-gray-200 text-gray-500 hover:text-gray-900"
              )}
              title="Export data"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Alerts Section */}
      {alerts?.some(a => !a.resolved) && (
        <div className={cn(
          "px-6 py-4 border-b",
          isDark ? "border-gray-700 bg-[#161b22]" : "border-gray-300 bg-gray-50"
        )}>
          <div className="flex items-center justify-between mb-3">
            <h3 className={cn("text-sm font-medium uppercase tracking-wider flex items-center gap-2", isDark ? "text-gray-400" : "text-gray-500")}>
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
                    alert.severity === "critical" && (isDark ? "bg-red-500/10 border border-red-500/20 text-red-400" : "bg-red-100 border border-red-200 text-red-700"),
                    alert.severity === "warning" && (isDark ? "bg-yellow-500/10 border border-yellow-500/20 text-yellow-400" : "bg-amber-100 border border-amber-200 text-amber-700"),
                    alert.severity === "info" && (isDark ? "bg-blue-500/10 border border-blue-500/20 text-blue-400" : "bg-blue-100 border border-blue-200 text-blue-700"),
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
        <h3 className={cn("text-sm font-medium uppercase tracking-wider mb-4 flex items-center gap-2", isDark ? "text-gray-400" : "text-gray-500")}>
          <BarChart3 className="w-4 h-4" />
          Performance Metrics
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {metrics?.map((metric) => (
            <div
              key={metric.name}
              className={cn(
                "rounded-lg p-4 border transition-colors",
                isDark ? "bg-[#161b22] border-gray-700 hover:border-gray-600" : "bg-gray-50 border-gray-300 hover:border-gray-400"
              )}
            >
              <div className={cn("text-sm mb-2", isDark ? "text-gray-400" : "text-gray-500")}>{metric.name}</div>
              <div className="flex items-baseline gap-1">
                <span className={cn("text-2xl font-semibold", isDark ? "text-white" : "text-gray-900")}>
                  {metric.value.toFixed(1)}
                </span>
                <span className={isDark ? "text-gray-500" : "text-gray-400"}>{metric.unit}</span>
              </div>
              <div className="flex items-center gap-1 mt-2 text-xs">
                {metric.trend === "up" && <TrendingUp className={cn("w-3 h-3", isDark ? "text-red-400" : "text-red-500")} />}
                {metric.trend === "down" && <TrendingDown className={cn("w-3 h-3", isDark ? "text-green-400" : "text-green-600")} />}
                {metric.trend === "flat" && <Minus className={cn("w-3 h-3", isDark ? "text-gray-400" : "text-gray-500")} />}
                <span
                  className={cn(
                    metric.trend === "up" && (isDark ? "text-red-400" : "text-red-500"),
                    metric.trend === "down" && (isDark ? "text-green-400" : "text-green-600"),
                    metric.trend === "flat" && (isDark ? "text-gray-400" : "text-gray-500")
                  )}
                >
                  {metric.change > 0 ? "+" : ""}
                  {metric.change.toFixed(1)}%
                </span>
                <span className={isDark ? "text-gray-500" : "text-gray-400"}>vs last period</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="px-6 pb-6">
        <h3 className={cn("text-sm font-medium uppercase tracking-wider mb-4", isDark ? "text-gray-400" : "text-gray-500")}>
          Quick Statistics
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className={cn("rounded-lg p-4 border", isDark ? "bg-[#161b22] border-gray-700" : "bg-gray-50 border-gray-300")}>
            <div className={cn("flex items-center gap-2 mb-2", isDark ? "text-gray-400" : "text-gray-500")}>
              <Clock className="w-4 h-4" />
              <span className="text-sm">Uptime</span>
            </div>
            <div className={cn("text-xl font-semibold", isDark ? "text-white" : "text-gray-900")}>99.97%</div>
            <div className={cn("text-xs mt-1", isDark ? "text-gray-500" : "text-gray-400")}>Last 30 days</div>
          </div>
          <div className={cn("rounded-lg p-4 border", isDark ? "bg-[#161b22] border-gray-700" : "bg-gray-50 border-gray-300")}>
            <div className={cn("flex items-center gap-2 mb-2", isDark ? "text-gray-400" : "text-gray-500")}>
              <Globe className="w-4 h-4" />
              <span className="text-sm">Requests</span>
            </div>
            <div className={cn("text-xl font-semibold", isDark ? "text-white" : "text-gray-900")}>2.4M</div>
            <div className={cn("text-xs mt-1", isDark ? "text-gray-500" : "text-gray-400")}>Total requests</div>
          </div>
          <div className={cn("rounded-lg p-4 border", isDark ? "bg-[#161b22] border-gray-700" : "bg-gray-50 border-gray-300")}>
            <div className={cn("flex items-center gap-2 mb-2", isDark ? "text-gray-400" : "text-gray-500")}>
              <Zap className="w-4 h-4" />
              <span className="text-sm">Avg Latency</span>
            </div>
            <div className={cn("text-xl font-semibold", isDark ? "text-white" : "text-gray-900")}>45ms</div>
            <div className={cn("text-xs mt-1", isDark ? "text-gray-500" : "text-gray-400")}>Response time</div>
          </div>
          <div className={cn("rounded-lg p-4 border", isDark ? "bg-[#161b22] border-gray-700" : "bg-gray-50 border-gray-300")}>
            <div className={cn("flex items-center gap-2 mb-2", isDark ? "text-gray-400" : "text-gray-500")}>
              <HardDrive className="w-4 h-4" />
              <span className="text-sm">Data Transfer</span>
            </div>
            <div className={cn("text-xl font-semibold", isDark ? "text-white" : "text-gray-900")}>1.2 TB</div>
            <div className={cn("text-xs mt-1", isDark ? "text-gray-500" : "text-gray-400")}>Outbound this month</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Using shared cn utility from @/lib/utils
// function cn(...classes: (string | boolean | undefined)[]) {
//   return classes.filter(Boolean).join(" ");
// }

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
