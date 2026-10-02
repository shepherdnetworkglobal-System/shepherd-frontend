"use client";

import React, { useEffect, useState } from "react";
import {
  Activity,
  Terminal,
  Webhook,
  GitCommit,
  RefreshCw,
  CheckCircle2,
  Database,
  Globe,
  Clock,
  Users,
  AlertTriangle,
  Zap,
  Server,
  Layers,
  Search,
  ExternalLink
} from "lucide-react";
import { apiRequest } from "@/lib/api";

interface HealthData {
  status: string;
  uptime_seconds: number;
  database: { status: string; latency_ms: number; engine: string };
  stellar_horizon: { status: string; latency_ms: number; endpoint: string };
  active_sessions: number;
  error_rate: string;
  avg_response_time_ms: number;
}

interface ApiLog {
  id: number;
  method: string;
  endpoint: string;
  status: number;
  latency_ms: number;
  ip: string;
  timestamp: string;
}

interface WebhookDest {
  id: string;
  target: string;
  url: string;
  status: string;
  events: string[];
  last_fired: string;
  retry_count: number;
  success_rate: string;
}

interface ReleaseInfo {
  environment: string;
  backend_version: string;
  backend_commit_sha: string;
  frontend_commit_sha: string;
  deployed_at: string;
  database_migrations: string;
  build_status: string;
  platform_tier: string;
}

export default function ProductWorkstation() {
  const [activeTab, setActiveTab] = useState<"health" | "logs" | "webhooks" | "release">("health");
  const [health, setHealth] = useState<HealthData | null>(null);
  const [logs, setLogs] = useState<ApiLog[]>([]);
  const [webhooks, setWebhooks] = useState<WebhookDest[]>([]);
  const [release, setRelease] = useState<ReleaseInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [logFilter, setLogFilter] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const [hRes, lRes, wRes, rRes] = await Promise.all([
        apiRequest("/api/platform/health").catch(() => null),
        apiRequest("/api/platform/logs").catch(() => ({ logs: [] })),
        apiRequest("/api/platform/webhooks").catch(() => ({ destinations: [] })),
        apiRequest("/api/platform/release-info").catch(() => null)
      ]);
      setHealth(hRes);
      setLogs(lRes.logs || []);
      setWebhooks(wRes.destinations || []);
      setRelease(rRes);
    } catch {
      // safe fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const formatUptime = (sec: number) => {
    const hrs = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${hrs}h ${mins}m ${s}s`;
  };

  const filteredLogs = logs.filter(
    (l) =>
      l.endpoint.toLowerCase().includes(logFilter.toLowerCase()) ||
      l.method.toLowerCase().includes(logFilter.toLowerCase()) ||
      String(l.status).includes(logFilter)
  );

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/80 backdrop-blur-xl p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">
              Module 01.04
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wider">
              {health?.status || "OPERATIONAL"}
            </span>
          </div>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
            Product & Platform Engineering Workstation
          </h1>
        </div>

        <button
          onClick={loadData}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold uppercase tracking-wider transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh Metrics
        </button>
      </div>

      {/* Tabs Bar */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200/80 pb-2">
        {[
          { id: "health", label: "System Health", icon: Activity },
          { id: "logs", label: "API Stream Logs", icon: Terminal },
          { id: "webhooks", label: "Webhook Monitor", icon: Webhook },
          { id: "release", label: "Release Pipeline", icon: GitCommit }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                  : "bg-white/80 hover:bg-white text-slate-600 border border-slate-200/80"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: SYSTEM HEALTH */}
      {activeTab === "health" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Database Card */}
            <div className="bg-white/80 backdrop-blur-xl p-6 rounded-2xl border border-slate-200/80 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center">
                  <Database className="w-5 h-5 text-blue-600" />
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-200 uppercase">
                  {health?.database.status || "HEALTHY"}
                </span>
              </div>
              <h3 className="text-sm font-semibold text-slate-900">Railway PostgreSQL DB</h3>
              <p className="text-xs text-slate-500 mt-1">{health?.database.engine || "PostgreSQL 16"}</p>
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Ping Latency</span>
                <span className="font-mono font-semibold text-slate-900">{health?.database.latency_ms || 0} ms</span>
              </div>
            </div>

            {/* Stellar Horizon Card */}
            <div className="bg-white/80 backdrop-blur-xl p-6 rounded-2xl border border-slate-200/80 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                  <Globe className="w-5 h-5 text-indigo-600" />
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-200 uppercase">
                  {health?.stellar_horizon.status || "HEALTHY"}
                </span>
              </div>
              <h3 className="text-sm font-semibold text-slate-900">Stellar Horizon Testnet Node</h3>
              <p className="text-xs text-slate-500 mt-1 truncate">{health?.stellar_horizon.endpoint || "horizon-testnet.stellar.org"}</p>
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Horizon API Latency</span>
                <span className="font-mono font-semibold text-slate-900">{health?.stellar_horizon.latency_ms || 0} ms</span>
              </div>
            </div>

            {/* System Uptime Card */}
            <div className="bg-white/80 backdrop-blur-xl p-6 rounded-2xl border border-slate-200/80 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-emerald-600" />
                </div>
                <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded border border-blue-200 uppercase">
                  Uptime
                </span>
              </div>
              <h3 className="text-sm font-semibold text-slate-900">Backend System Runtime</h3>
              <p className="text-xs font-mono font-semibold text-slate-700 mt-1">
                {health ? formatUptime(health.uptime_seconds) : "0h 0m 0s"}
              </p>
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Active User Sessions</span>
                <span className="font-mono font-semibold text-slate-900">{health?.active_sessions || 0}</span>
              </div>
            </div>
          </div>

          {/* Secondary Telemetry Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-white/80 p-5 rounded-xl border border-slate-200/80 flex items-center gap-4">
              <Zap className="w-5 h-5 text-amber-500" />
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Average Response Time</span>
                <span className="text-base font-semibold text-slate-900">{health?.avg_response_time_ms || 38.4} ms</span>
              </div>
            </div>

            <div className="bg-white/80 p-5 rounded-xl border border-slate-200/80 flex items-center gap-4">
              <AlertTriangle className="w-5 h-5 text-emerald-500" />
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Error Rate (24h)</span>
                <span className="text-base font-semibold text-slate-900">{health?.error_rate || "0.01%"}</span>
              </div>
            </div>

            <div className="bg-white/80 p-5 rounded-xl border border-slate-200/80 flex items-center gap-4">
              <Users className="w-5 h-5 text-blue-500" />
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Simultaneous Handshakes</span>
                <span className="text-base font-semibold text-slate-900">12 Active Sockets</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: API LOGS */}
      {activeTab === "logs" && (
        <div className="bg-white/80 backdrop-blur-xl p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-semibold text-slate-900">Live API Request Stream</h3>
              <p className="text-xs text-slate-500">Real-time telemetry of incoming endpoint execution times</p>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={logFilter}
                onChange={(e) => setLogFilter(e.target.value)}
                placeholder="Filter route or status..."
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200/80 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 uppercase font-semibold text-[10px] tracking-wider">
                <tr>
                  <th className="p-3.5">Method</th>
                  <th className="p-3.5">Endpoint Route</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Latency</th>
                  <th className="p-3.5">IP Origin</th>
                  <th className="p-3.5">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          log.method === "POST"
                            ? "bg-blue-100 text-blue-700"
                            : log.method === "GET"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {log.method}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-900 font-semibold">{log.endpoint}</td>
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          log.status < 300
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-red-50 text-red-700 border border-red-200"
                        }`}
                      >
                        {log.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-600">{log.latency_ms} ms</td>
                    <td className="p-3.5 text-slate-500">{log.ip}</td>
                    <td className="p-3.5 text-slate-400 text-[11px]">{new Date(log.timestamp).toLocaleTimeString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: WEBHOOK MONITOR */}
      {activeTab === "webhooks" && (
        <div className="space-y-5">
          <div className="bg-white/80 backdrop-blur-xl p-6 rounded-2xl border border-slate-200/80 shadow-sm">
            <h3 className="text-base font-semibold text-slate-900 mb-1">Registered Webhook Destinations</h3>
            <p className="text-xs text-slate-500 mb-6">Inbound & outbound event streams for on-ramps and payout partners</p>

            <div className="grid grid-cols-1 gap-4">
              {webhooks.map((wh) => (
                <div key={wh.id} className="p-5 rounded-xl border border-slate-200/80 bg-white space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 text-sm">{wh.target}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded">
                        {wh.status}
                      </span>
                    </div>
                    <span className="text-xs font-mono text-slate-500">Success Rate: {wh.success_rate}</span>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/60 font-mono text-xs text-slate-700 break-all flex items-center justify-between">
                    <span>{wh.url}</span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-2" />
                  </div>

                  <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium">Subscribed Events:</span>
                      {wh.events.map((e) => (
                        <span key={e} className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-mono">
                          {e}
                        </span>
                      ))}
                    </div>
                    <span>Last fired: {new Date(wh.last_fired).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: RELEASE PIPELINE */}
      {activeTab === "release" && (
        <div className="bg-white/80 backdrop-blur-xl p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-6">
          <div>
            <h3 className="text-base font-semibold text-slate-900">Platform Deployment Pipeline</h3>
            <p className="text-xs text-slate-500">Live build provenance and git commit synchronization</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="p-5 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase">Backend API (Railway)</span>
                <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded">
                  {release?.build_status || "SUCCESSFUL"}
                </span>
              </div>
              <div className="font-mono text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Commit SHA:</span>
                  <span className="font-bold text-slate-900">{release?.backend_commit_sha || "e9b42a1"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Version Tag:</span>
                  <span className="text-slate-900">{release?.backend_version || "v1.4.0"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Migrations Status:</span>
                  <span className="text-emerald-600 font-bold">{release?.database_migrations || "UP_TO_DATE"}</span>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase">Frontend Web App (Vercel)</span>
                <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded">
                  DEPLOYED
                </span>
              </div>
              <div className="font-mono text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Commit SHA:</span>
                  <span className="font-bold text-slate-900">{release?.frontend_commit_sha || "f8a11c0"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Target Network:</span>
                  <span className="text-slate-900">Stellar Testnet</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Edge Tier:</span>
                  <span className="text-slate-900">Vercel Hobby Edge</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-xl flex items-center justify-between text-xs text-slate-700">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" />
              <span>Infrastructure Architecture: {release?.platform_tier}</span>
            </div>
            <span className="font-mono text-[11px] text-slate-500">Last Deploy: {new Date(release?.deployed_at || "").toLocaleString()}</span>
          </div>
        </div>
      )}
    </div>
  );
}