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
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm hover:shadow-xl hover:shadow-blue-500/5 hover:border-blue-200/60 transition-all duration-300 overflow-hidden">
        {/* Top Gradient Bar */}
        <div className="h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />

        <div className="p-6 space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-lg">{flag}</span>
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {targetCountry}
                </span>
              </div>
              <h3 className="text-base font-bold text-gray-900 group-hover:text-blue-700 transition-colors line-clamp-2 leading-snug">
                {title}
              </h3>
            </div>
            <span
              className={`shrink-0 text-[11px] font-bold px-2.5 py-1 rounded-full ${
                status === "ACTIVE"
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : status === "FUNDED"
                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                  : "bg-gray-50 text-gray-600 border border-gray-200"
              }`}
            >
              {status}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-gray-900">
                ${raisedAmount.toLocaleString()}
                <span className="text-gray-400 font-normal"> / ${goalAmount.toLocaleString()}</span>
              </span>
              <span className="font-bold text-blue-600">{progress.toFixed(0)}%</span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-700"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Verified Mission</span>
            </div>
            <span className="text-xs font-semibold text-blue-600 flex items-center gap-1 group-hover:gap-2 transition-all">
              View Details <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}