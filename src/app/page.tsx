"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Heart,
  Globe2,
  Zap,
  Eye,
  ArrowRight,
  CheckCircle2,
  DollarSign,
  Users,
  MapPin,
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
    <div className="min-h-screen bg-gray-50/50">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 text-white">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500 rounded-full blur-[120px]" />
          <div className="absolute bottom-10 right-20 w-96 h-96 bg-indigo-500 rounded-full blur-[150px]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-24 lg:py-32">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-8">
              <Zap className="w-3.5 h-3.5 text-yellow-400" />
              <span className="text-xs font-semibold text-blue-200">
                Non-Custodial • Stellar Network • 100% Transparent
              </span>
            </div>

            <h1 className="text-4xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] mb-6">
              Give Directly to
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-emerald-400 bg-clip-text text-transparent">
                Verified Missionaries
              </span>
            </h1>

            <p className="text-lg text-blue-200/80 max-w-xl mb-10 leading-relaxed">
              Every dollar settles on the Stellar blockchain in seconds. Every receipt is public.
              No middlemen. No cloak. Just boots on the ground doing the work.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/missions"
                className="inline-flex items-center gap-2 bg-white text-slate-900 font-bold px-7 py-3.5 rounded-xl hover:bg-blue-50 transition-all shadow-xl shadow-black/20"
              >
                <Heart className="w-4 h-4 text-red-500" /> Browse Active Missions
              </Link>
              <Link
                href="/transparency"
                className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-semibold px-7 py-3.5 rounded-xl hover:bg-white/20 transition-all"
              >
                <Eye className="w-4 h-4" /> View Public Ledger
              </Link>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-16 lg:mt-24">
            {[
              { icon: DollarSign, label: "Total Funds Routed", value: `$${totalRaised.toLocaleString()}`, color: "text-emerald-400" },
              { icon: Globe2, label: "Active Missions", value: activeCount.toString(), color: "text-blue-400" },
              { icon: Users, label: "Verified Missionaries", value: "12", color: "text-purple-400" },
              { icon: MapPin, label: "Countries Reached", value: "4", color: "text-amber-400" },
            ].map((stat, i) => (
              <div
                key={i}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5"
              >
                <stat.icon className={`w-5 h-5 ${stat.color} mb-2`} />
                <div className="text-2xl font-extrabold text-white">{stat.value}</div>
                <div className="text-xs text-blue-300/60 font-medium mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-20">
        <div className="text-center mb-14">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">
            How It Works
          </span>
          <h2 className="text-3xl font-extrabold text-gray-900 mt-2 tracking-tight">
            Three Steps. Zero Middlemen.
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              step: "01",
              title: "Choose a Verified Mission",
              desc: "Browse missionaries vetted by Shepherd. See their identity, organization, and payout rails.",
              icon: ShieldCheck,
              gradient: "from-blue-500 to-indigo-600",
            },
            {
              step: "02",
              title: "Give in Your Currency",
              desc: "Pay with card or Stellar wallet. Funds convert to USDC and settle on-chain in seconds.",
              icon: Zap,
              gradient: "from-emerald-500 to-teal-600",
            },
            {
              step: "03",
              title: "Track Every Dollar",
              desc: "View field receipts, milestone photos, and expenditure reports on the public ledger.",
              icon: Eye,
              gradient: "from-purple-500 to-violet-600",
            },
          ].map((item, i) => (
            <div
              key={i}
              className="relative bg-white rounded-2xl border border-gray-200/80 p-8 shadow-sm hover:shadow-lg transition-shadow group"
            >
              <div
                className={`w-12 h-12 bg-gradient-to-br ${item.gradient} rounded-xl flex items-center justify-center shadow-lg mb-5`}
              >
                <item.icon className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs font-bold text-gray-300 uppercase tracking-widest">
                Step {item.step}
              </span>
              <h3 className="text-lg font-bold text-gray-900 mt-1 mb-2">{item.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Missions */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 pb-20">
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">
              Live Campaigns
            </span>
            <h2 className="text-3xl font-extrabold text-gray-900 mt-1 tracking-tight">
              Active Missions
            </h2>
          </div>
          <Link
            href="/missions"
            className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-800 transition"
          >
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {missions.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <Globe2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">No Active Missions Yet</h3>
            <p className="text-sm text-gray-500">
              Missions will appear here once verified missionaries launch campaigns from the admin dashboard.
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
      </section>

      {/* Trust Banner */}
      <section className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-2xl lg:text-3xl font-extrabold mb-4">
            &ldquo;Removing the Cloak&rdquo;
          </h2>
          <p className="text-emerald-100 max-w-2xl mx-auto mb-8 leading-relaxed">
            For we aim at what is honorable not only in the Lord&apos;s sight but also in the sight of man.
            Every transaction is on-chain. Every receipt is public. Every missionary is verified.
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-sm font-semibold">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> Non-Custodial
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> Stellar Settlement
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> Public Accounting
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> Verified Missionaries
            </span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-400" />
            <span className="text-sm font-semibold text-slate-300">The Shepherd&apos;s Network</span>
          </div>
          <p className="text-xs text-slate-500">
            Built on Stellar • Non-Custodial • 100% Transparent
          </p>
        </div>
      </footer>
    </div>
  );
}