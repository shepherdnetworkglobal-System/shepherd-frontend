"use client";

import React, { useEffect, useState } from "react";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
  User,
  Building2,
  CreditCard,
  Globe,
  Search,
  Lock,
  Award,
  Clock,
  ExternalLink,
  RefreshCw,
  Eye,
  ChevronRight,
  Sparkles,
  AlertCircle
} from "lucide-react";
import { apiRequest } from "@/lib/api";

interface Application {
  id: number;
  user_id: number;
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
  verification_status: "DRAFT" | "SUBMITTED" | "UNDER_REVIEW" | "INFO_REQUESTED" | "APPROVED" | "REJECTED";
  admin_notes: string | null;
  last_reviewed_at: string | null;
  created_at: string;
}

export default function TrustWorkstation() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");

  // Review Form State
  const [shepherdId, setShepherdId] = useState("");
  const [status, setStatus] = useState<string>("UNDER_REVIEW");
  const [adminNotes, setAdminNotes] = useState("");
  const [affiliationPath, setAffiliationPath] = useState<"ORG_AFFILIATED" | "INDEPENDENT">("INDEPENDENT");
  const [riskTier, setRiskTier] = useState<"LOW" | "STANDARD" | "ELEVATED" | "RESTRICTED">("STANDARD");

  // Layers
  const [identityLayer, setIdentityLayer] = useState("PENDING");
  const [addressLayer, setAddressLayer] = useState("NOT_STARTED");
  const [affiliationLayer, setAffiliationLayer] = useState("NOT_STARTED");
  const [orgLayer, setOrgLayer] = useState("NOT_STARTED");
  const [payoutLayer, setPayoutLayer] = useState("NOT_STARTED");
  const [missionLayer, setMissionLayer] = useState("NOT_STARTED");
  const [historyLayer, setHistoryLayer] = useState("NOT_STARTED");

  // Badges
  const [badgeIdentity, setBadgeIdentity] = useState(false);
  const [badgeOrg, setBadgeOrg] = useState(false);
  const [badgePayout, setBadgePayout] = useState(false);
  const [badgeMission, setBadgeMission] = useState(false);

  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const data = (await apiRequest("/api/verification/applications")) as Application[];
      setApplications(data);
      if (data.length > 0 && !selectedApp) {
        selectApplication(data[0]);
      }
    } catch (err) {
      console.error("Failed to load verification applications:", err);
    } finally {
      setLoading(false);
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

    setBadgeIdentity(app.badge_identity_verified || false);
    setBadgeOrg(app.badge_org_verified || false);
    setBadgePayout(app.badge_payout_verified || false);
    setBadgeMission(app.badge_mission_verified || false);
    setSaveMessage(null);
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
          badge_mission_verified: badgeMission
        })
      })) as Application;

      setSaveMessage("Verification inspection decision updated successfully.");
      setApplications(prev => prev.map(a => (a.id === updated.id ? updated : a)));
      setSelectedApp(updated);
    } catch (err: any) {
      setSaveMessage(err.message || "Failed to update review.");
    } finally {
      setSaving(false);
    }
  };

  const filteredApps = applications.filter(app => {
    const matchesSearch =
      (app.shepherd_id || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (app.organization_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.country.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "ALL" || app.verification_status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 max-w-[1600px] mx-auto h-full flex flex-col space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
              Module 01.05
            </span>
            <span className="text-xs font-medium text-slate-500">• 10-Layer Risk Architecture</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-blue-600" />
            Trust & Verification Workstation
          </h1>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchApplications}
            className="px-3.5 py-2 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 flex items-center gap-1.5 shadow-sm transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh Queue
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 items-start">
        {/* Left Column: Applicant Queue (4 Cols) */}
        <div className="lg:col-span-4 bg-white/80 backdrop-blur-xl border border-slate-200/80 rounded-2xl p-4 shadow-sm flex flex-col space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
              <User className="w-4 h-4 text-slate-500" />
              Verification Queue ({filteredApps.length})
            </h2>
          </div>

          {/* Filters */}
          <div className="flex flex-col space-y-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search Shepherd ID, org, country..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
              />
            </div>

            <div className="flex space-x-1 overflow-x-auto pb-1 text-xs">
              {["ALL", "SUBMITTED", "UNDER_REVIEW", "APPROVED", "REJECTED"].map(st => (
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

          {/* Queue List */}
          <div className="space-y-2 max-h-[650px] overflow-y-auto pr-1">
            {loading ? (
              <div className="text-center py-12 text-slate-400 text-xs font-medium">Loading queue...</div>
            ) : filteredApps.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs font-medium">No applicants found.</div>
            ) : (
              filteredApps.map(app => {
                const isSelected = selectedApp?.id === app.id;
                return (
                  <div
                    key={app.id}
                    onClick={() => selectApplication(app)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col space-y-1.5 ${
                      isSelected
                        ? "bg-blue-50/70 border-blue-300 ring-1 ring-blue-300 shadow-sm"
                        : "bg-white border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">
                        {app.shepherd_id || `ID #${app.id}`}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                          app.verification_status === "APPROVED"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : app.verification_status === "REJECTED"
                            ? "bg-rose-50 text-rose-700 border-rose-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}
                      >
                        {app.verification_status}
                      </span>
                    </div>

                    <div className="text-xs font-medium text-slate-600 flex items-center justify-between">
                      <span>{app.organization_name || "Independent Missionary"}</span>
                      <span className="text-slate-400 text-[11px]">{app.country}</span>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        {app.affiliation_path || "INDEPENDENT"}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        Tier: {app.risk_tier || "STANDARD"}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Multi-Layer Inspection Workspace (8 Cols) */}
        {selectedApp ? (
          <div className="lg:col-span-8 space-y-6">
            {/* Header Details */}
            <div className="bg-white/80 backdrop-blur-xl border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-slate-900">
                      {selectedApp.shepherd_id || `Unassigned Applicant #${selectedApp.id}`}
                    </h2>
                    <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                      User #{selectedApp.user_id}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-slate-500 mt-0.5">
                    Country: <span className="font-semibold text-slate-700">{selectedApp.country}</span> •
                    Submitted: {new Date(selectedApp.created_at).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="text-right">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Assigned Shepherd ID
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. JOSEPH-KENYA-1042"
                      value={shepherdId}
                      onChange={e => setShepherdId(e.target.value)}
                      className="px-2.5 py-1 text-xs font-bold font-mono bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                    />
                  </div>
                </div>
              </div>

              {/* Status & Risk Settings Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                <div>
                  <label className="text-[11px] font-semibold text-slate-500 mb-1 block">
                    Affiliation Path
                  </label>
                  <select
                    value={affiliationPath}
                    onChange={e => setAffiliationPath(e.target.value as any)}
                    className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800"
                  >
                    <option value="ORG_AFFILIATED">Organization-Affiliated</option>
                    <option value="INDEPENDENT">Independent Missionary</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-500 mb-1 block">
                    Risk Classification Tier
                  </label>
                  <select
                    value={riskTier}
                    onChange={e => setRiskTier(e.target.value as any)}
                    className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800"
                  >
                    <option value="LOW">Low Risk</option>
                    <option value="STANDARD">Standard Risk</option>
                    <option value="ELEVATED">Elevated Risk</option>
                    <option value="RESTRICTED">Restricted Risk</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-500 mb-1 block">
                    Overall Decision
                  </label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value)}
                    className="w-full text-xs font-bold bg-slate-900 text-white rounded-lg p-2 focus:outline-none"
                  >
                    <option value="DRAFT">DRAFT</option>
                    <option value="SUBMITTED">SUBMITTED</option>
                    <option value="UNDER_REVIEW">UNDER_REVIEW</option>
                    <option value="INFO_REQUESTED">INFO_REQUESTED</option>
                    <option value="APPROVED">APPROVED</option>
                    <option value="REJECTED">REJECTED</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Document Vault */}
            <div className="bg-white/80 backdrop-blur-xl border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-3">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-blue-600" />
                Document Evidence Vault
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "Government ID", url: selectedApp.government_id_url },
                  { label: "Liveness / Selfie", url: selectedApp.selfie_url },
                  { label: "Proof of Address", url: selectedApp.proof_of_address_url },
                  { label: "Org Certificate", url: selectedApp.organization_cert_url }
                ].map((doc, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 border border-slate-200/70 rounded-xl flex flex-col justify-between">
                    <span className="text-[11px] font-semibold text-slate-600">{doc.label}</span>
                    {doc.url ? (
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:underline"
                      >
                        <Eye className="w-3.5 h-3.5" /> View File
                      </a>
                    ) : (
                      <span className="mt-2 text-[10px] font-medium text-slate-400">Not Uploaded</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Layered Inspection Grid (7 Layers) */}
            <div className="bg-white/80 backdrop-blur-xl border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                7-Layer Verification Pipeline Statuses
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {[
                  { title: "1. Identity Layer", state: identityLayer, setState: setIdentityLayer },
                  { title: "2. Address / Location Layer", state: addressLayer, setState: setAddressLayer },
                  { title: "3. Affiliation Layer", state: affiliationLayer, setState: setAffiliationLayer },
                  { title: "4. Organization Layer", state: orgLayer, setState: setOrgLayer },
                  { title: "5. Payout Layer", state: payoutLayer, setState: setPayoutLayer },
                  { title: "6. Mission Layer", state: missionLayer, setState: setMissionLayer },
                  { title: "7. History & Reporting Layer", state: historyLayer, setState: setHistoryLayer }
                ].map((layer, idx) => (
                  <div key={idx} className="p-2.5 bg-slate-50 border border-slate-200/60 rounded-xl flex items-center justify-between">
                    <span className="font-semibold text-slate-700">{layer.title}</span>
                    <select
                      value={layer.state}
                      onChange={e => layer.setState(e.target.value)}
                      className="text-[11px] font-semibold bg-white border border-slate-200 rounded px-2 py-1 text-slate-800"
                    >
                      <option value="NOT_STARTED">NOT_STARTED</option>
                      <option value="PENDING">PENDING</option>
                      <option value="APPROVED">APPROVED</option>
                      <option value="INFO_REQUESTED">INFO_REQUESTED</option>
                      <option value="ESCALATED">ESCALATED</option>
                      <option value="REJECTED">REJECTED</option>
                      <option value="SUSPENDED">SUSPENDED</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>

            {/* Public Badges Controls */}
            <div className="bg-white/80 backdrop-blur-xl border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-3">
              <div>
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-500" />
                  Granular Public Badges
                </h3>
                <p className="text-xs font-medium text-slate-500 mt-0.5">
                  Enable individual badges for donor transparency. Do not use an ambiguous single badge.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "Identity Verified", state: badgeIdentity, setter: setBadgeIdentity },
                  { label: "Org Verified", state: badgeOrg, setter: setBadgeOrg },
                  { label: "Payout Verified", state: badgePayout, setter: setBadgePayout },
                  { label: "Mission Verified", state: badgeMission, setter: setBadgeMission }
                ].map((b, idx) => (
                  <label
                    key={idx}
                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      b.state
                        ? "bg-emerald-50/80 border-emerald-300 text-emerald-900"
                        : "bg-slate-50 border-slate-200 text-slate-600"
                    }`}
                  >
                    <span className="text-xs font-semibold">{b.label}</span>
                    <input
                      type="checkbox"
                      checked={b.state}
                      onChange={e => b.setter(e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                    />
                  </label>
                ))}
              </div>
            </div>

            {/* Notes & Actions */}
            <div className="bg-white/80 backdrop-blur-xl border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4">
              <label className="text-xs font-extrabold uppercase tracking-wider text-slate-400 block">
                Structured Review Exceptions & Audit Notes
              </label>
              <textarea
                rows={3}
                placeholder="Log verification exceptions, reference call notes, or reasons for information request..."
                value={adminNotes}
                onChange={e => setAdminNotes(e.target.value)}
                className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
              />

              {saveMessage && (
                <div className="p-3 bg-blue-50 border border-blue-200 text-blue-800 text-xs font-medium rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  {saveMessage}
                </div>
              )}

              <div className="flex justify-end">
                <button
                  onClick={handleSaveReview}
                  disabled={saving}
                  className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 disabled:opacity-50 transition-all flex items-center gap-2 shadow-sm"
                >
                  <Sparkles className="w-4 h-4 text-blue-400" />
                  {saving ? "Saving Review..." : "Commit Verification Decision"}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-8 bg-white/80 backdrop-blur-xl border border-slate-200/80 rounded-2xl p-12 text-center text-slate-400 text-xs font-medium">
            Select an applicant from the queue to open the verification inspection workstation.
          </div>
        )}
      </div>
    </div>
  );
}