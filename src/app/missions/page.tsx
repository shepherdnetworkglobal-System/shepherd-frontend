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
    <div className="min-h-screen bg-gray-50/50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        {/* Page Header */}
        <div className="mb-10">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">
            Live Campaigns
          </span>
          <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mt-1 tracking-tight">
            Active Missions
          </h1>
          <p className="text-gray-500 mt-2 max-w-xl">
            Every mission is verified. Every dollar is tracked on the Stellar blockchain.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search missions..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition"
            />
          </div>
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-gray-400" />
            <select
              value={filterCountry}
              onChange={(e) => setFilterCountry(e.target.value)}
              className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition"
            >
              {countries.map((c) => (
                <option key={c} value={c}>
                  {c === "All" ? "All Countries" : c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Mission Grid */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center">
            <Globe2 className="w-14 h-14 text-gray-200 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">No Missions Found</h3>
            <p className="text-sm text-gray-500">
              Try adjusting your search or check back soon for new campaigns.
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