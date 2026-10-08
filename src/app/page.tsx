"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Compass,
  Activity,
  ArrowUpRight,
  Zap,
  Eye,
  CheckCircle2,
  DollarSign,
  Users,
  MapPin,
  Sparkles,
  ArrowRight,
} from "lucide-react";
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

export default function Home() {
  const [missions, setMissions] = useState<Mission[]>([]);

  useEffect(() => {
    apiRequest("/api/missions/")
      .then(setMissions)
      .catch(() => setMissions([]));
  }, []);

  const totalRaised = missions.reduce((sum, m) => sum + Number(m.raised_amount_usd), 0);
  const activeCount = missions.filter((m) => m.status === "ACTIVE").length;

  return (
    <div className="min-h-screen bg-[#F7F4EF] text-[#3D3832] selection:bg-[#064E3B]/10 overflow-hidden">
      <Navbar />

      {/* Warm ambient orbs */}
      <div className="fixed top-0 left-1/4 w-[520px] h-[520px] glow-taupe rounded-full pointer-events-none -translate-y-1/3 -z-20" />
      <div className="fixed top-[30%] right-0 w-[480px] h-[480px] glow-emerald rounded-full pointer-events-none -z-20" />
      <div className="fixed bottom-[10%] left-[5%] w-[400px] h-[400px] glow-gold rounded-full pointer-events-none -z-20" />

      {/* Hero — cinematic full-bleed like Roskyways */}
      <section className="relative pt-12 pb-20 lg:pt-20 lg:pb-28 flex flex-col justify-center overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 relative z-10 w-full">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass mb-6 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-[#C4A35A]" />
              <span className="text-[10px] uppercase tracking-[0.16em] font-semibold text-[#7A736A]">
                Non-Custodial · Built on Stellar
              </span>
            </div>

            <h1 className="font-serif font-semibold tracking-[-0.03em] leading-[1.02] mb-6 text-[#1A1612]">
              <span className="block text-[clamp(2.1rem,4.8vw,4.25rem)]">
                Removing the cloak
              </span>
              <span className="block text-[clamp(2.1rem,4.8vw,4.25rem)] mt-1">
                from{" "}
                <span className="italic text-[#064E3B]">Humanitarian</span>
              </span>
              <span className="block text-[clamp(2.1rem,4.8vw,4.25rem)] mt-1 italic text-[#C4A35A]">
                Giving
              </span>
            </h1>

            <p className="text-base sm:text-lg text-[#3D3832]/90 max-w-lg mb-11 leading-relaxed font-normal">
              Every transaction is signed directly, routed on-chain, and matched
              instantly to verified field receipts. Zero middlemen. Direct
              custody. Sovereign transparency.
            </p>

            <div className="flex flex-wrap gap-3.5">
              <Link
                href="/missions"
                className="group inline-flex items-center gap-2.5 bg-[#064E3B] text-white text-[11px] uppercase tracking-[0.14em] font-semibold px-8 py-4 rounded-2xl shadow-[0_12px_32px_-8px_rgba(6,78,59,0.35)] hover:bg-[#047857] hover:shadow-[0_16px_40px_-8px_rgba(6,78,59,0.5)] hover:-translate-y-1 active:translate-y-0 active:scale-[0.98] transition-all duration-300"
              >
                <span>Deploy To Active Missions</span>
                <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
              <Link
                href="/transparency"
                className="inline-flex items-center gap-2 glass text-[#1A1612] text-[11px] uppercase tracking-[0.14em] font-semibold px-8 py-4 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300"
              >
                <Eye className="w-4 h-4 text-[#7A736A]" />
                <span>Audit Ledger</span>
              </Link>
            </div>
          </div>

          {/* Interactive Live stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-20 lg:mt-32 relative z-10">
            {[
              { icon: DollarSign, label: "Total Handled", value: `$${totalRaised.toLocaleString()}`, accent: "text-[#064E3B]", chip: "bg-[#064E3B]/10" },
              { icon: Compass, label: "Active Deployments", value: activeCount.toString(), accent: "text-[#C4A35A]", chip: "bg-[#C4A35A]/15" },
              { icon: Users, label: "Verified Operators", value: "12", accent: "text-[#064E3B]", chip: "bg-[#064E3B]/10" },
              { icon: MapPin, label: "Assisted Regions", value: "4", accent: "text-[#C4A35A]", chip: "bg-[#C4A35A]/15" },
            ].map((stat, i) => (
              <div
                key={i}
                className="glass rounded-2xl p-6 hover-lift cursor-default"
              >
                <div className="flex items-center justify-between mb-5">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${stat.chip}`}>
                    <stat.icon className={`w-4 h-4 ${stat.accent}`} />
                  </div>
                  <span className="text-[9px] uppercase tracking-[0.16em] text-[#7A736A] font-semibold">Live</span>
                </div>
                <div className="text-3xl font-semibold tracking-tight text-[#1A1612] num-tabular">{stat.value}</div>
                <div className="text-[10px] uppercase tracking-[0.14em] text-[#7A736A] font-semibold mt-1.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Floating Interactive Framework */}
      <section className="relative py-24 border-y border-[rgba(26,22,18,0.06)] bg-[#EFEBE4]/40 z-10">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="mb-14 max-w-2xl">
            <span className="text-[10px] uppercase tracking-[0.18em] font-semibold text-[#064E3B]">
              Operational Framework
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#1A1612] tracking-tight mt-3 leading-tight">
              Absolute transparency.{" "}
              <span className="italic text-[#064E3B]">By architecture.</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                step: "01",
                title: "Vetted Identities",
                desc: "Every operator undergoes multi-tier vetting. Only validated accounts launch initiatives on our rails.",
                icon: ShieldCheck,
                accent: "text-[#064E3B]",
                chip: "bg-[#064E3B]/10",
              },
              {
                step: "02",
                title: "Direct Settlement",
                desc: "Gifts convert to USDC and settle on-chain directly to designated regional wallets. Zero custody.",
                icon: Zap,
                accent: "text-[#C4A35A]",
                chip: "bg-[#C4A35A]/15",
              },
              {
                step: "03",
                title: "Live Accountability",
                desc: "Field receipts, milestones, and geo-tagged images map directly to public ledger transactions.",
                icon: Eye,
                accent: "text-[#064E3B]",
                chip: "bg-[#064E3B]/10",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="relative glass rounded-2xl p-8 hover-lift cursor-default group"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors duration-500 group-hover:bg-[#064E3B] ${item.chip}`}>
                    <item.icon className={`w-6 h-6 transition-colors duration-500 group-hover:text-white ${item.accent}`} />
                  </div>
                  <span className="font-serif text-3xl font-semibold text-[#1A1612]/[0.06] tracking-tight">
                    {item.step}
                  </span>
                </div>
                <h3 className="font-serif text-xl font-semibold text-[#1A1612] mb-3">{item.title}</h3>
                <p className="text-sm text-[#3D3832]/85 leading-relaxed font-normal">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured missions */}
      <section className="relative py-24 z-10">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
            <div>
              <span className="text-[10px] uppercase tracking-[0.18em] font-semibold text-[#C4A35A]">
                Active Initiatives
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#1A1612] tracking-tight mt-3">
                Field campaigns{" "}
                <span className="italic text-[#064E3B]">awaiting fuel</span>
              </h2>
            </div>
            <Link
              href="/missions"
              className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.14em] font-semibold text-[#064E3B] hover:text-[#047857] transition duration-200 group"
            >
              <span>View all field stations</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          {missions.length === 0 ? (
            <div className="glass rounded-2xl p-16 text-center shadow-sm">
              <Activity className="w-12 h-12 text-[#7A736A]/40 mx-auto mb-4" />
              <h3 className="font-serif text-lg font-semibold text-[#1A1612] mb-2">No Active Missions</h3>
              <p className="text-sm text-[#7A736A] max-w-md mx-auto leading-relaxed">
                No campaigns are live yet. Check back as vetted missions complete verification.
              </p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {missions.slice(0, 6).map((m) => (
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
      </section>

      {/* Footer */}
      <footer className="bg-[#1A1612] text-[#7A736A] py-16 relative z-10">
        <div className="max-w-6xl mx-auto px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="relative w-8 h-8 rounded-lg bg-white flex items-center justify-center overflow-hidden">
              <img src="/logo.jpg" alt="Shepherd Network" className="w-full h-full object-contain p-0.5" />
            </div>
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white">
              SHEPHERD NETWORK
            </span>
          </div>
          <p className="text-[11px] text-[#7A736A] font-medium tracking-wide">
            Sovereign Humanitarian Rails · Powered by Stellar
          </p>
        </div>
      </footer>
    </div>
  );
}