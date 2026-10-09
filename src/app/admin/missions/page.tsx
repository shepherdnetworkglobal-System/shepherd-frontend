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
  Package,
  X
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
  map_location?: string | null;
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
  const [editMapLocation, setEditMapLocation] = useState("");

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
    setEditMapLocation(m.map_location || "");
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
          local_partners: editLocalPartners || null,
          map_location: editMapLocation || null
        })
      })) as Mission;

      setSaveMessage("Mission field operations updated successfully.");
      setMissions(prev => prev.map(m => (m.id === updated.id ? { ...m, ...updated } : m)));
      setSelectedMission({ ...selectedMission, ...updated });
    } catch (err: any) {
      setSaveMessage(err.message || "Failed to update mission parameters.");
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
    <div className="p-6 max-w-[1600px] mx-auto h-full flex flex-col space-y-6 animate-in fade-in duration-300 text-[#3D3832]">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[rgba(26,22,18,0.08)] pb-5">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-[10px] font-bold text-[#064E3B] uppercase tracking-widest bg-[#064E3B]/10 px-2.5 py-0.5 rounded-full border border-[#064E3B]/20">
              Module 01.07
            </span>
            <span className="text-[10px] font-semibold text-[#7A736A] uppercase tracking-wider">Field Operations & Mission Lifecycle</span>
          </div>
          <h1 className="font-serif text-2xl font-semibold text-[#1A1612] tracking-tight flex items-center gap-2">
            <Map className="w-7 h-7 text-[#064E3B]" />
            Missions & Field Operations Workstation
          </h1>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowOpModal(true)}
            className="px-4 py-2.5 bg-[#1A1612] hover:bg-[#3D3832] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-sm"
          >
            + Onboard Missionary
          </button>

          <button
            onClick={() => {
              fetchOperators();
              setShowMissionModal(true);
            }}
            className="px-4 py-2.5 bg-[#064E3B] hover:bg-[#047857] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-sm"
          >
            + Create Mission
          </button>
          
          <button
            onClick={fetchMissions}
            className="px-3.5 py-2.5 text-xs font-bold text-[#7A736A] bg-white/70 border border-[rgba(26,22,18,0.08)] rounded-xl hover:bg-[#EFEBE4]/50 flex items-center gap-1.5 shadow-sm transition-all uppercase tracking-wider"
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
          { label: "Completed Missions", value: completedCount, icon: Flag, color: "text-[#C4A35A]" },
          { 
            label: "Total Raised", 
            value: `$${totalRaised.toLocaleString("en-US", { maximumFractionDigits: 0 })}`, 
            icon: DollarSign, 
            color: "text-[#064E3B]" 
          },
          { 
            label: "Funding Progress", 
            value: `${totalGoal > 0 ? Math.round((totalRaised / totalGoal) * 100) : 0}%`, 
            icon: Target, 
            color: "text-[#1A1612]" 
          }
        ].map((kpi, idx) => (
          <div key={idx} className="p-4 bg-white/70 backdrop-blur-md border border-[rgba(26,22,18,0.08)] rounded-2xl shadow-sm">
            <div className="flex items-center justify-between text-xs font-semibold text-[#7A736A] mb-1">
              <span>{kpi.label}</span>
              <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
            </div>
            <div className="text-2xl font-semibold text-[#1A1612] num-tabular">{kpi.value}</div>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 items-start">
        {/* Left: Mission Queue */}
        <div className="lg:col-span-4 bg-white/70 backdrop-blur-md border border-[rgba(26,22,18,0.08)] rounded-2xl p-4 shadow-sm flex flex-col space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[rgba(26,22,18,0.04)]">
            <h2 className="text-xs uppercase tracking-[0.14em] font-semibold text-[#1A1612] flex items-center gap-2">
              <Package className="w-4 h-4 text-[#7A736A]" />
              Mission Queue ({filteredMissions.length})
            </h2>
          </div>

          <div className="flex flex-col space-y-2">
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
            <div className="flex space-x-1 overflow-x-auto pb-1 text-[10px] uppercase tracking-wider scrollbar-none">
              {["ALL", "ACTIVE", "FUNDED", "COMPLETED", "PAUSED"].map(st => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-colors ${
                    filterStatus === st
                      ? "bg-[#064E3B] text-white"
                      : "bg-[#EFEBE4]/50 text-[#7A736A] hover:bg-[#EFEBE4]"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {loading ? (
              <div className="text-center py-12 text-[#7A736A] text-xs font-medium">Loading missions...</div>
            ) : filteredMissions.length === 0 ? (
              <div className="text-center py-12 text-[#7A736A] text-xs font-medium">No missions found.</div>
            ) : (
              filteredMissions.map(m => {
                const isSelected = selectedMission?.id === m.id;
                const pct = progressPct(m);
                return (
                  <div
                    key={m.id}
                    onClick={() => selectMission(m)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer space-y-2.5 ${
                      isSelected
                        ? "bg-[#EFEBE4]/60 border-[#064E3B]/40 shadow-sm"
                        : "bg-white border-[rgba(26,22,18,0.08)] hover:border-[#064E3B]/20 hover:bg-[#F7F4EF]/50"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <span className="font-serif text-sm font-semibold text-[#1A1612] line-clamp-1">{m.title}</span>
                      <span
                        className={`text-[9px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full border shrink-0 ml-2 ${
                          m.status === "ACTIVE"
                            ? "bg-[#064E3B]/10 text-[#064E3B] border-[#064E3B]/20"
                            : m.status === "COMPLETED"
                            ? "bg-[#C4A35A]/15 text-[#C4A35A] border-[#C4A35A]/30"
                            : m.status === "PAUSED"
                            ? "bg-[#7A736A]/10 text-[#7A736A] border-[#7A736A]/20"
                            : "bg-[#EFEBE4] text-[#1A1612] border-[rgba(26,22,18,0.08)]"
                        }`}
                      >
                        {m.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-[#7A736A]">
                      <span className="flex items-center gap-1 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-[#064E3B]" /> {m.target_country}
                      </span>
                      <span className="font-semibold num-tabular">
                        ${Number(m.raised_amount_usd).toLocaleString()} / ${Number(m.goal_amount_usd).toLocaleString()}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-[#EFEBE4] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#064E3B] to-[#C4A35A] rounded-full transition-all"
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
            <div className="bg-white/70 backdrop-blur-md border border-[rgba(26,22,18,0.08)] rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-[rgba(26,22,18,0.04)] pb-4">
                <div>
                  <h2 className="font-serif text-xl font-semibold text-[#1A1612]">{selectedMission.title}</h2>
                  <p className="text-[10px] uppercase tracking-wider font-semibold text-[#7A736A] mt-1">
                    Mission #{selectedMission.id} • Lead Operator #{selectedMission.missionary_id} •{" "}
                    {selectedMission.target_country}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={editStatus}
                    onChange={e => setEditStatus(e.target.value)}
                    className="text-xs font-semibold bg-[#1A1612] text-white rounded-lg px-3 py-2 focus:outline-none"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="FUNDED">FUNDED</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="PAUSED">PAUSED</option>
                  </select>
                </div>
              </div>

              <p className="text-xs text-[#3D3832]/90 leading-relaxed font-normal whitespace-pre-wrap">
                {selectedMission.description}
              </p>

              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-[#EFEBE4]/30 rounded-xl border border-[rgba(26,22,18,0.04)]">
                  <span className="text-[9px] uppercase tracking-wider font-semibold text-[#7A736A] block">Raised</span>
                  <span className="text-base font-semibold text-[#1A1612] num-tabular">
                    ${Number(selectedMission.raised_amount_usd).toLocaleString()}
                  </span>
                </div>
                <div className="p-3 bg-[#EFEBE4]/30 rounded-xl border border-[rgba(26,22,18,0.04)]">
                  <span className="text-[9px] uppercase tracking-wider font-semibold text-[#7A736A] block">Goal</span>
                  <span className="text-base font-semibold text-[#1A1612] num-tabular">
                    ${Number(selectedMission.goal_amount_usd).toLocaleString()}
                  </span>
                </div>
                <div className="p-3 bg-[#EFEBE4]/30 rounded-xl border border-[rgba(26,22,18,0.04)]">
                  <span className="text-[9px] uppercase tracking-wider font-semibold text-[#7A736A] block">Progress</span>
                  <span className="text-base font-semibold text-[#064E3B] num-tabular">
                    {progressPct(selectedMission)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Panel Tabs */}
            <div className="flex space-x-2 overflow-x-auto pb-1 scrollbar-none">
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
                    className={`px-4 py-2.5 rounded-xl text-[10px] uppercase tracking-wider font-semibold flex items-center gap-1.5 transition-all ${
                      isActive
                        ? "bg-[#064E3B] text-white shadow-sm"
                        : "bg-white/70 text-[#7A736A] hover:bg-[#EFEBE4]/50 border border-[rgba(26,22,18,0.08)]"
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
              <div className="bg-white/70 backdrop-blur-md border border-[rgba(26,22,18,0.08)] rounded-2xl p-6 shadow-sm space-y-5">
                <h3 className="text-xs uppercase tracking-wider font-semibold text-[#7A736A] flex items-center gap-1.5 border-b border-[rgba(26,22,18,0.04)] pb-3">
                  <Shield className="w-4 h-4 text-[#064E3B]" />
                  Telemetry, Location Privacy & Field Partners
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] uppercase tracking-wider font-semibold text-[#7A736A] mb-1 block">
                      GPS Coordinates (Latitude, Longitude)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. -1.2921, 36.8219"
                      value={editMapLocation}
                      onChange={e => setEditMapLocation(e.target.value)}
                      className="w-full text-xs font-semibold bg-[#F7F4EF]/50 border border-[rgba(26,22,18,0.08)] rounded-xl p-3 text-[#1A1612] focus:outline-none focus:ring-1 focus:ring-[#064E3B]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-wider font-semibold text-[#7A736A] mb-1 block">
                      Location Granularity (Public Display)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Turkana East, Kenya"
                      value={editLocationGranularity}
                      onChange={e => setEditLocationGranularity(e.target.value)}
                      className="w-full text-xs font-semibold bg-[#F7F4EF]/50 border border-[rgba(26,22,18,0.08)] rounded-xl p-3 text-[#1A1612] focus:outline-none focus:ring-1 focus:ring-[#064E3B]"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <label
                    className={`w-full p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      editLocationHidden
                        ? "bg-[#C4A35A]/10 border-[#C4A35A]/30 text-[#1A1612]"
                        : "bg-[#F7F4EF]/50 border-[rgba(26,22,18,0.08)] text-[#7A736A]"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {editLocationHidden ? <EyeOff className="w-4 h-4 text-[#C4A35A]" /> : <Eye className="w-4 h-4 text-[#064E3B]" />}
                      <span className="text-xs font-semibold">Hide Exact Location (Safeguarding Protocols)</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={editLocationHidden}
                      onChange={e => setEditLocationHidden(e.target.checked)}
                      className="w-4 h-4 rounded text-[#064E3B] focus:ring-[#064E3B]"
                    />
                  </label>
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-wider font-semibold text-[#7A736A] mb-1 block">Local Partners</label>
                  <textarea
                    rows={2}
                    placeholder="Local church partners, NGOs, community leaders..."
                    value={editLocalPartners}
                    onChange={e => setEditLocalPartners(e.target.value)}
                    className="w-full text-xs font-semibold bg-[#F7F4EF]/50 border border-[rgba(26,22,18,0.08)] rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-[#064E3B] text-[#1A1612]"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-wider font-semibold text-[#7A736A] mb-1 block">Reporting Plan</label>
                  <textarea
                    rows={2}
                    placeholder="Cadence of field reports, photo evidence, milestone schedule..."
                    value={editReportingPlan}
                    onChange={e => setEditReportingPlan(e.target.value)}
                    className="w-full text-xs font-semibold bg-[#F7F4EF]/50 border border-[rgba(26,22,18,0.08)] rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-[#064E3B] text-[#1A1612]"
                  />
                </div>
              </div>
            )}

            {/* RECEIPTS Panel */}
            {activePanel === "RECEIPTS" && (
              <div className="bg-white/70 backdrop-blur-md border border-[rgba(26,22,18,0.08)] rounded-2xl p-6 shadow-sm space-y-4">
                <h3 className="text-xs uppercase tracking-wider font-semibold text-[#7A736A] flex items-center gap-1.5 border-b border-[rgba(26,22,18,0.04)] pb-3">
                  <FileText className="w-4 h-4 text-[#064E3B]" />
                  Field Receipt Evidence
                </h3>
                {receipts.length === 0 ? (
                  <div className="py-10 text-center text-xs font-medium text-[#7A736A]">
                    No field receipts submitted for this mission yet.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {receipts.map(r => (
                      <div
                        key={r.id}
                        className="p-4 bg-[#F7F4EF]/50 border border-[rgba(26,22,18,0.04)] rounded-xl flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-[#1A1612]">{r.title}</span>
                            <span className="text-[9px] uppercase tracking-wider font-semibold text-[#C4A35A] bg-white px-2 py-0.5 rounded border border-[rgba(26,22,18,0.08)]">
                              {r.category}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#7A736A] mt-0.5 font-medium">
                            {r.vendor_name || "Unknown vendor"} • {new Date(r.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-sm font-semibold text-[#1A1612] num-tabular block">
                            ${Number(r.amount_spent_usd).toFixed(2)}
                          </span>
                          {r.receipt_image_url && (
                            <a
                              href={r.receipt_image_url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[10px] uppercase tracking-wider font-bold text-[#C4A35A] hover:text-[#1A1612]"
                            >
                              Verify Source
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
              <div className="bg-white/70 backdrop-blur-md border border-[rgba(26,22,18,0.08)] rounded-2xl p-6 shadow-sm space-y-4">
                <h3 className="text-xs uppercase tracking-wider font-semibold text-[#7A736A] flex items-center gap-1.5 border-b border-[rgba(26,22,18,0.04)] pb-3">
                  <Camera className="w-4 h-4 text-[#C4A35A]" />
                  Field Milestone Updates
                </h3>
                {milestones.length === 0 ? (
                  <div className="py-10 text-center text-xs font-medium text-[#7A736A]">
                    No milestone updates posted for this mission yet.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {milestones.map(ms => (
                      <div
                        key={ms.id}
                        className="p-4 bg-[#F7F4EF]/50 border border-[rgba(26,22,18,0.04)] rounded-xl space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#1A1612]">{ms.title}</span>
                          <span className="text-[10px] font-semibold text-[#7A736A] flex items-center gap-1">
                            <Users className="w-3.5 h-3.5" /> {ms.people_served} served
                          </span>
                        </div>
                        <p className="text-xs text-[#3D3832]/85 font-medium leading-relaxed">
                          {ms.description}
                        </p>
                        <div className="flex items-center justify-between pt-2 border-t border-[rgba(26,22,18,0.04)]">
                          <span className="text-[10px] text-[#7A736A]">
                            Logged: {new Date(ms.created_at).toLocaleDateString()}
                          </span>
                          {ms.photo_url && (
                            <a
                              href={ms.photo_url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[10px] uppercase tracking-wider font-bold text-[#064E3B] hover:text-[#047857]"
                            >
                              Proof Image
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
              <div className="bg-white/70 backdrop-blur-md border border-[rgba(26,22,18,0.08)] rounded-2xl p-6 shadow-sm space-y-4">
                <h3 className="text-xs uppercase tracking-wider font-semibold text-[#7A736A] flex items-center gap-1.5 border-b border-[rgba(26,22,18,0.04)] pb-3">
                  <Settings2 className="w-4 h-4 text-[#C4A35A]" />
                  Underfunding & Overfunding Policies
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] uppercase tracking-wider font-semibold text-[#7A736A] mb-1 block">
                      If Goal Not Reached (Underfunding)
                    </label>
                    <select
                      value={editUnderfunding}
                      onChange={e => setEditUnderfunding(e.target.value)}
                      className="w-full text-xs font-semibold bg-[#F7F4EF]/50 border border-[rgba(26,22,18,0.08)] rounded-lg p-3 text-[#1A1612]"
                    >
                      <option value="HOLD_UNTIL_THRESHOLD">Hold Until Threshold Met</option>
                      <option value="REFUND">Refund Donors</option>
                      <option value="REDIRECT_APPROVED_MISSION">Redirect to Approved Mission</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-wider font-semibold text-[#7A736A] mb-1 block">
                      If Goal Exceeded (Overfunding)
                    </label>
                    <select
                      value={editOverfunding}
                      onChange={e => setEditOverfunding(e.target.value)}
                      className="w-full text-xs font-semibold bg-[#F7F4EF]/50 border border-[rgba(26,22,18,0.08)] rounded-lg p-3 text-[#1A1612]"
                    >
                      <option value="EXPAND_SCOPE">Expand Mission Scope</option>
                      <option value="NEXT_MISSION_POOL">Pool for Next Mission</option>
                      <option value="RESERVE_FUND">Place in Reserve Fund</option>
                    </select>
                  </div>
                </div>
                <div className="p-4 bg-[#C4A35A]/10 border border-[#C4A35A]/20 rounded-xl flex items-start gap-2.5">
                  <AlertTriangle className="w-4.5 h-4.5 text-[#C4A35A] shrink-0 mt-0.5" />
                  <p className="text-xs font-semibold text-[#1A1612] leading-relaxed">
                    Funding parameters must be fully configured before public mobilization occurs. Amending strategic rules during an active campaign triggers automatic logging on the governance block.
                  </p>
                </div>
              </div>
            )}

            {/* Save Bar */}
            <div className="bg-white/70 backdrop-blur-md border border-[rgba(26,22,18,0.08)] rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
              {saveMessage ? (
                <div className="text-xs font-bold text-[#064E3B] flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#064E3B]" />
                  {saveMessage}
                </div>
              ) : (
                <div className="text-[11px] font-semibold text-[#7A736A] uppercase tracking-wider">
                  Operational Parameters & Governance Core Commit
                </div>
              )}
              <button
                onClick={handleSaveMission}
                disabled={saving}
                className="px-5 py-3 bg-[#064E3B] hover:bg-[#047857] text-white rounded-xl text-xs font-bold hover-lift transition-all flex items-center gap-2 shadow-sm shrink-0"
              >
                <CheckCircle2 className="w-4 h-4 text-white" />
                {saving ? "Saving..." : "Commit Field Operations Update"}
              </button>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-8 bg-white/70 backdrop-blur-md border border-[rgba(26,22,18,0.08)] rounded-2xl p-12 text-center text-[#7A736A] text-xs font-medium">
            Select a mission from the queue to open the field operations inspector.
          </div>
        )}
      </div>

      {/* 1. Standalone Missionary Onboarding Modal */}
      {showOpModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6 lg:p-12">
          <div className="absolute inset-0 bg-[#1A1612]/40 backdrop-blur-sm" onClick={() => setShowOpModal(false)} />
          <div className="relative bg-[#F7F4EF] rounded-[2rem] border border-[rgba(26,22,18,0.08)] shadow-2xl max-w-lg w-full p-8 overflow-hidden animate-in zoom-in-95 duration-200">
            <button
              type="button"
              onClick={() => setShowOpModal(false)}
              className="absolute top-6 right-6 w-8 h-8 rounded-full bg-white/80 border border-[rgba(26,22,18,0.08)] flex items-center justify-center text-[#7A736A] hover:text-[#1A1612] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <span className="text-[9px] font-bold text-[#064E3B] uppercase tracking-widest bg-[#064E3B]/10 px-2 py-1 rounded">
              Step 1: Operator Registry
            </span>
            <h2 className="font-serif text-xl font-semibold text-[#1A1612] mt-3 mb-5">Onboard Field Missionary</h2>
            
            <form onSubmit={handleCreateMissionary} className="space-y-4">
              <div>
                <label className="text-[10px] uppercase tracking-wider font-semibold text-[#7A736A] block mb-1.5">Full Name</label>
                <input required type="text" value={opName} onChange={e => setOpName(e.target.value)} placeholder="e.g. John Doe" className="w-full text-xs font-semibold p-3.5 bg-white border border-[rgba(26,22,18,0.08)] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#064E3B] text-[#1A1612]" />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider font-semibold text-[#7A736A] block mb-1.5">Email Address</label>
                <input required type="email" value={opEmail} onChange={e => setOpEmail(e.target.value)} placeholder="john@mission.org" className="w-full text-xs font-semibold p-3.5 bg-white border border-[rgba(26,22,18,0.08)] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#064E3B] text-[#1A1612]" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase tracking-wider font-semibold text-[#7A736A] block mb-1.5">Country</label>
                  <input required type="text" value={opCountry} onChange={e => setOpCountry(e.target.value)} className="w-full text-xs font-semibold p-3.5 bg-white border border-[rgba(26,22,18,0.08)] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#064E3B] text-[#1A1612]" />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider font-semibold text-[#7A736A] block mb-1.5">Organization</label>
                  <input required type="text" value={opOrg} onChange={e => setOpOrg(e.target.value)} className="w-full text-xs font-semibold p-3.5 bg-white border border-[rgba(26,22,18,0.08)] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#064E3B] text-[#1A1612]" />
                </div>
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider font-semibold text-[#7A736A] block mb-1.5">Stellar Wallet Address</label>
                <input type="text" value={opWallet} onChange={e => setOpWallet(e.target.value)} placeholder="G..." className="w-full text-xs font-semibold font-mono p-3.5 bg-white border border-[rgba(26,22,18,0.08)] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#064E3B] text-[#1A1612]" />
              </div>
              <button
                type="submit"
                disabled={creatingOp}
                className="w-full bg-[#1A1612] text-white font-semibold py-4 rounded-xl text-[10px] uppercase tracking-widest hover:bg-[#3D3832] transition-all disabled:opacity-50 mt-2"
              >
                {creatingOp ? "Saving..." : "Onboard Missionary"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 2. Standalone Mission Campaign Creation Modal */}
      {showMissionModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6 lg:p-12">
          <div className="absolute inset-0 bg-[#1A1612]/40 backdrop-blur-sm" onClick={() => setShowMissionModal(false)} />
          <div className="relative bg-[#F7F4EF] rounded-[2rem] border border-[rgba(26,22,18,0.08)] shadow-2xl max-w-lg w-full p-8 overflow-hidden animate-in zoom-in-95 duration-200">
            <button
              type="button"
              onClick={() => setShowMissionModal(false)}
              className="absolute top-6 right-6 w-8 h-8 rounded-full bg-white/80 border border-[rgba(26,22,18,0.08)] flex items-center justify-center text-[#7A736A] hover:text-[#1A1612] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <span className="text-[9px] font-bold text-[#064E3B] uppercase tracking-widest bg-[#064E3B]/10 px-2 py-1 rounded">
              Step 2: Campaign Deployment
            </span>
            <h2 className="font-serif text-xl font-semibold text-[#1A1612] mt-3 mb-5">Create Mission Campaign</h2>
            
            <form onSubmit={handleCreateMission} className="space-y-4">
              <div>
                <label className="text-[10px] uppercase tracking-wider font-semibold text-[#7A736A] block mb-1.5">Assigned Missionary</label>
                {availableOperators.length === 0 ? (
                  <p className="text-xs text-[#C4A35A] font-semibold">No missionaries found. Please onboard a missionary first.</p>
                ) : (
                  <select
                    value={selectedOpId}
                    onChange={e => setSelectedOpId(e.target.value)}
                    className="w-full text-xs font-semibold p-3.5 bg-white border border-[rgba(26,22,18,0.08)] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#064E3B] text-[#1A1612]"
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
                <label className="text-[10px] uppercase tracking-wider font-semibold text-[#7A736A] block mb-1.5">Mission Title</label>
                <input required type="text" value={missionTitle} onChange={e => setMissionTitle(e.target.value)} placeholder="e.g. Clean Water Wells" className="w-full text-xs font-semibold p-3.5 bg-white border border-[rgba(26,22,18,0.08)] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#064E3B] text-[#1A1612]" />
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-wider font-semibold text-[#7A736A] block mb-1.5">Description</label>
                <textarea required rows={3} value={missionDesc} onChange={e => setMissionDesc(e.target.value)} placeholder="Mission scope and goals..." className="w-full text-xs font-semibold p-3.5 bg-white border border-[rgba(26,22,18,0.08)] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#064E3B] text-[#1A1612]" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase tracking-wider font-semibold text-[#7A736A] block mb-1.5">Funding Goal (USD)</label>
                  <input required type="number" value={missionGoal} onChange={e => setMissionGoal(e.target.value)} className="w-full text-xs font-semibold p-3.5 bg-white border border-[rgba(26,22,18,0.08)] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#064E3B] text-[#1A1612]" />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider font-semibold text-[#7A736A] block mb-1.5">Target Country</label>
                  <input required type="text" value={missionCountry} onChange={e => setMissionCountry(e.target.value)} className="w-full text-xs font-semibold p-3.5 bg-white border border-[rgba(26,22,18,0.08)] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#064E3B] text-[#1A1612]" />
                </div>
              </div>

              <button
                type="submit"
                disabled={creatingMission || availableOperators.length === 0}
                className="w-full bg-[#064E3B] hover:bg-[#047857] text-white font-semibold py-4 rounded-xl text-[10px] uppercase tracking-widest transition-all disabled:opacity-50 mt-2"
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