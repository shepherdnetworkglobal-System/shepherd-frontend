"use client";

import React from "react";
import Link from "next/link";
import { ShieldCheck, ArrowRight, User, Activity, MapPin, Image as ImageIcon } from "lucide-react";
import "flag-icons/css/flag-icons.min.css";

interface MissionCardProps {
  id: number;
  title: string;
  targetCountry: string;
  goalAmount: number;
  raisedAmount: number;
  status: string;
  // Extended Details
  description?: string;
  coverImage?: string;
  latestUpdate?: string; // Snippet of the latest field report
  missionaryName?: string;
  shepherdId?: string;
  organizationName?: string;
  missionaryPhoto?: string;
  countryCode?: string;
}

const ISO_COUNTRY_CODES: Record<string, string> = {
  Kenya: "ke",
  Philippines: "ph",
  Nigeria: "ng",
  Pakistan: "pk",
  India: "in",
  Brazil: "br",
  Tanzania: "tz",
  Uganda: "ug",
  Ghana: "gh",
};

export default function MissionCard({
  id,
  title,
  targetCountry,
  goalAmount,
  raisedAmount,
  status,
  description,
  coverImage,
  latestUpdate,
  missionaryName,
  shepherdId,
  organizationName,
  missionaryPhoto,
  countryCode,
}: MissionCardProps) {
  const progress = goalAmount > 0 ? Math.min((raisedAmount / goalAmount) * 100, 100) : 0;
  const isoCode = countryCode?.toLowerCase() || ISO_COUNTRY_CODES[targetCountry] || "un";

  return (
    <Link href={`/missions/${id}`} className="group block w-full">
      <div className="relative rounded-3xl glass hover-lift border border-[rgba(26,22,18,0.08)] bg-white/70 backdrop-blur-xl overflow-hidden transition-all duration-500 flex flex-col md:flex-row">
        
        {/* Top Hairline */}
        <div className="absolute top-0 left-0 h-[2px] w-full bg-gradient-to-r from-[#064E3B] via-[#047857] to-[#C4A35A] opacity-70 group-hover:opacity-100 transition-opacity duration-300 z-10" />

        {/* LEFT COLUMN: Media / Visuals */}
        <div className="w-full md:w-[35%] lg:w-[30%] min-h-[240px] md:min-h-full relative bg-[#EFEBE4] overflow-hidden border-r border-[rgba(26,22,18,0.06)] shrink-0">
          {coverImage ? (
            <img 
              src={coverImage} 
              alt={title} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-[#7A736A]/50 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#EFEBE4] to-[#E3DDD3]">
              <ImageIcon className="w-12 h-12 mb-3 opacity-40" />
              <span className="text-[10px] uppercase tracking-[0.16em] font-semibold">Media Pending</span>
            </div>
          )}
          {/* Floating Status Badge on Media */}
          <div className="absolute top-5 left-5">
            <span className={`shadow-sm text-[9px] uppercase tracking-[0.16em] font-semibold px-3 py-1.5 rounded-full border backdrop-blur-md ${
                status === "ACTIVE"
                  ? "bg-[#064E3B]/90 text-white border-[#064E3B]/20"
                  : status === "FUNDED"
                  ? "bg-[#C4A35A]/90 text-white border-[#C4A35A]/30"
                  : "bg-white/90 text-[#7A736A] border-[rgba(26,22,18,0.08)]"
              }`}
            >
              {status}
            </span>
          </div>
        </div>

        {/* RIGHT COLUMN: Rich Info & Financials */}
        <div className="w-full md:w-[65%] lg:w-[70%] p-6 lg:p-8 flex flex-col justify-between bg-white/40">
          
          <div className="space-y-4">
            {/* Header: Location */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className={`fi fi-${isoCode} w-5 h-4 rounded-sm shadow-sm`} />
                <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#7A736A] flex items-center gap-1.5">
                  {targetCountry}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em] text-[#064E3B] font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span>View Ledger</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Title & Desc */}
            <div>
              <h3 className="font-serif text-2xl lg:text-3xl font-semibold text-[#1A1612] group-hover:text-[#064E3B] transition-colors duration-300 leading-tight">
                {title}
              </h3>
              <p className="mt-2.5 text-sm text-[#3D3832]/85 leading-relaxed line-clamp-2 font-normal">
                {description || "Sovereign funding initiative deployed. Connecting vetted field operators directly with transparent donor capital via Stellar rails."}
              </p>
            </div>

            {/* Latest Field Update Snippet */}
            <div className="mt-4 p-4 rounded-2xl bg-[#EFEBE4]/60 border border-[rgba(26,22,18,0.04)] flex items-start gap-3">
              <Activity className="w-4 h-4 text-[#C4A35A] mt-0.5 shrink-0" />
              <div>
                <span className="block text-[9px] uppercase tracking-[0.16em] font-bold text-[#7A736A] mb-1">
                  Latest Field Dispatch
                </span>
                <p className="text-xs font-medium text-[#1A1612] leading-snug line-clamp-1">
                  {latestUpdate || "Awaiting initial progress report from the field."}
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Section: Operator & Progress */}
          <div className="mt-8 pt-6 border-t border-[rgba(26,22,18,0.06)] grid grid-cols-1 lg:grid-cols-2 gap-6 items-end">
            
            {/* Operator Profile */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#064E3B]/10 border border-[#064E3B]/20 flex items-center justify-center overflow-hidden shrink-0">
                {missionaryPhoto ? (
                  <img src={missionaryPhoto} alt={missionaryName || "Head Missionary"} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-4 h-4 text-[#064E3B]" />
                )}
              </div>
              <div className="min-w-0">
                <div className="text-[10px] uppercase tracking-[0.14em] text-[#7A736A] font-semibold mb-0.5">
                  Lead Operator
                </div>
                <div className="text-sm font-semibold text-[#1A1612] truncate">
                  {missionaryName || "Pending Assignment"}
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-[#7A736A] mt-0.5">
                  {organizationName && <span className="truncate text-[#064E3B] font-medium">{organizationName}</span>}
                  {shepherdId && <span className="font-mono text-[9px] tracking-tight truncate border-l border-[rgba(26,22,18,0.1)] pl-1.5">{shepherdId}</span>}
                </div>
              </div>
            </div>

            {/* Financial Progress */}
            <div className="space-y-2.5">
              <div className="flex items-end justify-between">
                <div>
                  <span className="block text-[9px] uppercase tracking-[0.16em] text-[#7A736A] font-semibold mb-1">
                    Capital Deployed
                  </span>
                  <span className="text-[#1A1612] font-semibold num-tabular text-lg leading-none">
                    ${raisedAmount.toLocaleString()}
                  </span>
                  <span className="text-[#7A736A] font-medium text-xs ml-1">
                    / ${goalAmount.toLocaleString()}
                  </span>
                </div>
                <span className="font-semibold text-[#064E3B] num-tabular text-sm">
                  {progress.toFixed(0)}%
                </span>
              </div>
              <div className="w-full h-2 bg-[#EFEBE4] rounded-full overflow-hidden shadow-inner">
                <div
                  className="h-full bg-gradient-to-r from-[#064E3B] to-[#C4A35A] rounded-full transition-all duration-700 relative"
                  style={{ width: `${progress}%` }}
                >
                  <div className="absolute top-0 right-0 w-4 h-full bg-white/30 blur-[2px]" />
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </Link>
  );
}