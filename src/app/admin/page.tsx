"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  UserCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Layers,
  DollarSign,
  Receipt as ReceiptIcon,
  Search,
  ArrowUpRight,
  RefreshCw,
  Plus
} from "lucide-react";
import { apiRequest } from "@/lib/api";

interface Application {
  id: number;
  user_id: number;
  shepherd_id: string | null;
  country: string;
  organization_name: string | null;
  stellar_payout_address: string | null;
  mpesa_phone_number: string | null;
  verification_status: string;
  government_id_url: string | null;
  organization_cert_url: string | null;
  selfie_url: string | null;
  admin_notes: string | null;
  created_at: string;
}

interface Mission {
  id: number;
  missionary_id: number;
  title: string;
  goal_amount_usd: number;
  raised_amount_usd: number;
  target_country: string;
  status: string;
}

interface Donation {
  id: number;
  mission_id: number;
  donor_email: string;
  amount_usd: number;
  asset_type: string;
  stellar_tx_hash: string | null;
  status: string;
  created_at: string;
}

interface Receipt {
  id: number;
  mission_id: number;
  title: string;
  amount_spent_usd: number;
  category: string;
  receipt_image_url: string;
  vendor_name: string | null;
  created_at: string;
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<"verifications" | "missions" | "donations" | "receipts">("verifications");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loginEmail, setLoginEmail] = useState("admin@shepherd.network");
  const [loginPassword, setLoginPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [applications, setApplications] = useState<Application[]>([]);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(false);
  const [reviewNote, setReviewNote] = useState("");
  const [assignedShepherdId, setAssignedShepherdId] = useState("");

  // Mission creation state
  const [showCreateMission, setShowCreateMission] = useState(false);
  const [missionaryId, setMissionaryId] = useState("");
  const [missionTitle, setMissionTitle] = useState("");
  const [missionDesc, setMissionDesc] = useState("");
  const [missionGoal, setMissionGoal] = useState("");
  const [missionCountry, setMissionCountry] = useState("Kenya");

  const loadData = async () => {
    setLoading(true);
    try {
      const [appsData, missionsData, donationsData, receiptsData] = await Promise.all([
        apiRequest("/api/verification/applications").catch(() => []),
        apiRequest("/api/missions/").catch(() => []),
        apiRequest("/api/donations/").catch(() => []),
        apiRequest("/api/accountability/receipts").catch(() => []),
      ]);
      setApplications(appsData);
      setMissions(missionsData);
      setDonations(donationsData);
      setReceipts(receiptsData);
    } catch (err) {
      console.error("Failed to load admin data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("shepherd_token");
    const role = localStorage.getItem("shepherd_role");
    if (token && role === "ADMIN") {
      setIsAuthenticated(true);
      loadData();
    }
  }, []);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);
    try {
      const data = await apiRequest("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword,
        }),
      });

      if (data.role !== "ADMIN") {
        throw new Error("Access denied: You must be an administrator.");
      }

      localStorage.setItem("shepherd_token", data.access_token);
      localStorage.setItem("shepherd_role", data.role);
      setIsAuthenticated(true);
      await loadData();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setAuthError(err.message);
      } else {
        setAuthError("Login failed");
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("shepherd_token");
    localStorage.removeItem("shepherd_role");
    setIsAuthenticated(false);
  };

  const handleReview = async (profileId: number, status: "APPROVED" | "REJECTED") => {
    try {
      const generatedShepherdId = status === "APPROVED" 
        ? assignedShepherdId || `SHEPHERD-${Math.floor(1000 + Math.random() * 9000)}` 
        : undefined;

      await apiRequest(`/api/verification/admin/review/${profileId}`, {
        method: "PUT",
        body: JSON.stringify({
          status,
          admin_notes: reviewNote || (status === "APPROVED" ? "Verified and approved by Shepherd Admin." : "Application rejected."),
          shepherd_id: generatedShepherdId,
        }),
      });
      setReviewNote("");
      setAssignedShepherdId("");
      await loadData();
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const handleCreateMission = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiRequest("/api/missions/", {
        method: "POST",
        body: JSON.stringify({
          missionary_id: parseInt(missionaryId, 10),
          title: missionTitle,
          description: missionDesc,
          goal_amount_usd: parseFloat(missionGoal),
          target_country: missionCountry,
        }),
      });
      setShowCreateMission(false);
      setMissionTitle("");
      setMissionDesc("");
      setMissionGoal("");
      await loadData();
    } catch (err: unknown) {
      if (err instanceof Error) {
        alert(err.message);
      } else {
        alert("Failed to create mission");
      }
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 relative overflow-hidden flex items-center justify-center p-4">
        {/* Ambient glows */}
        <div className="absolute top-0 left-0 w-[500px] h-[500px] glow-blue rounded-full pointer-events-none -z-10" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] glow-emerald rounded-full pointer-events-none -z-10" />

        <div className="max-w-md w-full bg-white/80 backdrop-blur-xl border border-slate-200/80 rounded-2xl p-8 shadow-xl shadow-slate-200/60 text-slate-900">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-md shadow-blue-500/20">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold tracking-tight">Shepherd Admin</h2>
              <p className="text-[10px] uppercase tracking-widest font-bold text-slate-500">Command Center</p>
            </div>
          </div>

          {authError && (
            <div className="mb-6 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-semibold flex items-center gap-2">
              <XCircle className="w-4 h-4 shrink-0" />
              {authError}
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-5">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">
                Admin Email
              </label>
              <input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-bold text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">
                Admin Password
              </label>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="Enter passphrase..."
                className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-bold text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                required
              />
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3.5 rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.01] active:scale-[0.99] transition-all"
            >
              {authLoading ? "Authenticating..." : "Authorize Access"}
            </button>
          </form>

          <p className="text-[10px] text-slate-400 font-semibold text-center mt-8 uppercase tracking-widest">
            Default credentials: admin@shepherd.network
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-blue-200/50">
      {/* Admin Top Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200/80 px-8 py-4 flex items-center justify-between sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-md">
            <ShieldCheck className="w-4 h-4 text-white" />
          </div>
          <span className="font-extrabold text-lg tracking-tight text-slate-900">Shepherd Command</span>
          <span className="bg-blue-50 text-blue-700 text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-md border border-blue-200 ml-2">
            Internal Operations
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold px-4 py-2 rounded-lg border border-slate-200 shadow-sm transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-blue-600 ${loading ? "animate-spin" : ""}`} /> Refresh
          </button>
          <button
            onClick={handleLogout}
            className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-bold px-4 py-2 rounded-lg transition"
          >
            Terminate Session
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-8 py-10">
        {/* KPI Metric Overview */}
        <div className="grid grid-cols-4 gap-5 mb-10">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Pending Vetting</span>
            <div className="flex items-center justify-between mt-3">
              <span className="text-3xl font-extrabold text-slate-900 num-tabular">
                {applications.filter((a) => a.verification_status !== "APPROVED" && a.verification_status !== "REJECTED").length}
              </span>
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-amber-500" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Missions</span>
            <div className="flex items-center justify-between mt-3">
              <span className="text-3xl font-extrabold text-slate-900 num-tabular">{missions.length}</span>
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center">
                <Layers className="w-5 h-5 text-blue-500" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Donations</span>
            <div className="flex items-center justify-between mt-3">
              <span className="text-3xl font-extrabold text-slate-900 num-tabular">{donations.length}</span>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-emerald-500" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Field Receipts</span>
            <div className="flex items-center justify-between mt-3">
              <span className="text-3xl font-extrabold text-slate-900 num-tabular">{receipts.length}</span>
              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                <ReceiptIcon className="w-5 h-5 text-indigo-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-200 mb-8 gap-8 text-sm font-bold">
          <button
            onClick={() => setActiveTab("verifications")}
            className={`pb-4 transition flex items-center gap-2 ${
              activeTab === "verifications"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <UserCheck className="w-4 h-4" /> Operator Vetting
          </button>

          <button
            onClick={() => setActiveTab("missions")}
            className={`pb-4 transition flex items-center gap-2 ${
              activeTab === "missions"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <Layers className="w-4 h-4" /> Active Deployments
          </button>

          <button
            onClick={() => setActiveTab("donations")}
            className={`pb-4 transition flex items-center gap-2 ${
              activeTab === "donations"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <DollarSign className="w-4 h-4" /> Inbound Settlement
          </button>

          <button
            onClick={() => setActiveTab("receipts")}
            className={`pb-4 transition flex items-center gap-2 ${
              activeTab === "receipts"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <ReceiptIcon className="w-4 h-4" /> Cryptographic Ledger
          </button>
        </div>

        {/* Tab 1: Verification Queue */}
        {activeTab === "verifications" && (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-200 bg-slate-50 font-bold text-[10px] uppercase tracking-widest text-slate-500">
              Vetting Applications ({applications.length})
            </div>

            {applications.length === 0 ? (
              <div className="p-10 text-center text-sm font-medium text-slate-500">No applications in queue.</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {applications.map((app) => (
                  <div key={app.id} className="p-6 space-y-5 hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400 block">System Entry #{app.id} (Operator #{app.user_id})</span>
                        <h4 className="text-lg font-extrabold text-slate-900 mt-1">
                          {app.organization_name || "Independent Sovereign"} • {app.country}
                        </h4>
                        {app.shepherd_id && (
                          <span className="inline-block mt-2 bg-emerald-50 text-emerald-700 text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded border border-emerald-200">
                            Hash: {app.shepherd_id}
                          </span>
                        )}
                      </div>
                      <span
                        className={`text-[10px] uppercase tracking-widest font-bold px-3 py-1.5 rounded-md border ${
                          app.verification_status === "APPROVED"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : app.verification_status === "REJECTED"
                            ? "bg-red-50 text-red-700 border-red-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}
                      >
                        {app.verification_status}
                      </span>
                    </div>

                    {/* Rails and Documents */}
                    <div className="grid grid-cols-2 gap-4 bg-slate-50 border border-slate-100 p-5 rounded-xl text-xs font-mono">
                      <div>
                        <span className="text-slate-500 block mb-1.5 font-sans font-bold uppercase tracking-wider text-[10px]">Stellar Settlement Rail:</span>
                        <span className="break-all font-semibold text-slate-900">{app.stellar_payout_address || "Awaiting configuration"}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block mb-1.5 font-sans font-bold uppercase tracking-wider text-[10px]">Mobile Fiat Fallback:</span>
                        <span className="font-semibold text-slate-900">{app.mpesa_phone_number || "None"}</span>
                      </div>
                    </div>

                    {/* Action Panel for Pending */}
                    {app.verification_status !== "APPROVED" && (
                      <div className="pt-2 flex items-center gap-3">
                        <input
                          type="text"
                          placeholder="Assign Operator Hash (e.g. ALPHA-1042)"
                          value={assignedShepherdId}
                          onChange={(e) => setAssignedShepherdId(e.target.value)}
                          className="border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 w-72 shadow-sm"
                        />
                        <button
                          onClick={() => handleReview(app.id, "APPROVED")}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs uppercase tracking-wider font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-sm transition"
                        >
                          <CheckCircle2 className="w-4 h-4" /> Authorize
                        </button>
                        <button
                          onClick={() => handleReview(app.id, "REJECTED")}
                          className="bg-white border border-red-200 hover:bg-red-50 text-red-600 text-xs uppercase tracking-wider font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-sm transition"
                        >
                          <XCircle className="w-4 h-4" /> Decline
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Mission Management */}
        {activeTab === "missions" && (
          <div className="space-y-6">
            <div className="flex justify-end">
              <button
                onClick={() => setShowCreateMission(!showCreateMission)}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs uppercase tracking-wider font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-md shadow-blue-500/20 transition-all"
              >
                <Plus className="w-4 h-4" /> Initialize Deployment
              </button>
            </div>

            {showCreateMission && (
              <form onSubmit={handleCreateMission} className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-sm space-y-5">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-4 mb-2">Configure New Deployment</h3>
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Operator Internal ID</label>
                    <input
                      type="number"
                      value={missionaryId}
                      onChange={(e) => setMissionaryId(e.target.value)}
                      placeholder="e.g. 1"
                      className="w-full border border-slate-200 rounded-xl p-3 text-sm font-bold text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 shadow-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Target Area</label>
                    <input
                      type="text"
                      value={missionCountry}
                      onChange={(e) => setMissionCountry(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl p-3 text-sm font-bold text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 shadow-sm"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Deployment Title</label>
                  <input
                    type="text"
                    value={missionTitle}
                    onChange={(e) => setMissionTitle(e.target.value)}
                    placeholder="e.g. Clean Water Well - Turkana East"
                    className="w-full border border-slate-200 rounded-xl p-3 text-sm font-bold text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 shadow-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Parameters</label>
                  <textarea
                    value={missionDesc}
                    onChange={(e) => setMissionDesc(e.target.value)}
                    rows={3}
                    className="w-full border border-slate-200 rounded-xl p-3 text-sm font-medium text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 shadow-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Hard Limit Cap (USD)</label>
                  <input
                    type="number"
                    value={missionGoal}
                    onChange={(e) => setMissionGoal(e.target.value)}
                    placeholder="12000"
                    className="w-full border border-slate-200 rounded-xl p-3 text-sm font-bold text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 shadow-sm"
                    required
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="bg-slate-900 hover:bg-slate-800 text-white text-xs uppercase tracking-wider font-bold py-3 px-6 rounded-xl shadow-md transition-colors"
                  >
                    Commit to Public Ledger
                  </button>
                </div>
              </form>
            )}

            <div className="grid grid-cols-2 gap-5">
              {missions.map((m) => (
                <div key={m.id} className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Deployment #{m.id}</span>
                      <h4 className="text-base font-extrabold text-slate-900 mt-1">{m.title}</h4>
                      <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500 mt-1">Area: {m.target_country}</p>
                    </div>
                    <span className="bg-blue-50 text-blue-700 border border-blue-200 text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-md">
                      {m.status}
                    </span>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex justify-between text-xs font-bold">
                    <span className="text-slate-500">Cap: <span className="text-slate-900 num-tabular">${m.goal_amount_usd}</span></span>
                    <span className="text-emerald-600">Settled: <span className="num-tabular">${m.raised_amount_usd}</span></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Donations & Settlement */}
        {activeTab === "donations" && (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-4">Tx ID</th>
                  <th className="p-4">Deployment</th>
                  <th className="p-4">Origin Entity</th>
                  <th className="p-4">Volume</th>
                  <th className="p-4">Stellar cryptographic hash</th>
                  <th className="p-4">State</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {donations.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 font-bold text-slate-900">#{d.id}</td>
                    <td className="p-4 font-bold text-blue-600">Mission #{d.mission_id}</td>
                    <td className="p-4 font-medium text-slate-700">{d.donor_email}</td>
                    <td className="p-4 font-black text-slate-900 num-tabular">${d.amount_usd} <span className="text-[10px] text-slate-400 font-bold">{d.asset_type}</span></td>
                    <td className="p-4 font-mono text-slate-400 font-medium">{d.stellar_tx_hash ? `${d.stellar_tx_hash.slice(0, 16)}...` : "—"}</td>
                    <td className="p-4">
                      <span className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-2.5 py-1 rounded-md font-bold uppercase tracking-wider text-[9px]">
                        {d.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 4: Receipts Audit */}
        {activeTab === "receipts" && (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-4">Log ID</th>
                  <th className="p-4">Deployment</th>
                  <th className="p-4">Allocation Record</th>
                  <th className="p-4">Classification</th>
                  <th className="p-4">Volume</th>
                  <th className="p-4">Counterparty</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {receipts.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 font-bold text-slate-900">#{r.id}</td>
                    <td className="p-4 font-bold text-blue-600">Mission #{r.mission_id}</td>
                    <td className="p-4 font-bold text-slate-900">{r.title}</td>
                    <td className="p-4 font-semibold text-slate-500">{r.category}</td>
                    <td className="p-4 font-black text-emerald-600 num-tabular">${r.amount_spent_usd}</td>
                    <td className="p-4 text-slate-500 font-medium">{r.vendor_name || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}