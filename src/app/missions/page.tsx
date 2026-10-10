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

function formatUsd(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function getStatusStyles(status: string) {
  switch (status) {
    case "ACTIVE":
      return "bg-[#064E3B]/10 text-[#064E3B] border border-[#064E3B]/20";
    case "FUNDED":
      return "bg-[#C4A35A]/10 text-[#8A6A1F] border border-[#C4A35A]/20";
    case "COMPLETED":
      return "bg-[#0F172A]/10 text-[#0F172A] border border-[#0F172A]/20";
    case "PAUSED":
      return "bg-[#7A736A]/10 text-[#7A736A] border border-[#7A736A]/20";
    default:
      return "bg-[#F3F4F6] text-[#374151] border border-[#E5E7EB]";
  }
}

function MissionCard({ mission }: { mission: Mission }) {
  const countryCode = ISO_COUNTRY_CODES[mission.target_country] ?? "us";
  const progress = Math.min((mission.raised_amount_usd / Math.max(mission.goal_amount_usd, 1)) * 100, 100);
  const operatorName = mission.missionary?.name ?? "Field Operator";
  const organizationName = mission.missionary?.organization_name ?? "Humanitarian Network";

  return (
    <article className="glass bg-white/80 border border-[rgba(26,22,18,0.08)] rounded-[28px] shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200">
      <div className="md:flex">
        <div className="relative md:w-[320px] min-h-[220px] bg-[#EDE7DE] overflow-hidden">
          {mission.cover_image ? (
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${mission.cover_image})` }}
            />
          ) : (
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(6,78,59,0.18),_rgba(6,78,59,0)_45%),linear-gradient(135deg,#E9D7B6_0%,#F7F4EF_52%,#D9EBDD_100%)]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#1A1612]/55 via-[#1A1612]/10 to-transparent" />

          <div className="absolute top-4 left-4 flex items-center gap-2 rounded-full bg-white/80 backdrop-blur-sm px-2.5 py-1.5 border border-white/60 shadow-sm">
            <span className={`fi fi-${countryCode} text-lg rounded-[2px] shadow-sm`} />
            <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#1A1612]">
              {mission.target_country}
            </span>
          </div>

          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white">
            <div>
              <p className="text-[10px] uppercase tracking-[0.14em] text-white/75">Mission Lead</p>
              <p className="text-sm font-medium">{operatorName}</p>
            </div>
            <div className="flex items-center justify-center w-11 h-11 rounded-full bg-white/10 backdrop-blur-sm border border-white/30">
              <Camera className="w-4 h-4" />
            </div>
          </div>
        </div>

        <div className="flex-1 p-5 sm:p-6 lg:p-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${getStatusStyles(mission.status)}`}>
                  {mission.status}
                </span>
              </div>

              <div>
                <h2 className="font-serif text-2xl font-semibold text-[#1A1612] leading-tight">
                  {mission.title}
                </h2>
                <p className="mt-2 text-xs text-[#7A736A] leading-relaxed max-w-2xl">
                  {mission.description ?? "This field mission is being coordinated to deliver essential humanitarian support on the ground."}
                </p>
              </div>
            </div>

            <Link
              href={`/missions/${mission.id}`}
              className="inline-flex items-center gap-2 rounded-full bg-[#064E3B] px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-white shadow-sm hover:bg-[#05382e] transition-colors duration-200 whitespace-nowrap"
            >
              View mission
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-[rgba(26,22,18,0.06)] bg-[#F7F4EF] p-3.5">
              <p className="text-[10px] uppercase tracking-[0.15em] text-[#7A736A]">Goal</p>
              <p className="mt-2 text-lg font-semibold text-[#1A1612]">{formatUsd(mission.goal_amount_usd)}</p>
            </div>
            <div className="rounded-2xl border border-[rgba(26,22,18,0.06)] bg-[#F7F4EF] p-3.5">
              <p className="text-[10px] uppercase tracking-[0.15em] text-[#7A736A]">Raised</p>
              <p className="mt-2 text-lg font-semibold text-[#1A1612]">{formatUsd(mission.raised_amount_usd)}</p>
            </div>
            <div className="rounded-2xl border border-[rgba(26,22,18,0.06)] bg-[#F7F4EF] p-3.5">
              <p className="text-[10px] uppercase tracking-[0.15em] text-[#7A736A]">Operator</p>
              <p className="mt-2 text-sm font-semibold text-[#1A1612]">{organizationName}</p>
            </div>
          </div>

          <div className="mt-6 space-y-2">
            <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.14em] text-[#7A736A]">
              <span>Allocation progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#EDE7DE]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#064E3B] via-[#0F766E] to-[#C4A35A]"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {mission.latest_update && (
            <div className="mt-6 rounded-2xl border border-[rgba(26,22,18,0.06)] bg-[#F7F4EF]/80 p-3.5">
              <p className="text-[10px] uppercase tracking-[0.15em] text-[#7A736A]">Latest update</p>
              <p className="mt-2 text-sm text-[#1A1612] leading-relaxed">{mission.latest_update}</p>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

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
          <div className="flex flex-col space-y-8">
            {filtered.map((m) => (
              <MissionCard key={m.id} mission={m} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}