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
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-blue-200/50">
      <Navbar />

      {/* Bright Ambient background blurs */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] glow-blue rounded-full pointer-events-none -translate-y-1/2 -z-10" />
      <div className="absolute top-[20%] right-10 w-[600px] h-[600px] glow-emerald rounded-full pointer-events-none -z-10" />

      {/* Hero Section */}
      <section className="relative pt-12 pb-24 lg:pt-20 lg:pb-32 border-b border-slate-200/60">
        {/* Subtle decorative dot pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03] pointer-events-none -z-10"
          style={{
            backgroundImage: "radial-gradient(#0F172A 1px, transparent 1px)",
            backgroundSize: "24px 24px"
          }}
        />

        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="max-w-4xl">
            {/* Tag / Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/60 border border-slate-200 backdrop-blur-md mb-8 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-[10px] uppercase tracking-widest font-bold text-slate-600">
                Non-Custodial • Built on Stellar Network
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight leading-[1.08] mb-8 text-slate-900">
              Removing the cloak from <br />
              <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600">
                Humanitarian Giving
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mb-12 leading-relaxed font-medium">
              Every transaction is signed directly, routed on-chain, and matched instantly to verified field receipts. Zero middlemen. Direct custody. Sovereign transparency.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/missions"
                className="group inline-flex items-center gap-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs uppercase tracking-wider font-bold px-7 py-4 rounded-xl shadow-xl shadow-blue-500/20 hover:shadow-blue-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
              >
                <span>Deploy To Active Missions</span>
                <ArrowUpRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
              <Link
                href="/transparency"
                className="inline-flex items-center gap-2 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-xs uppercase tracking-wider font-bold px-7 py-4 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <Eye className="w-4 h-4 text-slate-500" /> <span>Audit Ledger</span>
              </Link>
            </div>
          </div>

          {/* Core Stats Metric Array */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-20 lg:mt-28">
            {[
              { icon: DollarSign, label: "Total Handled", value: `$${totalRaised.toLocaleString()}`, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100" },
              { icon: Compass, label: "Active Deployments", value: activeCount.toString(), color: "text-indigo-600", bg: "bg-indigo-50", border: "border-indigo-100" },
              { icon: Users, label: "Verified Operators", value: "12", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
              { icon: MapPin, label: "Assisted Regions", value: "4", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100" },
            ].map((stat, i) => (
              <div
                key={i}
                className="bg-white/80 border border-slate-200/80 rounded-2xl p-6 backdrop-blur-xl shadow-sm hover:shadow-md transition-shadow duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${stat.bg} ${stat.border} border`}>
                    <stat.icon className={`w-4 h-4 ${stat.color}`} />
                  </div>
                  <span className="text-[9px] uppercase tracking-widest text-slate-400 font-bold">Live</span>
                </div>
                <div className="text-3xl font-extrabold tracking-tight text-slate-900 num-tabular">{stat.value}</div>
                <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Protocol Pipeline / How It Works */}
      <section className="relative py-24 border-b border-slate-200/60 bg-white/40">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="mb-16">
            <span className="text-[10px] uppercase tracking-widest font-bold text-blue-600">
              Operational Framework
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-2">
              Absolute Transparency. <span className="text-indigo-600">By Architecture.</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                step: "01",
                title: "Vetted Identities",
                desc: "Every operator undergoes an exhaustive, multi-tier vetting protocol. Only validated accounts launch smart initiatives on our rails.",
                icon: ShieldCheck,
                color: "text-blue-600",
                bg: "bg-blue-50"
              },
              {
                step: "02",
                title: "Direct Pipeline Settlement",
                desc: "Donations are instantly converted into stable asset channels (USDC) and settled on-chain directly to designated regional wallets.",
                icon: Zap,
                color: "text-emerald-600",
                bg: "bg-emerald-50"
              },
              {
                step: "03",
                title: "Cryptographic Accountability",
                desc: "Operators upload real-time field receipts, expenditure milestones, and geo-tagged images directly mapped to transactions on the public ledger.",
                icon: Eye,
                color: "text-indigo-600",
                bg: "bg-indigo-50"
              },
            ].map((item, i) => (
              <div
                key={i}
                className="relative bg-white border border-slate-200/80 rounded-2xl p-8 hover:border-slate-300 transition-all duration-300 group shadow-sm hover:shadow-lg"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${item.bg}`}>
                    <item.icon className={`w-6 h-6 ${item.color}`} />
                  </div>
                  <span className="text-2xl font-black text-slate-100 tracking-widest uppercase">
                    {item.step}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-3">{item.title}</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Deployments */}
      <section className="relative py-24 border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
            <div>
              <span className="text-[10px] uppercase tracking-widest font-bold text-emerald-600">
                Active Initiatives
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-2">
                Field Campaigns <span className="text-blue-600">Awaiting Fuel</span>
              </h2>
            </div>
            <Link
              href="/missions"
              className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider font-bold text-blue-600 hover:text-blue-700 transition duration-200"
            >
              <span>View All Field Stations</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {missions.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center shadow-sm">
              <Activity className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-base font-bold text-slate-900 mb-2">No Active Missions</h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
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
      <section className="relative py-28 overflow-hidden bg-white">
        <div className="absolute top-1/2 left-1/2 w-[700px] h-[350px] -translate-x-1/2 -translate-y-1/2 bg-blue-50 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <p className="text-xs uppercase tracking-widest text-blue-600 font-bold mb-6">
            The Covenant Core
          </p>
          <blockquote className="text-xl sm:text-2xl font-medium italic leading-relaxed text-slate-800 mb-6 font-serif">
            &ldquo;For we aim at what is honorable not only in the Lord&apos;s sight but also in the sight of man.&rdquo;
          </blockquote>
          <cite className="block text-xs uppercase tracking-widest text-slate-500 font-bold not-italic mb-12">
            2 Corinthians 8:21
          </cite>

          <div className="flex flex-wrap justify-center gap-y-3 gap-x-8 text-[11px] uppercase tracking-wider text-slate-600 font-bold border-t border-slate-200 pt-12">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Non-Custodial Channels
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-500" /> Stellar Settlement Base
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-indigo-500" /> Cryptographic Accounting
            </span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="relative w-8 h-8 rounded-lg bg-white flex items-center justify-center overflow-hidden">
              <img
                src="/logo.jpg"
                alt="Shepherd Network"
                className="w-full h-full object-contain p-0.5"
              />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-white">
              SHEPHERD NETWORK
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Sovereign Humanitarian Rails • Powered by the Stellar Blockchain
          </p>
        </div>
      </footer>
    </div>
  );
}