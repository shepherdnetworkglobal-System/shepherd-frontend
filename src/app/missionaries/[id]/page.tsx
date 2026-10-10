"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ShieldCheck, MapPin, Calendar, Heart, Users, DollarSign, ArrowLeft,
  CheckCircle2, Globe2, Loader2, Briefcase, BookOpen, Award, Building2,
  CreditCard, UserCheck, Activity, ExternalLink, FileText, Clock
} from "lucide-react";
import Navbar from "@/components/Navbar";
import MissionCard from "@/components/MissionCard";
import { apiRequest } from "@/lib/api";
import "flag-icons/css/flag-icons.min.css";

interface MissionaryData {
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
  affiliation_path?: string;
  badge_identity_verified?: boolean;
  badge_org_verified?: boolean;
  badge_payout_verified?: boolean;
  badge_mission_verified?: boolean;
  active_missions: any[];
  past_projects: any[];
  total_funds_deployed: number;
  total_people_served: number;
}

const ISO_COUNTRY_CODES: Record<string, string> = {
  Kenya: "ke",
  Philippines: "ph",
  Nigeria: "ng",
  Pakistan: "pk",
  Uganda: "ug",
  India: "in",
  Brazil: "br",
  Tanzania: "tz",
  Ghana: "gh",
};

export default function MissionaryProfilePage() {
  const params = useParams();
  const profileId = Number(params.id);
  const [data, setData] = useState<MissionaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "past">("overview");

  useEffect(() => {
    setLoading(true);
    setErrorMsg(null);
    apiRequest(`/api/verification/public/${profileId}`)
      .then((res) => {
        setData(res);
      })
      .catch((err: any) => {
        console.error("Public missionary load failed:", err);
        setData(null);
        setErrorMsg(err?.message || "Failed to load missionary profile");
      })
      .finally(() => setLoading(false));
  }, [profileId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F4EF] text-[#1A1612]">
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-8 h-8 text-[#064E3B] animate-spin" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-[#F7F4EF] text-[#1A1612]">
        <Navbar />
        <div className="max-w-4xl mx-auto px-6 py-20 text-center">
          <h2 className="font-serif text-2xl font-semibold text-[#1A1612]">Operator Dossier Not Found</h2>
          {errorMsg && (
            <p className="text-sm text-[#7A736A] font-medium mt-3 max-w-lg mx-auto">{errorMsg}</p>
          )}
          <Link href="/missions" className="text-xs uppercase tracking-[0.14em] font-semibold text-[#064E3B] hover:text-[#047857] mt-6 inline-block transition-colors">
            Return to Active Deployments
          </Link>
        </div>
      </div>
    );
  }

  const isoCode = ISO_COUNTRY_CODES[data.country] || "un";
  const allMedia = data.past_projects
    .filter(p => p.media_urls)
    .flatMap(p => p.media_urls.split(","))
    .filter(url => url.trim().length > 0);

  return (
    <div className="min-h-screen bg-[#F7F4EF] text-[#3D3832] selection:bg-[#064E3B]/10 pb-24 overflow-x-hidden">
      <Navbar />
      
      {/* V7 Editorial Ambient Orbs */}
      <div className="fixed top-0 left-[10%] w-[500px] h-[500px] glow-taupe rounded-full pointer-events-none -translate-y-1/2 -z-10 opacity-70" />
      <div className="fixed top-1/4 right-[-5%] w-[600px] h-[600px] glow-emerald rounded-full pointer-events-none -z-10 opacity-40" />

      {/* Top Mobile Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4 relative z-10">
        <Link href="/missions" className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.16em] text-[#7A736A] hover:text-[#1A1612] font-semibold transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> <span>Back to Active Deployments</span>
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row gap-8 lg:gap-12 items-start relative z-10">
        
        {/* LEFT COLUMN: Identity Sidebar (Fixed Width) */}
        <div className="w-full lg:w-[320px] shrink-0 space-y-6">
          
          {/* Square Profile Photo */}
          <div className="w-full aspect-square rounded-[2rem] overflow-hidden glass bg-white/70 border border-[rgba(26,22,18,0.08)] shadow-sm relative group p-2">
            <div className="w-full h-full rounded-3xl overflow-hidden bg-[#EFEBE4]">
              {data.profile_photo_url ? (
                <img src={data.profile_photo_url} alt={data.full_name} className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-700" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <UserCheck className="w-16 h-16 text-[#C4A35A]/50" />
                </div>
              )}
            </div>
            {/* Verification Badge Overlay */}
            {data.verification_status === "APPROVED" && (
              <div className="absolute top-4 left-4 bg-[#064E3B]/90 backdrop-blur-md text-white rounded-full p-2 border border-white/20 shadow-lg" title="Approved Operator">
                <ShieldCheck className="w-5 h-5" />
              </div>
            )}
          </div>

          {/* Identity Info */}
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-[0.16em] font-semibold text-[#7A736A] block">Lead Operator</span>
            <h1 className="font-serif text-3xl font-semibold text-[#1A1612] tracking-tight leading-tight">{data.full_name}</h1>
          </div>

          {/* Quick Stats */}
          <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-[#3D3832]">
            <div className="flex items-center gap-1.5 glass px-3 py-1.5 rounded-full border border-[rgba(26,22,18,0.08)]">
              <Users className="w-3.5 h-3.5 text-[#064E3B]" />
              <span className="font-semibold text-[#1A1612]">{data.total_people_served.toLocaleString()}</span> served
            </div>
            <div className="flex items-center gap-1.5 glass px-3 py-1.5 rounded-full border border-[rgba(26,22,18,0.08)]">
              <DollarSign className="w-3.5 h-3.5 text-[#C4A35A]" />
              <span className="font-semibold text-[#1A1612]">${data.total_funds_deployed.toLocaleString()}</span> deployed
            </div>
          </div>

          <hr className="border-[rgba(26,22,18,0.06)]" />

          {/* Meta Information */}
          <ul className="space-y-3 text-xs text-[#3D3832] font-semibold">
            <li className="flex items-center gap-2.5">
              <Building2 className="w-4 h-4 text-[#7A736A] shrink-0" />
              <span className="truncate">{data.organization_name || "Independent"}</span>
            </li>
            <li className="flex items-center gap-2.5">
              <span className={`fi fi-${isoCode} w-4 h-4 text-center rounded-sm shrink-0 drop-shadow-sm`} />
              <span>{data.country}</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-[#7A736A] shrink-0" />
              <span>{data.years_of_service} Years of Service</span>
            </li>
            <li className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-[#7A736A] shrink-0" />
              <span className="text-[10px] uppercase tracking-[0.16em] bg-[#EFEBE4]/50 px-2 py-1 rounded border border-[rgba(26,22,18,0.08)]">
                {data.shepherd_id}
              </span>
            </li>
          </ul>

          <hr className="border-[rgba(26,22,18,0.06)]" />

          {/* Highlights / Badges Section */}
          <div>
            <h3 className="text-[10px] uppercase tracking-[0.16em] font-semibold text-[#7A736A] mb-4">Verified Credentials</h3>
            <div className="space-y-3">
              {data.badge_identity_verified && (
                <div className="flex items-center gap-3 text-xs font-semibold text-[#1A1612]">
                  <div className="w-7 h-7 rounded-full bg-white border border-[rgba(26,22,18,0.08)] shadow-sm flex items-center justify-center">
                    <UserCheck className="w-3.5 h-3.5 text-[#064E3B]" />
                  </div>
                  Government Identity Verified
                </div>
              )}
              {data.badge_org_verified && (
                <div className="flex items-center gap-3 text-xs font-semibold text-[#1A1612]">
                  <div className="w-7 h-7 rounded-full bg-white border border-[rgba(26,22,18,0.08)] shadow-sm flex items-center justify-center">
                    <Building2 className="w-3.5 h-3.5 text-[#064E3B]" />
                  </div>
                  Organizational Covering Confirmed
                </div>
              )}
              {data.badge_payout_verified && (
                <div className="flex items-center gap-3 text-xs font-semibold text-[#1A1612]">
                  <div className="w-7 h-7 rounded-full bg-white border border-[rgba(26,22,18,0.08)] shadow-sm flex items-center justify-center">
                    <CreditCard className="w-3.5 h-3.5 text-[#C4A35A]" />
                  </div>
                  Stellar Payout Rail Connected
                </div>
              )}
              {data.badge_mission_verified && (
                <div className="flex items-center gap-3 text-xs font-semibold text-[#1A1612]">
                  <div className="w-7 h-7 rounded-full bg-white border border-[rgba(26,22,18,0.08)] shadow-sm flex items-center justify-center">
                    <Award className="w-3.5 h-3.5 text-[#C4A35A]" />
                  </div>
                  Historical Impact Audited
                </div>
              )}
            </div>
          </div>

          {/* Biography moved to bottom of sidebar */}
          {data.biography && (
            <div className="pt-6 border-t border-[rgba(26,22,18,0.06)]">
              <h3 className="text-[10px] uppercase tracking-[0.16em] font-semibold text-[#7A736A] mb-3">Operator Background</h3>
              <p className="text-sm text-[#3D3832]/90 leading-relaxed whitespace-pre-wrap">{data.biography}</p>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Stretching Content Area */}
        <div className="flex-1 min-w-0 w-full space-y-8">
          
          {/* Navigation Tabs (Glass Pill) */}
          <div className="flex">
            <div className="inline-flex items-center gap-2 p-1.5 rounded-2xl glass bg-white/60 border border-[rgba(26,22,18,0.08)] shadow-sm overflow-x-auto scrollbar-none max-w-full">
              {[
                { id: "overview", label: "Active Dossiers", icon: BookOpen, count: data.active_missions.length },
                { id: "past", label: "Past Missions", icon: Briefcase, count: data.past_projects.length },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] uppercase tracking-[0.16em] font-semibold transition-all duration-300 whitespace-nowrap ${
                      isActive
                        ? "bg-[#1A1612] text-white shadow-md"
                        : "text-[#7A736A] hover:text-[#1A1612] hover:bg-white/50"
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? "text-[#C4A35A]" : ""}`} />
                    {tab.label}
                    <span className={`px-1.5 py-0.5 rounded-md ${isActive ? "bg-white/20 text-white" : "bg-[#EFEBE4] text-[#1A1612]"}`}>
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* TAB CONTENT: Overview (Calling + Active Dossiers) */}
          {activeTab === "overview" && (
            <div className="space-y-8 animate-in fade-in">
              
              {data.calling_description && (
                <div className="glass bg-white/70 border border-[rgba(26,22,18,0.08)] rounded-3xl p-8 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-[#064E3B] to-[#C4A35A]" />
                  <span className="text-[10px] uppercase tracking-[0.16em] font-semibold text-[#7A736A] block mb-3">Operator Calling</span>
                  <p className="font-serif text-xl sm:text-2xl text-[#1A1612] italic leading-relaxed">
                    "{data.calling_description}"
                  </p>
                </div>
              )}

              {/* Active Missions Full-Width Dossier Feed */}
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-[rgba(26,22,18,0.06)] pb-3">
                  <h3 className="text-[10px] uppercase tracking-[0.16em] font-semibold text-[#1A1612]">Pinned Deployments</h3>
                </div>
                {data.active_missions.length === 0 ? (
                  <div className="py-16 border border-dashed border-[rgba(26,22,18,0.15)] rounded-3xl text-center glass bg-white/40">
                    <Activity className="w-8 h-8 text-[#7A736A]/50 mx-auto mb-3" />
                    <p className="text-sm text-[#7A736A] font-semibold uppercase tracking-[0.16em]">No active dossiers deployed.</p>
                  </div>
                ) : (
                  <div className="flex flex-col space-y-8">
                    {/* Maps over the active missions, injecting the Dossier Cards at FULL WIDTH */}
                    {data.active_missions.map((m) => (
                      <MissionCard 
                        key={m.id} 
                        mission={{ ...m, missionary: data }} 
                      />
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB CONTENT: Past Missions */}
          {activeTab === "past" && (
            <div className="animate-in fade-in space-y-8">
              
              {/* Highlight Gallery */}
              {allMedia.length > 0 && (
                <div className="glass bg-white/70 border border-[rgba(26,22,18,0.08)] rounded-3xl p-6 sm:p-8 shadow-sm">
                  <span className="text-[10px] uppercase tracking-[0.16em] font-semibold text-[#7A736A] block mb-4">Historical Field Gallery</span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {allMedia.slice(0, 8).map((url, i) => (
                      <div key={i} className="aspect-square bg-[#EFEBE4] rounded-2xl overflow-hidden border border-[rgba(26,22,18,0.08)] shadow-sm group">
                        <img src={url.trim()} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Field highlight" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-[10px] uppercase tracking-[0.16em] font-semibold text-[#1A1612] border-b border-[rgba(26,22,18,0.06)] pb-3 mb-6">Archived Logs</h3>
                {data.past_projects.length === 0 ? (
                  <div className="py-16 border border-dashed border-[rgba(26,22,18,0.15)] rounded-3xl text-center glass bg-white/40">
                    <Briefcase className="w-8 h-8 text-[#7A736A]/50 mx-auto mb-3" />
                    <p className="text-sm text-[#7A736A] font-semibold uppercase tracking-[0.16em]">Past mission timeline is empty.</p>
                  </div>
                ) : (
                  <div className="relative border-l-2 border-[rgba(26,22,18,0.08)] ml-4 space-y-10 pb-4">
                    {data.past_projects.map((project) => (
                      <div key={project.id} className="relative pl-8 group">
                        {/* Timeline Dot */}
                        <div className="absolute -left-[9px] top-1.5 w-4 h-4 bg-[#F7F4EF] rounded-full border-[4px] border-[#C4A35A] transition-colors" />
                        
                        <div className="glass bg-white/70 border border-[rgba(26,22,18,0.08)] rounded-3xl p-6 sm:p-8 shadow-sm group-hover:border-[#064E3B]/20 transition-all duration-300">
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
                            <div>
                              <span className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[#7A736A] mb-1.5 block">Completed {project.year_completed}</span>
                              <h3 className="font-serif text-xl font-semibold text-[#1A1612] leading-tight">{project.title}</h3>
                            </div>
                            <span className="bg-[#064E3B]/10 text-[#064E3B] text-[9px] uppercase tracking-[0.16em] font-semibold px-3 py-1.5 rounded-full border border-[#064E3B]/20 shrink-0">
                              {project.people_impacted.toLocaleString()} Served
                            </span>
                          </div>
                          
                          <p className="text-sm text-[#3D3832]/90 leading-relaxed font-normal mb-6 whitespace-pre-wrap">
                            {project.description}
                          </p>

                          {project.media_urls && project.media_urls.trim().length > 0 && (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-6 border-t border-[rgba(26,22,18,0.04)]">
                              {project.media_urls.split(",").map((url: string, i: number) => (
                                <div key={i} className="aspect-[4/3] bg-[#EFEBE4] rounded-2xl overflow-hidden border border-[rgba(26,22,18,0.08)] shadow-sm">
                                  <img src={url.trim()} alt="Past archive" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}