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
    <div className="min-h-screen bg-[#0C0E0D] text-[#E6DED3] selection:bg-[#8FA68E]/30 selection:text-white">
      <Navbar />

      {/* Ambient background blurs */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] glow-sage rounded-full pointer-events-none -translate-y-1/2 -z-10" />
      <div className="absolute top-[20%] right-10 w-[600px] h-[600px] glow-clay rounded-full pointer-events-none -z-10" />

      {/* Hero Section */}
      <section className="relative pt-12 pb-24 lg:pt-20 lg:pb-32 border-b border-white/[0.04]">
        {/* Subtle decorative dot pattern */}
        <div 
          className="absolute inset-0 opacity-[0.02] pointer-events-none -z-10"
          style={{
            backgroundImage: "radial-gradient(rgba(255,255,255,0.15) 1px, transparent 1px)",
            backgroundSize: "24px 24px"
          }}
        />

        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="max-w-4xl">
            {/* Tag / Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.07] backdrop-blur-md mb-8 shadow-[0_4px_12px_rgba(0,0,0,0.1)]">
              <Sparkles className="w-3.5 h-3.5 text-[#8FA68E]" />
              <span className="text-[10px] uppercase tracking-widest font-semibold text-[#9A9690]">
                Non-Custodial Protocol • Stellar Network rails
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-light tracking-tight leading-[1.08] mb-8 text-[#E6DED3]">
              Removing the cloak from <br />
              <span className="font-semibold italic text-transparent bg-clip-text bg-gradient-to-r from-[#8FA68E] via-[#B8C7B7] to-[#C08A6A]">
                Humanitarian Giving
              </span>
            </h1>

            <p className="text-base sm:text-lg text-[#9A9690] max-w-2xl mb-12 leading-relaxed">
              Every transaction is signed directly, routed on-chain, and matched instantly to verified field receipts. Zero middlemen. Direct custody. Sovereign transparency.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/missions"
                className="group inline-flex items-center gap-2.5 bg-gradient-to-r from-[#C08A6A] to-[#D9A487] text-[#0C0E0D] text-xs uppercase tracking-wider font-bold px-7 py-4 rounded-xl shadow-[0_0_30px_rgba(192,138,106,0.15)] hover:shadow-[0_0_35px_rgba(192,138,106,0.35)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
              >
                <span>Deploy To Active Missions</span>
                <ArrowUpRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
              <Link
                href="/transparency"
                className="inline-flex items-center gap-2 bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.08] hover:border-white/[0.15] text-[#E6DED3] text-xs uppercase tracking-wider font-semibold px-7 py-4 rounded-xl transition-all duration-200 shadow-[0_4px_12px_rgba(0,0,0,0.1)]"
              >
                <Eye className="w-4 h-4 text-[#9A9690]" /> <span>Audit Ledger</span>
              </Link>
            </div>
          </div>

          {/* Core Stats Metric Array */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-20 lg:mt-28">
            {[
              { icon: DollarSign, label: "Total Handled", value: `$${totalRaised.toLocaleString()}`, color: "text-[#8FA68E]", accent: "border-[#8FA68E]/10" },
              { icon: Compass, label: "Active Deployments", value: activeCount.toString(), color: "text-[#C08A6A]", accent: "border-[#C08A6A]/10" },
              { icon: Users, label: "Sovereign Operators", value: "12", color: "text-[#8FA68E]", accent: "border-white/[0.05]" },
              { icon: MapPin, label: "Assisted Regions", value: "4", color: "text-[#C08A6A]", accent: "border-white/[0.05]" },
            ].map((stat, i) => (
              <div
                key={i}
                className={`bg-white/[0.015] border ${stat.accent} rounded-2xl p-6 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.12)]`}
              >
                <div className="flex items-center justify-between mb-4">
                  <stat.icon className={`w-5 h-5 ${stat.color} opacity-80`} />
                  <span className="text-[9px] uppercase tracking-widest text-[#9A9690] font-bold">Live</span>
                </div>
                <div className="text-3xl font-semibold tracking-tight text-[#E6DED3] num-tabular">{stat.value}</div>
                <div className="text-[10px] uppercase tracking-wider text-[#9A9690] font-medium mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Protocol Pipeline / How It Works */}
      <section className="relative py-24 border-b border-white/[0.04]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="mb-16">
            <span className="text-[10px] uppercase tracking-widest font-bold text-[#8FA68E]">
              Operational Framework
            </span>
            <h2 className="text-2xl sm:text-4xl font-light text-[#E6DED3] tracking-tight mt-2">
              Absolute Transparency. <span className="font-semibold italic text-[#C08A6A]">By Architecture.</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                step: "01",
                title: "Vetted Identities",
                desc: "Every operator undergoes an exhaustive, multi-tier vetting protocol. Only validated accounts launch smart initiatives on our rails.",
                icon: ShieldCheck,
                color: "text-[#8FA68E]",
                border: "border-[#8FA68E]/10"
              },
              {
                step: "02",
                title: "Direct Pipeline Settlement",
                desc: "Donations are instantly converted into stable asset channels (USDC) and settled on-chain directly to designated regional wallets. No custody.",
                icon: Zap,
                color: "text-[#C08A6A]",
                border: "border-[#C08A6A]/10"
              },
              {
                step: "03",
                title: "Cryptographic Accountability",
                desc: "Operators upload real-time field receipts, expenditure milestones, and geo-tagged images directly mapped to transactions on the public ledger.",
                icon: Eye,
                color: "text-[#8FA68E]",
                border: "border-white/[0.06]"
              },
            ].map((item, i) => (
              <div
                key={i}
                className={`relative bg-white/[0.01] border ${item.border} rounded-2xl p-8 backdrop-blur-xl hover:bg-white/[0.02] hover:border-white/[0.12] transition-all duration-300 group shadow-[0_8px_30px_rgba(0,0,0,0.1)]`}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="w-10 h-10 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-center">
                    <item.icon className={`w-5 h-5 ${item.color}`} />
                  </div>
                  <span className="text-2xl font-light text-white/10 tracking-widest uppercase">
                    {item.step}
                  </span>
                </div>
                <h3 className="text-lg font-medium text-[#E6DED3] mb-3">{item.title}</h3>
                <p className="text-xs sm:text-sm text-[#9A9690] leading-relaxed font-light">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Deployments */}
      <section className="relative py-24 border-b border-white/[0.04]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
            <div>
              <span className="text-[10px] uppercase tracking-widest font-bold text-[#8FA68E]">
                Active Initiatives
              </span>
              <h2 className="text-2xl sm:text-4xl font-light text-[#E6DED3] tracking-tight mt-2">
                Field Campaigns <span className="font-semibold italic text-[#C08A6A]">Awaiting Fuel</span>
              </h2>
            </div>
            <Link
              href="/missions"
              className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider font-semibold text-[#8FA68E] hover:text-[#B8C7B7] transition duration-200"
            >
              <span>View All Field Stations</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {missions.length === 0 ? (
            <div className="bg-white/[0.015] rounded-2xl border border-white/[0.06] p-16 text-center backdrop-blur-xl">
              <Activity className="w-10 h-10 text-[#9A9690] mx-auto mb-4" />
              <h3 className="text-base font-semibold text-[#E6DED3] mb-2">No Active Missions</h3>
              <p className="text-xs text-[#9A9690] max-w-md mx-auto leading-relaxed">
                No campaigns are active currently. Check back shortly as vetted missions complete verification.
              </p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
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

      {/* Trust Quote / Biblical Anchor */}
      <section className="relative py-28 overflow-hidden">
        {/* Soft atmospheric gradient glow */}
        <div className="absolute top-1/2 left-1/2 w-[700px] h-[350px] -translate-x-1/2 -translate-y-1/2 bg-[#3F4F42]/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <p className="text-xs uppercase tracking-widest text-[#8FA68E] font-semibold mb-6">
            The Covenant Core
          </p>
          <blockquote className="text-xl sm:text-2xl font-light italic leading-relaxed text-[#E6DED3] mb-6 font-serif">
            &ldquo;For we aim at what is honorable not only in the Lord&apos;s sight but also in the sight of man.&rdquo;
          </blockquote>
          <cite className="block text-xs uppercase tracking-widest text-[#9A9690] font-semibold not-italic mb-12">
            2 Corinthians 8:21
          </cite>

          <div className="flex flex-wrap justify-center gap-y-3 gap-x-8 text-[11px] uppercase tracking-wider text-[#9A9690] font-medium border-t border-white/[0.06] pt-12">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#8FA68E]" /> Non-Custodial Channels
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#8FA68E]" /> Stellar Settlement Base
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#8FA68E]" /> Cryptographic Accounting
            </span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0A0C0B] text-[#9A9690] py-16 border-t border-white/[0.05]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/[0.08] flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-[#8FA68E]" />
            </div>
            <span className="text-sm font-semibold tracking-tight text-[#E6DED3]">
              The Shepherd&apos;s Network
            </span>
          </div>
          <p className="text-xs text-[#9A9690]/60">
            Sovereign Humanitarian Rails • Powered by the Stellar Blockchain
          </p>
        </div>
      </footer>
    </div>
  );
}