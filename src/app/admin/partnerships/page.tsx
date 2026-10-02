"use client";

import React, { useEffect, useState } from "react";
import {
  Building2,
  Users,
  Briefcase,
  ShieldCheck,
  Plus,
  Trash2,
  ExternalLink,
  Save,
  Loader2,
  RefreshCw,
  Search,
  CheckCircle2,
  MapPin,
  Calendar,
  Award,
  CreditCard,
  UserCheck,
  Image as ImageIcon,
  BookOpen,
  Sparkles
} from "lucide-react";
import { apiRequest } from "@/lib/api";

interface Operator {
  id: number;
  user_id: number;
  full_name: string;
  email?: string | null;
  shepherd_id: string | null;
  country: string;
  organization_name: string | null;
  profile_photo_url: string | null;
  biography: string | null;
  years_of_service: number;
  calling_description: string | null;
  verification_status: string;
  affiliation_path: string;
  risk_tier: string;
  badge_identity_verified: boolean;
  badge_org_verified: boolean;
  badge_payout_verified: boolean;
  badge_mission_verified: boolean;
}

interface PublicProfileData {
  id: number;
  shepherd_id: string;
  full_name: string;
  country: string;
  organization_name: string;
  profile_photo_url: string;
  biography: string;
  years_of_service: number;
  calling_description: string;
  verification_status: string;
  affiliation_path: string;
  risk_tier: string;
  badge_identity_verified: boolean;
  badge_org_verified: boolean;
  badge_payout_verified: boolean;
  badge_mission_verified: boolean;
  active_missions: any[];
  past_projects: {
    id: number;
    title: string;
    description: string;
    location: string;
    year_completed: number;
    people_impacted: number;
    media_urls: string;
  }[];
  total_funds_deployed: number;
  total_people_served: number;
}

const COUNTRY_FLAGS: Record<string, string> = {
  Kenya: "🇰🇪",
  Philippines: "🇵🇭",
  Nigeria: "🇳🇬",
  Pakistan: "🇵🇰",
};

export default function PartnershipsWorkstation() {
  const [activeTab, setActiveTab] = useState<"crm" | "portfolio" | "badges">("crm");
  const [operators, setOperators] = useState<Operator[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProfileId, setSelectedProfileId] = useState<number | null>(null);
  const [activePublicData, setActivePublicData] = useState<PublicProfileData | null>(null);
  const [search, setSearch] = useState("");

  // Edit Profile Form State
  const [editCountry, setCountry] = useState("");
  const [editOrgName, setOrgName] = useState("");
  const [editPhotoUrl, setPhotoUrl] = useState("");
  const [editBio, setBio] = useState("");
  const [editYears, setYears] = useState("0");
  const [editCalling, setCalling] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSavedMsg, setProfileSavedMsg] = useState(false);

  // New Project Form State
  const [projectTitle, setProjectTitle] = useState("");
  const [projectDesc, setProjectDesc] = useState("");
  const [projectLoc, setProjectLoc] = useState("");
  const [projectYear, setProjectYear] = useState(new Date().getFullYear().toString());
  const [projectImpact, setProjectImpact] = useState("500");
  const [projectMedia, setProjectMedia] = useState("");
  const [addingProject, setAddingProject] = useState(false);

  // Badges Editing State
  const [badgeIdentity, setBadgeIdentity] = useState(false);
  const [badgeOrg, setBadgeOrg] = useState(false);
  const [badgePayout, setBadgePayout] = useState(false);
  const [badgeMission, setBadgeMission] = useState(false);
  const [savingBadges, setSavingBadges] = useState(false);

  const loadOperators = async () => {
    setLoading(true);
    try {
      const data = await apiRequest("/api/verification/applications");
      setOperators(data || []);
      if (data && data.length > 0 && !selectedProfileId) {
        setSelectedProfileId(data[0].id);
      }
    } catch {
      setOperators([]);
    } finally {
      setLoading(false);
    }
  };

  const loadPublicData = async (id: number) => {
    try {
      const pData = await apiRequest(`/api/verification/public/${id}`);
      setActivePublicData(pData);
      setCountry(pData.country || "");
      setOrgName(pData.organization_name || "");
      setPhotoUrl(pData.profile_photo_url || "");
      setBio(pData.biography || "");
      setYears(String(pData.years_of_service || 0));
      setCalling(pData.calling_description || "");
      setBadgeIdentity(pData.badge_identity_verified);
      setBadgeOrg(pData.badge_org_verified);
      setBadgePayout(pData.badge_payout_verified);
      setBadgeMission(pData.badge_mission_verified);
    } catch {
      setActivePublicData(null);
    }
  };

  useEffect(() => {
    loadOperators();
  }, []);

  useEffect(() => {
    if (selectedProfileId) {
      loadPublicData(selectedProfileId);
    }
  }, [selectedProfileId]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProfileId) return;
    setSavingProfile(true);
    try {
      await apiRequest(`/api/verification/profile/${selectedProfileId}`, {
        method: "PUT",
        body: JSON.stringify({
          country: editCountry,
          organization_name: editOrgName,
          profile_photo_url: editPhotoUrl,
          biography: editBio,
          years_of_service: parseInt(editYears, 10) || 0,
          calling_description: editCalling,
        }),
      });
      setProfileSavedMsg(true);
      setTimeout(() => setProfileSavedMsg(false), 3000);
      await loadPublicData(selectedProfileId);
      await loadOperators();
    } catch (err: any) {
      alert(err.message || "Failed to save profile changes");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProfileId) return;
    setAddingProject(true);
    try {
      await apiRequest("/api/verification/projects", {
        method: "POST",
        body: JSON.stringify({
          missionary_id: selectedProfileId,
          title: projectTitle,
          description: projectDesc,
          location: projectLoc,
          year_completed: parseInt(projectYear, 10) || new Date().getFullYear(),
          people_impacted: parseInt(projectImpact, 10) || 0,
          media_urls: projectMedia,
        }),
      });
      setProjectTitle("");
      setProjectDesc("");
      setProjectLoc("");
      setProjectMedia("");
      await loadPublicData(selectedProfileId);
    } catch (err: any) {
      alert(err.message || "Failed to add project");
    } finally {
      setAddingProject(false);
    }
  };

  const handleDeleteProject = async (projectId: number) => {
    if (!confirm("Are you sure you want to remove this project from the portfolio?")) return;
    try {
      await apiRequest(`/api/verification/projects/${projectId}`, {
        method: "DELETE",
      });
      if (selectedProfileId) {
        await loadPublicData(selectedProfileId);
      }
    } catch (err: any) {
      alert(err.message || "Failed to delete project");
    }
  };

  const handleSaveBadges = async () => {
    if (!selectedProfileId) return;
    setSavingBadges(true);
    try {
      const op = operators.find((o) => o.id === selectedProfileId);
      await apiRequest(`/api/verification/admin/review/${selectedProfileId}`, {
        method: "PUT",
        body: JSON.stringify({
          status: op?.verification_status || "APPROVED",
          badge_identity_verified: badgeIdentity,
          badge_org_verified: badgeOrg,
          badge_payout_verified: badgePayout,
          badge_mission_verified: badgeMission,
        }),
      });
      await loadPublicData(selectedProfileId);
      await loadOperators();
    } catch (err: any) {
      alert(err.message || "Failed to update badges");
    } finally {
      setSavingBadges(false);
    }
  };

  const filteredOperators = operators.filter((o) => {
    const term = search.toLowerCase();
    return (
      (o.full_name && o.full_name.toLowerCase().includes(term)) ||
      o.country.toLowerCase().includes(term) ||
      (o.organization_name && o.organization_name.toLowerCase().includes(term)) ||
      (o.shepherd_id && o.shepherd_id.toLowerCase().includes(term)) ||
      (o.email && o.email.toLowerCase().includes(term))
    );
  });

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/80 backdrop-blur-xl p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">
              Module 01.08
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wider">
              Network CRM & Impact Registry
            </span>
          </div>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
            Partnerships & Field Operations Workstation
          </h1>
        </div>

        <button
          onClick={loadOperators}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold uppercase tracking-wider transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Sync Registry
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200/80 pb-2">
        {[
          { id: "crm", label: "Partner Organizations & Operators", icon: Building2 },
          { id: "portfolio", label: "Impact & Portfolio Story Editor", icon: Briefcase },
          { id: "badges", label: "Co-Lab & Trust Badges Manager", icon: Award },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                  : "bg-white/80 hover:bg-white text-slate-600 border border-slate-200/80"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: PARTNER CRM */}
      {activeTab === "crm" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/80 p-4 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by shepherd ID, org name, or country..."
                className="w-full pl-10 pr-4 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="text-xs font-semibold text-slate-500">
              Showing <span className="text-slate-900 font-bold">{filteredOperators.length}</span> partners
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredOperators.map((op) => {
              const flag = COUNTRY_FLAGS[op.country] || "🌍";
              const isSelected = selectedProfileId === op.id;

              return (
                <div
                  key={op.id}
                  onClick={() => setSelectedProfileId(op.id)}
                  className={`p-6 rounded-2xl border transition-all cursor-pointer bg-white/80 backdrop-blur-xl relative overflow-hidden ${
                    isSelected
                      ? "border-blue-600 ring-2 ring-blue-500/20 shadow-lg"
                      : "border-slate-200/80 hover:border-slate-300 hover:shadow-md"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                        {op.profile_photo_url ? (
                          <img src={op.profile_photo_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <Users className="w-6 h-6 text-slate-400" />
                        )}
                      </div>
                      <div>
                        <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-widest block">
                          {op.shepherd_id || "SHEPHERD ID PENDING"}
                        </span>
                        <h3 className="text-sm font-semibold text-slate-900 line-clamp-1">
                          {op.full_name || "Unnamed Operator"}
                        </h3>
                        <p className="text-[11px] text-slate-500 font-medium line-clamp-1">
                          {op.organization_name || "Independent Field Operator"}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm">{flag}</span>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 mb-4 font-normal leading-relaxed">
                    {op.biography || op.calling_description || "No biography updated."}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {op.badge_identity_verified && (
                      <span className="bg-emerald-50 text-emerald-700 text-[9px] uppercase font-bold px-2 py-0.5 rounded border border-emerald-200">
                        Identity
                      </span>
                    )}
                    {op.badge_org_verified && (
                      <span className="bg-blue-50 text-blue-700 text-[9px] uppercase font-bold px-2 py-0.5 rounded border border-blue-200">
                        Org Verified
                      </span>
                    )}
                    {op.badge_payout_verified && (
                      <span className="bg-purple-50 text-purple-700 text-[9px] uppercase font-bold px-2 py-0.5 rounded border border-purple-200">
                        Payout Rail
                      </span>
                    )}
                    {op.badge_mission_verified && (
                      <span className="bg-amber-50 text-amber-700 text-[9px] uppercase font-bold px-2 py-0.5 rounded border border-amber-200">
                        Mission
                      </span>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">{op.years_of_service} Yrs Service</span>
                    <a
                      href={`/missionaries/${op.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-blue-600 hover:text-blue-700 font-semibold inline-flex items-center gap-1"
                    >
                      View ID Card <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: PORTFOLIO & IMPACT STORY EDITOR */}
      {activeTab === "portfolio" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Operator Selector Sidebar */}
          <div className="lg:col-span-4 bg-white/80 backdrop-blur-xl p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider text-[11px] text-slate-500">
              Select Operator to Edit
            </h3>
            <div className="space-y-2">
              {operators.map((op) => (
                <button
                  key={op.id}
                  onClick={() => setSelectedProfileId(op.id)}
                  className={`w-full text-left p-3.5 rounded-xl border text-xs font-semibold transition-all flex items-center justify-between ${
                    selectedProfileId === op.id
                      ? "border-blue-600 bg-blue-50/80 text-blue-900 shadow-sm"
                      : "border-slate-200/80 bg-white hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  <div className="truncate">
                    <span className="block font-bold text-slate-900 truncate">
                      {op.full_name || "Unnamed Operator"}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {op.organization_name || "Independent"} • {op.country} • {op.shepherd_id || "ID Pending"}
                    </span>
                  </div>
                  <span className="text-sm shrink-0 ml-2">{COUNTRY_FLAGS[op.country] || "🌍"}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Form Area */}
          <div className="lg:col-span-8 space-y-8">
            {activePublicData ? (
              <>
                {/* Profile Story Editor Card */}
                <div className="bg-white/80 backdrop-blur-xl p-6 md:p-8 rounded-2xl border border-slate-200/80 shadow-sm space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div>
                      <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest block">
                        Story & Credentials Editor
                      </span>
                      <h2 className="text-xl font-bold text-slate-900">{activePublicData.full_name}</h2>
                      <p className="text-xs text-slate-500 font-medium mt-1">
                        Shepherd ID: <span className="font-mono text-slate-800">{activePublicData.shepherd_id || "Pending"}</span>
                        {" • "}
                        Active Missions: <span className="text-slate-800 font-semibold">{activePublicData.active_missions?.length || 0}</span>
                      </p>
                    </div>
                    {profileSavedMsg && (
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Saved to Public ID
                      </span>
                    )}
                  </div>

                  <form onSubmit={handleSaveProfile} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                          Organization / Covering Ministry
                        </label>
                        <input
                          type="text"
                          value={editOrgName}
                          onChange={(e) => setOrgName(e.target.value)}
                          className="w-full border border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-500"
                          placeholder="e.g. Living Water International"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                          Target Country
                        </label>
                        <input
                          type="text"
                          value={editCountry}
                          onChange={(e) => setCountry(e.target.value)}
                          className="w-full border border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                          Years of Field Service
                        </label>
                        <input
                          type="number"
                          value={editYears}
                          onChange={(e) => setYears(e.target.value)}
                          className="w-full border border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                          Profile Photo URL
                        </label>
                        <input
                          type="url"
                          value={editPhotoUrl}
                          onChange={(e) => setPhotoUrl(e.target.value)}
                          placeholder="https://..."
                          className="w-full border border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                        Calling Statement (Renders in Serif Quote Box)
                      </label>
                      <input
                        type="text"
                        value={editCalling}
                        onChange={(e) => setCalling(e.target.value)}
                        placeholder="e.g. Dedicated to drilling clean water wells and building local churches in East Africa."
                        className="w-full border border-slate-200 rounded-xl p-3 text-xs font-serif text-slate-900 focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                        Full Biography
                      </label>
                      <textarea
                        rows={4}
                        value={editBio}
                        onChange={(e) => setBio(e.target.value)}
                        className="w-full border border-slate-200 rounded-xl p-3 text-xs font-normal text-slate-900 focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={savingProfile}
                      className="bg-blue-600 text-white font-bold px-6 py-3 rounded-xl text-xs uppercase tracking-wider flex items-center gap-2 hover:bg-blue-700 transition-all disabled:opacity-50"
                    >
                      {savingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      Save Profile & Story
                    </button>
                  </form>
                </div>

                {/* Add Completed Project Form */}
                <div className="bg-white/80 backdrop-blur-xl p-6 md:p-8 rounded-2xl border border-slate-200/80 shadow-sm space-y-6">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
                    <Sparkles className="w-5 h-5 text-indigo-600" />
                    <div>
                      <h3 className="text-base font-bold text-slate-900">Add Completed Mission to Portfolio</h3>
                      <p className="text-xs text-slate-500">Renders on public profile with photos and impact counters</p>
                    </div>
                  </div>

                  <form onSubmit={handleAddProject} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                          Project Title
                        </label>
                        <input
                          type="text"
                          required
                          value={projectTitle}
                          onChange={(e) => setProjectTitle(e.target.value)}
                          placeholder="e.g. Turkana East Well #4"
                          className="w-full border border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                          Location
                        </label>
                        <input
                          type="text"
                          required
                          value={projectLoc}
                          onChange={(e) => setProjectLoc(e.target.value)}
                          placeholder="e.g. Turkana County, Kenya"
                          className="w-full border border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                          Year Completed
                        </label>
                        <input
                          type="number"
                          required
                          value={projectYear}
                          onChange={(e) => setProjectYear(e.target.value)}
                          className="w-full border border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                          People Impacted (Lives Served)
                        </label>
                        <input
                          type="number"
                          required
                          value={projectImpact}
                          onChange={(e) => setProjectImpact(e.target.value)}
                          className="w-full border border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                        Project Media URLs (Comma-separated Image Links)
                      </label>
                      <input
                        type="text"
                        value={projectMedia}
                        onChange={(e) => setProjectMedia(e.target.value)}
                        placeholder="https://images.unsplash.com/photo-1..., https://..."
                        className="w-full border border-slate-200 rounded-xl p-3 text-xs font-mono text-slate-900 focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                        Impact Description
                      </label>
                      <textarea
                        rows={3}
                        required
                        value={projectDesc}
                        onChange={(e) => setProjectDesc(e.target.value)}
                        placeholder="Describe the outcomes, local community reaction, and physical assets built..."
                        className="w-full border border-slate-200 rounded-xl p-3 text-xs font-normal text-slate-900 focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={addingProject}
                      className="bg-indigo-600 text-white font-bold px-6 py-3 rounded-xl text-xs uppercase tracking-wider flex items-center gap-2 hover:bg-indigo-700 transition-all disabled:opacity-50"
                    >
                      {addingProject ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                      Publish Project to Portfolio
                    </button>
                  </form>
                </div>

                {/* Existing Portfolio List */}
                <div className="bg-white/80 backdrop-blur-xl p-6 md:p-8 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
                  <h3 className="text-base font-bold text-slate-900">
                    Existing Portfolio ({activePublicData.past_projects.length} Published)
                  </h3>

                  {activePublicData.past_projects.length === 0 ? (
                    <p className="text-xs text-slate-500 py-6 text-center border border-dashed border-slate-200 rounded-xl">
                      No completed projects added yet.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {activePublicData.past_projects.map((p) => (
                        <div key={p.id} className="p-4 rounded-xl border border-slate-200 bg-white flex items-start justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-200">
                                {p.year_completed}
                              </span>
                              <span className="text-xs font-bold text-slate-900">{p.title}</span>
                              <span className="text-xs text-slate-500">• {p.location}</span>
                            </div>
                            <p className="text-xs text-slate-600 line-clamp-2">{p.description}</p>
                            <span className="text-[10px] font-bold text-emerald-600 mt-2 block">
                              {p.people_impacted.toLocaleString()} lives served
                            </span>
                          </div>

                          <button
                            onClick={() => handleDeleteProject(p.id)}
                            className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-all shrink-0"
                            title="Remove project"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="p-12 text-center text-slate-500 text-xs font-semibold bg-white/80 rounded-2xl border border-slate-200">
                Select an operator from the left sidebar to manage their portfolio and story.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: TRUST BADGES MANAGER */}
      {activeTab === "badges" && (
        <div className="bg-white/80 backdrop-blur-xl p-6 md:p-8 rounded-2xl border border-slate-200/80 shadow-sm space-y-6 max-w-3xl mx-auto">
          <div>
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest block mb-1">
              Public Credentials Control
            </span>
            <h2 className="text-xl font-bold text-slate-900">Co-Lab & Granular Badge Manager</h2>
            <p className="text-xs text-slate-500 mt-1">
              Select an operator and configure which of the 4 granular verification badges render on their public profile.
            </p>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
              Select Operator
            </label>
            <select
              value={selectedProfileId || ""}
              onChange={(e) => setSelectedProfileId(Number(e.target.value))}
              className="w-full border border-slate-200 rounded-xl p-3 text-xs font-semibold text-slate-900 bg-white"
            >
              {operators.map((op) => (
                <option key={op.id} value={op.id}>
                  {op.full_name || "Unnamed Operator"} — {op.organization_name || "Independent"} ({op.country} • {op.shepherd_id || "ID Pending"})
                </option>
              ))}
            </select>
          </div>

          {activePublicData && (
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
                <label className="flex items-center justify-between cursor-pointer">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-bold text-slate-900">Identity Verified Badge</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={badgeIdentity}
                    onChange={(e) => setBadgeIdentity(e.target.checked)}
                    className="accent-blue-600 w-4 h-4 rounded"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-bold text-slate-900">Org Verified Badge</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={badgeOrg}
                    onChange={(e) => setBadgeOrg(e.target.checked)}
                    className="accent-blue-600 w-4 h-4 rounded"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-purple-600" />
                    <span className="text-xs font-bold text-slate-900">Payout Rail Verified Badge</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={badgePayout}
                    onChange={(e) => setBadgePayout(e.target.checked)}
                    className="accent-blue-600 w-4 h-4 rounded"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-600" />
                    <span className="text-xs font-bold text-slate-900">Mission Verified Badge</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={badgeMission}
                    onChange={(e) => setBadgeMission(e.target.checked)}
                    className="accent-blue-600 w-4 h-4 rounded"
                  />
                </label>
              </div>

              <button
                onClick={handleSaveBadges}
                disabled={savingBadges}
                className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-blue-700 transition-all disabled:opacity-50"
              >
                {savingBadges ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Badge Configuration
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}