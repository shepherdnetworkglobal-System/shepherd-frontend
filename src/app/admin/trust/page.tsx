"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  ShieldCheck,
  User,
  Building2,
  FileText,
  Search,
  RefreshCw,
  Eye,
  Sparkles,
  AlertCircle,
  BookOpen,
  Briefcase,
  Plus,
  Trash2,
  Upload,
  Image as ImageIcon,
  Globe2,
  CheckCircle2,
  Loader2,
  Award,
  MapPin,
  Save
} from "lucide-react";
import { apiRequest, uploadFile } from "@/lib/api";
import "flag-icons/css/flag-icons.min.css";

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
  mpesa_phone_number: string | null;
  affiliation_path: "ORG_AFFILIATED" | "INDEPENDENT";
  risk_tier: "LOW" | "STANDARD" | "ELEVATED" | "RESTRICTED";
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

interface PastProject {
  id: number;
  title: string;
  description: string;
  location: string;
  year_completed: number;
  people_impacted: number;
  media_urls: string;
}

const COUNTRY_TO_FLAG: Record<string, string> = {
  Kenya: "ke",
  Nigeria: "ng",
  Philippines: "ph",
  Pakistan: "pk",
  Uganda: "ug",
  Tanzania: "tz",
  Ghana: "gh",
  Ethiopia: "et",
  Rwanda: "rw",
  "South Africa": "za",
  India: "in",
  USA: "us",
  "United States": "us",
};

function FlagBadge({ country }: { country: string }) {
  const code = COUNTRY_TO_FLAG[country] || "";
  if (!code) {
    return <span className="text-sm">🌍</span>;
  }
  return <span className={`fi fi-${code} text-base rounded-sm shadow-sm`} title={country} />;
}

export default function OnboardingWorkstation() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [activeTab, setActiveTab] = useState<"VETTING" | "PROFILE" | "PORTFOLIO" | "MISSION">("VETTING");

  // Vetting form
  const [shepherdId, setShepherdId] = useState("");
  const [status, setStatus] = useState("UNDER_REVIEW");
  const [adminNotes, setAdminNotes] = useState("");
  const [affiliationPath, setAffiliationPath] = useState<"ORG_AFFILIATED" | "INDEPENDENT">("INDEPENDENT");
  const [riskTier, setRiskTier] = useState<"LOW" | "STANDARD" | "ELEVATED" | "RESTRICTED">("STANDARD");
  const [identityLayer, setIdentityLayer] = useState("PENDING");
  const [addressLayer, setAddressLayer] = useState("NOT_STARTED");
  const [affiliationLayer, setAffiliationLayer] = useState("NOT_STARTED");
  const [orgLayer, setOrgLayer] = useState("NOT_STARTED");
  const [payoutLayer, setPayoutLayer] = useState("NOT_STARTED");
  const [missionLayer, setMissionLayer] = useState("NOT_STARTED");
  const [historyLayer, setHistoryLayer] = useState("NOT_STARTED");
  const [badgeIdentity, setBadgeIdentity] = useState(false);
  const [badgeOrg, setBadgeOrg] = useState(false);
  const [badgePayout, setBadgePayout] = useState(false);
  const [badgeMission, setBadgeMission] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Profile builder
  const [editBio, setEditBio] = useState("");
  const [editCalling, setEditCalling] = useState("");
  const [editYears, setEditYears] = useState("0");
  const [editOrgName, setEditOrgName] = useState("");
  const [editCountry, setEditCountry] = useState("");
  const [editPhotoUrl, setEditPhotoUrl] = useState("");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  // Portfolio
  const [pastProjects, setPastProjects] = useState<PastProject[]>([]);
  const [projTitle, setProjTitle] = useState("");
  const [projDesc, setProjDesc] = useState("");
  const [projLoc, setProjLoc] = useState("");
  const [projYear, setProjYear] = useState(String(new Date().getFullYear()));
  const [projImpact, setProjImpact] = useState("100");
  const [projGallery, setProjGallery] = useState<string[]>([]);
  const [addingProject, setAddingProject] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // Mission create
  const [missionTitle, setMissionTitle] = useState("");
  const [missionDesc, setMissionDesc] = useState("");
  const [missionGoal, setMissionGoal] = useState("5000");
  const [missionCountry, setMissionCountry] = useState("Kenya");
  const [missionProblem, setMissionProblem] = useState("");
  const [missionObjectives, setMissionObjectives] = useState("");
  const [missionProcess, setMissionProcess] = useState("");
  const [missionBeneficiaries, setMissionBeneficiaries] = useState("");
  const [missionDuration, setMissionDuration] = useState("");
  const [missionMap, setMissionMap] = useState("");
  const [creatingMission, setCreatingMission] = useState(false);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const data = (await apiRequest("/api/verification/applications")) as Application[];
      setApplications(data || []);
      if (data && data.length > 0 && !selectedApp) {
        selectApplication(data[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadPortfolio = async (profileId: number) => {
    try {
      const pub = await apiRequest(`/api/verification/public/${profileId}`).catch(() => null);
      if (pub?.past_projects) {
        setPastProjects(pub.past_projects);
      } else {
        setPastProjects([]);
      }
    } catch {
      setPastProjects([]);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const selectApplication = (app: Application) => {
    setSelectedApp(app);
    setShepherdId(app.shepherd_id || "");
    setStatus(app.verification_status);
    setAdminNotes(app.admin_notes || "");
    setAffiliationPath(app.affiliation_path || "INDEPENDENT");
    setRiskTier(app.risk_tier || "STANDARD");
    setIdentityLayer(app.identity_layer_status || "NOT_STARTED");
    setAddressLayer(app.address_layer_status || "NOT_STARTED");
    setAffiliationLayer(app.affiliation_layer_status || "NOT_STARTED");
    setOrgLayer(app.organization_layer_status || "NOT_STARTED");
    setPayoutLayer(app.payout_layer_status || "NOT_STARTED");
    setMissionLayer(app.mission_layer_status || "NOT_STARTED");
    setHistoryLayer(app.history_layer_status || "NOT_STARTED");
    setBadgeIdentity(!!app.badge_identity_verified);
    setBadgeOrg(!!app.badge_org_verified);
    setBadgePayout(!!app.badge_payout_verified);
    setBadgeMission(!!app.badge_mission_verified);
    setEditBio(app.biography || "");
    setEditCalling(app.calling_description || "");
    setEditYears(String(app.years_of_service || 0));
    setEditOrgName(app.organization_name || "");
    setEditCountry(app.country || "");
    setEditPhotoUrl(app.profile_photo_url || "");
    setMissionCountry(app.country || "Kenya");
    setSaveMessage(null);
    setActiveTab("VETTING");
    loadPortfolio(app.id);
  };

  const handleSaveReview = async () => {
    if (!selectedApp) return;
    setSaving(true);
    setSaveMessage(null);
    try {
      const updated = (await apiRequest(`/api/verification/admin/review/${selectedApp.id}`, {
        method: "PUT",
        body: JSON.stringify({
          status,
          admin_notes: adminNotes,
          shepherd_id: shepherdId || null,
          affiliation_path: affiliationPath,
          risk_tier: riskTier,
          identity_layer_status: identityLayer,
          address_layer_status: addressLayer,
          affiliation_layer_status: affiliationLayer,
          organization_layer_status: orgLayer,
          payout_layer_status: payoutLayer,
          mission_layer_status: missionLayer,
          history_layer_status: historyLayer,
          badge_identity_verified: badgeIdentity,
          badge_org_verified: badgeOrg,
          badge_payout_verified: badgePayout,
          badge_mission_verified: badgeMission,
        }),
      })) as Application;
      setSaveMessage("Vetting decision committed.");
      setApplications((prev) => prev.map((a) => (a.id === updated.id ? { ...a, ...updated } : a)));
      setSelectedApp({ ...selectedApp, ...updated });
    } catch (err: any) {
      setSaveMessage(err.message || "Failed to save review.");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!selectedApp) return;
    setSaving(true);
    try {
      await apiRequest(`/api/verification/profile/${selectedApp.id}`, {
        method: "PUT",
        body: JSON.stringify({
          biography: editBio,
          calling_description: editCalling,
          years_of_service: parseInt(editYears, 10) || 0,
          organization_name: editOrgName,
          country: editCountry,
          profile_photo_url: editPhotoUrl || null,
        }),
      });
      setSaveMessage("Public profile story saved.");
      await fetchApplications();
    } catch (err: any) {
      setSaveMessage(err.message || "Failed to save profile.");
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    try {
      const res = await uploadFile(file);
      setEditPhotoUrl(res.url);
    } catch (err: any) {
      alert(err.message || "Photo upload failed. Check Cloudinary env vars.");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploadingGallery(true);
    try {
      const urls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const res = await uploadFile(files[i]);
        urls.push(res.url);
      }
      setProjGallery((prev) => [...prev, ...urls]);
    } catch (err: any) {
      alert(err.message || "Gallery upload failed.");
    } finally {
      setUploadingGallery(false);
    }
  };

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;
    setAddingProject(true);
    try {
      await apiRequest("/api/verification/projects", {
        method: "POST",
        body: JSON.stringify({
          missionary_id: selectedApp.id,
          title: projTitle,
          description: projDesc,
          location: projLoc,
          year_completed: parseInt(projYear, 10),
          people_impacted: parseInt(projImpact, 10) || 0,
          media_urls: projGallery.join(","),
        }),
      });
      setProjTitle("");
      setProjDesc("");
      setProjLoc("");
      setProjGallery([]);
      await loadPortfolio(selectedApp.id);
    } catch (err: any) {
      alert(err.message || "Failed to add past project.");
    } finally {
      setAddingProject(false);
    }
  };

  const handleDeleteProject = async (id: number) => {
    if (!confirm("Remove this past project?")) return;
    try {
      await apiRequest(`/api/verification/projects/${id}`, { method: "DELETE" });
      if (selectedApp) await loadPortfolio(selectedApp.id);
    } catch (err: any) {
      alert(err.message || "Delete failed.");
    }
  };

  const handleCreateMission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;
    if (selectedApp.verification_status !== "APPROVED") {
      alert("Missionary must be fully APPROVED before creating a mission, or use Shepherd Network Direct wallet mode later.");
      return;
    }
    setCreatingMission(true);
    try {
      await apiRequest("/api/missions", {
        method: "POST",
        body: JSON.stringify({
          missionary_id: selectedApp.id,
          title: missionTitle,
          description: missionDesc,
          goal_amount_usd: parseFloat(missionGoal),
          target_country: missionCountry,
          map_location: missionMap || null,
          problem_statement: missionProblem || null,
          mission_objectives: missionObjectives || null,
          proposed_process: missionProcess || null,
          beneficiary_group: missionBeneficiaries || null,
          expected_duration: missionDuration || null,
        }),
      });
      setMissionTitle("");
      setMissionDesc("");
      setMissionProblem("");
      setMissionObjectives("");
      setMissionProcess("");
      alert("Mission created. Manage live budget & progress in 01.02 Projects.");
    } catch (err: any) {
      alert(err.message || "Failed to create mission.");
    } finally {
      setCreatingMission(false);
    }
  };

  const filteredApps = applications.filter((app) => {
    const q = searchTerm.toLowerCase();
    const match =
      (app.full_name || "").toLowerCase().includes(q) ||
      (app.shepherd_id || "").toLowerCase().includes(q) ||
      (app.organization_name || "").toLowerCase().includes(q) ||
      app.country.toLowerCase().includes(q);
    const st = filterStatus === "ALL" || app.verification_status === filterStatus;
    return match && st;
  });

  return (
    <div className="p-6 max-w-[1600px] mx-auto h-full flex flex-col space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
              Module 01.05
            </span>
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
              Vetting · Public Profile · Portfolio · Mission Launch
            </span>
          </div>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-blue-600" />
            On-Boarding Workstation
          </h1>
        </div>
        <button
          onClick={fetchApplications}
          className="px-3.5 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 flex items-center gap-1.5 shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Sync Queue
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 items-start">
        {/* Queue */}
        <div className="lg:col-span-4 bg-white/80 backdrop-blur-xl border border-slate-200/80 rounded-2xl p-4 shadow-sm space-y-4">
          <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
            <User className="w-4 h-4 text-slate-500" />
            Operator Queue ({filteredApps.length})
          </h2>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search name, ID, org..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex flex-wrap gap-1 text-[10px]">
            {["ALL", "SUBMITTED", "UNDER_REVIEW", "APPROVED", "REJECTED"].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-2.5 py-1 rounded-md font-semibold ${
                  filterStatus === st ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
          <div className="space-y-2 max-h-[620px] overflow-y-auto">
            {loading ? (
              <div className="py-12 text-center text-xs text-slate-400">Loading...</div>
            ) : filteredApps.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">No operators in queue.</div>
            ) : (
              filteredApps.map((app) => (
                <button
                  key={app.id}
                  type="button"
                  onClick={() => selectApplication(app)}
                  className={`w-full text-left p-3 rounded-xl border transition-all ${
                    selectedApp?.id === app.id
                      ? "bg-blue-50 border-blue-300 ring-1 ring-blue-200"
                      : "bg-white border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <FlagBadge country={app.country} />
                      <span className="text-xs font-semibold text-slate-900 truncate">
                        {app.full_name || app.shepherd_id || `Profile #${app.id}`}
                      </span>
                    </div>
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                        app.verification_status === "APPROVED"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-amber-50 text-amber-700 border-amber-200"
                      }`}
                    >
                      {app.verification_status}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 truncate">
                    {app.organization_name || "Independent"} · {app.country}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Workspace */}
        <div className="lg:col-span-8 space-y-4">
          {!selectedApp ? (
            <div className="bg-white/80 border border-slate-200 rounded-2xl p-16 text-center text-xs text-slate-400">
              Select an operator from the queue to begin on-boarding.
            </div>
          ) : (
            <>
              <div className="bg-white/80 border border-slate-200/80 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center">
                    {editPhotoUrl || selectedApp.profile_photo_url ? (
                      <img
                        src={editPhotoUrl || selectedApp.profile_photo_url || ""}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-6 h-6 text-slate-400" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-semibold text-slate-900">
                        {selectedApp.full_name || "Unnamed Operator"}
                      </h2>
                      <FlagBadge country={selectedApp.country} />
                    </div>
                    <p className="text-xs text-slate-500">
                      {selectedApp.shepherd_id || "Shepherd ID pending"} · {selectedApp.organization_name || "Independent"}
                    </p>
                  </div>
                </div>
                <a
                  href={`/missionaries/${selectedApp.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-semibold text-blue-600 hover:underline"
                >
                  Open Public ID Page
                </a>
              </div>

              <div className="flex flex-wrap gap-2">
                {[
                  { id: "VETTING", label: "1. Vetting Layers", icon: ShieldCheck },
                  { id: "PROFILE", label: "2. Profile & Story", icon: BookOpen },
                  { id: "PORTFOLIO", label: "3. Past Missions", icon: Briefcase },
                  { id: "MISSION", label: "4. Create Mission", icon: Globe2 },
                ].map((t) => {
                  const Icon = t.icon;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setActiveTab(t.id as any)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 ${
                        activeTab === t.id
                          ? "bg-slate-900 text-white"
                          : "bg-white border border-slate-200 text-slate-600"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {t.label}
                    </button>
                  );
                })}
              </div>

              {saveMessage && (
                <div className="p-3 bg-blue-50 border border-blue-200 text-blue-800 text-xs font-medium rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {saveMessage}
                </div>
              )}

              {/* TAB: VETTING */}
              {activeTab === "VETTING" && (
                <div className="space-y-4">
                  <div className="bg-white/80 border border-slate-200 rounded-2xl p-5 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Shepherd ID</label>
                        <input
                          value={shepherdId}
                          onChange={(e) => setShepherdId(e.target.value)}
                          placeholder="JOE-KENYA-1001"
                          className="w-full text-xs font-mono p-2.5 border border-slate-200 rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Affiliation</label>
                        <select
                          value={affiliationPath}
                          onChange={(e) => setAffiliationPath(e.target.value as any)}
                          className="w-full text-xs p-2.5 border border-slate-200 rounded-xl"
                        >
                          <option value="INDEPENDENT">Independent</option>
                          <option value="ORG_AFFILIATED">Org-Affiliated</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Decision</label>
                        <select
                          value={status}
                          onChange={(e) => setStatus(e.target.value)}
                          className="w-full text-xs font-bold p-2.5 bg-slate-900 text-white rounded-xl"
                        >
                          <option value="SUBMITTED">SUBMITTED</option>
                          <option value="UNDER_REVIEW">UNDER_REVIEW</option>
                          <option value="INFO_REQUESTED">INFO_REQUESTED</option>
                          <option value="APPROVED">APPROVED</option>
                          <option value="REJECTED">REJECTED</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Risk Tier</label>
                      <select
                        value={riskTier}
                        onChange={(e) => setRiskTier(e.target.value as any)}
                        className="w-full text-xs p-2.5 border border-slate-200 rounded-xl"
                      >
                        <option value="LOW">LOW</option>
                        <option value="STANDARD">STANDARD</option>
                        <option value="ELEVATED">ELEVATED</option>
                        <option value="RESTRICTED">RESTRICTED</option>
                      </select>
                    </div>
                  </div>

                  <div className="bg-white/80 border border-slate-200 rounded-2xl p-5">
                    <h3 className="text-[10px] font-bold uppercase text-slate-400 mb-3 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-blue-600" /> Document Vault
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        { label: "Government ID", url: selectedApp.government_id_url },
                        { label: "Selfie", url: selectedApp.selfie_url },
                        { label: "Proof of Address", url: selectedApp.proof_of_address_url },
                        { label: "Org Certificate", url: selectedApp.organization_cert_url },
                      ].map((d) => (
                        <div key={d.label} className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                          <span className="text-[11px] font-semibold text-slate-600 block">{d.label}</span>
                          {d.url ? (
                            <a href={d.url} target="_blank" rel="noreferrer" className="text-[11px] text-blue-600 font-semibold mt-2 inline-flex items-center gap-1">
                              <Eye className="w-3 h-3" /> View
                            </a>
                          ) : (
                            <span className="text-[10px] text-slate-400 mt-2 block">Not uploaded</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white/80 border border-slate-200 rounded-2xl p-5 space-y-3">
                    <h3 className="text-[10px] font-bold uppercase text-slate-400">7-Layer Pipeline</h3>
                    {[
                      { t: "1. Identity", s: identityLayer, set: setIdentityLayer },
                      { t: "2. Address", s: addressLayer, set: setAddressLayer },
                      { t: "3. Affiliation", s: affiliationLayer, set: setAffiliationLayer },
                      { t: "4. Organization", s: orgLayer, set: setOrgLayer },
                      { t: "5. Payout", s: payoutLayer, set: setPayoutLayer },
                      { t: "6. Mission", s: missionLayer, set: setMissionLayer },
                      { t: "7. History", s: historyLayer, set: setHistoryLayer },
                    ].map((l) => (
                      <div key={l.t} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                        <span className="text-xs font-semibold text-slate-700">{l.t}</span>
                        <select value={l.s} onChange={(e) => l.set(e.target.value)} className="text-[11px] border border-slate-200 rounded-lg px-2 py-1">
                          {["NOT_STARTED", "PENDING", "APPROVED", "INFO_REQUESTED", "ESCALATED", "REJECTED"].map((v) => (
                            <option key={v} value={v}>{v}</option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>

                  <div className="bg-white/80 border border-slate-200 rounded-2xl p-5 space-y-3">
                    <h3 className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-amber-500" /> Public Badges
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { l: "Identity Verified", s: badgeIdentity, set: setBadgeIdentity },
                        { l: "Org Verified", s: badgeOrg, set: setBadgeOrg },
                        { l: "Payout Verified", s: badgePayout, set: setBadgePayout },
                        { l: "Mission Verified", s: badgeMission, set: setBadgeMission },
                      ].map((b) => (
                        <label key={b.l} className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold cursor-pointer">
                          {b.l}
                          <input type="checkbox" checked={b.s} onChange={(e) => b.set(e.target.checked)} className="accent-blue-600" />
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white/80 border border-slate-200 rounded-2xl p-5 space-y-3">
                    <label className="text-[10px] font-bold uppercase text-slate-400">Audit Notes</label>
                    <textarea
                      rows={3}
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      className="w-full text-xs p-3 border border-slate-200 rounded-xl"
                    />
                    <button
                      type="button"
                      onClick={handleSaveReview}
                      disabled={saving}
                      className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-2 disabled:opacity-50"
                    >
                      <Sparkles className="w-4 h-4 text-blue-400" />
                      {saving ? "Saving..." : "Commit Vetting Decision"}
                    </button>
                  </div>
                </div>
              )}

              {/* TAB: PROFILE */}
              {activeTab === "PROFILE" && (
                <div className="bg-white/80 border border-slate-200 rounded-2xl p-6 space-y-5">
                  <h3 className="text-sm font-semibold text-slate-900">Public Profile & Story Builder</h3>
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center">
                      {editPhotoUrl ? (
                        <img src={editPhotoUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="w-8 h-8 text-slate-400" />
                      )}
                    </div>
                    <div>
                      <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                      <button
                        type="button"
                        onClick={() => photoInputRef.current?.click()}
                        disabled={uploadingPhoto}
                        className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl flex items-center gap-2"
                      >
                        {uploadingPhoto ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                        Upload Profile Photo
                      </button>
                      <p className="text-[10px] text-slate-500 mt-1.5">Stored on Cloudinary · Flag badge auto from country</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Country</label>
                      <input value={editCountry} onChange={(e) => setEditCountry(e.target.value)} className="w-full text-xs p-3 border border-slate-200 rounded-xl" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Organization</label>
                      <input value={editOrgName} onChange={(e) => setEditOrgName(e.target.value)} className="w-full text-xs p-3 border border-slate-200 rounded-xl" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Years of Service</label>
                      <input type="number" value={editYears} onChange={(e) => setEditYears(e.target.value)} className="w-full text-xs p-3 border border-slate-200 rounded-xl" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Calling Quote</label>
                      <input value={editCalling} onChange={(e) => setEditCalling(e.target.value)} className="w-full text-xs p-3 border border-slate-200 rounded-xl" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Full Biography</label>
                    <textarea rows={5} value={editBio} onChange={(e) => setEditBio(e.target.value)} className="w-full text-xs p-3 border border-slate-200 rounded-xl" />
                  </div>
                  <button
                    type="button"
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Save Public Profile
                  </button>
                </div>
              )}

              {/* TAB: PORTFOLIO */}
              {activeTab === "PORTFOLIO" && (
                <div className="space-y-5">
                  <form onSubmit={handleAddProject} className="bg-white/80 border border-slate-200 rounded-2xl p-6 space-y-4">
                    <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                      <Plus className="w-4 h-4 text-indigo-600" /> Add Past Mission to Portfolio
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input required placeholder="Mission title" value={projTitle} onChange={(e) => setProjTitle(e.target.value)} className="text-xs p-3 border border-slate-200 rounded-xl" />
                      <input required placeholder="Location" value={projLoc} onChange={(e) => setProjLoc(e.target.value)} className="text-xs p-3 border border-slate-200 rounded-xl" />
                      <input required type="number" placeholder="Year" value={projYear} onChange={(e) => setProjYear(e.target.value)} className="text-xs p-3 border border-slate-200 rounded-xl" />
                      <input required type="number" placeholder="People impacted" value={projImpact} onChange={(e) => setProjImpact(e.target.value)} className="text-xs p-3 border border-slate-200 rounded-xl" />
                    </div>
                    <textarea required rows={3} placeholder="What was accomplished..." value={projDesc} onChange={(e) => setProjDesc(e.target.value)} className="w-full text-xs p-3 border border-slate-200 rounded-xl" />
                    <div>
                      <input ref={galleryInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleGalleryUpload} />
                      <button type="button" onClick={() => galleryInputRef.current?.click()} className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold flex items-center gap-2">
                        {uploadingGallery ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ImageIcon className="w-3.5 h-3.5" />}
                        Upload Gallery Photos ({projGallery.length})
                      </button>
                      {projGallery.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {projGallery.map((u) => (
                            <img key={u} src={u} alt="" className="w-16 h-16 object-cover rounded-lg border border-slate-200" />
                          ))}
                        </div>
                      )}
                    </div>
                    <button type="submit" disabled={addingProject} className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold">
                      {addingProject ? "Publishing..." : "Publish Past Mission"}
                    </button>
                  </form>

                  <div className="bg-white/80 border border-slate-200 rounded-2xl p-6 space-y-3">
                    <h3 className="text-sm font-semibold text-slate-900">Published Portfolio ({pastProjects.length})</h3>
                    {pastProjects.length === 0 ? (
                      <p className="text-xs text-slate-500 py-6 text-center border border-dashed border-slate-200 rounded-xl">No past missions yet.</p>
                    ) : (
                      pastProjects.map((p) => (
                        <div key={p.id} className="p-4 border border-slate-200 rounded-xl flex justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2 text-xs font-semibold text-slate-900">
                              <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-200 text-[10px]">{p.year_completed}</span>
                              {p.title}
                            </div>
                            <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                              <MapPin className="w-3 h-3" /> {p.location} · {p.people_impacted.toLocaleString()} lives
                            </p>
                          </div>
                          <button type="button" onClick={() => handleDeleteProject(p.id)} className="text-slate-400 hover:text-red-600 p-2">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* TAB: CREATE MISSION */}
              {activeTab === "MISSION" && (
                <form onSubmit={handleCreateMission} className="bg-white/80 border border-slate-200 rounded-2xl p-6 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">Create Mission Campaign</h3>
                      <p className="text-xs text-slate-500 mt-1">
                        Head of Operations: <strong>{selectedApp.full_name}</strong>
                        {selectedApp.verification_status !== "APPROVED" && (
                          <span className="text-amber-700"> · Must be APPROVED to deploy</span>
                        )}
                      </p>
                    </div>
                    <FlagBadge country={missionCountry || selectedApp.country} />
                  </div>
                  <input required placeholder="Mission title" value={missionTitle} onChange={(e) => setMissionTitle(e.target.value)} className="w-full text-xs p-3 border border-slate-200 rounded-xl" />
                  <textarea required rows={2} placeholder="Short public description" value={missionDesc} onChange={(e) => setMissionDesc(e.target.value)} className="w-full text-xs p-3 border border-slate-200 rounded-xl" />
                  <textarea rows={3} placeholder="Problem / Need / Calamity statement" value={missionProblem} onChange={(e) => setMissionProblem(e.target.value)} className="w-full text-xs p-3 border border-slate-200 rounded-xl" />
                  <textarea rows={3} placeholder="Mission objectives (one per line)" value={missionObjectives} onChange={(e) => setMissionObjectives(e.target.value)} className="w-full text-xs p-3 border border-slate-200 rounded-xl" />
                  <textarea rows={3} placeholder="Proposed process / implementation steps" value={missionProcess} onChange={(e) => setMissionProcess(e.target.value)} className="w-full text-xs p-3 border border-slate-200 rounded-xl" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input placeholder="Map location / address" value={missionMap} onChange={(e) => setMissionMap(e.target.value)} className="text-xs p-3 border border-slate-200 rounded-xl" />
                    <input required placeholder="Target country" value={missionCountry} onChange={(e) => setMissionCountry(e.target.value)} className="text-xs p-3 border border-slate-200 rounded-xl" />
                    <input placeholder="Beneficiary group" value={missionBeneficiaries} onChange={(e) => setMissionBeneficiaries(e.target.value)} className="text-xs p-3 border border-slate-200 rounded-xl" />
                    <input placeholder="Expected duration" value={missionDuration} onChange={(e) => setMissionDuration(e.target.value)} className="text-xs p-3 border border-slate-200 rounded-xl" />
                    <input required type="number" placeholder="Funding goal USD" value={missionGoal} onChange={(e) => setMissionGoal(e.target.value)} className="text-xs p-3 border border-slate-200 rounded-xl" />
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Budget line items, receipts, and live progress are managed after creation in <strong>01.02 Projects</strong>.
                  </p>
                  <button
                    type="submit"
                    disabled={creatingMission || selectedApp.verification_status !== "APPROVED"}
                    className="w-full py-3.5 bg-indigo-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider disabled:opacity-50"
                  >
                    {creatingMission ? "Creating..." : "Deploy Mission Campaign"}
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}