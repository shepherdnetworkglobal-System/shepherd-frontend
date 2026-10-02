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

import { Loader2 } from "lucide-react";

export default function MissionsPage() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [search, setSearch] = useState("");
  const [filterCountry, setFilterCountry] = useState("All");
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
    const matchSearch = m.title.toLowerCase().includes(search.toLowerCase());
    const matchCountry = filterCountry === "All" || m.target_country === filterCountry;
    return matchSearch && matchCountry;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-blue-200/50">
      <Navbar />

      {/* Ambient background glows */}
      <div className="absolute top-20 right-1/4 w-[500px] h-[500px] glow-blue rounded-full pointer-events-none -z-10" />
      <div className="absolute top-1/2 left-10 w-[600px] h-[600px] glow-emerald rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-14 lg:py-20">
        {/* Page Header */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm mb-5">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span className="text-[10px] uppercase tracking-widest font-bold text-slate-600">
              Active Humanitarian Rails
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
            Field <span className="text-blue-600">Deployments</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-600 mt-4 max-w-xl font-medium leading-relaxed">
            Every mission is directly connected to verified on-chain routing. Search active field campaigns and track every allocation in real time.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-3.5 mb-10">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search initiatives, regions, operators..."
              className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-xl text-xs font-bold text-slate-900 placeholder-slate-400 shadow-sm focus:outline-none transition-all duration-200"
            />
          </div>
          <div className="relative flex items-center">
            <SlidersHorizontal className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <select
              value={filterCountry}
              onChange={(e) => setFilterCountry(e.target.value)}
              className="w-full sm:w-auto appearance-none pl-11 pr-10 py-3.5 bg-white border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-xl text-xs font-bold text-slate-900 shadow-sm focus:outline-none transition-all duration-200 cursor-pointer"
            >
              {countries.map((c) => (
                <option key={c} value={c} className="bg-white text-slate-900">
                  {c === "All" ? "All Sovereign Regions" : c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Mission Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Syncing Live Field Deployments...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center shadow-sm">
            <Globe2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-base font-bold text-slate-900 mb-2">No Matching Missions Found</h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
              No active live missions found. Use the Admin Command Center to onboard a missionary and launch your first live deployment.
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