"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ShieldCheck,
  MapPin,
  Calendar,
  Heart,
  Users,
  DollarSign,
  ArrowLeft,
  CheckCircle2,
  Globe2,
  Loader2,
  Play,
  Image as ImageIcon,
  Briefcase,
  BookOpen,
  ArrowRight,
  Award,
  Building2,
  CreditCard,
  UserCheck,
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
  active_missions: {
    id: number;
    title: string;
    goal_amount_usd: number;
    raised_amount_usd: number;
    status: string;
    target_country: string;
  }[];
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

export default function MissionaryProfilePage() {
  const params = useParams();
  const profileId = Number(params.id);
  const [data, setData] = useState<MissionaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedProject, setExpandedProject] = useState<number | null>(null);

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
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-blue-200/50">
      <Navbar />

      {/* Ambient glows */}
      <div className="absolute top-24 left-[15%] w-[500px] h-[500px] glow-blue rounded-full pointer-events-none -z-10" />
      <div className="absolute top-[40%] right-[10%] w-[600px] h-[600px] glow-emerald rounded-full pointer-events-none -z-10" />

      {/* Magazine Hero Block */}
      <section className="relative border-b border-slate-200/60 bg-white/60 backdrop-blur-sm py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <Link
            href="/missions"
            className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-slate-500 hover:text-slate-900 font-bold mb-10 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> <span>Back to Active Deployments</span>
          </Link>

          <div className="flex flex-col lg:flex-row items-start gap-10">
            {/* Portrait */}
            <div className="shrink-0 mx-auto lg:mx-0">
              <div className="relative w-40 h-40 lg:w-48 lg:h-48 rounded-2xl overflow-hidden bg-white border border-slate-200 p-1.5 shadow-xl shadow-slate-200/60">
                <div className="w-full h-full rounded-xl overflow-hidden relative bg-slate-100">
                  {data.profile_photo_url ? (
                    <img
                      src={data.profile_photo_url}
                      alt={data.full_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Users className="w-14 h-14 text-slate-400" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Credentials */}
            <div className="flex-1 space-y-5 text-center lg:text-left">
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
                {/* Country */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 border border-slate-200">
                  <span className="text-xs select-none">{flag}</span>
                  <span className="text-[10px] uppercase tracking-wider font-bold text-slate-600">
                    {data.country}
                  </span>
                </div>

                {/* Affiliation Path */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-[10px] uppercase tracking-wider font-bold text-slate-700">
                  {data.affiliation_path === "ORG_AFFILIATED" ? "Org-Affiliated" : "Independent Missionary"}
                </div>

                {/* 4 Granular Verification Badges */}
                {data.badge_identity_verified && (
                  <span className="bg-emerald-50 text-emerald-700 text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-md border border-emerald-200 flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5 text-emerald-600" /> Identity Verified
                  </span>
                )}

                {data.badge_org_verified && (
                  <span className="bg-blue-50 text-blue-700 text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-md border border-blue-200 flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-blue-600" /> Org Verified
                  </span>
                )}

                {data.badge_payout_verified && (
                  <span className="bg-purple-50 text-purple-700 text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-md border border-purple-200 flex items-center gap-1">
                    <CreditCard className="w-3.5 h-3.5 text-purple-600" /> Payout Verified
                  </span>
                )}

                {data.badge_mission_verified && (
                  <span className="bg-amber-50 text-amber-700 text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-md border border-amber-200 flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-amber-600" /> Mission Verified
                  </span>
                )}
              </div>

              <div className="space-y-1">
                <h1 className="text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                  {data.full_name}
                </h1>
                <p className="text-sm uppercase tracking-wider text-blue-600 font-bold">
                  {data.organization_name}
                </p>
              </div>

              <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">
                Shepherd ID: <span className="text-slate-800">{data.shepherd_id}</span> • {data.years_of_service} Years of Service
              </p>

              {data.calling_description && (
                <blockquote className="text-sm sm:text-base text-slate-600 italic font-serif leading-relaxed max-w-2xl border-l-2 border-blue-200 pl-4 lg:pl-5 text-left mx-auto lg:mx-0">
                  &ldquo;{data.calling_description}&rdquo;
                </blockquote>
              )}

              {/* KPI metrics */}
              <div className="grid grid-cols-3 gap-4 pt-6 max-w-2xl">
                <div className="bg-white border border-slate-200 rounded-xl p-4 text-left shadow-sm">
                  <DollarSign className="w-4 h-4 text-blue-600 mb-2" />
                  <span className="text-lg sm:text-xl font-extrabold text-slate-900 block num-tabular">${data.total_funds_deployed.toLocaleString()}</span>
                  <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold block mt-1">Funds Deployed</span>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-4 text-left shadow-sm">
                  <Users className="w-4 h-4 text-emerald-600 mb-2" />
                  <span className="text-lg sm:text-xl font-extrabold text-slate-900 block num-tabular">{data.total_people_served.toLocaleString()}</span>
                  <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold block mt-1">Lives Impacted</span>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-4 text-left shadow-sm">
                  <Briefcase className="w-4 h-4 text-indigo-600 mb-2" />
                  <span className="text-lg sm:text-xl font-extrabold text-slate-900 block num-tabular">{data.past_projects.length}</span>
                  <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold block mt-1">Projects Done</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 space-y-16">
        {/* Biography */}
        {data.biography && (
          <section className="space-y-6">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-xl font-extrabold text-slate-900">Biography</h2>
            </div>
            <div className="rounded-2xl bg-white border border-slate-200/80 p-8 shadow-sm">
              <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed whitespace-pre-wrap">{data.biography}</p>
            </div>
          </section>
        )}

        {/* Active Missions */}
        <section className="space-y-6">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
              <Heart className="w-5 h-5 text-emerald-600" />
            </div>
            <h2 className="text-xl font-extrabold text-slate-900">Active Missions</h2>
          </div>

          {data.active_missions.length === 0 ? (
            <div className="rounded-2xl bg-white border border-dashed border-slate-300 py-12 text-center text-slate-500 text-sm font-medium">
              No active missions at this time.
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.active_missions.map((m) => (
                <MissionCard
                  key={m.id}
                  id={m.id}
                  title={m.title}
                  targetCountry={m.target_country}
                  goalAmount={m.goal_amount_usd}
                  raisedAmount={m.raised_amount_usd}
                  status={m.status}
                />
              ))}
            </div>
          )}
        </section>

        {/* Project Portfolio */}
        <section className="space-y-6">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-indigo-600" />
            </div>
            <div className="flex items-baseline gap-2">
              <h2 className="text-xl font-extrabold text-slate-900">Project Portfolio</h2>
              <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                ({data.past_projects.length} completed)
              </span>
            </div>
          </div>

          <div className="space-y-3">
            {data.past_projects.map((project) => {
              const mediaList = project.media_urls ? project.media_urls.split(",") : [];
              const isExpanded = expandedProject === project.id;

              return (
                <div
                  key={project.id}
                  className="rounded-2xl bg-white border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <button
                    onClick={() => setExpandedProject(isExpanded ? null : project.id)}
                    className="w-full text-left p-6 flex items-start justify-between gap-4 hover:bg-slate-50/80 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2.5">
                        <span className="bg-indigo-50 text-indigo-700 text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-md border border-indigo-200">
                          {project.year_completed}
                        </span>
                        {project.location && (
                          <span className="flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold text-slate-500">
                            <MapPin className="w-3 h-3 text-blue-500" /> {project.location}
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-bold text-slate-900">{project.title}</h3>
                      <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 font-medium leading-relaxed">
                        {project.description}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <span className="text-base sm:text-lg font-extrabold text-indigo-600 block num-tabular">
                        {project.people_impacted.toLocaleString()}
                      </span>
                      <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold block">People Served</span>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-6 pb-6 border-t border-slate-100 pt-5 space-y-5">
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                        {project.description}
                      </p>

                      {mediaList.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
                          {mediaList.map((url, i) => (
                            <div
                              key={i}
                              className="aspect-video rounded-xl overflow-hidden bg-slate-100 border border-slate-200 relative"
                            >
                              <img
                                src={url.trim()}
                                alt={`${project.title} photo ${i + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}