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
      <div className="min-h-screen bg-[#0C0E0D] text-[#E6DED3]">
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-8 h-8 text-[#8FA68E] animate-spin" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-[#0C0E0D] text-[#E6DED3]">
        <Navbar />
        <div className="max-w-7xl mx-auto px-6 py-20 text-center">
          <h2 className="text-xl font-light text-[#E6DED3]">Operator Credentials Unresolved</h2>
          <Link href="/missions" className="text-xs uppercase tracking-wider font-semibold text-[#8FA68E] mt-4 inline-block">
            Browse Active Missions
          </Link>
        </div>
      </div>
    );
  }

  const flag = COUNTRY_FLAGS[data.country] || "🌍";

  return (
    <div className="min-h-screen bg-[#0C0E0D] text-[#E6DED3] selection:bg-[#8FA68E]/30 selection:text-white">
      <Navbar />

      {/* Atmospheric Glowing Backdrops */}
      <div className="absolute top-24 left-[15%] w-[500px] h-[500px] glow-sage rounded-full pointer-events-none -z-10" />
      <div className="absolute top-[40%] right-[10%] w-[600px] h-[600px] glow-clay rounded-full pointer-events-none -z-10" />

      {/* Magazine Hero Block */}
      <section className="relative border-b border-white/[0.05] py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <Link
            href="/missions"
            className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-[#9A9690] hover:text-[#E6DED3] font-semibold mb-10 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> <span>Back to Active Deployments</span>
          </Link>

          <div className="flex flex-col lg:flex-row items-start gap-10">
            {/* Operator Portrait Frame */}
            <div className="shrink-0 mx-auto lg:mx-0">
              <div className="relative w-40 h-40 lg:w-48 lg:h-48 rounded-2xl overflow-hidden bg-white/[0.01] border border-white/[0.1] p-1.5 shadow-[0_16px_40px_rgba(0,0,0,0.4)]">
                <div className="w-full h-full rounded-xl overflow-hidden relative">
                  {data.profile_photo_url ? (
                    <img
                      src={data.profile_photo_url}
                      alt={data.full_name}
                      className="w-full h-full object-cover filter brightness-[0.95] contrast-[1.05]"
                    />
                  ) : (
                    <div className="w-full h-full bg-white/[0.02] flex items-center justify-center">
                      <Users className="w-14 h-14 text-[#9A9690]" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Core Credentials metadata */}
            <div className="flex-1 space-y-5 text-center lg:text-left">
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.07]">
                  <span className="text-sm select-none">{flag}</span>
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-[#9A9690]">
                    {data.country} Base
                  </span>
                </div>
                <span className="bg-[#8FA68E]/10 text-[#8FA68E] text-[9px] uppercase tracking-wider font-bold px-3 py-1 rounded-md border border-[#8FA68E]/20 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Checked Identity
                </span>
              </div>

              <div className="space-y-1">
                <h1 className="text-3xl lg:text-4xl font-light text-[#E6DED3] tracking-tight leading-tight">
                  {data.full_name}
                </h1>
                <p className="text-sm uppercase tracking-wider text-[#8FA68E] font-medium">
                  {data.organization_name}
                </p>
              </div>

              <p className="text-xs text-[#9A9690] uppercase tracking-widest font-mono">
                System Hash: <span className="text-[#E6DED3]">{data.shepherd_id}</span> • {data.years_of_service} Active Years
              </p>

              {data.calling_description && (
                <blockquote className="text-sm sm:text-base text-[#9A9690] italic font-serif leading-relaxed max-w-2xl border-l border-white/[0.08] pl-4 lg:pl-5 text-left mx-auto lg:mx-0">
                  &ldquo;{data.calling_description}&rdquo;
                </blockquote>
              )}

              {/* Cryptographic Key Performance metrics */}
              <div className="grid grid-cols-3 gap-4 pt-6 max-w-2xl">
                <div className="bg-white/[0.015] border border-white/[0.06] rounded-xl p-4 text-left backdrop-blur-md">
                  <DollarSign className="w-4 h-4 text-[#8FA68E] mb-2" />
                  <span className="text-lg sm:text-xl font-semibold text-[#E6DED3] block num-tabular">${data.total_funds_deployed.toLocaleString()}</span>
                  <span className="text-[9px] uppercase tracking-wider text-[#9A9690] font-medium block mt-1">Routed channels</span>
                </div>
                <div className="bg-white/[0.015] border border-white/[0.06] rounded-xl p-4 text-left backdrop-blur-md">
                  <Users className="w-4 h-4 text-[#C08A6A] mb-2" />
                  <span className="text-lg sm:text-xl font-semibold text-[#E6DED3] block num-tabular">{data.total_people_served.toLocaleString()}</span>
                  <span className="text-[9px] uppercase tracking-wider text-[#9A9690] font-medium block mt-1">Direct impacts</span>
                </div>
                <div className="bg-white/[0.015] border border-white/[0.06] rounded-xl p-4 text-left backdrop-blur-md">
                  <Briefcase className="w-4 h-4 text-[#8FA68E] mb-2" />
                  <span className="text-lg sm:text-xl font-semibold text-[#E6DED3] block num-tabular">{data.past_projects.length}</span>
                  <span className="text-[9px] uppercase tracking-wider text-[#9A9690] font-medium block mt-1">Audited stations</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Narrative Blocks */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 space-y-16">
        {/* Biography Block */}
        {data.biography && (
          <section className="space-y-6">
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-[#8FA68E]" />
              </div>
              <h2 className="text-lg font-semibold text-[#E6DED3]">Narrative & Biography</h2>
            </div>
            <div className="rounded-2xl bg-white/[0.015] border border-white/[0.07] p-8 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.03)] backdrop-blur-xl">
              <p className="text-sm sm:text-base text-[#9A9690] font-light leading-relaxed whitespace-pre-wrap">{data.biography}</p>
            </div>
          </section>
        )}

        {/* Active Deployments */}
        <section className="space-y-6">
          <div className="flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-center">
              <Heart className="w-4 h-4 text-[#C08A6A]" />
            </div>
            <h2 className="text-lg font-semibold text-[#E6DED3]">Active Deployments</h2>
          </div>

          {data.active_missions.length === 0 ? (
            <div className="rounded-2xl bg-white/[0.01] border border-dashed border-white/[0.08] py-12 text-center text-[#9A9690] text-xs font-light">
              No active deployments assigned currently.
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

        {/* Historical Archive Accordions */}
        <section className="space-y-6">
          <div className="flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-center">
              <Briefcase className="w-4 h-4 text-[#8FA68E]" />
            </div>
            <div className="flex items-baseline gap-2">
              <h2 className="text-lg font-semibold text-[#E6DED3]">Historical Projects</h2>
              <span className="text-[10px] uppercase tracking-wider text-[#9A9690] font-semibold">
                ({data.past_projects.length} Verified Records)
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
                  className="rounded-2xl bg-white/[0.015] border border-white/[0.07] overflow-hidden transition-all duration-300"
                >
                  <button
                    onClick={() => setExpandedProject(isExpanded ? null : project.id)}
                    className="w-full text-left p-6 flex items-start justify-between gap-4 hover:bg-white/[0.03] transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2.5">
                        <span className="bg-[#8FA68E]/10 text-[#8FA68E] text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded border border-[#8FA68E]/20">
                          {project.year_completed} Completed
                        </span>
                        {project.location && (
                          <span className="flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold text-[#9A9690]">
                            <MapPin className="w-3 h-3 text-[#C08A6A]" /> {project.location}
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-semibold text-[#E6DED3] group-hover:text-white transition duration-200">{project.title}</h3>
                      <p className="text-xs text-[#9A9690] mt-1.5 line-clamp-2 font-light leading-relaxed">
                        {project.description}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <span className="text-base sm:text-lg font-semibold text-[#8FA68E] block num-tabular">
                        {project.people_impacted.toLocaleString()}
                      </span>
                      <span className="text-[9px] uppercase tracking-wider text-[#9A9690] font-medium block">Impacted</span>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-6 pb-6 border-t border-white/[0.05] pt-5 space-y-5 animate-in fade-in duration-200">
                      <p className="text-xs sm:text-sm text-[#9A9690] leading-relaxed font-light">
                        {project.description}
                      </p>

                      {mediaList.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
                          {mediaList.map((url, i) => (
                            <div
                              key={i}
                              className="aspect-video rounded-xl overflow-hidden bg-white/[0.01] border border-white/[0.07] relative"
                            >
                              <img
                                src={url.trim()}
                                alt={`${project.title} reference frame ${i + 1}`}
                                className="w-full h-full object-cover filter brightness-[0.9]"
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