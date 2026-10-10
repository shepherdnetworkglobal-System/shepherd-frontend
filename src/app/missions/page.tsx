"use client";

import React, { useEffect, useState } from "react";
import { Search, SlidersHorizontal, Loader2, Compass, Camera, ArrowRight } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { apiRequest } from "@/lib/api";
import "flag-icons/css/flag-icons.min.css";

interface Mission {
  id: number;
  title: string;
  target_country: string;
  goal_amount_usd: number;
  raised_amount_usd: number;
  status: string;
  description?: string;
  cover_image?: string;
  latest_update?: string;
  missionary?: {
    name: string;
    organization_name: string;
  };
}

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

export default function MissionsPage() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [search, setSearch] = useState("");
  const [filterCountry, setFilterCountry] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest("/api/missions")
      .then((data) => {
        if (Array.isArray(data)) {
          setMissions(data as Mission[]);
        } else {
          setMissions([]);
        }
      })
      .catch((err) => {
        console.error("Failed to load public missions:", err);
        setMissions([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const countries = ["All", ...Array.from(new Set(missions.map((m) => m.target_country)))];

  const filtered = missions.filter((m) => {
    const matchSearch =
      m.title.toLowerCase().includes(search.toLowerCase()) ||
      m.target_country.toLowerCase().includes(search.toLowerCase());
    const matchCountry = filterCountry === "All" || m.target_country === filterCountry;
    const matchStatus = filterStatus === "All" || m.status === filterStatus;
    return matchSearch && matchCountry && matchStatus;
  });

  return (
    <div className="min-h-screen bg-[#F7F4EF] text-[#3D3832] selection:bg-[#064E3B]/10 pb-24 relative overflow-x-hidden">
      <Navbar />

      {/* V7 Editorial Ambient Orbs */}
      <div className="fixed top-0 left-[10%] w-[500px] h-[500px] glow-taupe rounded-full pointer-events-none -translate-y-1/2 -z-10 opacity-70" />
      <div className="fixed top-1/3 right-[-5%] w-[600px] h-[600px] glow-emerald rounded-full pointer-events-none -z-10 opacity-40" />
      <div className="fixed bottom-0 left-[20%] w-[700px] h-[700px] glow-gold rounded-full pointer-events-none translate-y-1/3 -z-10 opacity-30" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 relative z-10 space-y-10">
        
        {/* Page Header */}
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/70 border border-[rgba(26,22,18,0.08)] shadow-sm backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-[#064E3B] animate-pulse" />
            <span className="text-[10px] uppercase tracking-[0.16em] font-semibold text-[#7A736A]">
              Active Humanitarian Rails
            </span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#1A1612] tracking-tight leading-tight">
            Field <span className="italic font-serif text-[#064E3B]">Deployments</span>
          </h1>

          <p className="text-sm sm:text-base text-[#7A736A] font-normal leading-relaxed">
            Every mission is directly routed through non-custodial Stellar rails. Explore active field campaigns, track real-time allocations, and verify ground receipts transparently.
          </p>
        </div>

        {/* Filter Controls Bar */}
        <div className="glass bg-white/70 border border-[rgba(26,22,18,0.08)] rounded-3xl p-4 sm:p-5 shadow-sm space-y-4 sm:space-y-0 sm:flex sm:items-center sm:gap-4 justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7A736A]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search field missions, regions, operators..."
              className="w-full pl-11 pr-4 py-3 bg-white/80 border border-[rgba(26,22,18,0.08)] focus:border-[#064E3B] focus:ring-2 focus:ring-[#064E3B]/10 rounded-2xl text-xs font-medium text-[#1A1612] placeholder-[#7A736A]/60 shadow-sm focus:outline-none transition-all duration-200"
            />
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
            <div className="relative flex-1 sm:flex-initial">
              <SlidersHorizontal className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#7A736A] pointer-events-none" />
              <select
                value={filterCountry}
                onChange={(e) => setFilterCountry(e.target.value)}
                className="w-full sm:w-auto appearance-none pl-9 pr-8 py-3 bg-white/80 border border-[rgba(26,22,18,0.08)] focus:border-[#064E3B] focus:ring-2 focus:ring-[#064E3B]/10 rounded-2xl text-xs font-semibold text-[#1A1612] shadow-sm focus:outline-none cursor-pointer transition-all"
              >
                {countries.map((c) => (
                  <option key={c} value={c}>
                    {c === "All" ? "All Sovereign Regions" : c}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative flex-1 sm:flex-initial">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full sm:w-auto appearance-none px-4 py-3 bg-white/80 border border-[rgba(26,22,18,0.08)] focus:border-[#064E3B] focus:ring-2 focus:ring-[#064E3B]/10 rounded-2xl text-xs font-semibold text-[#1A1612] shadow-sm focus:outline-none cursor-pointer transition-all"
              >
                <option value="All">All Statuses</option>
                <option value="ACTIVE">Active Deployments</option>
                <option value="FUNDED">Fully Funded</option>
                <option value="COMPLETED">Completed</option>
                <option value="PAUSED">Paused</option>
              </select>
            </div>
          </div>
        </div>

        {/* Mission Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 glass bg-white/70 rounded-3xl border border-[rgba(26,22,18,0.08)] shadow-sm">
            <Loader2 className="w-8 h-8 text-[#064E3B] animate-spin mb-3" />
            <span className="text-xs font-semibold text-[#7A736A] uppercase tracking-[0.16em]">
              Syncing Live Field Deployments...
            </span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="glass bg-white/70 rounded-3xl border border-[rgba(26,22,18,0.08)] p-16 text-center shadow-sm max-w-2xl mx-auto space-y-4">
            <Compass className="w-12 h-12 text-[#C4A35A] mx-auto opacity-70" />
            <h3 className="font-serif text-xl font-semibold text-[#1A1612]">No Matching Deployments Found</h3>
            <p className="text-xs text-[#7A736A] max-w-sm mx-auto leading-relaxed">
              No active field missions match your current filter parameters. Expand your search or check back as operators launch new campaigns.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filtered.map((m) => {
              const progress = m.goal_amount_usd > 0 ? Math.min((m.raised_amount_usd / m.goal_amount_usd) * 100, 100) : 0;
              const isoCode = ISO_COUNTRY_CODES[m.target_country] || "un";
              const isActive = m.status === "ACTIVE";

              return (
                <Link
                  href={`/missions/${m.id}`}
                  key={m.id}
                  className="group flex flex-col glass bg-white/60 rounded-3xl border border-[rgba(26,22,18,0.08)] shadow-sm hover:border-[#064E3B]/20 hover:shadow-xl hover-lift overflow-hidden transition-all duration-500"
                >
                  {/* Taller Lookbook Image Header */}
                  <div className="relative h-60 sm:h-64 w-full bg-[#EFEBE4]/80 overflow-hidden shrink-0 flex items-center justify-center">
                    {m.cover_image ? (
                      <img 
                        src={m.cover_image} 
                        alt={m.title} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-2 opacity-50">
                        <Camera className="w-8 h-8 text-[#C4A35A]" />
                        <span className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[#C4A35A]">Media Pending</span>
                      </div>
                    )}

                    {/* Floating Badges */}
                    <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-[rgba(26,22,18,0.04)] shadow-sm">
                        <span className={`fi fi-${isoCode} rounded-sm text-xs drop-shadow-sm`} />
                        <span className="text-[9px] uppercase tracking-[0.16em] font-semibold text-[#1A1612]">
                          {m.target_country}
                        </span>
                      </div>
                      
                      <span className={`text-[9px] uppercase tracking-[0.16em] font-bold px-3 py-1.5 rounded-full backdrop-blur-md shadow-sm border ${
                        isActive 
                          ? "bg-[#064E3B]/90 text-white border-[#064E3B]/20" 
                          : "bg-white/90 text-[#1A1612] border-[rgba(26,22,18,0.08)]"
                      }`}>
                        {m.status}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 sm:p-8 flex flex-col flex-1 bg-white/40">
                    <span className="text-[10px] uppercase tracking-[0.16em] font-semibold text-[#7A736A] mb-2 block truncate">
                      Lead: {m.missionary?.name || "Verified Operator"}
                    </span>
                    
                    <h3 className="font-serif text-xl sm:text-2xl font-semibold text-[#1A1612] mb-3 leading-snug line-clamp-2 group-hover:text-[#064E3B] transition-colors">
                      {m.title}
                    </h3>
                    
                    <p className="text-sm text-[#3D3832]/80 leading-relaxed font-normal line-clamp-3 mb-8 flex-1">
                      {m.description || "Mission details pending configuration."}
                    </p>

                    {/* Progress & Financials */}
                    <div className="mt-auto">
                      <div className="flex items-end justify-between mb-2.5">
                        <div>
                          <span className="text-xl font-semibold text-[#1A1612] num-tabular">
                            ${Number(m.raised_amount_usd).toLocaleString()}
                          </span>
                          <span className="text-xs text-[#7A736A] font-medium ml-1">
                            / ${Number(m.goal_amount_usd).toLocaleString()}
                          </span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-[#C4A35A] group-hover:translate-x-1 transition-transform" />
                      </div>
                      
                      <div className="w-full h-2 bg-[#EFEBE4] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#064E3B] to-[#C4A35A] rounded-full transition-all duration-1000 ease-out"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}