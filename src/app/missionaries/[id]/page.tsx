"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ShieldCheck, MapPin, Calendar, Heart, Users, DollarSign, ArrowLeft,
  CheckCircle2, Globe2, Loader2, Briefcase, BookOpen, Award, Building2,
  CreditCard, UserCheck, LayoutGrid, Activity, ExternalLink, Clock
} from "lucide-react";
import Navbar from "@/components/Navbar";
import MissionCard from "@/components/MissionCard";
import { apiRequest } from "@/lib/api";

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
  risk_tier?: string;
  badge_identity_verified?: boolean;
  badge_org_verified?: boolean;
  badge_payout_verified?: boolean;
  badge_mission_verified?: boolean;
  active_missions: any[];
  past_projects: any[];
  total_funds_deployed: number;
  total_people_served: number;
}

const COUNTRY_FLAGS: Record<string, string> = {
  Kenya: "🇰🇪", Philippines: "🇵🇭", Nigeria: "🇳🇬", Pakistan: "🇵🇰",
};

export default function MissionaryProfilePage() {
  const params = useParams();
  const profileId = Number(params.id);
  const [data, setData] = useState<MissionaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "missions" | "portfolio">("overview");

  useEffect(() => {
    apiRequest(`/api/verification/public/${profileId}`)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [profileId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <Navbar />
        <div className="max-w-7xl mx-auto px-6 py-20 text-center">
          <h2 className="text-xl font-bold text-slate-900">Missionary Profile Not Found</h2>
          <Link href="/missions" className="text-xs uppercase tracking-wider font-bold text-blue-600 hover:text-blue-700 mt-4 inline-block">
            Browse Active Missions
          </Link>
        </div>
      </div>
    );
  }

  const flag = COUNTRY_FLAGS[data.country] || "🌍";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-blue-200/50 pb-20">
      <Navbar />
      
      {/* Background glow elements */}
      <div className="absolute top-24 left-[15%] w-[500px] h-[500px] glow-blue rounded-full pointer-events-none -z-10" />
      <div className="absolute top-[40%] right-[10%] w-[600px] h-[600px] glow-emerald rounded-full pointer-events-none -z-10" />

      {/* Top Mobile Navigation */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 pt-6 pb-4">
        <Link href="/missions" className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-slate-500 hover:text-slate-900 font-bold transition-colors">
          <ArrowLeft className="w-4 h-4" /> <span>Back to Active Deployments</span>
        </Link>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 flex flex-col md:flex-row gap-8 lg:gap-12 items-start">
        
        {/* LEFT COLUMN: Identity Sidebar (GitHub Style) */}
        <div className="w-full md:w-[296px] shrink-0 space-y-6">
          
          {/* Profile Photo */}
          <div className="w-full aspect-square rounded-full overflow-hidden border border-slate-200/80 shadow-xl shadow-slate-200/50 bg-white p-1.5 z-10 relative">
            <div className="w-full h-full rounded-full overflow-hidden bg-slate-100">
              {data.profile_photo_url ? (
                <img src={data.profile_photo_url} alt={data.full_name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <UserCheck className="w-20 h-20 text-slate-300" />
                </div>
              )}
            </div>
            {/* Verification Badge Overlay */}
            {data.verification_status === "APPROVED" && (
              <div className="absolute bottom-4 right-4 bg-emerald-500 text-white rounded-full p-2 border-4 border-white shadow-sm" title="Approved Operator">
                <ShieldCheck className="w-6 h-6" />
              </div>
            )}
          </div>

          {/* Identity Info */}
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight leading-tight">{data.full_name}</h1>
            <h2 className="text-lg font-medium text-slate-500">{data.shepherd_id}</h2>
          </div>

          <button className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-900 text-sm font-semibold py-2 rounded-xl transition-all">
            Share Profile
          </button>

          {data.biography && (
            <p className="text-sm text-slate-700 font-medium leading-relaxed">{data.biography}</p>
          )}

          {/* Quick Stats (Like Followers/Following) */}
          <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-slate-600">
            <div className="flex items-center gap-1.5 hover:text-blue-600 transition-colors cursor-default">
              <Users className="w-4 h-4 text-slate-400" />
              <span className="font-bold text-slate-900">{data.total_people_served.toLocaleString()}</span> lives served
            </div>
            <div className="flex items-center gap-1.5 hover:text-emerald-600 transition-colors cursor-default">
              <DollarSign className="w-4 h-4 text-slate-400" />
              <span className="font-bold text-slate-900">{data.total_funds_deployed.toLocaleString()}</span> deployed
            </div>
          </div>

          <hr className="border-slate-200" />

          {/* Meta Information */}
          <ul className="space-y-3 text-sm text-slate-700 font-medium">
            <li className="flex items-center gap-2.5">
              <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="truncate">{data.organization_name || "Independent"}</span>
            </li>
            <li className="flex items-center gap-2.5">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
              <span>{data.country} {flag}</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-slate-400 shrink-0" />
              <span>{data.years_of_service} Years of Service</span>
            </li>
          </ul>

          <hr className="border-slate-200" />

          {/* Highlights / Badges Section */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-3">Verified Credentials</h3>
            <div className="space-y-2.5">
              {data.badge_identity_verified && (
                <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-700">
                  <div className="w-6 h-6 rounded bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                    <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                  Government Identity Verified
                </div>
              )}
              {data.badge_org_verified && (
                <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-700">
                  <div className="w-6 h-6 rounded bg-blue-50 border border-blue-200 flex items-center justify-center">
                    <Building2 className="w-3.5 h-3.5 text-blue-600" />
                  </div>
                  Organizational Covering Confirmed
                </div>
              )}
              {data.badge_payout_verified && (
                <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-700">
                  <div className="w-6 h-6 rounded bg-purple-50 border border-purple-200 flex items-center justify-center">
                    <CreditCard className="w-3.5 h-3.5 text-purple-600" />
                  </div>
                  Stellar Payout Rail Connected
                </div>
              )}
              {data.badge_mission_verified && (
                <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-700">
                  <div className="w-6 h-6 rounded bg-amber-50 border border-amber-200 flex items-center justify-center">
                    <Award className="w-3.5 h-3.5 text-amber-600" />
                  </div>
                  Historical Impact Audited
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Main Content Area */}
        <div className="flex-1 min-w-0 w-full">
          {/* Navigation Tabs */}
          <div className="sticky top-0 z-20 bg-slate-50/90 backdrop-blur-md border-b border-slate-200 mb-6">
            <nav className="flex space-x-6 overflow-x-auto">
              {[
                { id: "overview", label: "Overview", icon: BookOpen },
                { id: "missions", label: "Active Missions", icon: LayoutGrid, count: data.active_missions.length },
                { id: "portfolio", label: "Project Activity", icon: Activity, count: data.past_projects.length },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 py-3 border-b-2 text-sm font-semibold whitespace-nowrap transition-colors ${
                      isActive ? "border-blue-600 text-slate-900" : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                    {tab.count !== undefined && (
                      <span className="bg-slate-200 text-slate-700 py-0.5 px-2 rounded-full text-[10px] ml-1">
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* TAB CONTENT: Overview */}
          {activeTab === "overview" && (
            <div className="space-y-8 animate-in fade-in">
              
              {data.calling_description && (
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Operator Calling</p>
                  <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
                    <p className="text-sm sm:text-base text-slate-700 italic font-serif leading-relaxed">
                      "{data.calling_description}"
                    </p>
                  </div>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pinned Deployments</p>
                  <button onClick={() => setActiveTab("missions")} className="text-xs font-semibold text-blue-600 hover:underline">View all</button>
                </div>
                {data.active_missions.length === 0 ? (
                  <div className="p-8 border border-dashed border-slate-300 rounded-2xl text-center text-sm text-slate-500 font-medium">
                    No active missions currently deployed.
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {data.active_missions.slice(0, 4).map((m) => (
                      <MissionCard key={m.id} id={m.id} title={m.title} targetCountry={m.target_country} goalAmount={m.goal_amount_usd} raisedAmount={m.raised_amount_usd} status={m.status} />
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB CONTENT: Active Missions */}
          {activeTab === "missions" && (
            <div className="animate-in fade-in">
              {data.active_missions.length === 0 ? (
                <div className="p-12 border border-dashed border-slate-300 rounded-2xl text-center text-sm text-slate-500 font-medium">
                  No active missions found.
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-6">
                  {data.active_missions.map((m) => (
                    <MissionCard key={m.id} id={m.id} title={m.title} targetCountry={m.target_country} goalAmount={m.goal_amount_usd} raisedAmount={m.raised_amount_usd} status={m.status} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB CONTENT: Portfolio Timeline */}
          {activeTab === "portfolio" && (
            <div className="animate-in fade-in">
              {data.past_projects.length === 0 ? (
                <div className="p-12 border border-dashed border-slate-300 rounded-2xl text-center text-sm text-slate-500 font-medium">
                  Portfolio activity timeline is currently empty.
                </div>
              ) : (
                <div className="relative border-l border-slate-200 ml-3 space-y-8 pb-4">
                  {data.past_projects.map((project) => (
                    <div key={project.id} className="relative pl-6 sm:pl-8 group">
                      {/* Timeline Dot */}
                      <div className="absolute -left-1.5 top-1.5 w-3 h-3 bg-blue-500 rounded-full ring-4 ring-slate-50 group-hover:ring-blue-100 transition-all" />
                      
                      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm group-hover:shadow-md transition-shadow">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-3">
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 mb-1 block">Completed in {project.year_completed}</span>
                            <h3 className="text-base font-bold text-slate-900 leading-tight">{project.title}</h3>
                          </div>
                          <span className="bg-indigo-50 text-indigo-700 text-[10px] uppercase font-bold px-2.5 py-1 rounded border border-indigo-200 self-start shrink-0">
                            {project.people_impacted.toLocaleString()} Served
                          </span>
                        </div>
                        
                        <p className="text-sm text-slate-600 leading-relaxed font-medium mb-4">
                          {project.description}
                        </p>

                        {project.media_urls && project.media_urls.trim().length > 0 && (
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {project.media_urls.split(",").map((url: string, i: number) => (
                              <div key={i} className="aspect-video bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
                                <img src={url.trim()} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
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
          )}

        </div>
      </div>
    </div>
  );
}