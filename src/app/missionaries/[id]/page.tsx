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
      <div className="min-h-screen bg-gray-50/50">
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50/50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-6 py-20 text-center">
          <h2 className="text-2xl font-bold text-gray-900">Missionary Not Found</h2>
          <Link href="/missions" className="text-blue-600 text-sm font-semibold mt-4 inline-block">
            Browse Missions
          </Link>
        </div>
      </div>
    );
  }

  const flag = COUNTRY_FLAGS[data.country] || "🌍";

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Navbar />

      {/* Hero Banner */}
      <section className="relative bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-20 w-96 h-96 bg-blue-500 rounded-full blur-[150px]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-16 lg:py-20">
          <Link
            href="/missions"
            className="inline-flex items-center gap-1.5 text-sm text-blue-300 hover:text-white font-medium mb-8 transition"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Missions
          </Link>

          <div className="flex flex-col lg:flex-row items-start gap-8">
            {/* Profile Photo */}
            <div className="shrink-0">
              <div className="w-36 h-36 lg:w-44 lg:h-44 rounded-2xl overflow-hidden border-4 border-white/20 shadow-2xl">
                {data.profile_photo_url ? (
                  <img
                    src={data.profile_photo_url}
                    alt={data.full_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-blue-800 flex items-center justify-center">
                    <Users className="w-16 h-16 text-blue-400" />
                  </div>
                )}
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{flag}</span>
                <span className="text-sm font-semibold text-blue-300 uppercase tracking-wider">
                  {data.country}
                </span>
                <span className="bg-emerald-500/20 text-emerald-300 text-xs font-bold px-2.5 py-1 rounded-full border border-emerald-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Verified Missionary
                </span>
              </div>

              <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight mb-2">
                {data.full_name}
              </h1>

              <p className="text-blue-300 font-medium mb-1">
                {data.organization_name}
              </p>

              <p className="text-sm text-blue-200/70 mb-6">
                Shepherd ID: {data.shepherd_id} • {data.years_of_service} Years of Service
              </p>

              {data.calling_description && (
                <p className="text-blue-100/80 italic text-sm leading-relaxed max-w-2xl">
                  &ldquo;{data.calling_description}&rdquo;
                </p>
              )}

              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-4 mt-8">
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
                  <DollarSign className="w-4 h-4 text-emerald-400 mb-1" />
                  <span className="text-xl font-extrabold block">${data.total_funds_deployed.toLocaleString()}</span>
                  <span className="text-[11px] text-blue-300/60">Funds Deployed</span>
                </div>
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
                  <Users className="w-4 h-4 text-purple-400 mb-1" />
                  <span className="text-xl font-extrabold block">{data.total_people_served.toLocaleString()}</span>
                  <span className="text-[11px] text-blue-300/60">Lives Impacted</span>
                </div>
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
                  <Briefcase className="w-4 h-4 text-amber-400 mb-1" />
                  <span className="text-xl font-extrabold block">{data.past_projects.length}</span>
                  <span className="text-[11px] text-blue-300/60">Completed Projects</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12 space-y-12">
        {/* Biography */}
        {data.biography && (
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-extrabold text-gray-900">Biography</h2>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-8">
              <p className="text-gray-700 leading-relaxed text-base">{data.biography}</p>
            </div>
          </section>
        )}

        {/* Active Missions */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-extrabold text-gray-900">Active Missions</h2>
          </div>

          {data.active_missions.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center text-gray-500 text-sm">
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

        {/* Past Projects Portfolio */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-extrabold text-gray-900">Project Portfolio</h2>
            <span className="text-sm text-gray-400 font-medium ml-2">
              {data.past_projects.length} completed projects
            </span>
          </div>

          <div className="space-y-4">
            {data.past_projects.map((project) => {
              const mediaList = project.media_urls ? project.media_urls.split(",") : [];
              const isExpanded = expandedProject === project.id;

              return (
                <div
                  key={project.id}
                  className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedProject(isExpanded ? null : project.id)}
                    className="w-full text-left p-6 flex items-start justify-between gap-4 hover:bg-gray-50/50 transition"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="bg-purple-50 text-purple-700 text-xs font-bold px-2.5 py-1 rounded-full border border-purple-200">
                          {project.year_completed}
                        </span>
                        {project.location && (
                          <span className="flex items-center gap-1 text-xs text-gray-500">
                            <MapPin className="w-3 h-3" /> {project.location}
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">{project.title}</h3>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                        {project.description}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <span className="text-lg font-extrabold text-purple-600 block">
                        {project.people_impacted.toLocaleString()}
                      </span>
                      <span className="text-[11px] text-gray-400">People Served</span>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-6 pb-6 border-t border-gray-100 pt-4 space-y-4">
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {project.description}
                      </p>

                      {mediaList.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {mediaList.map((url, i) => (
                            <div
                              key={i}
                              className="aspect-video rounded-xl overflow-hidden bg-gray-100 border border-gray-200"
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