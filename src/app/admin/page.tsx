"use client";

import React, { useState, useEffect } from "react";
import { UserCheck, CheckCircle2, XCircle, Layers, DollarSign, Receipt as ReceiptIcon, RefreshCw, Plus } from "lucide-react";
import { apiRequest } from "@/lib/api";

interface Application { id: number; user_id: number; shepherd_id: string | null; country: string; organization_name: string | null; stellar_payout_address: string | null; mpesa_phone_number: string | null; verification_status: string; created_at: string; }
interface Mission { id: number; missionary_id: number; title: string; goal_amount_usd: number; raised_amount_usd: number; target_country: string; status: string; }
interface Donation { id: number; mission_id: number; donor_email: string; amount_usd: number; asset_type: string; stellar_tx_hash: string | null; status: string; created_at: string; }
interface Receipt { id: number; mission_id: number; title: string; amount_spent_usd: number; category: string; vendor_name: string | null; created_at: string; }

export default function AdminOverviewPage() {
  const [activeTab, setActiveTab] = useState<"verifications" | "missions" | "donations" | "receipts">("verifications");
  const [applications, setApplications] = useState<Application[]>([]);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(false);
  const [assignedShepherdId, setAssignedShepherdId] = useState("");

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
    loadData();
  }, []);

  const handleReview = async (profileId: number, status: "APPROVED" | "REJECTED") => {
    try {
      const generatedShepherdId = status === "APPROVED" ? assignedShepherdId || `SHEPHERD-${Math.floor(1000 + Math.random() * 9000)}` : undefined;
      await apiRequest(`/api/verification/admin/review/${profileId}`, {
        method: "PUT",
        body: JSON.stringify({ status, admin_notes: status === "APPROVED" ? "Verified." : "Rejected.", shepherd_id: generatedShepherdId }),
      });
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
        body: JSON.stringify({ missionary_id: parseInt(missionaryId, 10), title: missionTitle, description: missionDesc, goal_amount_usd: parseFloat(missionGoal), target_country: missionCountry }),
      });
      setShowCreateMission(false);
      await loadData();
    } catch (err: unknown) {
      if (err instanceof Error) {
        alert(err.message);
      } else {
        alert("Failed to create mission");
      }
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">System Overview</h1>
          <p className="text-sm font-medium text-slate-500">Live platform metrics and processing queues.</p>
        </div>
        <button onClick={loadData} className="flex items-center gap-2 bg-white text-slate-700 text-xs font-bold px-4 py-2 rounded-xl border border-slate-200 shadow-sm hover:bg-slate-50 transition">
          <RefreshCw className={`w-3.5 h-3.5 text-blue-600 ${loading ? "animate-spin" : ""}`} /> Sync Data
        </button>
      </div>

      {/* KPI Metric Overview */}
      <div className="grid grid-cols-4 gap-5">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Pending Vetting</span>
          <div className="flex items-center justify-between mt-3">
            <span className="text-3xl font-extrabold text-slate-900 num-tabular">{applications.filter(a => a.verification_status !== "APPROVED" && a.verification_status !== "REJECTED").length}</span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center"><UserCheck className="w-5 h-5 text-amber-500" /></div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Missions</span>
          <div className="flex items-center justify-between mt-3">
            <span className="text-3xl font-extrabold text-slate-900 num-tabular">{missions.length}</span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center"><Layers className="w-5 h-5 text-blue-500" /></div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Donations</span>
          <div className="flex items-center justify-between mt-3">
            <span className="text-3xl font-extrabold text-slate-900 num-tabular">{donations.length}</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center"><DollarSign className="w-5 h-5 text-emerald-500" /></div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Field Receipts</span>
          <div className="flex items-center justify-between mt-3">
            <span className="text-3xl font-extrabold text-slate-900 num-tabular">{receipts.length}</span>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center"><ReceiptIcon className="w-5 h-5 text-indigo-500" /></div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-8 text-sm font-bold">
        {[{ id: "verifications", icon: UserCheck, label: "Operator Vetting" }, { id: "missions", icon: Layers, label: "Active Deployments" }, { id: "donations", icon: DollarSign, label: "Inbound Settlement" }, { id: "receipts", icon: ReceiptIcon, label: "Cryptographic Ledger" }].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as "verifications" | "missions" | "donations" | "receipts")} className={`pb-4 transition flex items-center gap-2 ${activeTab === tab.id ? "border-b-2 border-blue-600 text-blue-600" : "text-slate-500 hover:text-slate-900"}`}>
            <tab.icon className="w-4 h-4" /> {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "verifications" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 bg-slate-50 text-[10px] uppercase tracking-widest font-bold text-slate-500">Vetting Applications ({applications.length})</div>
          {applications.length === 0 ? (
            <div className="p-10 text-center text-sm font-medium text-slate-500">No applications in queue.</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {applications.map((app) => (
                <div key={app.id} className="p-6 space-y-5">
                  <div className="flex justify-between">
                    <div>
                      <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400">System Entry #{app.id} (User #{app.user_id})</span>
                      <h4 className="text-lg font-extrabold text-slate-900 mt-1">{app.organization_name || "Independent"} • {app.country}</h4>
                      {app.shepherd_id && <span className="inline-block mt-2 bg-emerald-50 text-emerald-700 text-[10px] uppercase font-bold px-2.5 py-1 rounded border border-emerald-200">Hash: {app.shepherd_id}</span>}
                    </div>
                    <span className={`text-[10px] uppercase tracking-widest font-bold px-3 py-1.5 rounded-md border h-fit ${app.verification_status === "APPROVED" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : app.verification_status === "REJECTED" ? "bg-red-50 text-red-700 border-red-200" : "bg-amber-50 text-amber-700 border-amber-200"}`}>{app.verification_status}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 bg-slate-50 border border-slate-100 p-5 rounded-xl text-xs font-mono">
                    <div><span className="text-slate-500 block mb-1 font-sans font-bold uppercase tracking-wider text-[10px]">Stellar Rail:</span><span className="font-semibold text-slate-900">{app.stellar_payout_address || "None"}</span></div>
                    <div><span className="text-slate-500 block mb-1 font-sans font-bold uppercase tracking-wider text-[10px]">Mobile Fiat:</span><span className="font-semibold text-slate-900">{app.mpesa_phone_number || "None"}</span></div>
                  </div>
                  {app.verification_status !== "APPROVED" && (
                    <div className="pt-2 flex items-center gap-3">
                      <input type="text" placeholder="Assign Hash (e.g. ALPHA-1042)" value={assignedShepherdId} onChange={(e) => setAssignedShepherdId(e.target.value)} className="border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold w-72 outline-none focus:border-blue-500" />
                      <button onClick={() => handleReview(app.id, "APPROVED")} className="bg-emerald-600 text-white text-xs uppercase font-bold px-5 py-2.5 rounded-xl flex items-center gap-2"><CheckCircle2 className="w-4 h-4"/> Authorize</button>
                      <button onClick={() => handleReview(app.id, "REJECTED")} className="bg-white border border-red-200 text-red-600 text-xs uppercase font-bold px-5 py-2.5 rounded-xl flex items-center gap-2"><XCircle className="w-4 h-4"/> Decline</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "missions" && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <button onClick={() => setShowCreateMission(!showCreateMission)} className="bg-blue-600 text-white text-xs uppercase font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-sm hover:bg-blue-700"><Plus className="w-4 h-4"/> Initialize Deployment</button>
          </div>
          {showCreateMission && (
            <form onSubmit={handleCreateMission} className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-5">
              <h3 className="text-sm font-bold uppercase border-b border-slate-100 pb-4">Configure New Deployment</h3>
              <div className="grid grid-cols-2 gap-5">
                <div><label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Operator ID</label><input type="number" value={missionaryId} onChange={(e) => setMissionaryId(e.target.value)} className="w-full border rounded-xl p-3 text-sm font-bold outline-none focus:border-blue-500" required/></div>
                <div><label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Target Area</label><input type="text" value={missionCountry} onChange={(e) => setMissionCountry(e.target.value)} className="w-full border rounded-xl p-3 text-sm font-bold outline-none focus:border-blue-500" required/></div>
              </div>
              <div><label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Deployment Title</label><input type="text" value={missionTitle} onChange={(e) => setMissionTitle(e.target.value)} className="w-full border rounded-xl p-3 text-sm font-bold outline-none focus:border-blue-500" required/></div>
              <div><label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Parameters</label><textarea value={missionDesc} onChange={(e) => setMissionDesc(e.target.value)} className="w-full border rounded-xl p-3 text-sm font-medium outline-none focus:border-blue-500" required/></div>
              <div><label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Limit Cap (USD)</label><input type="number" value={missionGoal} onChange={(e) => setMissionGoal(e.target.value)} className="w-full border rounded-xl p-3 text-sm font-bold outline-none focus:border-blue-500" required/></div>
              <button type="submit" className="bg-slate-900 text-white text-xs uppercase font-bold py-3 px-6 rounded-xl hover:bg-slate-800">Commit to Public Ledger</button>
            </form>
          )}
          <div className="grid grid-cols-2 gap-5">
            {missions.map(m => (
              <div key={m.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex justify-between items-start">
                  <div><span className="text-[10px] font-bold uppercase text-slate-400">Deployment #{m.id}</span><h4 className="text-base font-extrabold text-slate-900 mt-1">{m.title}</h4></div>
                  <span className="bg-blue-50 text-blue-700 border border-blue-200 text-[10px] uppercase font-bold px-2.5 py-1 rounded-md">{m.status}</span>
                </div>
                <div className="pt-4 border-t border-slate-100 flex justify-between text-xs font-bold">
                  <span className="text-slate-500">Cap: <span className="text-slate-900">${m.goal_amount_usd}</span></span>
                  <span className="text-emerald-600">Settled: <span>${m.raised_amount_usd}</span></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "donations" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left text-xs"><thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]"><tr><th className="p-4">Tx ID</th><th className="p-4">Deployment</th><th className="p-4">Entity</th><th className="p-4">Volume</th><th className="p-4">Hash</th><th className="p-4">State</th></tr></thead><tbody className="divide-y divide-slate-100">
            {donations.map(d => (
              <tr key={d.id} className="hover:bg-slate-50/50">
                <td className="p-4 font-bold">#{d.id}</td><td className="p-4 font-bold text-blue-600">Mission #{d.mission_id}</td><td className="p-4 font-medium">{d.donor_email}</td><td className="p-4 font-black">${d.amount_usd} {d.asset_type}</td><td className="p-4 font-mono text-slate-400">{d.stellar_tx_hash ? `${d.stellar_tx_hash.slice(0,16)}...` : "—"}</td><td className="p-4"><span className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md font-bold uppercase text-[9px] border border-emerald-200">{d.status}</span></td>
              </tr>
            ))}
          </tbody></table>
        </div>
      )}

      {activeTab === "receipts" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left text-xs"><thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]"><tr><th className="p-4">Log ID</th><th className="p-4">Deployment</th><th className="p-4">Record</th><th className="p-4">Classification</th><th className="p-4">Volume</th><th className="p-4">Counterparty</th></tr></thead><tbody className="divide-y divide-slate-100">
            {receipts.map(r => (
              <tr key={r.id} className="hover:bg-slate-50/50">
                <td className="p-4 font-bold">#{r.id}</td><td className="p-4 font-bold text-blue-600">Mission #{r.mission_id}</td><td className="p-4 font-bold">{r.title}</td><td className="p-4 font-semibold text-slate-500">{r.category}</td><td className="p-4 font-black text-emerald-600">${r.amount_spent_usd}</td><td className="p-4 text-slate-500 font-medium">{r.vendor_name || "—"}</td>
              </tr>
            ))}
          </tbody></table>
        </div>
      )}
    </div>
  );
}