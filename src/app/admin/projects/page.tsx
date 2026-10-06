"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  Briefcase,
  Search,
  RefreshCw,
  DollarSign,
  PieChart,
  CheckSquare,
  Camera,
  FileText,
  CreditCard,
  AlertTriangle,
  Plus,
  Trash2,
  ExternalLink,
  Upload,
  Loader2,
  Eye,
  EyeOff,
  Sparkles,
  TrendingUp,
  Activity,
  Layers,
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Info
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
  const [newReport, setNewReport] = useState({ title: "", body: "", report_type: "WEEKLY", people_served_delta: "0", is_public: false });
  const [newPayout, setNewPayout] = useState({ amount_usd: "", recipient_name: "", recipient_wallet: "", purpose: "", stellar_tx_hash: "" });
  const [newRisk, setNewRisk] = useState({ title: "", description: "", severity: "MEDIUM", resolution_plan: "" });
  const [newPhoto, setNewPhoto] = useState({ image_url: "", caption: "", category: "DURING" });

  const [actionLoading, setActionLoading] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

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

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 items-start">
        {/* Left Queue */}
        <div className="lg:col-span-4 bg-white/80 backdrop-blur-xl border border-slate-200/80 rounded-2xl p-4 shadow-sm space-y-4">
          <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
            <Layers className="w-4 h-4 text-slate-500" /> Active Mission Projects ({filteredMissions.length})
          </h2>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search title or country..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div className="space-y-2 max-h-[650px] overflow-y-auto">
            {loading ? (
              <div className="py-12 text-center text-xs text-slate-400">Loading missions...</div>
            ) : filteredMissions.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">No active projects.</div>
            ) : (
              filteredMissions.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setSelectedMissionId(m.id)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                    selectedMissionId === m.id
                      ? "bg-indigo-50 border-indigo-300 ring-1 ring-indigo-200"
                      : "bg-white border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-xs font-bold text-slate-900 line-clamp-1">{m.title}</span>
                    <FlagBadge country={m.target_country} />
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-semibold text-slate-500">
                    <span>${Number(m.raised_amount_usd).toLocaleString()} Raised</span>
                    <span className="text-indigo-600 font-bold">{m.status}</span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right 8-Tab Workspace */}
        <div className="lg:col-span-8 space-y-4">
          {!selectedMission || !summary ? (
            <div className="bg-white/80 border border-slate-200 rounded-2xl p-16 text-center text-xs text-slate-400">
              Select a mission project from the queue to open the project management workstation.
            </div>
          ) : (
            <>
              {/* Mission Header */}
              <div className="bg-white/80 border border-slate-200/80 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                      Project #{summary.mission_id}
                    </span>
                    <FlagBadge country={summary.target_country} />
                    <span className="text-xs font-semibold text-slate-500">{summary.target_country}</span>
                  </div>
                  <h2 className="text-lg font-bold text-slate-900">{summary.title}</h2>
                </div>
                {summary.risk_alerts.has_critical_blocker && (
                  <span className="bg-red-50 text-red-700 text-xs font-bold px-3 py-1 rounded-xl border border-red-200 flex items-center gap-1.5 shrink-0">
                    <AlertTriangle className="w-4 h-4 text-red-600" /> High Severity Incident Logged
                  </span>
                )}
              </div>

              {/* 8-Tab Bar */}
              <div className="flex flex-wrap gap-2 border-b border-slate-200/80 pb-2">
                {[
                  { id: "dashboard", label: "1. Dashboard", icon: PieChart },
                  { id: "budget", label: `2. Budget (${summary.counts.budget_items})`, icon: DollarSign },
                  { id: "receipts", label: `3. Receipts (${summary.counts.receipts})`, icon: FileText },
                  { id: "checkpoints", label: `4. Checkpoints (${summary.counts.checkpoints})`, icon: CheckSquare },
                  { id: "photos", label: `5. Photos (${summary.counts.photos})`, icon: Camera },
                  { id: "reports", label: `6. Reports (${summary.counts.field_reports})`, icon: Activity },
                  { id: "payouts", label: `7. Payouts (${summary.counts.payouts})`, icon: CreditCard },
                  { id: "risks", label: `8. Risks (${summary.risk_alerts.open_risks_count})`, icon: AlertTriangle },
                ].map((t) => {
                  const Icon = t.icon;
                  const isActive = activeTab === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setActiveTab(t.id as any)}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                        isActive ? "bg-indigo-600 text-white shadow-sm" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {t.label}
                    </button>
                  );
                })}
              </div>

              {/* TAB 1: LIVE DASHBOARD */}
              {activeTab === "dashboard" && (
                <div className="space-y-5 animate-in fade-in">
                  {/* Donations & Allocation Meter */}
                  <div className="bg-white/80 border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-emerald-600" /> Live Donations & Allocation Meter
                    </h3>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
                        <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Total Raised</span>
                        <span className="text-lg font-extrabold text-slate-900">${summary.donations_meter.total_raised_usd.toLocaleString()}</span>
                      </div>
                      <div className="p-3 bg-blue-50 border border-blue-200/80 rounded-xl">
                        <span className="text-[10px] font-bold text-blue-600 uppercase block mb-1">Total Budgeted</span>
                        <span className="text-lg font-extrabold text-blue-900">${summary.donations_meter.total_budgeted_usd.toLocaleString()}</span>
                      </div>
                      <div className="p-3 bg-emerald-50 border border-emerald-200/80 rounded-xl">
                        <span className="text-[10px] font-bold text-emerald-600 uppercase block mb-1">Verified Spent</span>
                        <span className="text-lg font-extrabold text-emerald-900">${summary.donations_meter.total_verified_spent_usd.toLocaleString()}</span>
                      </div>
                      <div className="p-3 bg-amber-50 border border-amber-200/80 rounded-xl">
                        <span className="text-[10px] font-bold text-amber-600 uppercase block mb-1">Unallocated Balance</span>
                        <span className="text-lg font-extrabold text-amber-900">${summary.donations_meter.unallocated_balance_usd.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold text-slate-600">
                        <span>Spend Rate (Spent vs Budgeted)</span>
                        <span>{summary.donations_meter.spend_rate_pct}%</span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${summary.donations_meter.spend_rate_pct}%` }} />
                      </div>
                    </div>
                  </div>

                  {/* Progress Checkpoints Meter */}
                  <div className="bg-white/80 border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                        <CheckSquare className="w-4 h-4 text-indigo-600" /> Weighted Checkpoint Execution Progress
                      </h3>
                      <span className="text-xs font-extrabold text-indigo-600">{summary.progress_meter.calculated_progress_pct}% Overall</span>
                    </div>

                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-indigo-500 to-blue-600 rounded-full transition-all" style={{ width: `${summary.progress_meter.calculated_progress_pct}%` }} />
                    </div>

                    <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                      <span>{summary.progress_meter.checkpoints_completed} of {summary.progress_meter.checkpoints_total} Checkpoints Completed</span>
                      <span>Total Assigned Weight: {summary.progress_meter.total_weight_assigned}%</span>
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
                        <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px]">
                          <tr>
                            <th className="p-3">Category</th>
                            <th className="p-3">Item Name</th>
                            <th className="p-3">Qty</th>
                            <th className="p-3">Unit Cost</th>
                            <th className="p-3">Total Cost</th>
                            <th className="p-3">Status</th>
                            <th className="p-3">Vendor</th>
                            <th className="p-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium">
                          {budgetItems.map((b) => (
                            <tr key={b.id} className="hover:bg-slate-50/50">
                              <td className="p-3"><span className="bg-slate-100 px-2 py-0.5 rounded text-[10px] font-bold">{b.category}</span></td>
                              <td className="p-3 font-semibold text-slate-900">{b.item_name}</td>
                              <td className="p-3">{b.quantity}</td>
                              <td className="p-3">${b.unit_cost_usd.toLocaleString()}</td>
                              <td className="p-3 font-bold text-slate-900">${b.total_cost_usd.toLocaleString()}</td>
                              <td className="p-3">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${b.status === "PAID" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                                  {b.status}
                                </span>
                              </td>
                              <td className="p-3 text-slate-500">{b.vendor_name || "—"}</td>
                              <td className="p-3 text-right">
                                <button onClick={() => handleDeleteBudgetItem(b.id)} className="text-slate-400 hover:text-red-600 p-1">
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Add Budget Item Form */}
                    <form onSubmit={handleAddBudgetItem} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                      <h4 className="text-xs font-bold text-slate-700 uppercase">Add Budget Line Item</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <input required placeholder="Item name" value={newBudgetItem.item_name} onChange={(e) => setNewBudgetItem({ ...newBudgetItem, item_name: e.target.value })} className="text-xs p-2.5 border rounded-xl" />
                        <select value={newBudgetItem.category} onChange={(e) => setNewBudgetItem({ ...newBudgetItem, category: e.target.value })} className="text-xs p-2.5 border rounded-xl bg-white">
                          <option value="EQUIPMENT">EQUIPMENT</option>
                          <option value="MATERIALS">MATERIALS</option>
                          <option value="LABOR">LABOR</option>
                          <option value="TRANSPORT">TRANSPORT</option>
                          <option value="LOGISTICS">LOGISTICS</option>
                        </select>
                        <input required type="number" step="any" placeholder="Qty" value={newBudgetItem.quantity} onChange={(e) => setNewBudgetItem({ ...newBudgetItem, quantity: e.target.value })} className="text-xs p-2.5 border rounded-xl" />
                        <input required type="number" step="any" placeholder="Unit Cost USD" value={newBudgetItem.unit_cost_usd} onChange={(e) => setNewBudgetItem({ ...newBudgetItem, unit_cost_usd: e.target.value })} className="text-xs p-2.5 border rounded-xl" />
                        <input placeholder="Vendor Name (Optional)" value={newBudgetItem.vendor_name} onChange={(e) => setNewBudgetItem({ ...newBudgetItem, vendor_name: e.target.value })} className="text-xs p-2.5 border rounded-xl" />
                        <input placeholder="Notes" value={newBudgetItem.notes} onChange={(e) => setNewBudgetItem({ ...newBudgetItem, notes: e.target.value })} className="text-xs p-2.5 border rounded-xl" />
                      </div>
                      <button type="submit" disabled={actionLoading} className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl flex items-center gap-1.5">
                        <Plus className="w-3.5 h-3.5" /> Add Line Item
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {/* TAB 4: CHECKPOINTS */}
              {activeTab === "checkpoints" && (
                <div className="space-y-5 animate-in fade-in">
                  <div className="bg-white/80 border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">Mission Progress Checkpoints</h3>
                        <p className="text-xs text-slate-500">Auto-generated from objectives or defined manually by admin</p>
                      </div>
                      <button onClick={handleAutogenCheckpoints} disabled={actionLoading} className="px-3 py-2 bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold rounded-xl flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" /> Auto-Gen from Objectives
                      </button>
                    </div>

                    <div className="space-y-2">
                      {checkpoints.map((cp) => (
                        <div key={cp.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <button onClick={() => handleToggleCheckpointStatus(cp)} className={`w-5 h-5 rounded-full flex items-center justify-center border ${cp.status === "COMPLETED" ? "bg-emerald-500 border-emerald-600 text-white" : "border-slate-300 bg-white"}`}>
                              {cp.status === "COMPLETED" && <CheckCircle2 className="w-4 h-4" />}
                            </button>
                            <div>
                              <span className={`text-xs font-bold ${cp.status === "COMPLETED" ? "line-through text-slate-400" : "text-slate-900"}`}>{cp.title}</span>
                              <span className="text-[10px] font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded ml-2">{cp.weight_percent}% Weight</span>
                            </div>
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${cp.status === "COMPLETED" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{cp.status}</span>
                        </div>
                      ))}
                    </div>

                    {/* Add Checkpoint Form */}
                    <form onSubmit={handleAddCheckpoint} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                      <h4 className="text-xs font-bold text-slate-700 uppercase">Add Manual Checkpoint</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <input required placeholder="Checkpoint title" value={newCheckpoint.title} onChange={(e) => setNewCheckpoint({ ...newCheckpoint, title: e.target.value })} className="text-xs p-2.5 border rounded-xl sm:col-span-2" />
                        <input required type="number" step="any" placeholder="Weight %" value={newCheckpoint.weight_percent} onChange={(e) => setNewCheckpoint({ ...newCheckpoint, weight_percent: e.target.value })} className="text-xs p-2.5 border rounded-xl" />
                      </div>
                      <button type="submit" disabled={actionLoading} className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl flex items-center gap-1.5">
                        <Plus className="w-3.5 h-3.5" /> Add Checkpoint
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {/* TAB 8: RISKS */}
              {activeTab === "risks" && (
                <div className="space-y-5 animate-in fade-in">
                  <div className="bg-white/80 border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                    <h3 className="text-sm font-bold text-slate-900">Risk & Incident Log</h3>

                    <div className="space-y-3">
                      {risks.map((r) => (
                        <div key={r.id} className={`p-4 rounded-xl border flex flex-col gap-2 ${r.severity === "HIGH" ? "bg-red-50/60 border-red-200" : "bg-slate-50 border-slate-200"}`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <AlertTriangle className={`w-4 h-4 ${r.severity === "HIGH" ? "text-red-600" : "text-amber-500"}`} />
                              <span className="text-xs font-bold text-slate-900">{r.title}</span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${r.severity === "HIGH" ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800"}`}>{r.severity} SEVERITY</span>
                            </div>
                            <span className="text-[10px] font-bold bg-white px-2 py-0.5 rounded border">{r.status}</span>
                          </div>
                          <p className="text-xs text-slate-600">{r.description}</p>
                          {r.resolution_plan && <p className="text-xs text-slate-500 italic">Resolution: {r.resolution_plan}</p>}
                        </div>
                      ))}
                    </div>

                    {/* Add Risk Form */}
                    <form onSubmit={handleAddRisk} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                      <h4 className="text-xs font-bold text-slate-700 uppercase">Log New Incident / Risk</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input required placeholder="Incident title" value={newRisk.title} onChange={(e) => setNewRisk({ ...newRisk, title: e.target.value })} className="text-xs p-2.5 border rounded-xl" />
                        <select value={newRisk.severity} onChange={(e) => setNewRisk({ ...newRisk, severity: e.target.value })} className="text-xs p-2.5 border rounded-xl bg-white">
                          <option value="LOW">LOW SEVERITY</option>
                          <option value="MEDIUM">MEDIUM SEVERITY</option>
                          <option value="HIGH">HIGH SEVERITY (FLAG ADMIN)</option>
                        </select>
                      </div>
                      <textarea required rows={2} placeholder="Incident description..." value={newRisk.description} onChange={(e) => setNewRisk({ ...newRisk, description: e.target.value })} className="w-full text-xs p-2.5 border rounded-xl" />
                      <button type="submit" disabled={actionLoading} className="px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-xl flex items-center gap-1.5">
                        <Plus className="w-3.5 h-3.5" /> Log Incident
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}