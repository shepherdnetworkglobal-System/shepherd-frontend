"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Camera, TrendingUp, Users, ShieldCheck, Activity } from "lucide-react";
import "flag-icons/css/flag-icons.min.css";

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

export default function MissionCard(props: any) {
  // Normalize data whether passed as an object or individual flat props
  const m = props.mission || {
    id: props.id,
    title: props.title || "Untitled Mission",
    target_country: props.targetCountry || props.target_country || "Global",
    goal_amount_usd: props.goalAmount || props.goal_amount_usd || 0,
    raised_amount_usd: props.raisedAmount || props.raised_amount_usd || 0,
    status: props.status || "ACTIVE",
    description: props.description,
    cover_image: props.coverImage || props.cover_image,
    latest_update: props.latestUpdate || props.latest_update,
    missionary: props.missionary || (props.missionaryName ? { name: props.missionaryName, profile_photo_url: props.missionaryPhoto } : undefined),
    photos: props.coverImage || props.cover_image ? [{ id: 1, image_url: props.coverImage || props.cover_image }] : [],
    reports: props.latestUpdate || props.latest_update ? [{ title: "Latest Update", summary: props.latestUpdate || props.latest_update }] : [],
    checkpoints: []
  };

  const [photoIdx, setPhotoIdx] = useState(0);

  // Auto-advance photo carousel if multiple photos exist
  useEffect(() => {
    if (!m.photos || m.photos.length <= 1) return;
    const timer = setInterval(() => {
      setPhotoIdx((prev) => (prev + 1) % m.photos.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [m.photos]);

  const raised = Number(m.raised_amount_usd || 0);
  const goal = Number(m.goal_amount_usd || 0);
  const progress = goal > 0 ? Math.min((raised / goal) * 100, 100) : 0;
  const isoCode = ISO_COUNTRY_CODES[m.target_country] || "un";
  
  // Intelligence Extraction
  const latestReport = m.reports && m.reports.length > 0 ? m.reports[0] : null;
  const activeCheckpoint = m.checkpoints?.find((c: any) => c.status === "IN_PROGRESS") 
                        || m.checkpoints?.find((c: any) => c.status === "PENDING");
  const totalBeneficiaries = m.reports?.reduce((acc: number, r: any) => acc + (r.people_served_delta || 0), 0) || 0;

  return (
    <Link
      href={`/missions/${m.id}`}
      className="group block w-full rounded-[2rem] glass bg-white/60 border border-[rgba(26,22,18,0.08)] shadow-sm hover:shadow-xl hover:border-[#064E3B]/30 transition-all duration-500 overflow-hidden hover-lift"
    >
      <div className="flex flex-col lg:flex-row h-full">
        
        {/* LEFT COLUMN: Media Collage (30%) */}
        <div className="lg:w-[30%] relative h-64 lg:h-auto bg-[#1A1612] overflow-hidden shrink-0">
          {m.photos && m.photos.length > 0 ? (
            <>
              {m.photos.map((p: any, idx: number) => (
                <img
                  key={p.id || idx}
                  src={p.image_url || p.url}
                  alt={p.caption || m.title}
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                    idx === photoIdx ? "opacity-100 scale-105" : "opacity-0 scale-100"
                  }`}
                  style={{ transitionProperty: 'opacity, transform' }}
                />
              ))}
              {/* Carousel Indicators */}
              {m.photos.length > 1 && (
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 z-10">
                  {m.photos.map((_: any, idx: number) => (
                    <div key={idx} className={`h-1 rounded-full transition-all duration-500 ${idx === photoIdx ? "w-4 bg-white" : "w-1 bg-white/40"}`} />
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#EFEBE4]">
              <Camera className="w-8 h-8 text-[#C4A35A]/50 mb-2" />
              <span className="text-[9px] uppercase tracking-[0.16em] font-semibold text-[#C4A35A]">Media Pending</span>
            </div>
          )}

          {/* Operator Overlay */}
          <div className="absolute top-4 left-4 z-10">
            <div className="glass bg-[#1A1612]/70 backdrop-blur-md border border-white/10 rounded-full pr-4 p-1 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full overflow-hidden bg-[#EFEBE4]">
                {m.missionary?.profile_photo_url ? (
                  <img src={m.missionary.profile_photo_url} alt="Operator" className="w-full h-full object-cover" />
                ) : (
                  <Users className="w-4 h-4 text-[#7A736A] m-2" />
                )}
              </div>
              <div className="flex flex-col">
                <span className="text-[8px] uppercase tracking-[0.16em] font-semibold text-[#C4A35A] leading-none">Lead Operator</span>
                <span className="text-xs font-semibold text-white leading-tight">{m.missionary?.name || "Verified Operator"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* MIDDLE COLUMN: Narrative & Intelligence Feed (45%) */}
        <div className="lg:w-[45%] p-6 sm:p-8 flex flex-col justify-center border-b lg:border-b-0 lg:border-r border-[rgba(26,22,18,0.06)] bg-white/40">
          
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#EFEBE4]/50 border border-[rgba(26,22,18,0.05)]">
              <span className={`fi fi-${isoCode} rounded-sm text-[10px]`} />
              <span className="text-[9px] uppercase tracking-[0.16em] font-semibold text-[#1A1612]">
                {m.target_country}
              </span>
            </div>
            <span className={`text-[9px] uppercase tracking-[0.16em] font-bold px-2.5 py-1 rounded-full border ${
              m.status === "ACTIVE" ? "bg-[#064E3B]/10 text-[#064E3B] border-[#064E3B]/20" 
              : "bg-[#7A736A]/10 text-[#1A1612] border-[rgba(26,22,18,0.08)]"
            }`}>
              {m.status}
            </span>
            <span className="text-[9px] uppercase tracking-[0.16em] font-semibold text-[#7A736A] ml-auto">
              ID: M-{m.id}
            </span>
          </div>

          <h2 className="font-serif text-xl sm:text-2xl font-semibold text-[#1A1612] leading-snug group-hover:text-[#064E3B] transition-colors line-clamp-2">
            {m.title}
          </h2>
          {m.description && (
            <p className="text-sm text-[#3D3832]/80 mt-3 line-clamp-2 leading-relaxed font-normal">
              {m.description}
            </p>
          )}

          <div className="mt-6 space-y-3">
            {activeCheckpoint && (
              <div className="flex items-center gap-2 text-xs font-medium text-[#3D3832]">
                <Activity className="w-4 h-4 text-[#064E3B]" />
                <span className="text-[#7A736A]">Current Phase:</span>
                <span className="font-semibold text-[#1A1612] truncate">{activeCheckpoint.title}</span>
              </div>
            )}
            
            {latestReport && (
              <div className="bg-[#F7F4EF]/80 border border-[rgba(26,22,18,0.04)] rounded-xl p-3.5 mt-2">
                <span className="text-[9px] uppercase tracking-[0.16em] font-semibold text-[#C4A35A] mb-1.5 flex items-center gap-1.5">
                  <TrendingUp className="w-3 h-3" /> Latest Field Dispatch
                </span>
                <p className="text-xs font-semibold text-[#1A1612] mb-0.5 truncate">{latestReport.title}</p>
                <p className="text-xs text-[#7A736A] line-clamp-1">{latestReport.summary}</p>
              </div>
            )}
          </div>

        </div>

        {/* RIGHT COLUMN: Financials & Action (25%) */}
        <div className="lg:w-[25%] p-6 sm:p-8 flex flex-col justify-between bg-white/20">
          
          <div>
            <span className="text-[10px] uppercase tracking-[0.16em] font-semibold text-[#7A736A] block mb-2">
              Sovereign Capital Deployed
            </span>
            <div className="flex items-end gap-1.5 mb-3">
              <span className="text-3xl font-semibold text-[#1A1612] num-tabular leading-none">
                ${raised.toLocaleString()}
              </span>
            </div>
            
            <div className="w-full h-1.5 bg-[#EFEBE4] rounded-full overflow-hidden mb-2">
              <div
                className="h-full bg-gradient-to-r from-[#064E3B] to-[#C4A35A] rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[10px] font-semibold text-[#7A736A]">
              <span>{progress.toFixed(1)}% Funded</span>
              <span>Target: ${goal.toLocaleString()}</span>
            </div>
          </div>

          <div className="mt-8 space-y-4">
            {totalBeneficiaries > 0 && (
              <div className="flex items-center justify-between border-t border-[rgba(26,22,18,0.04)] pt-4">
                <span className="text-[10px] uppercase tracking-[0.16em] font-semibold text-[#7A736A] flex items-center gap-1.5">
                  <Users className="w-3 h-3 text-[#064E3B]" /> Verified Impact
                </span>
                <span className="text-sm font-semibold text-[#1A1612] num-tabular">+{totalBeneficiaries.toLocaleString()}</span>
              </div>
            )}
            
            <div className="flex items-center justify-between border-t border-[rgba(26,22,18,0.04)] pt-4 pb-2">
              <span className="text-[10px] uppercase tracking-[0.16em] font-semibold text-[#7A736A] flex items-center gap-1.5">
                <ShieldCheck className="w-3 h-3 text-[#C4A35A]" /> On-Chain Ledger
              </span>
              <span className="text-[9px] uppercase tracking-[0.16em] font-bold text-[#064E3B]">Public</span>
            </div>

            <button className="w-full group/btn inline-flex items-center justify-center gap-2 bg-[#1A1612] text-white text-[10px] uppercase tracking-[0.16em] font-semibold py-3.5 px-4 rounded-xl hover:bg-[#064E3B] transition-all duration-300">
              <span>View Dossier</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
            </button>
          </div>

        </div>

      </div>
    </Link>
  );
}