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
  AlertTriangle,
  Eye,
  EyeOff,
  Shield,
  MapPin,
  Settings2,
  Activity,
  Package,
  X,
  UserPlus,
  UserMinus,
  TrendingUp,
  Wallet,
  Info,
  FileText
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
  map_location?: string | null;
  location_granularity?: string | null;
  exact_location_hidden?: boolean;
  local_partners?: string | null;
  underfunding_rule?: string;
  overfunding_rule?: string;
  reporting_plan?: string | null;
  status: string;
  created_at: string;
  missionary?: {
    name: string;
    shepherd_id: string;
    organization_name: string;
  };
  coalition_partners?: CoalitionPartner[];
}

interface CoalitionPartner {
  id: number;
  mission_id: number;
  missionary_id: number;
  partner_role: string;
  created_at: string;
}

interface FinancialSummary {
  total_raised_usd: number;
  total_budgeted_usd: number;
  total_verified_spent_usd: number;
  unallocated_balance_usd: number;
  remaining_budget_usd: number;
  spend_rate_pct: number;
}

export default function MissionsWorkstation() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [financials, setFinancials] = useState<FinancialSummary | null>(null);
  const [finLoading, setFinLoading] = useState(false);

  // Editable fields
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editGoal, setEditGoal] = useState("");
  const [editCountry, setEditCountry] = useState("");
  const [editMapLocation, setEditMapLocation] = useState("");
  const [editStatus, setEditStatus] = useState("ACTIVE");
  const [editUnderfunding, setEditUnderfunding] = useState("HOLD_UNTIL_THRESHOLD");
  const [editOverfunding, setEditOverfunding] = useState("EXPAND_SCOPE");
  const [editLocationHidden, setEditLocationHidden] = useState(false);
  const [editLocationGranularity, setEditLocationGranularity] = useState("");
  const [editReportingPlan, setEditReportingPlan] = useState("");
  const [editLocalPartners, setEditLocalPartners] = useState("");
  const [editProblemStatement, setEditProblemStatement] = useState("");
  const [editMissionObjectives, setEditMissionObjectives] = useState("");
  const [editProposedProcess, setEditProposedProcess] = useState("");

  // Partner management
  const [showPartnerModal, setShowPartnerModal] = useState(false);
  const [availableMissionaries, setAvailableMissionaries] = useState<any[]>([]);
  const [selectedPartnerId, setSelectedPartnerId] = useState("");
  const [selectedPartnerRole, setSelectedPartnerRole] = useState("SUPPORT");
  const [addingPartner, setAddingPartner] = useState(false);

  // Create mission modal
  const [showMissionModal, setShowMissionModal] = useState(false);
  const [availableOperators, setAvailableOperators] = useState<any[]>([]);
  const [selectedOpId, setSelectedOpId] = useState("");
  const [missionTitle, setMissionTitle] = useState("");
  const [missionDesc, setMissionDesc] = useState("");
  const [missionGoal, setMissionGoal] = useState("5000");
  const [missionCountry, setMissionCountry] = useState("Kenya");
  const [creatingMission, setCreatingMission] = useState(false);

  const fetchOperators = async () => {
    try {
      const ops = await apiRequest("/api/verification/applications");
      setAvailableOperators(ops || []);
      setAvailableMissionaries(ops || []);
      if (ops && ops.length > 0) {
        if (!selectedOpId) setSelectedOpId(String(ops[0].id));
        if (!selectedPartnerId) setSelectedPartnerId(String(ops[0].id));
      }
    } catch {
      setAvailableOperators([]);
      setAvailableMissionaries([]);
    }
  };

  useEffect(() => {
    fetchOperators();
  }, []);

  const fetchFinancials = async (missionId: number) => {
    setFinLoading(true);
    try {
      const data = await apiRequest(`/api/projects/summary/${missionId}`);
      if (data?.donations_meter) {
        setFinancials(data.donations_meter);
      } else {
        setFinancials(null);
      }
    } catch {
      setFinancials(null);
    } finally {
      setFinLoading(false);
    }
  };

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

  useEffect(() => {
    fetchMissions();
  }, []);

  const selectMission = (m: Mission) => {
    setSelectedMission(m);
    setEditTitle(m.title);
    setEditDescription(m.description);
    setEditGoal(String(m.goal_amount_usd));
    setEditCountry(m.target_country);
    setEditMapLocation(m.map_location || "");
    setEditStatus(m.status);
    setEditUnderfunding(m.underfunding_rule || "HOLD_UNTIL_THRESHOLD");
    setEditOverfunding(m.overfunding_rule || "EXPAND_SCOPE");
    setEditLocationHidden(m.exact_location_hidden || false);
    setEditLocationGranularity(m.location_granularity || "");
    setEditReportingPlan(m.reporting_plan || "");
    setEditLocalPartners(m.local_partners || "");
    setEditProblemStatement((m as any).problem_statement || "");
    setEditMissionObjectives((m as any).mission_objectives || "");
    setEditProposedProcess((m as any).proposed_process || "");
    setSaveMessage(null);
    fetchFinancials(m.id);
  };

  const handleSaveMission = async () => {
    if (!selectedMission) return;
    setSaving(true);
    setSaveMessage(null);
    try {
      const updated = (await apiRequest(`/api/missions/${selectedMission.id}`, {
        method: "PUT",
        body: JSON.stringify({
          title: editTitle,
          description: editDescription,
          goal_amount_usd: parseFloat(editGoal) || 0,
          target_country: editCountry,
          map_location: editMapLocation || null,
          status: editStatus,
          underfunding_rule: editUnderfunding,
          overfunding_rule: editOverfunding,
          exact_location_hidden: editLocationHidden,
          location_granularity: editLocationGranularity || null,
          reporting_plan: editReportingPlan || null,
          local_partners: editLocalPartners || null,
          problem_statement: editProblemStatement || null,
          mission_objectives: editMissionObjectives || null,
          proposed_process: editProposedProcess || null
        })
      })) as Mission;

      setSaveMessage("Mission parameters committed successfully.");
      setMissions(prev => prev.map(m => (m.id === updated.id ? { ...m, ...updated } : m)));
      setSelectedMission({ ...selectedMission, ...updated });
      fetchFinancials(updated.id);
    } catch (err: any) {
      setSaveMessage(err.message || "Failed to update mission.");
    } finally {
      setSaving(false);
    }
  };

  const handleAddPartner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMission || !selectedPartnerId) return;
    setAddingPartner(true);
    try {
      await apiRequest(`/api/missions/${selectedMission.id}/partners`, {
        method: "POST",
        body: JSON.stringify({
          missionary_id: parseInt(selectedPartnerId, 10),
          partner_role: selectedPartnerRole
        })
      });
      setShowPartnerModal(false);
      const refreshed = await apiRequest(`/api/missions/${selectedMission.id}`);
      setSelectedMission(refreshed);
      setMissions(prev => prev.map(m => (m.id === refreshed.id ? refreshed : m)));
    } catch (err: any) {
      alert(err.message || "Failed to add partner.");
    } finally {
      setAddingPartner(false);
    }
  };

  const handleRemovePartner = async (partnerId: number) => {
    if (!selectedMission) return;
    if (!confirm("Remove this partner missionary from the mission?")) return;
    try {
      await apiRequest(`/api/missions/${selectedMission.id}/partners/${partnerId}`, {
        method: "DELETE"
      });
      const refreshed = await apiRequest(`/api/missions/${selectedMission.id}`);
      setSelectedMission(refreshed);
      setMissions(prev => prev.map(m => (m.id === refreshed.id ? refreshed : m)));
    } catch (err: any) {
      alert(err.message || "Failed to remove partner.");
    }
  };

  const handleCreateMission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOpId) {
      alert("Please select a missionary first.");
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
    } catch (err: any) {
      alert(err.message || "Failed to create mission.");
    } finally {
      setCreatingMission(false);
    }
  };

  const filteredMissions = missions.filter(m => {
    const matchesSearch =
      m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.target_country.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "ALL" || m.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const activeCount = missions.filter(m => m.status === "ACTIVE").length;
  const completedCount = missions.filter(m => m.status === "COMPLETED").length;

  const progressPct = (m: Mission) => {
    const goal = Number(m.goal_amount_usd) || 1;
    return Math.min(100, Math.round((Number(m.raised_amount_usd) / goal) * 100));
  };

  const fmt = (n: number) => `$${Number(n || 0).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;

  return (
    <div className="p-6 max-w-[1600px] mx-auto h-full flex flex-col space-y-6 animate-in fade-in duration-300 text-[#3D3832]">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[rgba(26,22,18,0.08)] pb-5">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-[10px] font-semibold text-[#064E3B] uppercase tracking-widest bg-[#064E3B]/10 px-2.5 py-0.5 rounded-full border border-[#064E3B]/20">
              Module 01.07
            </span>
            <span className="text-[10px] font-semibold text-[#7A736A] uppercase tracking-wider">Field Operations & Mission Lifecycle</span>
          </div>
          <h1 className="font-serif text-2xl font-semibold text-[#1A1612] tracking-tight flex items-center gap-2">
            <Map className="w-6 h-6 text-[#064E3B]" />
            Missions Workstation
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => { fetchOperators(); setShowMissionModal(true); }}
            className="px-4 py-2.5 bg-[#064E3B] hover:bg-[#047857] text-white rounded-xl text-[10px] font-semibold uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-sm"
          >
            + Create Mission
          </button>
          <button
            onClick={fetchMissions}
            className="px-3.5 py-2.5 text-[10px] font-semibold text-[#7A736A] bg-white/70 border border-[rgba(26,22,18,0.08)] rounded-xl hover:bg-[#EFEBE4]/50 flex items-center gap-1.5 shadow-sm transition-all uppercase tracking-wider"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Sync
          </button>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Active Deployments", value: activeCount, icon: PlayCircle, color: "text-[#064E3B]" },
          { label: "Completed", value: completedCount, icon: Flag, color: "text-[#C4A35A]" },
          { label: "Total Raised (All)", value: fmt(missions.reduce((a, m) => a + Number(m.raised_amount_usd), 0)), icon: DollarSign, color: "text-[#064E3B]" },
          { label: "Total Missions", value: missions.length, icon: Package, color: "text-[#1A1612]" }
        ].map((kpi, idx) => (
          <div key={idx} className="p-4 bg-white/70 backdrop-blur-md border border-[rgba(26,22,18,0.08)] rounded-2xl shadow-sm">
            <div className="flex items-center justify-between text-[10px] font-semibold text-[#7A736A] uppercase tracking-wider mb-1">
              <span>{kpi.label}</span>
              <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
            </div>
            <div className="text-xl font-semibold text-[#1A1612] num-tabular">{kpi.value}</div>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 items-start">

        {/* Left: Mission Queue */}
        <div className="lg:col-span-4 bg-white/70 backdrop-blur-md border border-[rgba(26,22,18,0.08)] rounded-2xl p-4 shadow-sm flex flex-col space-y-4">
          <h2 className="text-[10px] uppercase tracking-[0.14em] font-semibold text-[#1A1612] flex items-center gap-2 border-b border-[rgba(26,22,18,0.04)] pb-2">
            <Package className="w-4 h-4 text-[#7A736A]" />
            Mission Queue ({filteredMissions.length})
          </h2>
          <div className="relative">
            <Search className="w-4 h-4 text-[#7A736A] absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search title or country..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-white/50 border border-[rgba(26,22,18,0.08)] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#064E3B] text-[#1A1612]"
            />
          </div>
          <div className="flex space-x-1 overflow-x-auto pb-1 text-[9px] uppercase tracking-wider scrollbar-none">
            {["ALL", "ACTIVE", "FUNDED", "COMPLETED", "PAUSED"].map(st => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-2.5 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-colors ${
                  filterStatus === st
                    ? "bg-[#064E3B] text-white"
                    : "bg-[#EFEBE4]/50 text-[#7A736A] hover:bg-[#EFEBE4]"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {loading ? (
              <div className="text-center py-12 text-[#7A736A] text-xs">Loading missions...</div>
            ) : filteredMissions.length === 0 ? (
              <div className="text-center py-12 text-[#7A736A] text-xs">No missions found.</div>
            ) : (
              filteredMissions.map(m => {
                const isSelected = selectedMission?.id === m.id;
                const pct = progressPct(m);
                return (
                  <div
                    key={m.id}
                    onClick={() => selectMission(m)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer space-y-2 ${
                      isSelected
                        ? "bg-[#EFEBE4]/60 border-[#064E3B]/40 shadow-sm"
                        : "bg-white border-[rgba(26,22,18,0.08)] hover:border-[#064E3B]/20"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-serif text-sm font-semibold text-[#1A1612] line-clamp-1">{m.title}</span>
                      <span className={`text-[9px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full border shrink-0 ${
                        m.status === "ACTIVE" ? "bg-[#064E3B]/10 text-[#064E3B] border-[#064E3B]/20"
                        : m.status === "COMPLETED" ? "bg-[#C4A35A]/15 text-[#C4A35A] border-[#C4A35A]/30"
                        : m.status === "PAUSED" ? "bg-[#7A736A]/10 text-[#7A736A] border-[#7A736A]/20"
                        : "bg-[#EFEBE4] text-[#1A1612] border-[rgba(26,22,18,0.08)]"
                      }`}>
                        {m.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-[#7A736A]">
                      <span className="flex items-center gap-1 font-medium">
                        <MapPin className="w-3 h-3 text-[#064E3B]" /> {m.target_country}
                      </span>
                      <span className="font-semibold num-tabular">
                        {fmt(Number(m.raised_amount_usd))} / {fmt(Number(m.goal_amount_usd))}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-[#EFEBE4] rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-[#064E3B] to-[#C4A35A] rounded-full transition-all" style={{ width: `${pct}%` }} />
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

            {/* Financial Sync Strip from Projects Module */}
            <div className="bg-white/70 backdrop-blur-md border border-[rgba(26,22,18,0.08)] rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[10px] uppercase tracking-wider font-semibold text-[#7A736A] flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-[#064E3B]" />
                  Financial Telemetry (Synced from Projects)
                </h3>
                {finLoading && <RefreshCw className="w-3.5 h-3.5 text-[#7A736A] animate-spin" />}
              </div>
              {financials ? (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="p-3 bg-[#064E3B]/5 border border-[#064E3B]/10 rounded-xl">
                    <span className="text-[9px] uppercase tracking-wider font-semibold text-[#064E3B] block mb-0.5">Total Raised</span>
                    <span className="text-lg font-semibold text-[#064E3B] num-tabular">{fmt(financials.total_raised_usd)}</span>
                  </div>
                  <div className="p-3 bg-[#1A1612]/5 border border-[rgba(26,22,18,0.06)] rounded-xl">
                    <span className="text-[9px] uppercase tracking-wider font-semibold text-[#7A736A] block mb-0.5">Total Budgeted</span>
                    <span className="text-lg font-semibold text-[#1A1612] num-tabular">{fmt(financials.total_budgeted_usd)}</span>
                  </div>
                  <div className="p-3 bg-[#C4A35A]/5 border border-[#C4A35A]/15 rounded-xl">
                    <span className="text-[9px] uppercase tracking-wider font-semibold text-[#C4A35A] block mb-0.5">Verified Spent</span>
                    <span className="text-lg font-semibold text-[#1A1612] num-tabular">{fmt(financials.total_verified_spent_usd)}</span>
                  </div>
                  <div className="p-3 bg-[#EFEBE4]/50 border border-[rgba(26,22,18,0.04)] rounded-xl">
                    <span className="text-[9px] uppercase tracking-wider font-semibold text-[#7A736A] block mb-0.5">Unallocated</span>
                    <span className="text-lg font-semibold text-[#1A1612] num-tabular">{fmt(financials.unallocated_balance_usd)}</span>
                  </div>
                </div>
              ) : (
                <div className="py-6 text-center text-xs text-[#7A736A] font-medium">
                  No financial data available. Configure budget items in the Projects module.
                </div>
              )}
            </div>

            {/* General Info Editor */}
            <div className="bg-white/70 backdrop-blur-md border border-[rgba(26,22,18,0.08)] rounded-2xl p-6 shadow-sm space-y-5">
              <h3 className="text-[10px] uppercase tracking-wider font-semibold text-[#7A736A] flex items-center gap-1.5 border-b border-[rgba(26,22,18,0.04)] pb-3">
                <Settings2 className="w-4 h-4 text-[#064E3B]" />
                General Mission Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-[10px] uppercase tracking-wider font-semibold text-[#7A736A] mb-1 block">Mission Title</label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={e => setEditTitle(e.target.value)}
                    className="w-full text-sm font-semibold bg-[#F7F4EF]/50 border border-[rgba(26,22,18,0.08)] rounded-xl p-3 text-[#1A1612] focus:outline-none focus:ring-1 focus:ring-[#064E3B]"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-[10px] uppercase tracking-wider font-semibold text-[#7A736A] mb-1 block">Description</label>
                  <textarea
                    rows={3}
                    value={editDescription}
                    onChange={e => setEditDescription(e.target.value)}
                    className="w-full text-xs font-medium bg-[#F7F4EF]/50 border border-[rgba(26,22,18,0.08)] rounded-xl p-3 text-[#1A1612] focus:outline-none focus:ring-1 focus:ring-[#064E3B] leading-relaxed"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider font-semibold text-[#7A736A] mb-1 block">Funding Goal (USD)</label>
                  <input
                    type="number"
                    value={editGoal}
                    onChange={e => setEditGoal(e.target.value)}
                    className="w-full text-sm font-semibold num-tabular bg-[#F7F4EF]/50 border border-[rgba(26,22,18,0.08)] rounded-xl p-3 text-[#1A1612] focus:outline-none focus:ring-1 focus:ring-[#064E3B]"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider font-semibold text-[#7A736A] mb-1 block">Target Country</label>
                  <input
                    type="text"
                    value={editCountry}
                    onChange={e => setEditCountry(e.target.value)}
                    className="w-full text-sm font-semibold bg-[#F7F4EF]/50 border border-[rgba(26,22,18,0.08)] rounded-xl p-3 text-[#1A1612] focus:outline-none focus:ring-1 focus:ring-[#064E3B]"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider font-semibold text-[#7A736A] mb-1 block">GPS Coordinates (Lat, Lng)</label>
                  <input
                    type="text"
                    placeholder="e.g. -1.2921, 36.8219"
                    value={editMapLocation}
                    onChange={e => setEditMapLocation(e.target.value)}
                    className="w-full text-xs font-semibold font-mono bg-[#F7F4EF]/50 border border-[rgba(26,22,18,0.08)] rounded-xl p-3 text-[#1A1612] focus:outline-none focus:ring-1 focus:ring-[#064E3B]"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider font-semibold text-[#7A736A] mb-1 block">Location Display Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Turkana East, Kenya"
                    value={editLocationGranularity}
                    onChange={e => setEditLocationGranularity(e.target.value)}
                    className="w-full text-xs font-semibold bg-[#F7F4EF]/50 border border-[rgba(26,22,18,0.08)] rounded-xl p-3 text-[#1A1612] focus:outline-none focus:ring-1 focus:ring-[#064E3B]"
                  />
                </div>
              </div>
              <label className={`w-full p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                editLocationHidden
                  ? "bg-[#C4A35A]/10 border-[#C4A35A]/30"
                  : "bg-[#F7F4EF]/50 border-[rgba(26,22,18,0.08)]"
              }`}>
                <div className="flex items-center gap-2.5">
                  {editLocationHidden ? <EyeOff className="w-4 h-4 text-[#C4A35A]" /> : <Eye className="w-4 h-4 text-[#064E3B]" />}
                  <span className="text-xs font-semibold text-[#1A1612]">Hide Exact Location (Safeguarding)</span>
                </div>
                <input
                  type="checkbox"
                  checked={editLocationHidden}
                  onChange={e => setEditLocationHidden(e.target.checked)}
                  className="w-4 h-4 rounded text-[#064E3B] focus:ring-[#064E3B]"
                />
              </label>
            </div>

            {/* Master Brief Details */}
            <div className="bg-white/70 backdrop-blur-md border border-[rgba(26,22,18,0.08)] rounded-2xl p-6 shadow-sm space-y-5">
              <h3 className="text-[10px] uppercase tracking-wider font-semibold text-[#7A736A] flex items-center gap-1.5 border-b border-[rgba(26,22,18,0.04)] pb-3">
                <FileText className="w-4 h-4 text-[#064E3B]" />
                Master Brief Details
              </h3>
              <div>
                <label className="text-[10px] uppercase tracking-wider font-semibold text-[#7A736A] mb-1 block">Problem / Need Statement</label>
                <textarea
                  rows={4}
                  value={editProblemStatement}
                  onChange={e => setEditProblemStatement(e.target.value)}
                  placeholder="Describe the core problem this mission addresses..."
                  className="w-full text-xs font-medium bg-[#F7F4EF]/50 border border-[rgba(26,22,18,0.08)] rounded-xl p-3 text-[#1A1612] focus:outline-none focus:ring-1 focus:ring-[#064E3B] leading-relaxed"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider font-semibold text-[#7A736A] mb-1 block">Mission Objectives</label>
                <textarea
                  rows={4}
                  value={editMissionObjectives}
                  onChange={e => setEditMissionObjectives(e.target.value)}
                  placeholder="List operational objectives (one per line preferred)..."
                  className="w-full text-xs font-medium bg-[#F7F4EF]/50 border border-[rgba(26,22,18,0.08)] rounded-xl p-3 text-[#1A1612] focus:outline-none focus:ring-1 focus:ring-[#064E3B] leading-relaxed"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider font-semibold text-[#7A736A] mb-1 block">Proposed Implementation Process</label>
                <textarea
                  rows={5}
                  value={editProposedProcess}
                  onChange={e => setEditProposedProcess(e.target.value)}
                  placeholder="Describe the implementation strategy and phases..."
                  className="w-full text-xs font-medium bg-[#F7F4EF]/50 border border-[rgba(26,22,18,0.08)] rounded-xl p-3 text-[#1A1612] focus:outline-none focus:ring-1 focus:ring-[#064E3B] leading-relaxed"
                />
              </div>
            </div>

            {/* Funding Rules & Status */}
            <div className="bg-white/70 backdrop-blur-md border border-[rgba(26,22,18,0.08)] rounded-2xl p-6 shadow-sm space-y-5">
              <h3 className="text-[10px] uppercase tracking-wider font-semibold text-[#7A736A] flex items-center gap-1.5 border-b border-[rgba(26,22,18,0.04)] pb-3">
                <Shield className="w-4 h-4 text-[#C4A35A]" />
                Funding Rules & Donation Control
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] uppercase tracking-wider font-semibold text-[#7A736A] mb-1 block">Mission Status</label>
                  <select
                    value={editStatus}
                    onChange={e => setEditStatus(e.target.value)}
                    className="w-full text-xs font-semibold bg-[#F7F4EF]/50 border border-[rgba(26,22,18,0.08)] rounded-xl p-3 text-[#1A1612] focus:outline-none focus:ring-1 focus:ring-[#064E3B]"
                  >
                    <option value="ACTIVE">Active (Accepting Donations)</option>
                    <option value="PAUSED">Paused (Suspend Donations)</option>
                    <option value="FUNDED">Fully Funded</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider font-semibold text-[#7A736A] mb-1 block">Underfunding Rule</label>
                  <select
                    value={editUnderfunding}
                    onChange={e => setEditUnderfunding(e.target.value)}
                    className="w-full text-xs font-semibold bg-[#F7F4EF]/50 border border-[rgba(26,22,18,0.08)] rounded-xl p-3 text-[#1A1612] focus:outline-none focus:ring-1 focus:ring-[#064E3B]"
                  >
                    <option value="HOLD_UNTIL_THRESHOLD">Hold Until Threshold</option>
                    <option value="REFUND">Refund Donors</option>
                    <option value="REDIRECT_APPROVED_MISSION">Redirect to Approved Mission</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider font-semibold text-[#7A736A] mb-1 block">Overfunding Rule</label>
                  <select
                    value={editOverfunding}
                    onChange={e => setEditOverfunding(e.target.value)}
                    className="w-full text-xs font-semibold bg-[#F7F4EF]/50 border border-[rgba(26,22,18,0.08)] rounded-xl p-3 text-[#1A1612] focus:outline-none focus:ring-1 focus:ring-[#064E3B]"
                  >
                    <option value="EXPAND_SCOPE">Expand Mission Scope</option>
                    <option value="NEXT_MISSION_POOL">Pool for Next Mission</option>
                    <option value="RESERVE_FUND">Place in Reserve Fund</option>
                  </select>
                </div>
              </div>
              {editStatus === "PAUSED" && (
                <div className="p-3.5 bg-[#C4A35A]/10 border border-[#C4A35A]/20 rounded-xl flex items-start gap-2.5">
                  <PauseCircle className="w-4 h-4 text-[#C4A35A] shrink-0 mt-0.5" />
                  <p className="text-xs font-semibold text-[#1A1612]">Donations are currently suspended for this mission. Donors will see a paused status on the public page.</p>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase tracking-wider font-semibold text-[#7A736A] mb-1 block">Local Partners</label>
                  <textarea
                    rows={2}
                    placeholder="Local church partners, NGOs, community leaders..."
                    value={editLocalPartners}
                    onChange={e => setEditLocalPartners(e.target.value)}
                    className="w-full text-xs font-medium bg-[#F7F4EF]/50 border border-[rgba(26,22,18,0.08)] rounded-xl p-3 text-[#1A1612] focus:outline-none focus:ring-1 focus:ring-[#064E3B]"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider font-semibold text-[#7A736A] mb-1 block">Reporting Plan</label>
                  <textarea
                    rows={2}
                    placeholder="Cadence of field reports, photo evidence..."
                    value={editReportingPlan}
                    onChange={e => setEditReportingPlan(e.target.value)}
                    className="w-full text-xs font-medium bg-[#F7F4EF]/50 border border-[rgba(26,22,18,0.08)] rounded-xl p-3 text-[#1A1612] focus:outline-none focus:ring-1 focus:ring-[#064E3B]"
                  />
                </div>
              </div>
            </div>

            {/* Coalition Partners */}
            <div className="bg-white/70 backdrop-blur-md border border-[rgba(26,22,18,0.08)] rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-[rgba(26,22,18,0.04)] pb-3">
                <h3 className="text-[10px] uppercase tracking-wider font-semibold text-[#7A736A] flex items-center gap-1.5">
                  <UserPlus className="w-4 h-4 text-[#064E3B]" />
                  Coalition Partners ({selectedMission.coalition_partners?.length || 0})
                </h3>
                <button
                  onClick={() => { fetchOperators(); setShowPartnerModal(true); }}
                  className="px-3 py-1.5 bg-[#064E3B] hover:bg-[#047857] text-white rounded-lg text-[9px] font-semibold uppercase tracking-wider transition-all flex items-center gap-1"
                >
                  <UserPlus className="w-3 h-3" /> Add Partner
                </button>
              </div>

              {/* Lead Operator (always shown) */}
              <div className="p-3.5 bg-[#064E3B]/5 border border-[#064E3B]/10 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#064E3B]/10 flex items-center justify-center">
                    <Wallet className="w-4 h-4 text-[#064E3B]" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-[#1A1612] block">
                      {selectedMission.missionary?.name || `Missionary #${selectedMission.missionary_id}`}
                    </span>
                    <span className="text-[9px] uppercase tracking-wider font-semibold text-[#064E3B]">Head of Operations (Lead)</span>
                  </div>
                </div>
                <span className="text-[9px] uppercase tracking-wider font-semibold text-[#7A736A] bg-[#EFEBE4] px-2 py-1 rounded">
                  {selectedMission.missionary?.shepherd_id || "—"}
                </span>
              </div>

              {/* Additional Partners */}
              {selectedMission.coalition_partners && selectedMission.coalition_partners.length > 0 ? (
                <div className="space-y-2">
                  {selectedMission.coalition_partners.map(p => (
                    <div key={p.id} className="p-3.5 bg-[#F7F4EF]/50 border border-[rgba(26,22,18,0.04)] rounded-xl flex items-center justify-between group">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#C4A35A]/10 flex items-center justify-center">
                          <UserPlus className="w-3.5 h-3.5 text-[#C4A35A]" />
                        </div>
                        <div>
                          <span className="text-xs font-semibold text-[#1A1612] block">Missionary #{p.missionary_id}</span>
                          <span className="text-[9px] uppercase tracking-wider font-semibold text-[#7A736A]">{p.partner_role}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemovePartner(p.id)}
                        className="opacity-0 group-hover:opacity-100 px-2.5 py-1.5 bg-red-50 text-red-600 rounded-lg text-[9px] font-semibold uppercase tracking-wider hover:bg-red-100 transition-all flex items-center gap-1"
                      >
                        <UserMinus className="w-3 h-3" /> Remove
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-6 text-center text-xs text-[#7A736A] font-medium border border-dashed border-[rgba(26,22,18,0.1)] rounded-xl">
                  No additional coalition partners assigned.
                </div>
              )}
            </div>

            {/* Save Bar */}
            <div className="bg-white/70 backdrop-blur-md border border-[rgba(26,22,18,0.08)] rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
              {saveMessage ? (
                <div className="text-xs font-semibold text-[#064E3B] flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  {saveMessage}
                </div>
              ) : (
                <div className="text-[10px] font-semibold text-[#7A736A] uppercase tracking-wider">
                  Commit all mission parameter changes
                </div>
              )}
              <button
                onClick={handleSaveMission}
                disabled={saving}
                className="px-5 py-3 bg-[#064E3B] hover:bg-[#047857] text-white rounded-xl text-[10px] font-semibold uppercase tracking-wider transition-all flex items-center gap-2 shadow-sm shrink-0 disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                {saving ? "Saving..." : "Commit Changes"}
              </button>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-8 bg-white/70 backdrop-blur-md border border-[rgba(26,22,18,0.08)] rounded-2xl p-12 text-center text-[#7A736A] text-xs font-medium">
            Select a mission from the queue to inspect and edit.
          </div>
        )}
      </div>

      {/* Add Partner Modal */}
      {showPartnerModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#1A1612]/40 backdrop-blur-sm" onClick={() => setShowPartnerModal(false)} />
          <div className="relative bg-[#F7F4EF] rounded-[2rem] border border-[rgba(26,22,18,0.08)] shadow-2xl max-w-md w-full p-8 animate-in zoom-in-95 duration-200">
            <button onClick={() => setShowPartnerModal(false)} className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/80 border border-[rgba(26,22,18,0.08)] flex items-center justify-center text-[#7A736A] hover:text-[#1A1612] transition-colors">
              <X className="w-4 h-4" />
            </button>
            <h2 className="font-serif text-lg font-semibold text-[#1A1612] mb-5">Add Coalition Partner</h2>
            <form onSubmit={handleAddPartner} className="space-y-4">
              <div>
                <label className="text-[10px] uppercase tracking-wider font-semibold text-[#7A736A] block mb-1.5">Select Missionary</label>
                <select
                  value={selectedPartnerId}
                  onChange={e => setSelectedPartnerId(e.target.value)}
                  className="w-full text-xs font-semibold p-3 bg-white border border-[rgba(26,22,18,0.08)] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#064E3B] text-[#1A1612]"
                >
                  {availableMissionaries.map(op => (
                    <option key={op.id} value={op.id}>
                      {op.full_name} ({op.organization_name || "Independent"} - {op.country})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider font-semibold text-[#7A736A] block mb-1.5">Partner Role</label>
                <select
                  value={selectedPartnerRole}
                  onChange={e => setSelectedPartnerRole(e.target.value)}
                  className="w-full text-xs font-semibold p-3 bg-white border border-[rgba(26,22,18,0.08)] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#064E3B] text-[#1A1612]"
                >
                  <option value="SUPPORT">Support Missionary</option>
                  <option value="CHURCH_PARTNER">Church Partner</option>
                  <option value="NGO_PARTNER">NGO Partner</option>
                  <option value="LOGISTICS">Logistics Coordinator</option>
                  <option value="FINANCE">Finance Overseer</option>
                </select>
              </div>
              <button
                type="submit"
                disabled={addingPartner}
                className="w-full bg-[#064E3B] hover:bg-[#047857] text-white font-semibold py-3.5 rounded-xl text-[10px] uppercase tracking-widest transition-all disabled:opacity-50"
              >
                {addingPartner ? "Adding..." : "Add Partner"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Create Mission Modal */}
      {showMissionModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#1A1612]/40 backdrop-blur-sm" onClick={() => setShowMissionModal(false)} />
          <div className="relative bg-[#F7F4EF] rounded-[2rem] border border-[rgba(26,22,18,0.08)] shadow-2xl max-w-lg w-full p-8 animate-in zoom-in-95 duration-200">
            <button onClick={() => setShowMissionModal(false)} className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/80 border border-[rgba(26,22,18,0.08)] flex items-center justify-center text-[#7A736A] hover:text-[#1A1612] transition-colors">
              <X className="w-4 h-4" />
            </button>
            <span className="text-[9px] font-bold text-[#064E3B] uppercase tracking-widest bg-[#064E3B]/10 px-2 py-1 rounded">Campaign Deployment</span>
            <h2 className="font-serif text-xl font-semibold text-[#1A1612] mt-3 mb-5">Create Mission Campaign</h2>
            <form onSubmit={handleCreateMission} className="space-y-4">
              <div>
                <label className="text-[10px] uppercase tracking-wider font-semibold text-[#7A736A] block mb-1.5">Assigned Missionary</label>
                {availableOperators.length === 0 ? (
                  <p className="text-xs text-[#C4A35A] font-semibold">No approved missionaries found.</p>
                ) : (
                  <select value={selectedOpId} onChange={e => setSelectedOpId(e.target.value)} className="w-full text-xs font-semibold p-3 bg-white border border-[rgba(26,22,18,0.08)] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#064E3B] text-[#1A1612]">
                    {availableOperators.map(op => (
                      <option key={op.id} value={op.id}>{op.full_name} ({op.organization_name || "Independent"} - {op.country})</option>
                    ))}
                  </select>
                )}
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider font-semibold text-[#7A736A] block mb-1.5">Mission Title</label>
                <input required type="text" value={missionTitle} onChange={e => setMissionTitle(e.target.value)} placeholder="e.g. Clean Water Wells" className="w-full text-xs font-semibold p-3 bg-white border border-[rgba(26,22,18,0.08)] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#064E3B] text-[#1A1612]" />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider font-semibold text-[#7A736A] block mb-1.5">Description</label>
                <textarea required rows={3} value={missionDesc} onChange={e => setMissionDesc(e.target.value)} placeholder="Mission scope and goals..." className="w-full text-xs font-semibold p-3 bg-white border border-[rgba(26,22,18,0.08)] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#064E3B] text-[#1A1612]" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase tracking-wider font-semibold text-[#7A736A] block mb-1.5">Funding Goal (USD)</label>
                  <input required type="number" value={missionGoal} onChange={e => setMissionGoal(e.target.value)} className="w-full text-xs font-semibold p-3 bg-white border border-[rgba(26,22,18,0.08)] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#064E3B] text-[#1A1612]" />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider font-semibold text-[#7A736A] block mb-1.5">Target Country</label>
                  <input required type="text" value={missionCountry} onChange={e => setMissionCountry(e.target.value)} className="w-full text-xs font-semibold p-3 bg-white border border-[rgba(26,22,18,0.08)] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#064E3B] text-[#1A1612]" />
                </div>
              </div>
              <button type="submit" disabled={creatingMission || availableOperators.length === 0} className="w-full bg-[#064E3B] hover:bg-[#047857] text-white font-semibold py-3.5 rounded-xl text-[10px] uppercase tracking-widest transition-all disabled:opacity-50">
                {creatingMission ? "Deploying..." : "Deploy Mission Campaign"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}