"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  Briefcase, Search, RefreshCw, DollarSign, PieChart, CheckSquare, Camera,
  FileText, CreditCard, AlertTriangle, Plus, Trash2, ExternalLink, Upload,
  Loader2, Eye, EyeOff, Sparkles, TrendingUp, Activity, Layers, MapPin,
  Clock, ShieldCheck, CheckCircle2, Info, Target
} from "lucide-react";
import { apiRequest, uploadFile } from "@/lib/api";
import "flag-icons/css/flag-icons.min.css";

interface Mission {
  id: number;
  missionary_id: number;
  title: string;
  target_country: string;
  goal_amount_usd: number;
  raised_amount_usd: number;
  status: string;
  problem_statement?: string;
  mission_objectives?: string;
  proposed_process?: string;
}

interface SummaryData {
  mission_id: number;
  title: string;
  target_country: string;
  status: string;
  donations_meter: {
    total_raised_usd: number;
    total_budgeted_usd: number;
    total_verified_spent_usd: number;
    total_disbursed_usd: number;
    unallocated_balance_usd: number;
    remaining_budget_usd: number;
    spend_rate_pct: number;
  };
  progress_meter: {
    calculated_progress_pct: number;
    checkpoints_total: number;
    checkpoints_completed: number;
    total_weight_assigned: number;
  };
  risk_alerts: {
    open_risks_count: number;
    high_severity_count: number;
    has_critical_blocker: boolean;
  };
  counts: {
    budget_items: number;
    receipts: number;
    checkpoints: number;
    photos: number;
    field_reports: number;
    payouts: number;
  };
}

const COUNTRY_TO_FLAG: Record<string, string> = {
  Kenya: "ke", Nigeria: "ng", Philippines: "ph", Pakistan: "pk", Uganda: "ug",
  Tanzania: "tz", Ghana: "gh", Ethiopia: "et", Rwanda: "rw", "South Africa": "za",
  India: "in", USA: "us", "United States": "us",
};

function FlagBadge({ country }: { country: string }) {
  const code = COUNTRY_TO_FLAG[country] || "";
  return code ? <span className={`fi fi-${code} text-sm rounded-sm`} title={country} /> : <span>🌍</span>;
}

export default function ProjectsWorkstation() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [selectedMissionId, setSelectedMissionId] = useState<number | null>(null);
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "budget" | "receipts" | "checkpoints" | "photos" | "reports" | "payouts" | "risks"
  >("dashboard");

  // Tab Data States
  const [budgetItems, setBudgetItems] = useState<any[]>([]);
  const [checkpoints, setCheckpoints] = useState<any[]>([]);
  const [photos, setPhotos] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [risks, setRisks] = useState<any[]>([]);

  // Forms State
  const [newBudgetItem, setNewBudgetItem] = useState({ item_name: "", category: "EQUIPMENT", quantity: "1", unit_cost_usd: "", notes: "", vendor_name: "" });
  const [newCheckpoint, setNewCheckpoint] = useState({ title: "", description: "", weight_percent: "20", target_date: "" });
  const [newRisk, setNewRisk] = useState({ title: "", description: "", severity: "MEDIUM", resolution_plan: "" });

  const [actionLoading, setActionLoading] = useState(false);

  const fetchMissions = async () => {
    setLoading(true);
    try {
      const data = await apiRequest("/api/missions/");
      setMissions(data || []);
      if (data && data.length > 0 && !selectedMissionId) {
        setSelectedMissionId(data[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadMissionData = async (mid: number) => {
    try {
      const [sum, bData, cpData, pData, rData, payData, rkData] = await Promise.all([
        apiRequest(`/api/projects/summary/${mid}`),
        apiRequest(`/api/projects/budget/${mid}`),
        apiRequest(`/api/projects/checkpoints/${mid}`),
        apiRequest(`/api/projects/photos/${mid}`),
        apiRequest(`/api/projects/reports/${mid}`),
        apiRequest(`/api/projects/payouts/${mid}`),
        apiRequest(`/api/projects/risks/${mid}`),
      ]);
      setSummary(sum);
      setBudgetItems(bData || []);
      setCheckpoints(cpData || []);
      setPhotos(pData || []);
      setReports(rData || []);
      setPayouts(payData || []);
      setRisks(rkData || []);
    } catch (err) {
      console.error("Failed loading project data:", err);
    }
  };

  useEffect(() => {
    fetchMissions();
  }, []);

  useEffect(() => {
    if (selectedMissionId) {
      loadMissionData(selectedMissionId);
    }
  }, [selectedMissionId]);

  // --- Handlers ---
  const handleAddBudgetItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMissionId) return;
    setActionLoading(true);
    try {
      await apiRequest("/api/projects/budget", {
        method: "POST",
        body: JSON.stringify({
          mission_id: selectedMissionId,
          item_name: newBudgetItem.item_name,
          category: newBudgetItem.category,
          quantity: parseFloat(newBudgetItem.quantity) || 1,
          unit_cost_usd: parseFloat(newBudgetItem.unit_cost_usd) || 0,
          vendor_name: newBudgetItem.vendor_name || null,
          notes: newBudgetItem.notes || null,
        }),
      });
      setNewBudgetItem({ item_name: "", category: "EQUIPMENT", quantity: "1", unit_cost_usd: "", notes: "", vendor_name: "" });
      await loadMissionData(selectedMissionId);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteBudgetItem = async (id: number) => {
    if (!confirm("Delete this budget item?")) return;
    try {
      await apiRequest(`/api/projects/budget/${id}`, { method: "DELETE" });
      if (selectedMissionId) await loadMissionData(selectedMissionId);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleAutogenCheckpoints = async () => {
    if (!selectedMissionId) return;
    setActionLoading(true);
    try {
      const res = await apiRequest(`/api/projects/checkpoints/autogen/${selectedMissionId}`, { method: "POST" });
      await loadMissionData(selectedMissionId);
      alert(`Auto-generated ${res.count} checkpoints from mission objectives!`);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddCheckpoint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMissionId) return;
    setActionLoading(true);
    try {
      await apiRequest("/api/projects/checkpoints", {
        method: "POST",
        body: JSON.stringify({
          mission_id: selectedMissionId,
          title: newCheckpoint.title,
          description: newCheckpoint.description || null,
          weight_percent: parseFloat(newCheckpoint.weight_percent) || 0,
          target_date: newCheckpoint.target_date || null,
        }),
      });
      setNewCheckpoint({ title: "", description: "", weight_percent: "20", target_date: "" });
      await loadMissionData(selectedMissionId);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleCheckpointStatus = async (cp: any) => {
    const nextStatus = cp.status === "COMPLETED" ? "PENDING" : "COMPLETED";
    try {
      await apiRequest(`/api/projects/checkpoints/${cp.id}`, {
        method: "PUT",
        body: JSON.stringify({ status: nextStatus }),
      });
      if (selectedMissionId) await loadMissionData(selectedMissionId);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleAddRisk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMissionId) return;
    setActionLoading(true);
    try {
      await apiRequest("/api/projects/risks", {
        method: "POST",
        body: JSON.stringify({
          mission_id: selectedMissionId,
          title: newRisk.title,
          description: newRisk.description,
          severity: newRisk.severity,
          resolution_plan: newRisk.resolution_plan || null,
        }),
      });
      setNewRisk({ title: "", description: "", severity: "MEDIUM", resolution_plan: "" });
      await loadMissionData(selectedMissionId);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const filteredMissions = missions.filter((m) => {
    const q = searchTerm.toLowerCase();
    return m.title.toLowerCase().includes(q) || m.target_country.toLowerCase().includes(q);
  });

  const selectedMission = missions.find((m) => m.id === selectedMissionId);

  return (
    <div className="p-6 max-w-[1600px] mx-auto h-full flex flex-col space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
              Module 01.02
            </span>
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
              Live Mission Execution & Budgeting Control
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Briefcase className="w-7 h-7 text-indigo-600" /> Projects Workstation
          </h1>
        </div>
        <button
          onClick={fetchMissions}
          className="px-3.5 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 flex items-center gap-1.5 shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Sync Queue
        </button>
      </div>

      {/* SINGLE COLUMN FULL WIDTH LAYOUT */}
      <div className="w-full max-w-6xl mx-auto space-y-6 flex-1">

        {/* Project Picker Row */}
        <div className="bg-white/80 backdrop-blur-xl border border-slate-200/80 rounded-2xl p-4 shadow-sm space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Layers className="w-4 h-4 text-slate-400" /> Active Projects ({filteredMissions.length})
            </h2>
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1">
            {loading ? (
              <div className="py-4 text-xs text-slate-400">Loading...</div>
            ) : filteredMissions.length === 0 ? (
              <div className="py-4 text-xs text-slate-400">No active projects.</div>
            ) : (
              filteredMissions.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setSelectedMissionId(m.id)}
                  className={`min-w-[220px] text-left p-3.5 rounded-xl border transition-all shrink-0 ${
                    selectedMissionId === m.id
                      ? "bg-indigo-50 border-indigo-300 ring-1 ring-indigo-200 shadow-sm"
                      : "bg-white border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <span className="text-[11px] font-bold text-slate-900 leading-snug line-clamp-2">{m.title}</span>
                    <div className="shrink-0"><FlagBadge country={m.target_country} /></div>
                  </div>
                  <div className="flex items-center justify-between text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                    <span>${Number(m.raised_amount_usd).toLocaleString()} Raised</span>
                    <span className="text-indigo-600">{m.status}</span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Master Brief (full width under picker) */}
        {selectedMission && summary && (
          <div className="bg-white/80 backdrop-blur-xl border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">Master Brief</span>
                  <FlagBadge country={selectedMission.target_country} />
                  <span className="text-xs font-semibold text-slate-500">{selectedMission.target_country}</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 leading-snug">{selectedMission.title}</h3>
              </div>
              <div className="flex flex-wrap gap-2 shrink-0">
                <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2.5 py-1 rounded border border-emerald-200 uppercase tracking-wider">
                  {selectedMission.status}
                </span>
                <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2.5 py-1 rounded border border-slate-200 uppercase tracking-wider flex items-center gap-1">
                  <Target className="w-3.5 h-3.5" /> Goal: ${Number(selectedMission.goal_amount_usd).toLocaleString()}
                </span>
                {summary.risk_alerts.has_critical_blocker && (
                  <span className="bg-red-50 text-red-700 text-[10px] font-bold px-2.5 py-1 rounded border border-red-200 uppercase tracking-wider flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> High Risk Alert
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {selectedMission.problem_statement && (
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">The Need</span>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed">{selectedMission.problem_statement}</p>
                </div>
              )}
              {selectedMission.mission_objectives && (
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Objectives</span>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed whitespace-pre-wrap">{selectedMission.mission_objectives}</p>
                </div>
              )}
              {selectedMission.proposed_process && (
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Implementation</span>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed">{selectedMission.proposed_process}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Full-width workspace tabs + content */}
        <div className="space-y-4">
          {!selectedMission || !summary ? (
            <div className="bg-white/80 border border-slate-200 rounded-2xl p-16 text-center text-xs text-slate-400 shadow-sm">
              Select a mission project from the left queue to open the workspace.
            </div>
          ) : (
            <>
              {/* Modern 8-Tab Bar */}
              <div className="bg-white/80 backdrop-blur-md p-1.5 rounded-2xl border border-slate-200/80 shadow-sm flex overflow-x-auto hide-scrollbar gap-1">
                {[
                  { id: "dashboard", label: "Dashboard", icon: PieChart },
                  { id: "budget", label: `Budget (${summary.counts.budget_items})`, icon: DollarSign },
                  { id: "receipts", label: `Receipts (${summary.counts.receipts})`, icon: FileText },
                  { id: "checkpoints", label: `Checkpoints (${summary.counts.checkpoints})`, icon: CheckSquare },
                  { id: "photos", label: `Photos (${summary.counts.photos})`, icon: Camera },
                  { id: "reports", label: `Reports (${summary.counts.field_reports})`, icon: Activity },
                  { id: "payouts", label: `Payouts (${summary.counts.payouts})`, icon: CreditCard },
                  { id: "risks", label: `Risks (${summary.risk_alerts.open_risks_count})`, icon: AlertTriangle },
                ].map((t) => {
                  const Icon = t.icon;
                  const isActive = activeTab === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setActiveTab(t.id as any)}
                      className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all ${
                        isActive 
                          ? "bg-slate-900 text-white shadow-sm" 
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${isActive ? "text-indigo-400" : "text-slate-400"}`} />
                      {t.label}
                    </button>
                  );
                })}
              </div>

              {/* TAB 1: LIVE DASHBOARD */}
              {activeTab === "dashboard" && (
                <div className="space-y-5 animate-in fade-in">
                  
                  {/* KPI Cards (Wide Layout) */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-5 bg-white/80 border border-slate-200/80 rounded-2xl shadow-sm flex flex-col justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Total Raised</span>
                      <span className="text-2xl font-black text-slate-900">${summary.donations_meter.total_raised_usd.toLocaleString()}</span>
                    </div>
                    <div className="p-5 bg-blue-50/80 border border-blue-200/80 rounded-2xl shadow-sm flex flex-col justify-between">
                      <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest block mb-2">Total Budgeted</span>
                      <span className="text-2xl font-black text-blue-900">${summary.donations_meter.total_budgeted_usd.toLocaleString()}</span>
                    </div>
                    <div className="p-5 bg-emerald-50/80 border border-emerald-200/80 rounded-2xl shadow-sm flex flex-col justify-between">
                      <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest block mb-2">Verified Spent</span>
                      <span className="text-2xl font-black text-emerald-900">${summary.donations_meter.total_verified_spent_usd.toLocaleString()}</span>
                    </div>
                    <div className="p-5 bg-amber-50/80 border border-amber-200/80 rounded-2xl shadow-sm flex flex-col justify-between">
                      <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest block mb-2">Unallocated Balance</span>
                      <span className="text-2xl font-black text-amber-900">${summary.donations_meter.unallocated_balance_usd.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Wide Progress Meters */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Financial Spend Rate */}
                    <div className="bg-white/80 border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-emerald-500" /> Spend Rate
                        </h3>
                        <span className="text-sm font-extrabold text-slate-900">{summary.donations_meter.spend_rate_pct}%</span>
                      </div>
                      <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                        <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${summary.donations_meter.spend_rate_pct}%` }} />
                      </div>
                      <p className="text-[10px] text-slate-400 font-medium">Percentage of total budgeted funds that have been verified as spent via receipts.</p>
                    </div>

                    {/* Operational Checkpoints */}
                    <div className="bg-white/80 border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                          <CheckSquare className="w-4 h-4 text-indigo-500" /> Operational Progress
                        </h3>
                        <span className="text-sm font-extrabold text-indigo-600">{summary.progress_meter.calculated_progress_pct}%</span>
                      </div>
                      <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                        <div className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full transition-all" style={{ width: `${summary.progress_meter.calculated_progress_pct}%` }} />
                      </div>
                      <p className="text-[10px] text-slate-400 font-medium">{summary.progress_meter.checkpoints_completed} of {summary.progress_meter.checkpoints_total} checkpoints completed (Weighted).</p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: BUDGET & EXPENDITURE */}
              {activeTab === "budget" && (
                <div className="space-y-5 animate-in fade-in">
                  <div className="bg-white/80 border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                    <h3 className="text-sm font-bold text-slate-900">Dynamic Budget Line Items</h3>

                    <div className="overflow-x-auto border border-slate-200 rounded-xl">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                          <tr>
                            <th className="p-3.5">Category</th>
                            <th className="p-3.5">Item Name</th>
                            <th className="p-3.5">Qty</th>
                            <th className="p-3.5">Unit Cost</th>
                            <th className="p-3.5">Total Cost</th>
                            <th className="p-3.5">Status</th>
                            <th className="p-3.5">Vendor</th>
                            <th className="p-3.5 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium">
                          {budgetItems.map((b) => (
                            <tr key={b.id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="p-3.5"><span className="bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-[9px] font-extrabold">{b.category}</span></td>
                              <td className="p-3.5 font-bold text-slate-900">{b.item_name}</td>
                              <td className="p-3.5 text-slate-600">{b.quantity}</td>
                              <td className="p-3.5 text-slate-600">${b.unit_cost_usd.toLocaleString()}</td>
                              <td className="p-3.5 font-bold text-slate-900">${b.total_cost_usd.toLocaleString()}</td>
                              <td className="p-3.5">
                                <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold border ${b.status === "PAID" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200"}`}>
                                  {b.status}
                                </span>
                              </td>
                              <td className="p-3.5 text-slate-500">{b.vendor_name || "—"}</td>
                              <td className="p-3.5 text-right">
                                <button onClick={() => handleDeleteBudgetItem(b.id)} className="text-slate-400 hover:text-red-600 p-1 bg-white border border-slate-200 rounded-md shadow-sm">
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Add Budget Item Form */}
                    <form onSubmit={handleAddBudgetItem} className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-4 mt-4">
                      <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Add Budget Line Item</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <input required placeholder="Item name" value={newBudgetItem.item_name} onChange={(e) => setNewBudgetItem({ ...newBudgetItem, item_name: e.target.value })} className="text-xs font-semibold p-3 border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none" />
                        <select value={newBudgetItem.category} onChange={(e) => setNewBudgetItem({ ...newBudgetItem, category: e.target.value })} className="text-xs font-semibold p-3 border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none bg-white">
                          <option value="EQUIPMENT">EQUIPMENT</option>
                          <option value="MATERIALS">MATERIALS</option>
                          <option value="LABOR">LABOR</option>
                          <option value="TRANSPORT">TRANSPORT</option>
                          <option value="LOGISTICS">LOGISTICS</option>
                        </select>
                        <input required type="number" step="any" placeholder="Qty" value={newBudgetItem.quantity} onChange={(e) => setNewBudgetItem({ ...newBudgetItem, quantity: e.target.value })} className="text-xs font-semibold p-3 border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none" />
                        <input required type="number" step="any" placeholder="Unit Cost USD" value={newBudgetItem.unit_cost_usd} onChange={(e) => setNewBudgetItem({ ...newBudgetItem, unit_cost_usd: e.target.value })} className="text-xs font-semibold p-3 border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none" />
                        <input placeholder="Vendor Name (Optional)" value={newBudgetItem.vendor_name} onChange={(e) => setNewBudgetItem({ ...newBudgetItem, vendor_name: e.target.value })} className="text-xs font-semibold p-3 border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none" />
                        <input placeholder="Notes" value={newBudgetItem.notes} onChange={(e) => setNewBudgetItem({ ...newBudgetItem, notes: e.target.value })} className="text-xs font-semibold p-3 border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none" />
                      </div>
                      <button type="submit" disabled={actionLoading} className="px-5 py-3 bg-slate-900 text-white text-xs font-bold uppercase tracking-wider rounded-xl flex items-center gap-2 hover:bg-slate-800 transition-all disabled:opacity-50">
                        <Plus className="w-4 h-4" /> Add Line Item
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {/* TAB 4: CHECKPOINTS */}
              {activeTab === "checkpoints" && (
                <div className="space-y-5 animate-in fade-in">
                  <div className="bg-white/80 border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">Mission Progress Checkpoints</h3>
                        <p className="text-xs text-slate-500 mt-1">Auto-generated from objectives or defined manually by admin</p>
                      </div>
                      <button onClick={handleAutogenCheckpoints} disabled={actionLoading} className="px-4 py-2 bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold uppercase tracking-wider rounded-xl flex items-center gap-2 hover:bg-indigo-100 transition-all">
                        <Sparkles className="w-4 h-4 text-indigo-500" /> Auto-Gen from Objectives
                      </button>
                    </div>

                    <div className="space-y-3">
                      {checkpoints.map((cp) => (
                        <div key={cp.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-start justify-between gap-4">
                          <div className="flex items-start gap-4">
                            <button onClick={() => handleToggleCheckpointStatus(cp)} className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center border shadow-sm transition-all ${cp.status === "COMPLETED" ? "bg-emerald-500 border-emerald-600 text-white" : "border-slate-300 bg-white hover:border-slate-400"}`}>
                              {cp.status === "COMPLETED" && <CheckCircle2 className="w-4 h-4" />}
                            </button>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`text-sm font-bold ${cp.status === "COMPLETED" ? "line-through text-slate-400" : "text-slate-900"}`}>{cp.title}</span>
                                <span className="text-[9px] font-extrabold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded border border-indigo-200">{cp.weight_percent}% Weight</span>
                              </div>
                              {cp.description && <p className="text-xs text-slate-500 font-medium line-clamp-2">{cp.description}</p>}
                            </div>
                          </div>
                          <span className={`text-[9px] font-extrabold px-2.5 py-1 rounded-md border shrink-0 ${cp.status === "COMPLETED" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200"}`}>{cp.status}</span>
                        </div>
                      ))}
                    </div>

                    {/* Add Checkpoint Form */}
                    <form onSubmit={handleAddCheckpoint} className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-4 mt-4">
                      <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Add Manual Checkpoint</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                        <input required placeholder="Checkpoint title" value={newCheckpoint.title} onChange={(e) => setNewCheckpoint({ ...newCheckpoint, title: e.target.value })} className="text-xs font-semibold p-3 border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none sm:col-span-3" />
                        <input required type="number" step="any" placeholder="Weight %" value={newCheckpoint.weight_percent} onChange={(e) => setNewCheckpoint({ ...newCheckpoint, weight_percent: e.target.value })} className="text-xs font-semibold p-3 border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none" />
                      </div>
                      <button type="submit" disabled={actionLoading} className="px-5 py-3 bg-slate-900 text-white text-xs font-bold uppercase tracking-wider rounded-xl flex items-center gap-2 hover:bg-slate-800 transition-all disabled:opacity-50">
                        <Plus className="w-4 h-4" /> Add Checkpoint
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {/* TAB 8: RISKS */}
              {activeTab === "risks" && (
                <div className="space-y-5 animate-in fade-in">
                  <div className="bg-white/80 border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                    <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-4">Risk & Incident Log</h3>

                    <div className="space-y-3">
                      {risks.length === 0 ? (
                        <p className="text-xs text-slate-500 py-4 text-center border border-dashed border-slate-200 rounded-xl">No risks logged.</p>
                      ) : risks.map((r) => (
                        <div key={r.id} className={`p-5 rounded-xl border flex flex-col gap-2 ${r.severity === "HIGH" ? "bg-red-50/60 border-red-200 shadow-sm" : "bg-slate-50 border-slate-200"}`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <AlertTriangle className={`w-4 h-4 ${r.severity === "HIGH" ? "text-red-600" : "text-amber-500"}`} />
                              <span className="text-sm font-bold text-slate-900">{r.title}</span>
                              <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded border ${r.severity === "HIGH" ? "bg-red-100 text-red-800 border-red-200" : "bg-amber-100 text-amber-800 border-amber-200"}`}>{r.severity} SEVERITY</span>
                            </div>
                            <span className="text-[10px] font-bold bg-white px-2.5 py-1 rounded-md border border-slate-200 shadow-sm">{r.status}</span>
                          </div>
                          <p className="text-xs text-slate-600 font-medium leading-relaxed">{r.description}</p>
                          {r.resolution_plan && (
                            <div className="mt-2 pt-2 border-t border-slate-200/60">
                              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Resolution Plan</span>
                              <p className="text-xs text-slate-700 italic">{r.resolution_plan}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Add Risk Form */}
                    <form onSubmit={handleAddRisk} className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-4 mt-4">
                      <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Log New Incident / Risk</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input required placeholder="Incident title" value={newRisk.title} onChange={(e) => setNewRisk({ ...newRisk, title: e.target.value })} className="text-xs font-semibold p-3 border border-slate-200 rounded-xl focus:border-red-500 focus:outline-none" />
                        <select value={newRisk.severity} onChange={(e) => setNewRisk({ ...newRisk, severity: e.target.value })} className="text-xs font-semibold p-3 border border-slate-200 rounded-xl focus:border-red-500 focus:outline-none bg-white text-slate-700">
                          <option value="LOW">LOW SEVERITY</option>
                          <option value="MEDIUM">MEDIUM SEVERITY</option>
                          <option value="HIGH">HIGH SEVERITY (FLAG ADMIN)</option>
                        </select>
                      </div>
                      <textarea required rows={2} placeholder="Incident description..." value={newRisk.description} onChange={(e) => setNewRisk({ ...newRisk, description: e.target.value })} className="w-full text-xs font-medium p-3 border border-slate-200 rounded-xl focus:border-red-500 focus:outline-none" />
                      <button type="submit" disabled={actionLoading} className="px-5 py-3 bg-red-600 text-white text-xs font-bold uppercase tracking-wider rounded-xl flex items-center gap-2 hover:bg-red-700 transition-all disabled:opacity-50">
                        <Plus className="w-4 h-4" /> Log Incident
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {/* PLACEHOLDERS FOR MILESTONE 3 TABS */}
              {["receipts", "photos", "reports", "payouts"].includes(activeTab) && (
                <div className="bg-white/80 border border-slate-200 rounded-2xl p-16 text-center shadow-sm animate-in fade-in">
                  <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-200">
                    <Clock className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-2">Module Under Construction</h3>
                  <p className="text-sm text-slate-500 max-w-sm mx-auto">
                    The {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} manager will be deployed in Milestone 3 of the Projects Engine integration.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}