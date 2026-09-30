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
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-2xl p-8 shadow-2xl text-white">
          <div className="flex items-center gap-3 mb-6">
            <ShieldCheck className="w-8 h-8 text-blue-400" />
            <div>
              <h2 className="text-xl font-bold">Shepherd Command</h2>
              <p className="text-xs text-slate-400">Restricted Admin Access</p>
            </div>
          </div>

          {authError && (
            <div className="mb-4 p-3 rounded-lg bg-red-900/50 border border-red-700 text-red-200 text-xs">
              {authError}
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                Admin Email
              </label>
              <input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                Password
              </label>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="Enter password..."
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 rounded-lg text-sm transition"
            >
              {authLoading ? "Authenticating..." : "Enter Command Center"}
            </button>
          </form>

          <p className="text-[11px] text-slate-500 text-center mt-6">
            Default test credentials: admin@shepherd.network / ShepherdAdmin2026!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Admin Top Header */}
      <header className="bg-slate-900 text-white px-8 py-4 border-b border-slate-800 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-6 h-6 text-blue-400" />
          <span className="font-bold text-lg tracking-tight">Shepherd Admin Command</span>
          <span className="bg-blue-500/20 text-blue-300 text-xs px-2.5 py-0.5 rounded border border-blue-500/30">
            Internal Operations
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-700 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh Data
          </button>
          <button
            onClick={handleLogout}
            className="bg-red-600/80 hover:bg-red-600 text-xs font-semibold px-3 py-1.5 rounded-lg transition"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* KPI Metric Overview */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Pending Vetting</span>
            <div className="flex items-center justify-between mt-2">
              <span className="text-2xl font-bold text-gray-900">
                {applications.filter((a) => a.verification_status !== "APPROVED" && a.verification_status !== "REJECTED").length}
              </span>
              <UserCheck className="w-6 h-6 text-amber-500" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Active Missions</span>
            <div className="flex items-center justify-between mt-2">
              <span className="text-2xl font-bold text-gray-900">{missions.length}</span>
              <Layers className="w-6 h-6 text-blue-500" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Donations</span>
            <div className="flex items-center justify-between mt-2">
              <span className="text-2xl font-bold text-gray-900">{donations.length}</span>
              <DollarSign className="w-6 h-6 text-green-500" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Field Receipts Audited</span>
            <div className="flex items-center justify-between mt-2">
              <span className="text-2xl font-bold text-gray-900">{receipts.length}</span>
              <ReceiptIcon className="w-6 h-6 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-gray-200 mb-6 gap-6 text-sm font-semibold">
          <button
            onClick={() => setActiveTab("verifications")}
            className={`pb-3 transition flex items-center gap-2 ${
              activeTab === "verifications"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            <UserCheck className="w-4 h-4" /> Missionary Verification Queue
          </button>

          <button
            onClick={() => setActiveTab("missions")}
            className={`pb-3 transition flex items-center gap-2 ${
              activeTab === "missions"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            <Layers className="w-4 h-4" /> Mission Management
          </button>

          <button
            onClick={() => setActiveTab("donations")}
            className={`pb-3 transition flex items-center gap-2 ${
              activeTab === "donations"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            <DollarSign className="w-4 h-4" /> Settlement & Donations
          </button>

          <button
            onClick={() => setActiveTab("receipts")}
            className={`pb-3 transition flex items-center gap-2 ${
              activeTab === "receipts"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            <ReceiptIcon className="w-4 h-4" /> Field Receipts Audit
          </button>
        </div>

        {/* Tab 1: Verification Queue */}
        {activeTab === "verifications" && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gray-50 font-bold text-xs uppercase tracking-wider text-gray-600">
              Vetting Applications ({applications.length})
            </div>

            {applications.length === 0 ? (
              <div className="p-8 text-center text-sm text-gray-500">No applications in queue.</div>
            ) : (
              <div className="divide-y divide-gray-200">
                {applications.map((app) => (
                  <div key={app.id} className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-mono text-gray-400 block">Profile #{app.id} (User #{app.user_id})</span>
                        <h4 className="text-base font-bold text-gray-900 mt-0.5">
                          {app.organization_name || "Independent Missionary"} • {app.country}
                        </h4>
                        {app.shepherd_id && (
                          <span className="inline-block mt-1 bg-green-50 text-green-700 text-xs font-semibold px-2.5 py-0.5 rounded border border-green-200">
                            Shepherd ID: {app.shepherd_id}
                          </span>
                        )}
                      </div>
                      <span
                        className={`text-xs font-semibold px-3 py-1 rounded-full ${
                          app.verification_status === "APPROVED"
                            ? "bg-green-100 text-green-800"
                            : app.verification_status === "REJECTED"
                            ? "bg-red-100 text-red-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {app.verification_status}
                      </span>
                    </div>

                    {/* Rails and Documents */}
                    <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg text-xs font-mono">
                      <div>
                        <span className="text-gray-500 block mb-1 font-sans font-semibold">Stellar Payout Address:</span>
                        <span className="break-all">{app.stellar_payout_address || "Not set"}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block mb-1 font-sans font-semibold">M-Pesa Number:</span>
                        <span>{app.mpesa_phone_number || "Not set"}</span>
                      </div>
                    </div>

                    {/* Action Panel for Pending */}
                    {app.verification_status !== "APPROVED" && (
                      <div className="pt-2 flex items-center gap-3">
                        <input
                          type="text"
                          placeholder="Assign Shepherd ID (e.g. MARIA-KENYA-1042)"
                          value={assignedShepherdId}
                          onChange={(e) => setAssignedShepherdId(e.target.value)}
                          className="border border-gray-300 rounded-lg px-3 py-1.5 text-xs w-64"
                        />
                        <button
                          onClick={() => handleReview(app.id, "APPROVED")}
                          className="bg-green-600 hover:bg-green-700 text-white text-xs font-semibold px-4 py-1.5 rounded-lg flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-4 h-4" /> Approve & Issue ID
                        </button>
                        <button
                          onClick={() => handleReview(app.id, "REJECTED")}
                          className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-4 py-1.5 rounded-lg flex items-center gap-1.5"
                        >
                          <XCircle className="w-4 h-4" /> Reject
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
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Launch New Mission
              </button>
            </div>

            {showCreateMission && (
              <form onSubmit={handleCreateMission} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Create Mission for Approved Missionary</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Missionary Profile ID</label>
                    <input
                      type="number"
                      value={missionaryId}
                      onChange={(e) => setMissionaryId(e.target.value)}
                      placeholder="e.g. 1"
                      className="w-full border border-gray-300 rounded-lg p-2 text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Target Country</label>
                    <input
                      type="text"
                      value={missionCountry}
                      onChange={(e) => setMissionCountry(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-2 text-sm"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Mission Title</label>
                  <input
                    type="text"
                    value={missionTitle}
                    onChange={(e) => setMissionTitle(e.target.value)}
                    placeholder="e.g. Clean Water Well - Turkana East"
                    className="w-full border border-gray-300 rounded-lg p-2 text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Description</label>
                  <textarea
                    value={missionDesc}
                    onChange={(e) => setMissionDesc(e.target.value)}
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg p-2 text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Goal Amount (USD)</label>
                  <input
                    type="number"
                    value={missionGoal}
                    onChange={(e) => setMissionGoal(e.target.value)}
                    placeholder="12000"
                    className="w-full border border-gray-300 rounded-lg p-2 text-sm"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg text-sm hover:bg-blue-700"
                >
                  Publish Mission to Live Public Site
                </button>
              </form>
            )}

            <div className="grid grid-cols-2 gap-4">
              {missions.map((m) => (
                <div key={m.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs font-mono text-gray-400">Mission #{m.id}</span>
                      <h4 className="text-base font-bold text-gray-900">{m.title}</h4>
                      <p className="text-xs text-gray-500">Target Country: {m.target_country}</p>
                    </div>
                    <span className="bg-blue-50 text-blue-700 text-xs font-semibold px-2.5 py-0.5 rounded">
                      {m.status}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-gray-100 flex justify-between text-xs font-medium">
                    <span className="text-gray-500">Goal: ${m.goal_amount_usd}</span>
                    <span className="text-green-600 font-bold">Raised: ${m.raised_amount_usd}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Donations & Settlement */}
        {activeTab === "donations" && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase">
                <tr>
                  <th className="p-3">ID</th>
                  <th className="p-3">Mission ID</th>
                  <th className="p-3">Donor</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Stellar Hash</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {donations.map((d) => (
                  <tr key={d.id}>
                    <td className="p-3 font-mono">#{d.id}</td>
                    <td className="p-3">Mission #{d.mission_id}</td>
                    <td className="p-3">{d.donor_email}</td>
                    <td className="p-3 font-semibold">${d.amount_usd} {d.asset_type}</td>
                    <td className="p-3 font-mono text-gray-500">{d.stellar_tx_hash ? `${d.stellar_tx_hash.slice(0, 12)}...` : "—"}</td>
                    <td className="p-3">
                      <span className="bg-green-50 text-green-700 px-2 py-0.5 rounded font-semibold text-[11px]">
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
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase">
                <tr>
                  <th className="p-3">ID</th>
                  <th className="p-3">Mission ID</th>
                  <th className="p-3">Expense Title</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Vendor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {receipts.map((r) => (
                  <tr key={r.id}>
                    <td className="p-3 font-mono">#{r.id}</td>
                    <td className="p-3">Mission #{r.mission_id}</td>
                    <td className="p-3 font-medium">{r.title}</td>
                    <td className="p-3">{r.category}</td>
                    <td className="p-3 font-bold text-gray-900">${r.amount_spent_usd}</td>
                    <td className="p-3 text-gray-500">{r.vendor_name || "—"}</td>
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