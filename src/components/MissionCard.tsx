"use client";

import React from "react";
import Link from "next/link";
import { MapPin, TrendingUp, ShieldCheck, ArrowRight } from "lucide-react";

interface MissionCardProps {
  id: number;
  title: string;
  targetCountry: string;
  goalAmount: number;
  raisedAmount: number;
  status: string;
}

const COUNTRY_FLAGS: Record<string, string> = {
  Kenya: "🇰🇪",
  Philippines: "🇵🇭",
  Nigeria: "🇳🇬",
  Pakistan: "🇵🇰",
  India: "🇮🇳",
  Brazil: "🇧🇷",
  Tanzania: "🇹🇿",
  Uganda: "🇺🇬",
  Ghana: "🇬🇭",
};

export default function MissionCard({
  id,
  title,
  targetCountry,
  goalAmount,
  raisedAmount,
  status,
}: MissionCardProps) {
  const progress = goalAmount > 0 ? Math.min((raisedAmount / goalAmount) * 100, 100) : 0;
  const flag = COUNTRY_FLAGS[targetCountry] || "🌍";

  return (
    <Link href={`/missions/${id}`} className="group block">
      <div className="relative rounded-2xl bg-white/[0.015] border border-white/[0.07] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.03),0_8px_32px_rgba(0,0,0,0.15)] hover:bg-white/[0.035] hover:border-[#8FA68E]/30 transition-all duration-300 overflow-hidden group">
        {/* Subtle top indicator bar */}
        <div className={`h-[2px] w-full transition-colors duration-300 ${
          status === "ACTIVE" 
            ? "bg-[#8FA68E]/30 group-hover:bg-[#8FA68E]" 
            : "bg-[#C08A6A]/30 group-hover:bg-[#C08A6A]"
        }`} />

        <div className="p-6 space-y-5">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-base select-none leading-none">{flag}</span>
                <span className="text-[10px] uppercase tracking-wider font-semibold text-[#9A9690]">
                  {targetCountry}
                </span>
              </div>
              <h3 className="text-base font-medium text-[#E6DED3] group-hover:text-white transition-colors duration-200 line-clamp-2 leading-snug">
                {title}
              </h3>
            </div>
            <span
              className={`shrink-0 text-[9px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-md border ${
                status === "ACTIVE"
                  ? "bg-[#8FA68E]/10 text-[#8FA68E] border-[#8FA68E]/20"
                  : status === "FUNDED"
                  ? "bg-[#C08A6A]/10 text-[#C08A6A] border-[#C08A6A]/20"
                  : "bg-white/[0.04] text-[#9A9690] border-white/[0.08]"
              }`}
            >
              {status}
            </span>
          </div>

          {/* Progress Bar & Ledger Snapshot */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#9A9690] font-medium text-[11px] uppercase tracking-wider">
                <span className="text-[#E6DED3] font-semibold num-tabular">${raisedAmount.toLocaleString()}</span>
                <span className="opacity-60"> / ${goalAmount.toLocaleString()}</span>
              </span>
              <span className={`font-semibold num-tabular ${status === "ACTIVE" ? "text-[#8FA68E]" : "text-[#C08A6A]"}`}>
                {progress.toFixed(0)}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#8FA68E] to-[#C08A6A] rounded-full transition-all duration-700"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Card Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-[#9A9690] font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-[#8FA68E]/85" />
              <span>Verified Rail</span>
            </div>
            <span className="text-[10px] uppercase tracking-wider font-semibold text-[#8FA68E] group-hover:text-[#B8C7B7] flex items-center gap-1 transition-all">
              <span>Inspect Deployment</span> 
              <ArrowRight className="w-3 h-3 transition-transform duration-200 group-hover:translate-x-0.5" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}