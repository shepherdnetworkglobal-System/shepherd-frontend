"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  Briefcase, Search, RefreshCw, DollarSign, PieChart, CheckSquare, Camera,
  FileText, CreditCard, AlertTriangle, Plus, Trash2, ExternalLink, Upload,
  Loader2, Eye, EyeOff, Sparkles, TrendingUp, Activity, Layers, MapPin,
  Clock, ShieldCheck, CheckCircle2, Info, Target, ChevronDown, ChevronUp
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
  const [receipts, setReceipts] = useState<any[]>([]);

  // Forms State
  const [newBudgetItem, setNewBudgetItem] = useState({ item_name: "", category: "EQUIPMENT", quantity: "1", unit_cost_usd: "", notes: "", vendor_name: "" });
  const [newCheckpoint, setNewCheckpoint] = useState({ title: "", description: "", weight_percent: "20", target_date: "" });
  const [newRisk, setNewRisk] = useState({ title: "", description: "", severity: "MEDIUM", resolution_plan: "" });
  
  // New States for Milestone 3 Tabs
  const [newReceipt, setNewReceipt] = useState({ title: "", amount_spent_usd: "", category: "MATERIALS", vendor_name: "", notes: "", receipt_image_url: "" });
  const [newPhoto, setNewPhoto] = useState({ image_url: "", caption: "", category: "DURING", checkpoint_id: "" });
  const [newReport, setNewReport] = useState({ title: "", body: "", report_type: "WEEKLY", people_served_delta: "0", author_name: "" });
  const [editingReportId, setEditingReportId] = useState<number | null>(null);
  const [editReportForm, setEditReportForm] = useState({ title: "", body: "", report_type: "WEEKLY", people_served_delta: "0", author_name: "" });
  const [editingRiskId, setEditingRiskId] = useState<number | null>(null);
  const [editRiskForm, setEditRiskForm] = useState({ title: "", description: "", severity: "MEDIUM", status: "OPEN", resolution_plan: "" });
  const [editingReceiptId, setEditingReceiptId] = useState<number | null>(null);
  const [editReceiptForm, setEditReceiptForm] = useState({ title: "", amount_spent_usd: "", category: "MATERIALS", vendor_name: "", notes: "", receipt_image_url: "" });
  
  

  const [actionLoading, setActionLoading] = useState(false);
  const [uploadingState, setUploadingState] = useState<string | null>(null);
  const [isBriefExpanded, setIsBriefExpanded] = useState(false);
  const [editingCheckpointId, setEditingCheckpointId] = useState<number | null>(null);
  const [editCpForm, setEditCpForm] = useState({ title: "", description: "", weight_percent: "0" });

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
      const [sum, bData, cpData, pData, rData, payData, rkData, rcData] = await Promise.all([
        apiRequest(`/api/projects/summary/${mid}`),
        apiRequest(`/api/projects/budget/${mid}`),
        apiRequest(`/api/projects/checkpoints/${mid}`),
        apiRequest(`/api/projects/photos/${mid}`),
        apiRequest(`/api/projects/reports/${mid}`),
        apiRequest(`/api/projects/payouts/${mid}`),
        apiRequest(`/api/projects/risks/${mid}`),
        apiRequest(`/api/projects/receipts/${mid}`).catch(() => []),
      ]);
      setSummary(sum);
      setBudgetItems(bData || []);
      setCheckpoints(cpData || []);
      setPhotos(pData || []);
      setReports(rData || []);
      setPayouts(payData || []);
      setRisks(rkData || []);
      setReceipts(rcData || []);
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
    const current = String(cp.status || "PENDING").toUpperCase();
    const nextStatus =
      current === "PENDING" ? "IN_PROGRESS" :
      current === "IN_PROGRESS" ? "COMPLETED" :
      "PENDING";
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

  const handleSetCheckpointStatus = async (cp: any, status: string) => {
    try {
      await apiRequest(`/api/projects/checkpoints/${cp.id}`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      });
      if (selectedMissionId) await loadMissionData(selectedMissionId);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const startEditCheckpoint = (cp: any) => {
    setEditingCheckpointId(cp.id);
    setEditCpForm({
      title: cp.title || "",
      description: cp.description || "",
      weight_percent: String(cp.weight_percent ?? 0),
    });
  };

  const handleSaveCheckpointEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCheckpointId || !selectedMissionId) return;
    setActionLoading(true);
    try {
      await apiRequest(`/api/projects/checkpoints/${editingCheckpointId}`, {
        method: "PUT",
        body: JSON.stringify({
          title: editCpForm.title,
          description: editCpForm.description || null,
          weight_percent: parseFloat(editCpForm.weight_percent) || 0,
        }),
      });
      setEditingCheckpointId(null);
      await loadMissionData(selectedMissionId);
    } catch (err: any) {
      alert(err.message || "Failed to update checkpoint");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteCheckpoint = async (id: number) => {
    if (!confirm("Delete this checkpoint/objective?")) return;
    try {
      await apiRequest(`/api/projects/checkpoints/${id}`, { method: "DELETE" });
      if (selectedMissionId) await loadMissionData(selectedMissionId);
    } catch (err: any) {
      alert(err.message || "Failed to delete checkpoint");
    }
  };

  const handleDeletePhoto = async (id: number) => {
    if (!confirm("Delete this photo permanently?")) return;
    try {
      await apiRequest(`/api/projects/photos/${id}`, { method: "DELETE" });
      if (selectedMissionId) await loadMissionData(selectedMissionId);
    } catch (err: any) {
      alert(err.message || "Failed to delete photo");
    }
  };

  const handleDeleteReport = async (id: number) => {
    if (!confirm("Delete this field report?")) return;
    try {
      await apiRequest(`/api/projects/reports/${id}`, { method: "DELETE" });
      if (selectedMissionId) await loadMissionData(selectedMissionId);
    } catch (err: any) {
      alert(err.message || "Failed to delete report");
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, setter: (url: string) => void, label: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingState(label);
    try {
      const res = await uploadFile(file);
      setter(res.url);
    } catch (err: any) {
      alert(err.message || `Failed to upload ${label}`);
    } finally {
      setUploadingState(null);
    }
  };

  const handleAddReceipt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMissionId) return;
    if (!newReceipt.receipt_image_url) return alert("Please upload a receipt image first.");
    setActionLoading(true);
    try {
      await apiRequest("/api/projects/receipts", {
        method: "POST",
        body: JSON.stringify({
          mission_id: selectedMissionId,
          title: newReceipt.title,
          amount_spent_usd: parseFloat(newReceipt.amount_spent_usd),
          category: newReceipt.category,
          vendor_name: newReceipt.vendor_name || null,
          notes: newReceipt.notes || null,
          receipt_image_url: newReceipt.receipt_image_url,
          is_public: true,
        }),
      });
      setNewReceipt({ title: "", amount_spent_usd: "", category: "MATERIALS", vendor_name: "", notes: "", receipt_image_url: "" });
      await loadMissionData(selectedMissionId);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const startEditReceipt = (r: any) => {
    setEditingReceiptId(r.id);
    setEditReceiptForm({
      title: r.title || "",
      amount_spent_usd: String(r.amount_spent_usd ?? ""),
      category: r.category || "MATERIALS",
      vendor_name: r.vendor_name || "",
      notes: r.notes || "",
      receipt_image_url: r.receipt_image_url || "",
    });
  };

  const handleSaveReceiptEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReceiptId || !selectedMissionId) return;
    setActionLoading(true);
    try {
      await apiRequest(`/api/projects/receipts/${editingReceiptId}`, {
        method: "PUT",
        body: JSON.stringify({
          title: editReceiptForm.title,
          amount_spent_usd: parseFloat(editReceiptForm.amount_spent_usd),
          category: editReceiptForm.category,
          vendor_name: editReceiptForm.vendor_name || null,
          notes: editReceiptForm.notes || null,
          receipt_image_url: editReceiptForm.receipt_image_url || null,
        }),
      });
      setEditingReceiptId(null);
      await loadMissionData(selectedMissionId);
    } catch (err: any) {
      alert(err.message || "Failed to update receipt");
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMissionId) return;
    if (!newPhoto.image_url) return alert("Please upload an image first.");
    setActionLoading(true);
    try {
      await apiRequest("/api/projects/photos", {
        method: "POST",
        body: JSON.stringify({
          mission_id: selectedMissionId,
          checkpoint_id: newPhoto.checkpoint_id ? parseInt(newPhoto.checkpoint_id, 10) : null,
          image_url: newPhoto.image_url,
          caption: newPhoto.caption || null,
          category: newPhoto.category,
          is_public: true,
        }),
      });
      setNewPhoto({ image_url: "", caption: "", category: "DURING", checkpoint_id: "" });
      await loadMissionData(selectedMissionId);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMissionId) return;
    setActionLoading(true);
    try {
      await apiRequest("/api/projects/reports", {
        method: "POST",
        body: JSON.stringify({
          mission_id: selectedMissionId,
          title: newReport.title,
          body: newReport.body,
          report_type: newReport.report_type,
          people_served_delta: parseInt(newReport.people_served_delta, 10) || 0,
          author_name: newReport.author_name || null,
          is_public: true,
        }),
      });
      setNewReport({ title: "", body: "", report_type: "WEEKLY", people_served_delta: "0", author_name: "" });
      await loadMissionData(selectedMissionId);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const startEditReport = (r: any) => {
    setEditingReportId(r.id);
    setEditReportForm({
      title: r.title || "",
      body: r.body || "",
      report_type: r.report_type || "WEEKLY",
      people_served_delta: String(r.people_served_delta ?? 0),
      author_name: r.author_name || "",
    });
  };

  const handleSaveReportEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReportId || !selectedMissionId) return;
    setActionLoading(true);
    try {
      await apiRequest(`/api/projects/reports/${editingReportId}`, {
        method: "PUT",
        body: JSON.stringify({
          title: editReportForm.title,
          body: editReportForm.body,
          report_type: editReportForm.report_type,
          people_served_delta: parseInt(editReportForm.people_served_delta, 10) || 0,
          author_name: editReportForm.author_name || null,
        }),
      });
      setEditingReportId(null);
      await loadMissionData(selectedMissionId);
    } catch (err: any) {
      alert(err.message || "Failed to update report");
    } finally {
      setActionLoading(false);
    }
  };

  const startEditRisk = (r: any) => {
    setEditingRiskId(r.id);
    setEditRiskForm({
      title: r.title || "",
      description: r.description || "",
      severity: r.severity || "MEDIUM",
      status: r.status || "OPEN",
      resolution_plan: r.resolution_plan || "",
    });
  };

  const handleSaveRiskEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRiskId || !selectedMissionId) return;
    setActionLoading(true);
    try {
      await apiRequest(`/api/projects/risks/${editingRiskId}`, {
        method: "PUT",
        body: JSON.stringify({
          title: editRiskForm.title,
          description: editRiskForm.description,
          severity: editRiskForm.severity,
          status: editRiskForm.status,
          resolution_plan: editRiskForm.resolution_plan || null,
        }),
      });
      setEditingRiskId(null);
      await loadMissionData(selectedMissionId);
    } catch (err: any) {
      alert(err.message || "Failed to update risk");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSetRiskStatus = async (r: any, status: string) => {
    try {
      await apiRequest(`/api/projects/risks/${r.id}`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      });
      if (selectedMissionId) await loadMissionData(selectedMissionId);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteRisk = async (id: number) => {
    if (!confirm("Delete this risk incident?")) return;
    try {
      // soft fallback if delete endpoint missing: mark CLOSED
      await apiRequest(`/api/projects/risks/${id}`, {
        method: "PUT",
        body: JSON.stringify({ status: "CLOSED" }),
      });
      if (selectedMissionId) await loadMissionData(selectedMissionId);
    } catch (err: any) {
      alert(err.message);
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
          <div className="bg-white/80 backdrop-blur-xl border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4 transition-all duration-300">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">Master Brief</span>
                  <FlagBadge country={selectedMission.target_country} />
                  <span className="text-xs font-semibold text-slate-500">{selectedMission.target_country}</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 leading-snug">{selectedMission.title}</h3>
              </div>
              <div className="flex flex-wrap gap-2 shrink-0">
                <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2.5 py-1 rounded border border-emerald-200 uppercase tracking-wider flex items-center h-fit">
                  {selectedMission.status}
                </span>
                <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2.5 py-1 rounded border border-slate-200 uppercase tracking-wider flex items-center gap-1 h-fit">
                  <Target className="w-3.5 h-3.5" /> Goal: ${Number(selectedMission.goal_amount_usd).toLocaleString()}
                </span>
                {summary.risk_alerts.has_critical_blocker && (
                  <span className="bg-red-50 text-red-700 text-[10px] font-bold px-2.5 py-1 rounded border border-red-200 uppercase tracking-wider flex items-center gap-1 h-fit">
                    <AlertTriangle className="w-3.5 h-3.5" /> High Risk Alert
                  </span>
                )}
                <button 
                  onClick={() => setIsBriefExpanded(!isBriefExpanded)}
                  className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-[10px] font-bold px-3 py-1 rounded border border-indigo-200 uppercase tracking-wider flex items-center gap-1.5 transition-colors h-fit"
                >
                  {isBriefExpanded ? (
                    <><ChevronUp className="w-3.5 h-3.5" /> Close Details</>
                  ) : (
                    <><ChevronDown className="w-3.5 h-3.5" /> Read Full Brief</>
                  )}
                </button>
              </div>
            </div>

            {isBriefExpanded && (
              <div className="pt-5 border-t border-slate-100 space-y-6 animate-in slide-in-from-top-2 duration-300">
                {selectedMission.problem_statement && (
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">The Need / Problem Statement</span>
                    <p className="text-sm text-slate-700 font-medium leading-relaxed max-w-4xl">{selectedMission.problem_statement}</p>
                  </div>
                )}
                {selectedMission.mission_objectives && (
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Objectives</span>
                    <p className="text-sm text-slate-700 font-medium leading-relaxed whitespace-pre-wrap max-w-4xl">{selectedMission.mission_objectives}</p>
                  </div>
                )}
                {selectedMission.proposed_process && (
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Implementation Process</span>
                    <p className="text-sm text-slate-700 font-medium leading-relaxed whitespace-pre-wrap max-w-4xl">{selectedMission.proposed_process}</p>
                  </div>
                )}
              </div>
            )}
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
                      {checkpoints.length === 0 ? (
                        <p className="text-xs text-slate-500 py-6 text-center border border-dashed border-slate-200 rounded-xl">
                          No checkpoints yet. Click Auto-Gen or add manually.
                        </p>
                      ) : checkpoints.map((cp) => (
                        <div key={cp.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                          {editingCheckpointId === cp.id ? (
                            <form onSubmit={handleSaveCheckpointEdit} className="space-y-3">
                              <input
                                required
                                value={editCpForm.title}
                                onChange={(e) => setEditCpForm({ ...editCpForm, title: e.target.value })}
                                className="w-full text-xs font-semibold p-2.5 border border-slate-200 rounded-xl"
                                placeholder="Checkpoint title"
                              />
                              <textarea
                                rows={2}
                                value={editCpForm.description}
                                onChange={(e) => setEditCpForm({ ...editCpForm, description: e.target.value })}
                                className="w-full text-xs p-2.5 border border-slate-200 rounded-xl"
                                placeholder="Description / objective detail"
                              />
                              <div className="flex items-center gap-3">
                                <div className="w-28">
                                  <label className="text-[10px] font-bold text-slate-500 block mb-1">Weight %</label>
                                  <input
                                    type="number"
                                    step="any"
                                    required
                                    value={editCpForm.weight_percent}
                                    onChange={(e) => setEditCpForm({ ...editCpForm, weight_percent: e.target.value })}
                                    className="w-full text-xs font-semibold p-2.5 border border-slate-200 rounded-xl"
                                  />
                                </div>
                                <div className="flex gap-2 mt-5">
                                  <button type="submit" disabled={actionLoading} className="px-3 py-2 bg-indigo-600 text-white text-[10px] font-bold rounded-lg">
                                    Save
                                  </button>
                                  <button type="button" onClick={() => setEditingCheckpointId(null)} className="px-3 py-2 bg-white border border-slate-200 text-slate-600 text-[10px] font-bold rounded-lg">
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            </form>
                          ) : (
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex items-start gap-4 min-w-0">
                                <button
                                  type="button"
                                  onClick={() => handleToggleCheckpointStatus(cp)}
                                  className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center border shadow-sm transition-all shrink-0 ${cp.status === "COMPLETED" ? "bg-emerald-500 border-emerald-600 text-white" : "border-slate-300 bg-white hover:border-slate-400"}`}
                                >
                                  {cp.status === "COMPLETED" && <CheckCircle2 className="w-4 h-4" />}
                                </button>
                                <div className="min-w-0">
                                  <div className="flex flex-wrap items-center gap-2 mb-1">
                                    <span className={`text-sm font-bold ${cp.status === "COMPLETED" ? "line-through text-slate-400" : "text-slate-900"}`}>{cp.title}</span>
                                    <span className="text-[9px] font-extrabold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded border border-indigo-200">{cp.weight_percent}% Weight</span>
                                    {cp.auto_generated && (
                                      <span className="text-[9px] font-bold bg-slate-200 text-slate-600 px-2 py-0.5 rounded">AUTO</span>
                                    )}
                                  </div>
                                  {cp.description && <p className="text-xs text-slate-500 font-medium">{cp.description}</p>}
                                </div>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <select
                                  value={String(cp.status || "PENDING").toUpperCase()}
                                  onChange={(e) => handleSetCheckpointStatus(cp, e.target.value)}
                                  className={`text-[9px] font-extrabold px-2 py-1 rounded-md border bg-white ${
                                    String(cp.status).toUpperCase() === "COMPLETED"
                                      ? "text-emerald-700 border-emerald-200"
                                      : String(cp.status).toUpperCase() === "IN_PROGRESS"
                                      ? "text-blue-700 border-blue-200"
                                      : "text-amber-700 border-amber-200"
                                  }`}
                                >
                                  <option value="PENDING">PENDING</option>
                                  <option value="IN_PROGRESS">IN_PROGRESS</option>
                                  <option value="COMPLETED">COMPLETED</option>
                                  <option value="DELAYED">DELAYED</option>
                                </select>
                                <button type="button" onClick={() => startEditCheckpoint(cp)} className="text-[10px] font-bold text-indigo-600 hover:underline px-2">
                                  Edit
                                </button>
                                <button type="button" onClick={() => handleDeleteCheckpoint(cp.id)} className="p-1.5 text-slate-400 hover:text-red-600 border border-slate-200 rounded-md bg-white">
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          )}
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
                        <div key={r.id} className={`p-5 rounded-xl border flex flex-col gap-2 ${String(r.severity).toUpperCase() === "HIGH" ? "bg-red-50/60 border-red-200 shadow-sm" : "bg-slate-50 border-slate-200"}`}>
                          {editingRiskId === r.id ? (
                            <form onSubmit={handleSaveRiskEdit} className="space-y-3">
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <input
                                  required
                                  value={editRiskForm.title}
                                  onChange={(e) => setEditRiskForm({ ...editRiskForm, title: e.target.value })}
                                  className="text-xs font-semibold p-2.5 border border-slate-200 rounded-xl sm:col-span-2"
                                  placeholder="Risk title"
                                />
                                <select
                                  value={editRiskForm.severity}
                                  onChange={(e) => setEditRiskForm({ ...editRiskForm, severity: e.target.value })}
                                  className="text-xs font-semibold p-2.5 border border-slate-200 rounded-xl bg-white"
                                >
                                  <option value="LOW">LOW</option>
                                  <option value="MEDIUM">MEDIUM</option>
                                  <option value="HIGH">HIGH</option>
                                </select>
                              </div>
                              <textarea
                                required
                                rows={2}
                                value={editRiskForm.description}
                                onChange={(e) => setEditRiskForm({ ...editRiskForm, description: e.target.value })}
                                className="w-full text-xs p-2.5 border border-slate-200 rounded-xl"
                                placeholder="Description"
                              />
                              <textarea
                                rows={2}
                                value={editRiskForm.resolution_plan}
                                onChange={(e) => setEditRiskForm({ ...editRiskForm, resolution_plan: e.target.value })}
                                className="w-full text-xs p-2.5 border border-slate-200 rounded-xl"
                                placeholder="Resolution plan"
                              />
                              <div className="flex flex-wrap items-center gap-3">
                                <select
                                  value={editRiskForm.status}
                                  onChange={(e) => setEditRiskForm({ ...editRiskForm, status: e.target.value })}
                                  className="text-xs font-semibold p-2.5 border border-slate-200 rounded-xl bg-white"
                                >
                                  <option value="OPEN">OPEN</option>
                                  <option value="MONITORING">MONITORING</option>
                                  <option value="RESOLVED">RESOLVED</option>
                                  <option value="CLOSED">CLOSED</option>
                                </select>
                                <button type="submit" disabled={actionLoading} className="px-3 py-2 bg-indigo-600 text-white text-[10px] font-bold rounded-lg">Save Changes</button>
                                <button type="button" onClick={() => setEditingRiskId(null)} className="px-3 py-2 bg-white border border-slate-200 text-slate-600 text-[10px] font-bold rounded-lg">Cancel</button>
                              </div>
                            </form>
                          ) : (
                            <>
                              <div className="flex items-center justify-between gap-3">
                                <div className="flex flex-wrap items-center gap-2 min-w-0">
                                  <AlertTriangle className={`w-4 h-4 shrink-0 ${String(r.severity).toUpperCase() === "HIGH" ? "text-red-600" : "text-amber-500"}`} />
                                  <span className="text-sm font-bold text-slate-900">{r.title}</span>
                                  <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded border ${String(r.severity).toUpperCase() === "HIGH" ? "bg-red-100 text-red-800 border-red-200" : "bg-amber-100 text-amber-800 border-amber-200"}`}>{r.severity} SEVERITY</span>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                  <select
                                    value={String(r.status || "OPEN").toUpperCase()}
                                    onChange={(e) => handleSetRiskStatus(r, e.target.value)}
                                    className="text-[10px] font-bold bg-white px-2 py-1 rounded-md border border-slate-200"
                                  >
                                    <option value="OPEN">OPEN</option>
                                    <option value="MONITORING">MONITORING</option>
                                    <option value="RESOLVED">RESOLVED</option>
                                    <option value="CLOSED">CLOSED</option>
                                  </select>
                                  <button type="button" onClick={() => startEditRisk(r)} className="text-[10px] font-bold text-indigo-600 hover:underline px-2">Edit</button>
                                  <button type="button" onClick={() => handleDeleteRisk(r.id)} className="p-1.5 text-slate-400 hover:text-red-600 border border-slate-200 rounded-md bg-white">
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                              <p className="text-xs text-slate-600 font-medium leading-relaxed">{r.description}</p>
                              <div className="mt-2 pt-2 border-t border-slate-200/60">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Resolution Plan</span>
                                <p className="text-xs text-slate-700 italic">{r.resolution_plan || "No resolution plan set yet."}</p>
                              </div>
                            </>
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
                      <textarea rows={2} placeholder="Resolution plan (optional)..." value={newRisk.resolution_plan} onChange={(e) => setNewRisk({ ...newRisk, resolution_plan: e.target.value })} className="w-full text-xs font-medium p-3 border border-slate-200 rounded-xl focus:border-red-500 focus:outline-none" />
                      <button type="submit" disabled={actionLoading} className="px-5 py-3 bg-red-600 text-white text-xs font-bold uppercase tracking-wider rounded-xl flex items-center gap-2 hover:bg-red-700 transition-all disabled:opacity-50">
                        <Plus className="w-4 h-4" /> Log Incident
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {/* TAB 3: RECEIPTS */}
              {activeTab === "receipts" && (
                <div className="space-y-5 animate-in fade-in">
                  <div className="bg-white/80 border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                    <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-4">Verified Receipts Ledger</h3>

                    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                      {receipts.length === 0 ? (
                        <p className="text-xs text-slate-500 py-6 text-center border border-dashed border-slate-200 rounded-xl">No receipts logged yet.</p>
                      ) : (
                        <div className="grid grid-cols-1 gap-3">
                          {receipts.map((r) => (
                            <div key={r.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                              {editingReceiptId === r.id ? (
                                <form onSubmit={handleSaveReceiptEdit} className="space-y-3">
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <input
                                      required
                                      value={editReceiptForm.title}
                                      onChange={(e) => setEditReceiptForm({ ...editReceiptForm, title: e.target.value })}
                                      className="text-xs font-semibold p-2.5 border border-slate-200 rounded-xl"
                                      placeholder="Receipt title"
                                    />
                                    <input
                                      required
                                      type="number"
                                      step="any"
                                      value={editReceiptForm.amount_spent_usd}
                                      onChange={(e) => setEditReceiptForm({ ...editReceiptForm, amount_spent_usd: e.target.value })}
                                      className="text-xs font-semibold p-2.5 border border-slate-200 rounded-xl"
                                      placeholder="Amount USD"
                                    />
                                    <select
                                      value={editReceiptForm.category}
                                      onChange={(e) => setEditReceiptForm({ ...editReceiptForm, category: e.target.value })}
                                      className="text-xs font-semibold p-2.5 border border-slate-200 rounded-xl bg-white"
                                    >
                                      <option value="EQUIPMENT">EQUIPMENT</option>
                                      <option value="MATERIALS">MATERIALS</option>
                                      <option value="LABOR">LABOR</option>
                                      <option value="TRANSPORT">TRANSPORT</option>
                                      <option value="LOGISTICS">LOGISTICS</option>
                                    </select>
                                    <input
                                      value={editReceiptForm.vendor_name}
                                      onChange={(e) => setEditReceiptForm({ ...editReceiptForm, vendor_name: e.target.value })}
                                      className="text-xs font-semibold p-2.5 border border-slate-200 rounded-xl"
                                      placeholder="Vendor name"
                                    />
                                  </div>
                                  <textarea
                                    rows={2}
                                    value={editReceiptForm.notes}
                                    onChange={(e) => setEditReceiptForm({ ...editReceiptForm, notes: e.target.value })}
                                    className="w-full text-xs p-2.5 border border-slate-200 rounded-xl"
                                    placeholder="Notes / correction details"
                                  />
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="file"
                                      accept="image/*,.pdf"
                                      onChange={(e) => handleFileUpload(e, (url) => setEditReceiptForm({ ...editReceiptForm, receipt_image_url: url }), "EditReceipt")}
                                      className="text-xs w-full p-2 border border-slate-200 rounded-xl bg-white"
                                    />
                                    {uploadingState === "EditReceipt" && <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" />}
                                    {editReceiptForm.receipt_image_url && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                                  </div>
                                  <div className="flex gap-2">
                                    <button type="submit" disabled={actionLoading || uploadingState !== null} className="px-3 py-2 bg-indigo-600 text-white text-[10px] font-bold rounded-lg">
                                      Save Changes
                                    </button>
                                    <button type="button" onClick={() => setEditingReceiptId(null)} className="px-3 py-2 bg-white border border-slate-200 text-slate-600 text-[10px] font-bold rounded-lg">
                                      Cancel
                                    </button>
                                  </div>
                                </form>
                              ) : (
                                <div className="flex items-start justify-between gap-3">
                                  <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2 mb-1">
                                      <span className="text-sm font-bold text-slate-900">{r.title}</span>
                                      <span className="text-[9px] font-extrabold bg-slate-200 text-slate-700 px-2 py-0.5 rounded">{r.category}</span>
                                    </div>
                                    <p className="text-xs text-slate-500 font-medium">
                                      {r.vendor_name || "Unknown vendor"}
                                    </p>
                                    {r.notes && (
                                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                                        <span className="font-bold text-slate-500">Notes:</span> {r.notes}
                                      </p>
                                    )}
                                    {r.receipt_image_url && (
                                      <button
                                        type="button"
                                        onClick={() => window.open(r.receipt_image_url, "_blank")}
                                        className="text-[11px] font-bold text-indigo-600 mt-2 hover:underline"
                                      >
                                        View receipt file
                                      </button>
                                    )}
                                  </div>
                                  <div className="text-right shrink-0 space-y-2">
                                    <div className="text-sm font-extrabold text-slate-900">${Number(r.amount_spent_usd).toLocaleString()}</div>
                                    <div className="flex items-center justify-end gap-2">
                                      <button
                                        type="button"
                                        onClick={() => startEditReceipt(r)}
                                        className="text-[10px] font-bold text-indigo-600 hover:underline px-2"
                                      >
                                        Edit
                                      </button>
                                      <button
                                        type="button"
                                        onClick={async () => {
                                          if (!confirm("Delete this receipt?")) return;
                                          try {
                                            await apiRequest(`/api/projects/receipts/${r.id}`, { method: "DELETE" });
                                            if (selectedMissionId) await loadMissionData(selectedMissionId);
                                          } catch (err: any) {
                                            alert(err.message);
                                          }
                                        }}
                                        className="p-1.5 text-slate-400 hover:text-red-600 border border-slate-200 rounded-md bg-white"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                          <p className="text-xs text-slate-500 italic">Total verified spend logged: ${summary.donations_meter.total_verified_spent_usd.toLocaleString()}</p>
                        </div>
                      )}
                    </div>

                    <form onSubmit={handleAddReceipt} className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-4 mt-4">
                      <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Log Field Receipt</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        <input required placeholder="Receipt title / description" value={newReceipt.title} onChange={(e) => setNewReceipt({ ...newReceipt, title: e.target.value })} className="text-xs font-semibold p-3 border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none lg:col-span-2" />
                        <input required type="number" step="any" placeholder="Amount (USD)" value={newReceipt.amount_spent_usd} onChange={(e) => setNewReceipt({ ...newReceipt, amount_spent_usd: e.target.value })} className="text-xs font-semibold p-3 border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none" />
                        <select value={newReceipt.category} onChange={(e) => setNewReceipt({ ...newReceipt, category: e.target.value })} className="text-xs font-semibold p-3 border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none bg-white">
                          <option value="EQUIPMENT">EQUIPMENT</option>
                          <option value="MATERIALS">MATERIALS</option>
                          <option value="LABOR">LABOR</option>
                          <option value="TRANSPORT">TRANSPORT</option>
                          <option value="LOGISTICS">LOGISTICS</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input placeholder="Vendor Name (optional)" value={newReceipt.vendor_name} onChange={(e) => setNewReceipt({ ...newReceipt, vendor_name: e.target.value })} className="text-xs font-semibold p-3 border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none" />
                        <div className="flex items-center gap-2">
                          <input type="file" accept="image/*,.pdf" onChange={(e) => handleFileUpload(e, (url) => setNewReceipt({ ...newReceipt, receipt_image_url: url }), "Receipt")} className="text-xs w-full p-2 border border-slate-200 rounded-xl bg-white" />
                          {uploadingState === "Receipt" && <Loader2 className="w-4 h-4 text-indigo-500 animate-spin shrink-0" />}
                          {newReceipt.receipt_image_url && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />}
                        </div>
                      </div>

                      <textarea
                        rows={2}
                        placeholder="Notes (optional) — payment context, invoice #, correction remarks..."
                        value={newReceipt.notes}
                        onChange={(e) => setNewReceipt({ ...newReceipt, notes: e.target.value })}
                        className="w-full text-xs font-medium p-3 border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none"
                      />

                      <button type="submit" disabled={actionLoading || uploadingState !== null} className="px-5 py-3 bg-indigo-600 text-white text-xs font-bold uppercase tracking-wider rounded-xl flex items-center gap-2 hover:bg-indigo-700 transition-all disabled:opacity-50">
                        <Upload className="w-4 h-4" /> Upload & Verify Receipt
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {/* TAB 5: PHOTOS */}
              {activeTab === "photos" && (
                <div className="space-y-5 animate-in fade-in">
                  <div className="bg-white/80 border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                    <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-4">Field Media Gallery</h3>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-h-[500px] overflow-y-auto pr-2">
                      {photos.length === 0 ? (
                        <p className="text-xs text-slate-500 py-6 text-center border border-dashed border-slate-200 rounded-xl col-span-full">No media uploaded yet.</p>
                      ) : (
                        photos.map((p) => (
                          <div key={p.id} className="relative group rounded-xl overflow-hidden border border-slate-200 aspect-square bg-slate-100">
                            <img src={p.image_url} alt="" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                              <div className="flex justify-end">
                                <button
                                  type="button"
                                  onClick={() => handleDeletePhoto(p.id)}
                                  className="bg-red-600 hover:bg-red-700 text-white p-1.5 rounded-lg shadow-sm"
                                  title="Delete photo"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                              <div>
                                <span className="text-white text-[9px] font-bold">{p.category}</span>
                                {p.caption && <p className="text-white text-[9px] truncate">{p.caption}</p>}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    <form onSubmit={handleAddPhoto} className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-4 mt-4">
                      <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Upload Mission Photo</h4>
                      
                      <div className="flex items-center gap-3">
                        <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, (url) => setNewPhoto({ ...newPhoto, image_url: url }), "Photo")} className="text-xs w-full max-w-xs p-2 border border-slate-200 rounded-xl bg-white" />
                        {uploadingState === "Photo" && <span className="text-[10px] text-blue-500 flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin"/> Uploading...</span>}
                        {newPhoto.image_url && <span className="text-[10px] text-emerald-600 flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Ready</span>}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <input placeholder="Caption (optional)" value={newPhoto.caption} onChange={(e) => setNewPhoto({ ...newPhoto, caption: e.target.value })} className="text-xs font-semibold p-3 border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none" />
                        
                        <select value={newPhoto.category} onChange={(e) => setNewPhoto({ ...newPhoto, category: e.target.value })} className="text-xs font-semibold p-3 border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none bg-white">
                          <option value="BEFORE">BEFORE (Current State)</option>
                          <option value="DURING">DURING (Progress)</option>
                          <option value="AFTER">AFTER (Completed)</option>
                        </select>

                        <select value={newPhoto.checkpoint_id} onChange={(e) => setNewPhoto({ ...newPhoto, checkpoint_id: e.target.value })} className="text-xs font-semibold p-3 border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none bg-white">
                          <option value="">-- No Checkpoint Linked --</option>
                          {checkpoints.map(cp => (
                            <option key={cp.id} value={cp.id}>{cp.title}</option>
                          ))}
                        </select>
                      </div>

                      <button type="submit" disabled={actionLoading || uploadingState !== null || !newPhoto.image_url} className="px-5 py-3 bg-indigo-600 text-white text-xs font-bold uppercase tracking-wider rounded-xl flex items-center gap-2 hover:bg-indigo-700 transition-all disabled:opacity-50">
                        <Plus className="w-4 h-4" /> Add Photo
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {/* TAB 6: REPORTS */}
              {activeTab === "reports" && (
                <div className="space-y-5 animate-in fade-in">
                  <div className="bg-white/80 border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                    <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-4">Field Narrative Reports</h3>

                    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                      {reports.length === 0 ? (
                        <p className="text-xs text-slate-500 py-6 text-center border border-dashed border-slate-200 rounded-xl">No field reports submitted yet.</p>
                      ) : (
                        reports.map((r) => (
                          <div key={r.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                            {editingReportId === r.id ? (
                              <form onSubmit={handleSaveReportEdit} className="space-y-3">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  <input
                                    required
                                    value={editReportForm.title}
                                    onChange={(e) => setEditReportForm({ ...editReportForm, title: e.target.value })}
                                    className="text-xs font-semibold p-2.5 border border-slate-200 rounded-xl"
                                    placeholder="Report title"
                                  />
                                  <select
                                    value={editReportForm.report_type}
                                    onChange={(e) => setEditReportForm({ ...editReportForm, report_type: e.target.value })}
                                    className="text-xs font-semibold p-2.5 border border-slate-200 rounded-xl bg-white"
                                  >
                                    <option value="WEEKLY">Weekly Update</option>
                                    <option value="MONTHLY">Monthly Summary</option>
                                    <option value="TESTIMONY">Beneficiary Testimony</option>
                                    <option value="COMPLETION">Completion Report</option>
                                    <option value="INCIDENT">Incident Note</option>
                                  </select>
                                </div>
                                <textarea
                                  required
                                  rows={4}
                                  value={editReportForm.body}
                                  onChange={(e) => setEditReportForm({ ...editReportForm, body: e.target.value })}
                                  className="w-full text-xs p-2.5 border border-slate-200 rounded-xl"
                                />
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  <input
                                    type="number"
                                    value={editReportForm.people_served_delta}
                                    onChange={(e) => setEditReportForm({ ...editReportForm, people_served_delta: e.target.value })}
                                    className="text-xs font-semibold p-2.5 border border-slate-200 rounded-xl"
                                    placeholder="People impacted delta"
                                  />
                                  <input
                                    value={editReportForm.author_name}
                                    onChange={(e) => setEditReportForm({ ...editReportForm, author_name: e.target.value })}
                                    className="text-xs font-semibold p-2.5 border border-slate-200 rounded-xl"
                                    placeholder="Author name"
                                  />
                                </div>
                                <div className="flex gap-2">
                                  <button type="submit" disabled={actionLoading} className="px-3 py-2 bg-indigo-600 text-white text-[10px] font-bold rounded-lg">Save Changes</button>
                                  <button type="button" onClick={() => setEditingReportId(null)} className="px-3 py-2 bg-white border border-slate-200 text-slate-600 text-[10px] font-bold rounded-lg">Cancel</button>
                                </div>
                              </form>
                            ) : (
                              <>
                                <div className="flex items-center justify-between mb-2 gap-3">
                                  <h4 className="text-sm font-bold text-slate-900">{r.title}</h4>
                                  <div className="flex items-center gap-2 shrink-0">
                                    <span className="text-[9px] font-bold uppercase bg-slate-200 text-slate-700 px-2 py-0.5 rounded">{r.report_type}</span>
                                    <button type="button" onClick={() => startEditReport(r)} className="text-[10px] font-bold text-indigo-600 hover:underline px-2">Edit</button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteReport(r.id)}
                                      className="p-1.5 text-slate-400 hover:text-red-600 border border-slate-200 rounded-md bg-white"
                                      title="Delete report"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                                <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">{r.body}</p>
                                <div className="mt-3 pt-3 border-t border-slate-200/60 flex justify-between text-[10px] text-slate-500 font-semibold">
                                  <span>By: {r.author_name || "Unknown"}</span>
                                  {r.people_served_delta > 0 && <span className="text-emerald-600">+{r.people_served_delta} Lives Impacted</span>}
                                </div>
                              </>
                            )}
                          </div>
                        ))
                      )}
                    </div>

                    <form onSubmit={handleAddReport} className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-4 mt-4">
                      <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Publish New Report</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input required placeholder="Report Title" value={newReport.title} onChange={(e) => setNewReport({ ...newReport, title: e.target.value })} className="text-xs font-semibold p-3 border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none" />
                        <select value={newReport.report_type} onChange={(e) => setNewReport({ ...newReport, report_type: e.target.value })} className="text-xs font-semibold p-3 border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none bg-white">
                          <option value="WEEKLY">Weekly Update</option>
                          <option value="MONTHLY">Monthly Summary</option>
                          <option value="TESTIMONY">Beneficiary Testimony</option>
                          <option value="COMPLETION">Completion Report</option>
                        </select>
                      </div>
                      <textarea required rows={4} placeholder="Write report content..." value={newReport.body} onChange={(e) => setNewReport({ ...newReport, body: e.target.value })} className="w-full text-xs font-medium p-3 border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none" />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 block mb-1">New People Impacted (Delta)</label>
                          <input type="number" value={newReport.people_served_delta} onChange={(e) => setNewReport({ ...newReport, people_served_delta: e.target.value })} className="w-full text-xs font-semibold p-3 border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none" />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 block mb-1">Author Name (Optional)</label>
                          <input value={newReport.author_name} onChange={(e) => setNewReport({ ...newReport, author_name: e.target.value })} className="w-full text-xs font-semibold p-3 border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none" />
                        </div>
                      </div>
                      <button type="submit" disabled={actionLoading} className="px-5 py-3 bg-indigo-600 text-white text-xs font-bold uppercase tracking-wider rounded-xl flex items-center gap-2 hover:bg-indigo-700 transition-all disabled:opacity-50">
                        <Plus className="w-4 h-4" /> Publish Report
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {/* TAB 7: PAYOUTS (Placeholder remains as it requires Stellar integration logic) */}
              {activeTab === "payouts" && (
                <div className="bg-white/80 border border-slate-200 rounded-2xl p-16 text-center shadow-sm animate-in fade-in">
                  <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-200">
                    <CreditCard className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-2">On-Chain Payout Ledger</h3>
                  <p className="text-sm text-slate-500 max-w-sm mx-auto">
                    The Payouts ledger will map directly to actual Stellar network disbursements sent from the treasury wallet in the final integration phase.
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