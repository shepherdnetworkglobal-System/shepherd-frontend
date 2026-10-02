"use client";

import React, { useEffect, useState } from "react";
import {
  Map,
  Search,
  RefreshCw,
  Target,
  DollarSign,
  CheckCircle2,
  PauseCircle,
  PlayCircle,
  Flag,
  FileText,
  Camera,
  AlertTriangle,
  Eye,
  EyeOff,
  Shield,
  Clock,
  Users,
  MapPin,
  Settings2,
  ChevronRight,
  Activity,
  Package
} from "lucide-react";
import { apiRequest } from "@/lib/api";

interface Mission {
  id: number;
  missionary_id: number;
  title: string;
  description: string;
  goal_amount_usd: number;
  raised_amount_usd: number;
  target_country: string;
  location_granularity?: string | null;
  exact_location_hidden?: boolean;
  local_partners?: string | null;
  underfunding_rule?: string;
  overfunding_rule?: string;
  reporting_plan?: string | null;
  status: "ACTIVE" | "FUNDED" | "COMPLETED" | "PAUSED";
  created_at: string;
}

interface Receipt {
  id: number;
  mission_id: number;
  title: string;
  amount_spent_usd: number;
  category: string;
  receipt_image_url: string;
  vendor_name?: string | null;
  notes?: string | null;
  created_at: string;
}

interface Milestone {
  id: number;
  mission_id: number;
  title: string;
  description: string;
  photo_url?: string | null;
  people_served: number;
  created_at: string;
}

export default function MissionsWorkstation() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [activePanel, setActivePanel] = useState<"OVERVIEW" | "RECEIPTS" | "MILESTONES" | "RULES">("OVERVIEW");
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Editable fields
  const [editStatus, setEditStatus] = useState<string>("ACTIVE");
  const [editUnderfunding, setEditUnderfunding] = useState("HOLD_UNTIL_THRESHOLD");
  const [editOverfunding, setEditOverfunding] = useState("EXPAND_SCOPE");
  const [editLocationHidden, setEditLocationHidden] = useState(false);
  const [editLocationGranularity, setEditLocationGranularity] = useState("");
  const [editReportingPlan, setEditReportingPlan] = useState("");
  const [editLocalPartners, setEditLocalPartners] = useState("");

  // Independent Modals State
  const [showOpModal, setShowOpModal] = useState(false);
  const [showMissionModal, setShowMissionModal] = useState(false);
  const [availableOperators, setAvailableOperators] = useState<any[]>([]);

  // Standalone Missionary Form
  const [opName, setOpName] = useState("");
  const [opEmail, setOpEmail] = useState("");
  const [opCountry, setOpCountry] = useState("Kenya");
  const [opOrg, setOpOrg] = useState("Independent");
  const [opWallet, setOpWallet] = useState("");
  const [creatingOp, setCreatingOp] = useState(false);

  // Standalone Mission Form
  const [selectedOpId, setSelectedOpId] = useState<string>("");
  const [missionTitle, setMissionTitle] = useState("");
  const [missionDesc, setMissionDesc] = useState("");
  const [missionGoal, setMissionGoal] = useState("5000");
  const [missionCountry, setMissionCountry] = useState("Kenya");
  const [creatingMission, setCreatingMission] = useState(false);

  const fetchOperators = async () => {
    try {
      const ops = await apiRequest("/api/verification/applications");
      setAvailableOperators(ops || []);
      if (ops && ops.length > 0 && !selectedOpId) {
        setSelectedOpId(String(ops[0].id));
      }
    } catch {
      setAvailableOperators([]);
    }
  };

  useEffect(() => {
    fetchOperators();
  }, []);

  const fetchMissions = async () => {
    setLoading(true);
    try {
      const data = (await apiRequest("/api/missions")) as Mission[];
      setMissions(data);
      if (data.length > 0 && !selectedMission) {
        selectMission(data[0]);
      }
    } catch (err) {
      console.error("Failed to load missions:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMissionDetails = async (missionId: number) => {
    try {
      const [rData, mData] = await Promise.all([
        apiRequest(`/api/accountability/receipts/${missionId}`).catch(() => []),
        apiRequest(`/api/accountability/milestones/${missionId}`).catch(() => [])
      ]);
      setReceipts(rData as Receipt[]);
      setMilestones(mData as Milestone[]);
    } catch (err) {
      setReceipts([]);
      setMilestones([]);
    }
  };

  useEffect(() => {
    fetchMissions();
  }, []);

  const selectMission = (m: Mission) => {
    setSelectedMission(m);
    setEditStatus(m.status);
    setEditUnderfunding(m.underfunding_rule || "HOLD_UNTIL_THRESHOLD");
    setEditOverfunding(m.overfunding_rule || "EXPAND_SCOPE");
    setEditLocationHidden(m.exact_location_hidden || false);
    setEditLocationGranularity(m.location_granularity || "");
    setEditReportingPlan(m.reporting_plan || "");
    setEditLocalPartners(m.local_partners || "");
    setSaveMessage(null);
    setActivePanel("OVERVIEW");
    fetchMissionDetails(m.id);
  };

  const handleCreateMissionary = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingOp(true);
    try {
      const userRes = await apiRequest("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({
          email: opEmail,
          password: "TempPassword123!",
          full_name: opName,
          role: "MISSIONARY",
        }),
      });

      await apiRequest("/api/verification/apply", {
        method: "POST",
        body: JSON.stringify({
          user_id: userRes.id || userRes.user_id,
          country: opCountry,
          affiliation_path: "INDEPENDENT",
          organization_name: opOrg,
          stellar_payout_address: opWallet || null,
        }),
      });

      setShowOpModal(false);
      setOpName("");
      setOpEmail("");
      setOpWallet("");
      await fetchOperators();
      alert("Missionary Profile Onboarded Successfully!");
    } catch (err: any) {
      alert(err.message || "Failed to onboard missionary.");
    } finally {
      setCreatingOp(false);
    }
  };

  const handleCreateMission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOpId) {
      alert("Please select or onboard a missionary first.");
      return;
    }
    setCreatingMission(true);
    try {
      await apiRequest("/api/missions", {
        method: "POST",
        body: JSON.stringify({
          missionary_id: parseInt(selectedOpId, 10),
          title: missionTitle,
          description: missionDesc,
          goal_amount_usd: parseFloat(missionGoal),
          target_country: missionCountry,
        }),
      });

      setShowMissionModal(false);
      setMissionTitle("");
      setMissionDesc("");
      await fetchMissions();
      alert("Mission Campaign Created Successfully!");
    } catch (err: any) {
      alert(err.message || "Failed to create mission.");
    } finally {
      setCreatingMission(false);
    }
  };

  const handleSaveMission = async () => {
    if (!selectedMission) return;
    setSaving(true);
    setSaveMessage(null);
    try {
      const updated = (await apiRequest(`/api/missions/${selectedMission.id}`, {
        method: "PUT",
        body: JSON.stringify({
          status: editStatus,
          underfunding_rule: editUnderfunding,
          overfunding_rule: editOverfunding,
          exact_location_hidden: editLocationHidden,
          location_granularity: editLocationGranularity || null,
          reporting_plan: editReportingPlan || null,
          local_partners: editLocalPartners || null
        })
      })) as Mission;

      setSaveMessage("Mission field operations updated successfully.");
      setMissions(prev => prev.map(m => (m.id === updated.id ? { ...m, ...updated } : m)));
      setSelectedMission({ ...selectedMission, ...updated });
    } catch (err: any) {
      setSaveMessage(err.message || "Failed to update mission. Backend may need PUT endpoint.");
    } finally {
      setSaving(false);
    }
  };

  const filteredMissions = missions.filter(m => {
    const matchesSearch =
      m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.target_country.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "ALL" || m.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const totalRaised = missions.reduce((acc, m) => acc + Number(m.raised_amount_usd), 0);
  const totalGoal = missions.reduce((acc, m) => acc + Number(m.goal_amount_usd), 0);
  const activeCount = missions.filter(m => m.status === "ACTIVE").length;
  const completedCount = missions.filter(m => m.status === "COMPLETED").length;

  const progressPct = (m: Mission) => {
    const goal = Number(m.goal_amount_usd) || 1;
    return Math.min(100, Math.round((Number(m.raised_amount_usd) / goal) * 100));
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto h-full flex flex-col space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
              Module 01.07
            </span>
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Field Operations & Mission Lifecycle</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Map className="w-7 h-7 text-indigo-600" />
            Missions & Field Operations Workstation
          </h1>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowOpModal(true)}
            className="px-4 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-slate-800 transition-all flex items-center gap-1.5 shadow-sm"
          >
            + Onboard Missionary
          </button>

          <button
            onClick={() => {
              fetchOperators();
              setShowMissionModal(true);
            }}
            className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-indigo-700 transition-all flex items-center gap-1.5 shadow-sm"
          >
            + Create Mission
          </button>
          
          <button
            onClick={fetchMissions}
            className="px-3.5 py-2.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 flex items-center gap-1.5 shadow-sm transition-all uppercase tracking-wider"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Sync
          </button>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white/80 backdrop-blur-xl border border-slate-200/80 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1">
            <span>Active Deployments</span>
            <PlayCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 num-tabular">{activeCount}</div>
        </div>
        <div className="p-4 bg-white/80 backdrop-blur-xl border border-slate-200/80 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1">
            <span>Completed Missions</span>
            <Flag className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 num-tabular">{completedCount}</div>
        </div>
        <div className="p-4 bg-white/80 backdrop-blur-xl border border-slate-200/80 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1">
            <span>Total Raised</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 num-tabular">
            ${totalRaised.toLocaleString("en-US", { maximumFractionDigits: 0 })}
          </div>
        </div>
        <div className="p-4 bg-white/80 backdrop-blur-xl border border-slate-200/80 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1">
            <span>Funding Progress</span>
            <Target className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 num-tabular">
            {totalGoal > 0 ? Math.round((totalRaised / totalGoal) * 100) : 0}%
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 items-start">
        {/* Left: Mission Queue */}
        <div className="lg:col-span-4 bg-white/80 backdrop-blur-xl border border-slate-200/80 rounded-2xl p-4 shadow-sm flex flex-col space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
              <Package className="w-4 h-4 text-slate-500" />
              Mission Queue ({filteredMissions.length})
            </h2>
          </div>

          <div className="flex flex-col space-y-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search title or country..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
              />
            </div>
            <div className="flex space-x-1 overflow-x-auto pb-1 text-xs">
              {["ALL", "ACTIVE", "FUNDED", "COMPLETED", "PAUSED"].map(st => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`px-2.5 py-1 rounded-md font-medium whitespace-nowrap transition-colors ${
                    filterStatus === st
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {loading ? (
              <div className="text-center py-12 text-slate-400 text-xs font-medium">Loading missions...</div>
            ) : filteredMissions.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs font-medium">No missions found.</div>
            ) : (
              filteredMissions.map(m => {
                const isSelected = selectedMission?.id === m.id;
                const pct = progressPct(m);
                return (
                  <div
                    key={m.id}
                    onClick={() => selectMission(m)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer space-y-2 ${
                      isSelected
                        ? "bg-indigo-50/70 border-indigo-300 ring-1 ring-indigo-300 shadow-sm"
                        : "bg-white border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 line-clamp-1">{m.title}</span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border shrink-0 ml-2 ${
                          m.status === "ACTIVE"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : m.status === "COMPLETED"
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : m.status === "PAUSED"
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : "bg-slate-100 text-slate-600 border-slate-200"
                        }`}
                      >
                        {m.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {m.target_country}
                      </span>
                      <span className="font-semibold num-tabular">
                        ${Number(m.raised_amount_usd).toLocaleString()} / ${Number(m.goal_amount_usd).toLocaleString()}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Mission Inspector */}
        {selectedMission ? (
          <div className="lg:col-span-8 space-y-5">
            {/* Mission Header Card */}
            <div className="bg-white/80 backdrop-blur-xl border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">{selectedMission.title}</h2>
                  <p className="text-xs font-medium text-slate-500 mt-0.5">
                    Mission #{selectedMission.id} • Missionary Profile #{selectedMission.missionary_id} •{" "}
                    {selectedMission.target_country}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={editStatus}
                    onChange={e => setEditStatus(e.target.value)}
                    className="text-xs font-bold bg-slate-900 text-white rounded-lg px-3 py-2 focus:outline-none"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="FUNDED">FUNDED</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="PAUSED">PAUSED</option>
                  </select>
                </div>
              </div>

              <p className="text-xs font-medium text-slate-600 leading-relaxed line-clamp-3">
                {selectedMission.description}
              </p>

              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Raised</span>
                  <span className="text-base font-extrabold text-slate-900 num-tabular">
                    ${Number(selectedMission.raised_amount_usd).toLocaleString()}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Goal</span>
                  <span className="text-base font-extrabold text-slate-900 num-tabular">
                    ${Number(selectedMission.goal_amount_usd).toLocaleString()}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Progress</span>
                  <span className="text-base font-extrabold text-indigo-600 num-tabular">
                    {progressPct(selectedMission)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Panel Tabs */}
            <div className="flex space-x-2">
              {[
                { id: "OVERVIEW", label: "Overview & Privacy", icon: Eye },
                { id: "RECEIPTS", label: `Field Receipts (${receipts.length})`, icon: FileText },
                { id: "MILESTONES", label: `Milestones (${milestones.length})`, icon: Camera },
                { id: "RULES", label: "Funding Rules", icon: Settings2 }
              ].map(tab => {
                const Icon = tab.icon;
                const isActive = activePanel === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActivePanel(tab.id as any)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                      isActive
                        ? "bg-slate-900 text-white shadow-sm"
                        : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/60"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* OVERVIEW Panel */}
            {activePanel === "OVERVIEW" && (
              <div className="bg-white/80 backdrop-blur-xl border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-indigo-600" />
                  Location Privacy & Field Partners
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-500 mb-1 block">
                      Location Granularity (Public Display)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Turkana East, Kenya"
                      value={editLocationGranularity}
                      onChange={e => setEditLocationGranularity(e.target.value)}
                      className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="flex items-end">
                    <label
                      className={`w-full p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                        editLocationHidden
                          ? "bg-amber-50/80 border-amber-300 text-amber-900"
                          : "bg-slate-50 border-slate-200 text-slate-600"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {editLocationHidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        <span className="text-xs font-semibold">Hide Exact Location (Safeguarding)</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={editLocationHidden}
                        onChange={e => setEditLocationHidden(e.target.checked)}
                        className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                      />
                    </label>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-500 mb-1 block">Local Partners</label>
                  <textarea
                    rows={2}
                    placeholder="Local church partners, NGOs, community leaders..."
                    value={editLocalPartners}
                    onChange={e => setEditLocalPartners(e.target.value)}
                    className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-500 mb-1 block">Reporting Plan</label>
                  <textarea
                    rows={2}
                    placeholder="Cadence of field reports, photo evidence, milestone schedule..."
                    value={editReportingPlan}
                    onChange={e => setEditReportingPlan(e.target.value)}
                    className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
                  />
                </div>
              </div>
            )}

            {/* RECEIPTS Panel */}
            {activePanel === "RECEIPTS" && (
              <div className="bg-white/80 backdrop-blur-xl border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-3">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  Field Receipt Evidence
                </h3>
                {receipts.length === 0 ? (
                  <div className="py-10 text-center text-xs font-medium text-slate-400">
                    No field receipts submitted for this mission yet.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {receipts.map(r => (
                      <div
                        key={r.id}
                        className="p-3 bg-slate-50 border border-slate-200/70 rounded-xl flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900">{r.title}</span>
                            <span className="text-[10px] font-semibold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                              {r.category}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {r.vendor_name || "Unknown vendor"} • {new Date(r.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-sm font-extrabold text-slate-900 num-tabular block">
                            ${Number(r.amount_spent_usd).toFixed(2)}
                          </span>
                          {r.receipt_image_url && (
                            <a
                              href={r.receipt_image_url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[10px] font-semibold text-blue-600 hover:underline"
                            >
                              View Image
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* MILESTONES Panel */}
            {activePanel === "MILESTONES" && (
              <div className="bg-white/80 backdrop-blur-xl border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-3">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-blue-600" />
                  Field Milestone Updates
                </h3>
                {milestones.length === 0 ? (
                  <div className="py-10 text-center text-xs font-medium text-slate-400">
                    No milestone updates posted for this mission yet.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {milestones.map(ms => (
                      <div
                        key={ms.id}
                        className="p-3 bg-slate-50 border border-slate-200/70 rounded-xl space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900">{ms.title}</span>
                          <span className="text-[10px] font-semibold text-slate-500 flex items-center gap-1">
                            <Users className="w-3 h-3" /> {ms.people_served} served
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 font-medium leading-relaxed line-clamp-2">
                          {ms.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-slate-400">
                            {new Date(ms.created_at).toLocaleDateString()}
                          </span>
                          {ms.photo_url && (
                            <a
                              href={ms.photo_url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[10px] font-semibold text-blue-600 hover:underline"
                            >
                              View Photo Evidence
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* RULES Panel */}
            {activePanel === "RULES" && (
              <div className="bg-white/80 backdrop-blur-xl border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Settings2 className="w-4 h-4 text-amber-600" />
                  Underfunding & Overfunding Policy
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-500 mb-1 block">
                      If Goal Not Reached (Underfunding)
                    </label>
                    <select
                      value={editUnderfunding}
                      onChange={e => setEditUnderfunding(e.target.value)}
                      className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800"
                    >
                      <option value="HOLD_UNTIL_THRESHOLD">Hold Until Threshold Met</option>
                      <option value="REFUND">Refund Donors</option>
                      <option value="REDIRECT_APPROVED_MISSION">Redirect to Approved Mission</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-500 mb-1 block">
                      If Goal Exceeded (Overfunding)
                    </label>
                    <select
                      value={editOverfunding}
                      onChange={e => setEditOverfunding(e.target.value)}
                      className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800"
                    >
                      <option value="EXPAND_SCOPE">Expand Mission Scope</option>
                      <option value="NEXT_MISSION_POOL">Pool for Next Mission</option>
                      <option value="RESERVE_FUND">Place in Reserve Fund</option>
                    </select>
                  </div>
                </div>
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-[11px] font-medium text-amber-800 leading-relaxed">
                    Funding rules must be set before a mission goes live. Changing rules mid-campaign requires donor
                    notification and may need dual-approval under financial controls policy.
                  </p>
                </div>
              </div>
            )}

            {/* Save Bar */}
            <div className="bg-white/80 backdrop-blur-xl border border-slate-200/80 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
              {saveMessage ? (
                <div className="text-xs font-medium text-blue-800 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-600" />
                  {saveMessage}
                </div>
              ) : (
                <div className="text-xs font-medium text-slate-400">
                  Commit status, privacy, partners, and funding rule changes.
                </div>
              )}
              <button
                onClick={handleSaveMission}
                disabled={saving}
                className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 disabled:opacity-50 transition-all flex items-center gap-2 shadow-sm shrink-0"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                {saving ? "Saving..." : "Commit Field Operations Update"}
              </button>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-8 bg-white/80 backdrop-blur-xl border border-slate-200/80 rounded-2xl p-12 text-center text-slate-400 text-xs font-medium">
            Select a mission from the queue to open the field operations inspector.
          </div>
        )}
      </div>

      {/* 1. Standalone Missionary Onboarding Modal */}
      {showOpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-2xl max-w-lg w-full p-8 relative my-auto">
            <button
              type="button"
              onClick={() => setShowOpModal(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-800 font-bold"
            >
              ✕
            </button>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-100 px-2 py-1 rounded">
              Step 1: Operator Registry
            </span>
            <h2 className="text-xl font-bold text-slate-900 mt-2 mb-4">Onboard Field Missionary</h2>
            
            <form onSubmit={handleCreateMissionary} className="space-y-4">
              <div>
                <label className="text-[11px] font-bold text-slate-500 block mb-1">Full Name</label>
                <input required type="text" value={opName} onChange={e => setOpName(e.target.value)} placeholder="e.g. John Doe" className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-500 block mb-1">Email Address</label>
                <input required type="email" value={opEmail} onChange={e => setOpEmail(e.target.value)} placeholder="john@mission.org" className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 block mb-1">Country</label>
                  <input required type="text" value={opCountry} onChange={e => setOpCountry(e.target.value)} className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-500 block mb-1">Organization</label>
                  <input required type="text" value={opOrg} onChange={e => setOpOrg(e.target.value)} className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500" />
                </div>
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-500 block mb-1">Stellar Wallet Address</label>
                <input type="text" value={opWallet} onChange={e => setOpWallet(e.target.value)} placeholder="G..." className="w-full text-xs font-mono p-3 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500" />
              </div>
              <button
                type="submit"
                disabled={creatingOp}
                className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl text-xs uppercase tracking-wider hover:bg-slate-800 transition-all disabled:opacity-50"
              >
                {creatingOp ? "Saving..." : "Onboard Missionary"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 2. Standalone Mission Campaign Creation Modal */}
      {showMissionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-2xl max-w-lg w-full p-8 relative my-auto">
            <button
              type="button"
              onClick={() => setShowMissionModal(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-800 font-bold"
            >
              ✕
            </button>
            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2 py-1 rounded">
              Step 2: Campaign Deployment
            </span>
            <h2 className="text-xl font-bold text-slate-900 mt-2 mb-4">Create Mission Campaign</h2>
            
            <form onSubmit={handleCreateMission} className="space-y-4">
              <div>
                <label className="text-[11px] font-bold text-slate-500 block mb-1">Assigned Missionary</label>
                {availableOperators.length === 0 ? (
                  <p className="text-xs text-red-600 font-medium">No missionaries found. Please onboard a missionary first.</p>
                ) : (
                  <select
                    value={selectedOpId}
                    onChange={e => setSelectedOpId(e.target.value)}
                    className="w-full text-xs font-semibold p-3 border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-indigo-500"
                  >
                    {availableOperators.map(op => (
                      <option key={op.id} value={op.id}>
                        {op.full_name} ({op.organization_name || "Independent"} - {op.country})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 block mb-1">Mission Title</label>
                <input required type="text" value={missionTitle} onChange={e => setMissionTitle(e.target.value)} placeholder="e.g. Clean Water Wells" className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500" />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 block mb-1">Description</label>
                <textarea required rows={3} value={missionDesc} onChange={e => setMissionDesc(e.target.value)} placeholder="Mission scope and goals..." className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 block mb-1">Funding Goal (USD)</label>
                  <input required type="number" value={missionGoal} onChange={e => setMissionGoal(e.target.value)} className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500" />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-500 block mb-1">Target Country</label>
                  <input required type="text" value={missionCountry} onChange={e => setMissionCountry(e.target.value)} className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500" />
                </div>
              </div>

              <button
                type="submit"
                disabled={creatingMission || availableOperators.length === 0}
                className="w-full bg-indigo-600 text-white font-bold py-3.5 rounded-xl text-xs uppercase tracking-wider hover:bg-indigo-700 transition-all disabled:opacity-50"
              >
                {creatingMission ? "Deploying..." : "Deploy Mission Campaign"}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}