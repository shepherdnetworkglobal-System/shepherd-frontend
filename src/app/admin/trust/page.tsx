"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  ShieldCheck, User, Building2, FileText, Search, RefreshCw, Eye, Sparkles, AlertCircle,
  BookOpen, Briefcase, Plus, Trash2, Upload, Image as ImageIcon, Globe2, CheckCircle2,
  Loader2, Award, MapPin, Save, UserPlus, Target
} from "lucide-react";
import { apiRequest, uploadFile } from "@/lib/api";
import "flag-icons/css/flag-icons.min.css";

// --- Interfaces ---
interface Application {
  id: number;
  user_id: number;
  full_name?: string;
  email?: string;
  shepherd_id: string | null;
  country: string;
  organization_name: string | null;
  organization_cert_url: string | null;
  government_id_url: string | null;
  selfie_url: string | null;
  proof_of_address_url: string | null;
  profile_photo_url: string | null;
  biography: string | null;
  years_of_service: number;
  calling_description: string | null;
  stellar_payout_address: string | null;
  affiliation_path: string;
  risk_tier: string;
  identity_layer_status: string;
  address_layer_status: string;
  affiliation_layer_status: string;
  organization_layer_status: string;
  payout_layer_status: string;
  mission_layer_status: string;
  history_layer_status: string;
  badge_identity_verified: boolean;
  badge_org_verified: boolean;
  badge_payout_verified: boolean;
  badge_mission_verified: boolean;
  verification_status: string;
  admin_notes: string | null;
  created_at: string;
}

const COUNTRY_TO_FLAG: Record<string, string> = {
  Kenya: "ke", Nigeria: "ng", Philippines: "ph", Pakistan: "pk", Uganda: "ug",
  Tanzania: "tz", Ghana: "gh", Ethiopia: "et", Rwanda: "rw", "South Africa": "za",
  India: "in", USA: "us", "United States": "us",
};

function FlagBadge({ country }: { country: string }) {
  const code = COUNTRY_TO_FLAG[country] || "";
  return code ? <span className={`fi fi-${code} text-base rounded-sm shadow-sm`} title={country} /> : <span>🌍</span>;
}

export default function OnboardingWorkstation() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [activeTab, setActiveTab] = useState<"VETTING" | "PROFILE" | "PORTFOLIO">("VETTING");
  
  // Interactive Gateways
  const [showOpModal, setShowOpModal] = useState(false);
  const [showMissionModal, setShowMissionModal] = useState(false);

  // New Missionary Form
  const [opName, setOpName] = useState("");
  const [opEmail, setOpEmail] = useState("");
  const [opCountry, setOpCountry] = useState("Kenya");
  const [opOrg, setOpOrg] = useState("Independent");
  const [opWallet, setOpWallet] = useState("");
  const [opGovId, setOpGovId] = useState("");
  const [opSelfie, setOpSelfie] = useState("");
  const [opCert, setOpCert] = useState("");
  const [opPhoto, setOpPhoto] = useState("");
  const [uploadingState, setUploadingState] = useState<string | null>(null); // tracks which file is uploading
  const [creatingOp, setCreatingOp] = useState(false);

  // New Mission Form
  const [selectedOpId, setSelectedOpId] = useState("");
  const [mTitle, setMTitle] = useState("");
  const [mDesc, setMDesc] = useState("");
  const [mGoal, setMGoal] = useState("5000");
  const [mCountry, setMCountry] = useState("Kenya");
  const [mProblem, setMProblem] = useState("");
  const [mObjectives, setMObjectives] = useState("");
  const [mProcess, setMProcess] = useState("");
  const [creatingMission, setCreatingMission] = useState(false);

  // Vetting & Profile Editor States (for selectedApp)
  const [status, setStatus] = useState("UNDER_REVIEW");
  const [adminNotes, setAdminNotes] = useState("");
  const [shepherdId, setShepherdId] = useState("");
  const [identityLayer, setIdentityLayer] = useState("PENDING");
  const [badgeIdentity, setBadgeIdentity] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const data = await apiRequest("/api/verification/applications");
      setApplications(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchApplications(); }, []);

  const selectApplication = (app: Application) => {
    setSelectedApp(app);
    setStatus(app.verification_status);
    setAdminNotes(app.admin_notes || "");
    setShepherdId(app.shepherd_id || "");
    setIdentityLayer(app.identity_layer_status || "NOT_STARTED");
    setBadgeIdentity(!!app.badge_identity_verified);
    setActiveTab("VETTING");
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

  const handleCreateMissionary = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingOp(true);
    try {
      // 1. Create User
      const userRes = await apiRequest("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ email: opEmail, password: "TempPassword123!", full_name: opName, role: "MISSIONARY" }),
      });

      // 2. Create Profile
      const profileRes = await apiRequest("/api/verification/apply", {
        method: "POST",
        body: JSON.stringify({
          user_id: userRes.id || userRes.user_id,
          country: opCountry,
          affiliation_path: opOrg.toLowerCase() === "independent" ? "INDEPENDENT" : "ORG_AFFILIATED",
          organization_name: opOrg,
          stellar_payout_address: opWallet || null,
        }),
      });

      // 3. Attach Docs & Photo
      if (opGovId || opSelfie || opCert) {
        await apiRequest(`/api/verification/documents/${profileRes.id}`, {
          method: "PUT",
          body: JSON.stringify({
            government_id_url: opGovId || null,
            selfie_url: opSelfie || null,
            organization_cert_url: opCert || null,
          }),
        });
      }
      if (opPhoto) {
        await apiRequest(`/api/verification/profile/${profileRes.id}`, {
          method: "PUT",
          body: JSON.stringify({ profile_photo_url: opPhoto }),
        });
      }

      setShowOpModal(false);
      setOpName(""); setOpEmail(""); setOpWallet(""); setOpGovId(""); setOpSelfie(""); setOpCert(""); setOpPhoto("");
      await fetchApplications();
      alert("Missionary Onboarded! They are now in the queue for vetting.");
    } catch (err: any) {
      alert(err.message || "Failed to onboard missionary.");
    } finally {
      setCreatingOp(false);
    }
  };

  const handleCreateMission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOpId) return alert("Select an approved missionary.");
    setCreatingMission(true);
    try {
      await apiRequest("/api/missions", {
        method: "POST",
        body: JSON.stringify({
          missionary_id: parseInt(selectedOpId, 10),
          title: mTitle,
          description: mDesc,
          goal_amount_usd: parseFloat(mGoal),
          target_country: mCountry,
          problem_statement: mProblem || null,
          mission_objectives: mObjectives || null,
          proposed_process: mProcess || null,
        }),
      });
      setShowMissionModal(false);
      setMTitle(""); setMDesc(""); setMProblem(""); setMObjectives(""); setMProcess("");
      alert("Mission Created! It is now live on the public dashboard.");
    } catch (err: any) {
      alert(err.message || "Failed to create mission.");
    } finally {
      setCreatingMission(false);
    }
  };

  const handleSaveReview = async () => {
    if (!selectedApp) return;
    setSaving(true);
    try {
      const updated = await apiRequest(`/api/verification/admin/review/${selectedApp.id}`, {
        method: "PUT",
        body: JSON.stringify({
          status, admin_notes: adminNotes, shepherd_id: shepherdId || null,
          identity_layer_status: identityLayer, badge_identity_verified: badgeIdentity,
        }),
      });
      setApplications((prev) => prev.map((a) => (a.id === updated.id ? { ...a, ...updated } : a)));
      setSelectedApp({ ...selectedApp, ...updated });
      alert("Vetting Decision Saved");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const filteredApps = applications.filter((app) => {
    const q = searchTerm.toLowerCase();
    const match = (app.full_name || "").toLowerCase().includes(q) || (app.organization_name || "").toLowerCase().includes(q);
    const st = filterStatus === "ALL" || app.verification_status === filterStatus;
    return match && st;
  });

  const approvedOps = applications.filter((a) => a.verification_status === "APPROVED");

  return (
    <div className="p-6 max-w-[1600px] mx-auto h-full flex flex-col space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
              Module 01.05
            </span>
          </div>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-blue-600" /> On-Boarding Workstation
          </h1>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchApplications} className="px-3.5 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 flex items-center gap-1.5 shadow-sm">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Sync Queue
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 items-start">
        {/* Left Sidebar: Queue */}
        <div className="lg:col-span-4 bg-white/80 backdrop-blur-xl border border-slate-200/80 rounded-2xl p-4 shadow-sm flex flex-col space-y-4">
          <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
            <User className="w-4 h-4 text-slate-500" /> Operator Queue ({filteredApps.length})
          </h2>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input type="text" placeholder="Search name or org..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500" />
          </div>
          <div className="space-y-2 max-h-[620px] overflow-y-auto">
            {filteredApps.map((app) => (
              <button
                key={app.id}
                onClick={() => selectApplication(app)}
                className={`w-full text-left p-3 rounded-xl border transition-all ${selectedApp?.id === app.id ? "bg-blue-50 border-blue-300 ring-1 ring-blue-200" : "bg-white border-slate-200 hover:border-slate-300"}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <FlagBadge country={app.country} />
                    <span className="text-xs font-semibold text-slate-900 truncate">{app.full_name || "Unnamed"}</span>
                  </div>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${app.verification_status === "APPROVED" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200"}`}>
                    {app.verification_status}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right Workspace: Entry Points or Vetting */}
        <div className="lg:col-span-8 space-y-4">
          {!selectedApp ? (
            <div className="bg-white/80 backdrop-blur-xl border border-slate-200/80 rounded-2xl p-8 shadow-sm">
              <div className="text-center mb-10">
                <h2 className="text-2xl font-bold text-slate-900">Welcome to On-Boarding</h2>
                <p className="text-sm text-slate-500 mt-2">Select an operator from the queue to vet them, or choose an action below.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <button
                  onClick={() => setShowOpModal(true)}
                  className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-blue-200 bg-blue-50/50 hover:bg-blue-50 rounded-3xl transition-all group"
                >
                  <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <UserPlus className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">1. Onboard a Missionary</h3>
                  <p className="text-xs text-slate-500 mt-2 text-center">Create profile, upload government ID & credentials.</p>
                </button>

                <button
                  onClick={() => setShowMissionModal(true)}
                  className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50 rounded-3xl transition-all group"
                >
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Target className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">2. Deploy a Mission</h3>
                  <p className="text-xs text-slate-500 mt-2 text-center">Create a master mission brief for an approved operator.</p>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white/80 border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-6">
              {/* Quick Vetting View for Selected App */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  {selectedApp.profile_photo_url ? (
                    <img src={selectedApp.profile_photo_url} alt="" className="w-12 h-12 rounded-xl object-cover" />
                  ) : <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center"><User className="w-5 h-5 text-slate-400"/></div>}
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">{selectedApp.full_name}</h2>
                    <p className="text-xs text-slate-500">{selectedApp.country} · {selectedApp.shepherd_id || "ID Pending"}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedApp(null)} className="text-xs text-blue-600 font-bold hover:underline">Close</button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                  <h3 className="text-[10px] font-bold uppercase text-slate-400 mb-2">Uploaded Documents</h3>
                  <div className="space-y-2">
                    {selectedApp.government_id_url && <a href={selectedApp.government_id_url} target="_blank" rel="noreferrer" className="text-xs text-blue-600 flex items-center gap-1"><Eye className="w-3 h-3"/> Gov ID</a>}
                    {selectedApp.selfie_url && <a href={selectedApp.selfie_url} target="_blank" rel="noreferrer" className="text-xs text-blue-600 flex items-center gap-1"><Eye className="w-3 h-3"/> Selfie</a>}
                    {selectedApp.organization_cert_url && <a href={selectedApp.organization_cert_url} target="_blank" rel="noreferrer" className="text-xs text-blue-600 flex items-center gap-1"><Eye className="w-3 h-3"/> Org Cert</a>}
                    {!selectedApp.government_id_url && !selectedApp.selfie_url && !selectedApp.organization_cert_url && <p className="text-xs text-slate-400">No documents uploaded.</p>}
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-400">Status</label>
                    <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full text-xs font-bold p-2 bg-slate-900 text-white rounded-lg mt-1">
                      <option value="UNDER_REVIEW">UNDER_REVIEW</option>
                      <option value="APPROVED">APPROVED</option>
                      <option value="REJECTED">REJECTED</option>
                    </select>
                  </div>
                  <button onClick={handleSaveReview} disabled={saving} className="w-full py-2 bg-blue-600 text-white text-xs font-bold rounded-lg disabled:opacity-50">
                    {saving ? "Saving..." : "Commit Decision"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* --- MODAL 1: ONBOARD MISSIONARY --- */}
      {showOpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md overflow-y-auto">
          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-2xl max-w-2xl w-full p-8 relative my-auto">
            <button onClick={() => setShowOpModal(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-800">✕</button>
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Onboard Field Missionary</h2>
            
            <form onSubmit={handleCreateMissionary} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 mb-1 block">Full Name</label>
                  <input required value={opName} onChange={e => setOpName(e.target.value)} className="w-full text-xs p-3 border border-slate-200 rounded-xl" />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-500 mb-1 block">Login Email</label>
                  <input required type="email" value={opEmail} onChange={e => setOpEmail(e.target.value)} className="w-full text-xs p-3 border border-slate-200 rounded-xl" />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-500 mb-1 block">Country</label>
                  <input required value={opCountry} onChange={e => setOpCountry(e.target.value)} className="w-full text-xs p-3 border border-slate-200 rounded-xl" />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-500 mb-1 block">Organization</label>
                  <input required value={opOrg} onChange={e => setOpOrg(e.target.value)} className="w-full text-xs p-3 border border-slate-200 rounded-xl" />
                </div>
                <div className="col-span-2">
                  <label className="text-[11px] font-bold text-slate-500 mb-1 block">Stellar Wallet (Optional during vetting)</label>
                  <input value={opWallet} onChange={e => setOpWallet(e.target.value)} placeholder="G..." className="w-full text-xs font-mono p-3 border border-slate-200 rounded-xl" />
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <h3 className="text-[11px] font-bold text-slate-500">Document Uploads (Cloudinary)</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block mb-1">Profile Photo</label>
                    <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, setOpPhoto, "Profile Photo")} className="text-xs w-full" />
                    {uploadingState === "Profile Photo" && <span className="text-[10px] text-blue-500">Uploading...</span>}
                    {opPhoto && <span className="text-[10px] text-emerald-600 flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Uploaded</span>}
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block mb-1">Government ID</label>
                    <input type="file" accept="image/*,.pdf" onChange={(e) => handleFileUpload(e, setOpGovId, "Gov ID")} className="text-xs w-full" />
                    {uploadingState === "Gov ID" && <span className="text-[10px] text-blue-500">Uploading...</span>}
                    {opGovId && <span className="text-[10px] text-emerald-600 flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Uploaded</span>}
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block mb-1">Liveness Selfie</label>
                    <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, setOpSelfie, "Selfie")} className="text-xs w-full" />
                    {uploadingState === "Selfie" && <span className="text-[10px] text-blue-500">Uploading...</span>}
                    {opSelfie && <span className="text-[10px] text-emerald-600 flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Uploaded</span>}
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block mb-1">Org Certificate</label>
                    <input type="file" accept="image/*,.pdf" onChange={(e) => handleFileUpload(e, setOpCert, "Cert")} className="text-xs w-full" />
                    {uploadingState === "Cert" && <span className="text-[10px] text-blue-500">Uploading...</span>}
                    {opCert && <span className="text-[10px] text-emerald-600 flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Uploaded</span>}
                  </div>
                </div>
              </div>

              <button type="submit" disabled={creatingOp || !!uploadingState} className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl text-xs uppercase tracking-wider hover:bg-blue-700 disabled:opacity-50">
                {creatingOp ? "Creating..." : "Submit Missionary Profile"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 2: DEPLOY MISSION --- */}
      {showMissionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md overflow-y-auto">
          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-2xl max-w-2xl w-full p-8 relative my-auto mt-20 mb-20">
            <button onClick={() => setShowMissionModal(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-800">✕</button>
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Deploy Master Mission</h2>
            
            <form onSubmit={handleCreateMission} className="space-y-4">
              <div>
                <label className="text-[11px] font-bold text-slate-500 mb-1 block">Head of Operations (Must be APPROVED)</label>
                <select required value={selectedOpId} onChange={e => setSelectedOpId(e.target.value)} className="w-full text-xs p-3 border border-slate-200 rounded-xl bg-white">
                  <option value="">Select an approved missionary...</option>
                  {approvedOps.map((op) => (
                    <option key={op.id} value={op.id}>{op.full_name} ({op.country})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 mb-1 block">Mission Title</label>
                <input required value={mTitle} onChange={e => setMTitle(e.target.value)} className="w-full text-xs p-3 border border-slate-200 rounded-xl" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 mb-1 block">Funding Goal (USD)</label>
                  <input required type="number" value={mGoal} onChange={e => setMGoal(e.target.value)} className="w-full text-xs p-3 border border-slate-200 rounded-xl" />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-500 mb-1 block">Target Country</label>
                  <input required value={mCountry} onChange={e => setMCountry(e.target.value)} className="w-full text-xs p-3 border border-slate-200 rounded-xl" />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 mb-1 block">Short Description</label>
                <textarea required rows={2} value={mDesc} onChange={e => setMDesc(e.target.value)} className="w-full text-xs p-3 border border-slate-200 rounded-xl" />
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
                <h3 className="text-[11px] font-bold text-slate-500">Master Brief Details</h3>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">Problem / Need Statement</label>
                  <textarea rows={2} value={mProblem} onChange={e => setMProblem(e.target.value)} className="w-full text-xs p-3 border border-slate-200 rounded-xl" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">Mission Objectives</label>
                  <textarea rows={2} value={mObjectives} onChange={e => setMObjectives(e.target.value)} className="w-full text-xs p-3 border border-slate-200 rounded-xl" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">Proposed Implementation Process</label>
                  <textarea rows={2} value={mProcess} onChange={e => setMProcess(e.target.value)} className="w-full text-xs p-3 border border-slate-200 rounded-xl" />
                </div>
              </div>

              <button type="submit" disabled={creatingMission || !selectedOpId} className="w-full bg-emerald-600 text-white font-bold py-4 rounded-xl text-xs uppercase tracking-wider hover:bg-emerald-700 disabled:opacity-50">
                {creatingMission ? "Deploying..." : "Launch Mission to Ledger"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}