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
      <div className="relative rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-xl hover:shadow-blue-500/10 hover:border-blue-200/80 transition-all duration-300 overflow-hidden group">
        {/* Fintech Gradient Top Bar */}
        <div className="h-[3px] w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500 opacity-80 group-hover:opacity-100 transition-opacity duration-300" />

        <div className="p-6 space-y-5">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-base select-none leading-none">{flag}</span>
                <span className="text-[10px] uppercase tracking-widest font-bold text-slate-500">
                  {targetCountry}
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-700 transition-colors duration-200 line-clamp-2 leading-snug">
                {title}
              </h3>
            </div>
            <span
              className={`shrink-0 text-[10px] uppercase tracking-widest font-bold px-2.5 py-1 rounded-md border ${
                status === "ACTIVE"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : status === "FUNDED"
                  ? "bg-blue-50 text-blue-700 border-blue-200"
                  : "bg-slate-50 text-slate-600 border-slate-200"
              }`}
            >
              {status}
            </span>
          </div>

          {/* Progress Bar & Ledger Snapshot */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium text-[11px] uppercase tracking-wider">
                <span className="text-slate-900 font-bold num-tabular">${raisedAmount.toLocaleString()}</span>
                <span className="opacity-70"> / ${goalAmount.toLocaleString()}</span>
              </span>
              <span className="font-bold text-blue-600 num-tabular">
                {progress.toFixed(0)}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-700"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Card Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-slate-500 font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Verified Rail</span>
            </div>
            <span className="text-[10px] uppercase tracking-wider font-bold text-blue-600 group-hover:text-indigo-600 flex items-center gap-1 transition-all">
              <span>Inspect Deployment</span> 
              <ArrowRight className="w-3 h-3 transition-transform duration-200 group-hover:translate-x-0.5" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}