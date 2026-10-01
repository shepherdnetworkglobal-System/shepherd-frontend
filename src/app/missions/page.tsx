"use client";

import React, { useEffect, useState } from "react";
import { Globe2, Search, SlidersHorizontal } from "lucide-react";
import Navbar from "@/components/Navbar";
import MissionCard from "@/components/MissionCard";
import { apiRequest } from "@/lib/api";

interface Mission {
  id: number;
  title: string;
  target_country: string;
  goal_amount_usd: number;
  raised_amount_usd: number;
  status: string;
}

export default function MissionsPage() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [search, setSearch] = useState("");
  const [filterCountry, setFilterCountry] = useState("All");

  useEffect(() => {
    apiRequest("/api/missions/")
      .then(setMissions)
      .catch(() => setMissions([]));
  }, []);

  const countries = ["All", ...Array.from(new Set(missions.map((m) => m.target_country)))];

  const filtered = missions.filter((m) => {
    const matchSearch = m.title.toLowerCase().includes(search.toLowerCase());
    const matchCountry = filterCountry === "All" || m.target_country === filterCountry;
    return matchSearch && matchCountry;
  });

  return (
    <div className="min-h-screen bg-[#0C0E0D] text-[#E6DED3] selection:bg-[#8FA68E]/30 selection:text-white">
      <Navbar />

      {/* Ambient background glows */}
      <div className="absolute top-20 right-1/4 w-[500px] h-[500px] glow-sage rounded-full pointer-events-none -z-10" />
      <div className="absolute top-1/2 left-10 w-[600px] h-[600px] glow-clay rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-14 lg:py-20">
        {/* Page Header */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.07] mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#8FA68E] animate-pulse" />
            <span className="text-[10px] uppercase tracking-widest font-semibold text-[#9A9690]">
              Active Humanitarian Rails
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-light text-[#E6DED3] tracking-tight">
            Field <span className="font-semibold italic text-[#8FA68E]">Deployments</span>
          </h1>
          <p className="text-sm text-[#9A9690] mt-3 max-w-xl font-light leading-relaxed">
            Every mission is directly connected to verified on-chain routing. Search active field campaigns and track every allocation in real time.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-3.5 mb-10">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9A9690]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search initiatives, regions, operators..."
              className="w-full pl-11 pr-4 py-3.5 bg-white/[0.025] border border-white/[0.08] focus:border-[#8FA68E]/50 focus:bg-white/[0.04] rounded-xl text-xs uppercase tracking-wider text-[#E6DED3] placeholder-[#9A9690]/60 backdrop-blur-xl focus:outline-none transition-all duration-200"
            />
          </div>
          <div className="relative flex items-center">
            <SlidersHorizontal className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9A9690] pointer-events-none" />
            <select
              value={filterCountry}
              onChange={(e) => setFilterCountry(e.target.value)}
              className="w-full sm:w-auto appearance-none pl-11 pr-10 py-3.5 bg-white/[0.025] border border-white/[0.08] focus:border-[#8FA68E]/50 focus:bg-white/[0.04] rounded-xl text-xs uppercase tracking-wider text-[#E6DED3] backdrop-blur-xl focus:outline-none transition-all duration-200 cursor-pointer"
            >
              {countries.map((c) => (
                <option key={c} value={c} className="bg-[#151917] text-[#E6DED3]">
                  {c === "All" ? "All Sovereign Regions" : c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Mission Grid */}
        {filtered.length === 0 ? (
          <div className="bg-white/[0.015] rounded-2xl border border-white/[0.06] p-16 text-center backdrop-blur-xl">
            <Globe2 className="w-12 h-12 text-[#9A9690]/40 mx-auto mb-4" />
            <h3 className="text-base font-semibold text-[#E6DED3] mb-2">No Matching Missions Found</h3>
            <p className="text-xs text-[#9A9690] max-w-sm mx-auto leading-relaxed">
              No field stations matched your filter criteria. Try adjusting your parameters or check back soon.
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((m) => (
              <MissionCard
                key={m.id}
                id={m.id}
                title={m.title}
                targetCountry={m.target_country}
                goalAmount={Number(m.goal_amount_usd)}
                raisedAmount={Number(m.raised_amount_usd)}
                status={m.status}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}