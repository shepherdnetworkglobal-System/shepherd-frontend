"use client";

import React from "react";
import Link from "next/link";
import { ShieldCheck, ArrowRight, User } from "lucide-react";
import "flag-icons/css/flag-icons.min.css";

interface MissionCardProps {
  id: number;
  title: string;
  targetCountry: string;
  goalAmount: number;
  raisedAmount: number;
  status: string;
  // Head Missionary Details
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
  missionaryName,
  shepherdId,
  organizationName,
  missionaryPhoto,
  countryCode,
}: MissionCardProps) {
  const progress = goalAmount > 0 ? Math.min((raisedAmount / goalAmount) * 100, 100) : 0;
  const isoCode = countryCode?.toLowerCase() || ISO_COUNTRY_CODES[targetCountry] || "un";

  return (
    <Link href={`/missions/${id}`} className="group block">
      <div className="relative rounded-2xl glass hover-lift border border-[rgba(26,22,18,0.08)] bg-white/70 backdrop-blur-xl overflow-hidden transition-all duration-300">
        {/* Editorial Emerald-Gold Top Hairline */}
        <div className="h-[2px] w-full bg-gradient-to-r from-[#064E3B] via-[#047857] to-[#C4A35A] opacity-70 group-hover:opacity-100 transition-opacity duration-300" />

        <div className="p-6 space-y-5">
          {/* Top Country & Status */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className={`fi fi-${isoCode} w-4 h-3 rounded-xs shadow-xs`} />
              <span className="text-[10px] uppercase tracking-[0.16em] font-semibold text-[#7A736A]">
                {targetCountry}
              </span>
            </div>
            <span
              className={`shrink-0 text-[9px] uppercase tracking-[0.16em] font-semibold px-2.5 py-1 rounded-full border ${
                status === "ACTIVE"
                  ? "bg-[#064E3B]/10 text-[#064E3B] border-[#064E3B]/20"
                  : status === "FUNDED"
                  ? "bg-[#C4A35A]/15 text-[#1A1612] border-[#C4A35A]/30"
                  : "bg-[#EFEBE4] text-[#7A736A] border-[rgba(26,22,18,0.08)]"
              }`}
            >
              {status}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-serif text-lg font-semibold text-[#1A1612] group-hover:text-[#064E3B] transition-colors duration-200 line-clamp-2 leading-snug">
            {title}
          </h3>

          {/* Lead Missionary Operator Info */}
          {(missionaryName || shepherdId || organizationName) && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-[#EFEBE4]/50 border border-[rgba(26,22,18,0.05)]">
              <div className="w-8 h-8 rounded-full bg-[#064E3B]/10 border border-[#064E3B]/20 flex items-center justify-center overflow-hidden shrink-0">
                {missionaryPhoto ? (
                  <img src={missionaryPhoto} alt={missionaryName || "Head Missionary"} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-4 h-4 text-[#064E3B]" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold text-[#1A1612] truncate">
                  {missionaryName || "Head Missionary"}
                </div>
                <div className="flex items-center gap-2 text-[10px] text-[#7A736A]">
                  {organizationName && <span className="truncate text-[#064E3B] font-medium">{organizationName}</span>}
                  {shepherdId && <span className="font-mono text-[9px] tracking-tight truncate">{shepherdId}</span>}
                </div>
              </div>
            </div>
          )}

          {/* Progress Bar & Ledger Snapshot */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#7A736A] font-medium text-[10px] uppercase tracking-[0.14em]">
                <span className="text-[#1A1612] font-semibold num-tabular text-sm">${raisedAmount.toLocaleString()}</span>
                <span> / ${goalAmount.toLocaleString()}</span>
              </span>
              <span className="font-semibold text-[#064E3B] num-tabular text-xs">
                {progress.toFixed(0)}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-[#EFEBE4] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#064E3B] to-[#C4A35A] rounded-full transition-all duration-700"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Card Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-[rgba(26,22,18,0.06)]">
            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em] text-[#7A736A] font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-[#064E3B]" />
              <span>Verified Rail</span>
            </div>
            <span className="text-[10px] uppercase tracking-[0.14em] font-semibold text-[#064E3B] group-hover:text-[#047857] flex items-center gap-1 transition-all">
              <span>Inspect Mission</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}