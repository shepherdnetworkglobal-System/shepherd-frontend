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
  UserCheck,
  Building2,
  CreditCard,
  Award,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import MissionCard from "@/components/MissionCard";
import { apiRequest } from "@/lib/api";

interface Mission {
  id: number;
  title: string;
  description: string | null;
  target_country: string;
  goal_amount_usd: number;
  raised_amount_usd: number;
  status: string;
  cover_image?: string | null;
  latest_update?: string | null;
  missionary?: any;
  photos?: any[];
  reports?: any[];
  checkpoints?: any[];
}

interface HeroSlide {
  url: string;
  mission: Mission;
}

export default function Home() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
  const [bgIdx, setBgIdx] = useState(0);

  useEffect(() => {
    apiRequest("/api/missions/")
      .then(setMissions)
      .catch(() => setMissions([]));
  }, []);

  // Build the dynamic carousel from active mission photos
  useEffect(() => {
    if (missions.length === 0) return;
    
    const slides: HeroSlide[] = [];
    missions.filter(m => m.status === "ACTIVE").forEach(m => {
      if (m.cover_image) slides.push({ url: m.cover_image, mission: m });
      m.photos?.forEach(p => {
        if (p.url || p.image_url) slides.push({ url: p.url || p.image_url, mission: m });
      });
    });

    // Deduplicate and limit to 6 slides
    const uniqueMap = new Map<string, HeroSlide>();
    slides.forEach(s => {
      if (!uniqueMap.has(s.url)) uniqueMap.set(s.url, s);
    });
    
    const uniqueSlides = Array.from(uniqueMap.values()).sort(() => 0.5 - Math.random()).slice(0, 6);
    
    if (uniqueSlides.length > 0) {
      setHeroSlides(uniqueSlides);
    } else if (missions.length > 0) {
      setHeroSlides([{
        url: "https://res.cloudinary.com/xo4onwh5/image/upload/v1791543058/shepherd_network/shepherd_media/2eda6d5be6da481092dcd661d2291451.jpg",
        mission: missions[0]
      }]);
    }
  }, [missions]);

  // Auto-advance carousel
  useEffect(() => {
    if (heroSlides.length <= 1) return;
    const timer = setInterval(() => {
      setBgIdx((prev) => (prev + 1) % heroSlides.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [heroSlides]);

  const totalRaised = missions.reduce((sum, m) => sum + Number(m.raised_amount_usd), 0);
  const activeCount = missions.filter((m) => m.status === "ACTIVE").length;

  const currentSlide = heroSlides[bgIdx];
  const currentMission = currentSlide?.mission;
  const currentProgress = currentMission && currentMission.goal_amount_usd > 0 
    ? Math.min((currentMission.raised_amount_usd / currentMission.goal_amount_usd) * 100, 100) 
    : 0;

  const tickerItems = [
    "USDC 500.00 routed to M-12 (Kenya)",
    "Operator JOE-KE-1002 verified",
    "Field Receipt verified on M-08",
    "Checkpoint 2 reached: Borehole Drilling",
    "USDC 1,200.00 settled on-chain",
    "New Dispatch: Phase 1 Survey Complete",
    "Impact +120 lives served verified",
    "USDC 250.00 routed to M-14 (Philippines)"
  ];

  return (
    <div className="min-h-screen bg-[#F7F4EF] text-[#3D3832] selection:bg-[#064E3B]/10 overflow-x-hidden relative">
      
      {/* ABSOLUTE BACKGROUND - Covers behind Navbar to the very top edge */}
      <div className="absolute top-0 left-0 w-full h-[100vh] min-h-[640px] z-0 overflow-hidden bg-[#1A1612]">
        {heroSlides.map((slide, idx) => (
          <img
            key={idx}
            src={slide.url}
            alt="Field Deployment"
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${
              idx === bgIdx ? "opacity-100 scale-105 animate-[heroDrift_28s_ease-in-out_infinite_alternate]" : "opacity-0 scale-100"
            }`}
          />
        ))}
        {/* Dark Gradient Overlay for Typography Legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1A1612] via-[#1A1612]/60 to-[#1A1612]/10" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1A1612]/50 via-transparent to-[#1A1612]/20" />
      </div>

      {/* NAVBAR - Floating over the background */}
      <div className="relative z-50 pt-4">
        <Navbar />
      </div>

      {/* 1. HERO FOREGROUND (Flexes to fill remaining screen height) */}
      <section className="relative z-20 w-full h-[calc(100vh-80px)] min-h-[560px] flex flex-col justify-end pb-20 sm:pb-28 perspective-[1200px] pointer-events-none">
        
        {/* Floating 3D Telemetry Card (Dynamically tied to the visible photo) */}
        <div className="absolute right-6 top-16 sm:right-10 sm:top-20 lg:right-16 lg:top-24 z-20 hidden md:block pointer-events-auto">
          <div className="w-[280px] lg:w-[320px] rounded-[1.75rem] border border-white/20 bg-white/10 backdrop-blur-2xl shadow-[0_30px_80px_-20px_rgba(0,0,0,0.55)] p-5 transform-gpu rotate-y-[-8deg] rotate-x-[4deg] hover:rotate-y-0 hover:rotate-x-0 transition-transform duration-700 ease-out">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[9px] uppercase tracking-[0.18em] font-bold text-white/80">Live Field Link</span>
              <span className="flex items-center gap-1.5 text-[9px] uppercase tracking-[0.14em] font-bold text-[#6EE7B7]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#6EE7B7] animate-pulse" /> On-chain
              </span>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-xs text-white/90">
                <span className="text-white/60">Capital Routed</span>
                <span className="font-semibold num-tabular">${Number(currentMission?.raised_amount_usd || 0).toLocaleString()}</span>
              </div>
              <div className="h-1.5 rounded-full bg-white/15 overflow-hidden">
                <div 
                  className="h-full rounded-full bg-gradient-to-r from-[#34D399] to-[#C4A35A] transition-all duration-1000" 
                  style={{ width: `${currentProgress}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-white/90">
                <span className="text-white/60">Active Fields</span>
                <span className="font-semibold num-tabular">{activeCount}</span>
              </div>
              <div className="pt-3 border-t border-white/15">
                <p className="text-[10px] uppercase tracking-[0.14em] text-white/55 mb-1">Featured theater</p>
                <p className="text-sm font-semibold text-white leading-snug line-clamp-2">
                  {currentMission?.title || "Awaiting next deployment"}
                </p>
                <p className="text-[11px] text-[#6EE7B7] font-semibold mt-1">
                  {currentMission?.target_country || "Global network"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom-left Editorial Typography & Actions */}
        <div className="w-full max-w-[1600px] mx-auto px-6 lg:px-12 flex flex-col md:flex-row md:items-end justify-between gap-10 pointer-events-auto">
          
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/20 bg-white/10 backdrop-blur-md mb-6 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-[#6EE7B7]" />
              <span className="text-[9px] uppercase tracking-[0.18em] font-bold text-[#F7F4EF]/95">
                Non-Custodial · Stellar Rails
              </span>
            </div>
            
            {/* Ivory + Emerald — wrapped in explicit spans to override globals.css h1 color */}
            <h1 className="font-serif leading-[1.12] tracking-tight text-3xl sm:text-4xl lg:text-5xl drop-shadow-lg max-w-3xl">
              <span className="text-[#F7F4EF]">Removing the cloak</span>
              <br />
              <span className="text-[#F7F4EF]">from </span>
              <span className="italic text-[#34D399]">Humanitarian</span>
              <br />
              <span className="italic text-[#34D399]">Giving.</span>
            </h1>
          </div>

          <div className="flex flex-col items-start md:items-end gap-6 shrink-0">
            <Link
              href="/missions"
              className="group flex items-center justify-center gap-2.5 bg-white text-[#1A1612] text-[11px] uppercase tracking-[0.16em] font-bold px-8 py-4.5 rounded-full hover:bg-[#F7F4EF] transition-all duration-300 shadow-2xl"
            >
              <span>Deploy Capital</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            
            {/* Carousel Indicators */}
            {heroSlides.length > 1 && (
              <div className="hidden md:flex items-center gap-3">
                {heroSlides.map((_, i) => (
                  <div key={i} className={`h-[2px] transition-all duration-500 ${i === bgIdx ? "w-10 bg-[#6EE7B7]" : "w-6 bg-[#F7F4EF]/30"}`} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Metadata Strip (JamesEdition Style) */}
        <div className="absolute bottom-0 left-0 w-full border-t border-white/10 bg-[#1A1612]/50 backdrop-blur-xl pointer-events-auto">
          <div className="max-w-[1600px] mx-auto px-6 lg:px-12 py-3.5 flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="text-[10px] sm:text-[11px] uppercase tracking-[0.18em] font-bold text-white/95">
              NON-CUSTODIAL &nbsp;•&nbsp; ${totalRaised.toLocaleString()} DEPLOYED &nbsp;•&nbsp; {activeCount} ACTIVE FIELDS &nbsp;•&nbsp; ON-CHAIN VERIFIED
            </div>
            <div className="text-[9px] sm:text-[10px] uppercase tracking-[0.16em] font-bold text-[#6EE7B7] truncate max-w-xl">
              {currentMission ? `FEATURED: ${currentMission.title.toUpperCase()} • ${currentMission.target_country.toUpperCase()}` : "LIVE STELLAR LEDGER"}
            </div>
          </div>
        </div>
      </section>

      {/* 2. INFINITE LEDGER TICKER */}
      <div className="w-full border-y border-[rgba(26,22,18,0.08)] bg-[#EFEBE4]/50 overflow-hidden relative z-10 py-3 backdrop-blur-md">
        <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-[#F7F4EF] to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[#F7F4EF] to-transparent z-10" />
        <div className="animate-marquee flex items-center">
          {[...tickerItems, ...tickerItems].map((item, idx) => (
            <div key={idx} className="flex items-center whitespace-nowrap px-8">
              <span className="w-1.5 h-1.5 rounded-full bg-[#064E3B] mr-3 animate-pulse" />
              <span className="text-[11px] uppercase tracking-[0.16em] font-semibold text-[#7A736A]">
                {item}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* V7 Editorial Ambient Orbs for the rest of the page */}
      <div className="fixed top-[30%] right-[-5%] w-[700px] h-[700px] glow-emerald rounded-full pointer-events-none -z-20 opacity-50" />
      <div className="fixed bottom-[-10%] left-[20%] w-[800px] h-[800px] glow-gold rounded-full pointer-events-none -z-20 opacity-40" />

      {/* 3. SCRIPTURE BAND */}
      <section className="relative z-10 py-16 bg-white/30 backdrop-blur-sm border-b border-[rgba(26,22,18,0.04)]">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="font-serif text-xl sm:text-2xl text-[#1A1612] italic leading-relaxed">
            "For we aim at what is honorable not only in the Lord's sight but also in the sight of man."
          </p>
          <div className="mt-6 flex items-center justify-center gap-4">
            <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-[#C4A35A]" />
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#C4A35A]">
              2 Corinthians 8:21
            </span>
            <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-[#C4A35A]" />
          </div>
        </div>
      </section>

      {/* 4. LIVE METRICS BENTO */}
      <section className="relative py-24 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: DollarSign, label: "Total Capital Handled", value: `$${totalRaised.toLocaleString()}`, color: "text-[#064E3B]", bg: "bg-[#064E3B]/10", border: "border-[#064E3B]/20" },
              { icon: Compass, label: "Active Deployments", value: activeCount.toString(), color: "text-[#C4A35A]", bg: "bg-[#C4A35A]/15", border: "border-[#C4A35A]/25" },
              { icon: Users, label: "Verified Operators", value: "12", color: "text-[#1A1612]", bg: "bg-[#1A1612]/10", border: "border-[#1A1612]/20" },
              { icon: MapPin, label: "Sovereign Regions", value: "4", color: "text-[#7A736A]", bg: "bg-[#7A736A]/15", border: "border-[rgba(26,22,18,0.15)]" },
            ].map((stat, i) => (
              <div key={i} className="glass bg-white/60 rounded-[2rem] p-8 border border-[rgba(26,22,18,0.08)] shadow-sm hover-lift">
                <div className="flex items-center justify-between mb-6">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${stat.bg} ${stat.border}`}>
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <span className="flex items-center gap-1.5 text-[9px] uppercase tracking-[0.16em] text-[#1A1612] font-bold bg-white/80 px-2.5 py-1 rounded-full shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#064E3B] animate-pulse" /> Live
                  </span>
                </div>
                <div className="text-4xl font-semibold tracking-tight text-[#1A1612] num-tabular mb-2">{stat.value}</div>
                <div className="text-[10px] uppercase tracking-[0.16em] text-[#7A736A] font-semibold">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. STICKY SCROLL ARCHITECTURE */}
      <section className="relative z-10 bg-[#EFEBE4]/40 border-y border-[rgba(26,22,18,0.06)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 flex flex-col lg:flex-row gap-16 lg:gap-24">
          
          <div className="lg:w-1/3">
            <div className="lg:sticky lg:top-32 space-y-6">
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#064E3B]">
                The Trust Protocol
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#1A1612] leading-[1.1]">
                Absolute transparency. <br />
                <span className="italic text-[#C4A35A]">By architecture.</span>
              </h2>
              <p className="text-base text-[#7A736A] leading-relaxed font-medium">
                We replaced opaque treasury pools with a deterministic, non-custodial pipeline. You don't have to trust us—the ledger proves it.
              </p>
              <Link href="/transparency" className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] font-bold text-[#1A1612] hover:text-[#064E3B] transition-colors pt-4">
                Explore the framework <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="lg:w-2/3 space-y-8">
            {[
              {
                step: "01",
                title: "Cryptographic Identity",
                desc: "Every ground operator undergoes multi-tier KYC and organizational vetting. Unverified actors cannot touch the ledger.",
                icon: ShieldCheck,
                color: "text-[#1A1612]"
              },
              {
                step: "02",
                title: "Non-Custodial Routing",
                desc: "Your capital never sits in our bank account. Contributions are tokenized as USDC and settle directly to the missionary's sovereign wallet.",
                icon: Zap,
                color: "text-[#064E3B]"
              },
              {
                step: "03",
                title: "Phase-Gated Execution",
                desc: "Missions are broken into weighted checkpoints. Funds map directly to ground realities via uploaded evidence before the next phase begins.",
                icon: CheckCircle2,
                color: "text-[#C4A35A]"
              },
              {
                step: "04",
                title: "Immutable Receipts",
                desc: "Every bag of cement and every solar panel bought is logged. Vendor receipts are uploaded and permanently tied to the mission ID.",
                icon: Eye,
                color: "text-[#1A1612]"
              },
            ].map((item, i) => (
              <div key={i} className="glass bg-white/80 rounded-[2rem] p-8 sm:p-10 border border-[rgba(26,22,18,0.08)] shadow-sm hover-lift group">
                <div className="flex flex-col sm:flex-row sm:items-start gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-[#F7F4EF] border border-[rgba(26,22,18,0.06)] flex items-center justify-center shrink-0 group-hover:bg-[#1A1612] transition-colors duration-500">
                    <item.icon className={`w-8 h-8 transition-colors duration-500 group-hover:text-white ${item.color}`} />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#7A736A] mb-2 block">
                      Phase {item.step}
                    </span>
                    <h3 className="font-serif text-2xl font-semibold text-[#1A1612] mb-3">{item.title}</h3>
                    <p className="text-base text-[#3D3832]/80 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 6. VERIFICATION BADGES EXPLAINER */}
      <section className="relative z-10 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#1A1612] mb-4">The Four Pillars of Verification</h2>
            <p className="text-[#7A736A] text-base">Look for these credentials on every operator's profile. They represent our uncompromising standard for network entry.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: UserCheck, title: "Identity", desc: "Government ID and biometric liveness verified." },
              { icon: Building2, title: "Organization", desc: "Affiliation to a recognized local church or NGO confirmed." },
              { icon: CreditCard, title: "Payout Rail", desc: "Stellar wallet established, tested, and secured." },
              { icon: Award, title: "Impact Audit", desc: "Historical field work verified by independent references." },
            ].map((badge, idx) => (
              <div key={idx} className="glass bg-white/50 rounded-[2rem] p-8 border border-[rgba(26,22,18,0.08)] text-center shadow-sm">
                <div className="w-14 h-14 mx-auto rounded-full bg-[#EFEBE4] border border-[rgba(26,22,18,0.06)] flex items-center justify-center mb-5">
                  <badge.icon className="w-6 h-6 text-[#064E3B]" />
                </div>
                <h4 className="font-serif text-lg font-semibold text-[#1A1612] mb-2">{badge.title}</h4>
                <p className="text-xs text-[#7A736A] leading-relaxed">{badge.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. DOSSIER FEED */}
      <section className="relative z-10 py-24 bg-[#EFEBE4]/30 border-t border-[rgba(26,22,18,0.06)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-6">
            <div>
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#064E3B] mb-2 block">
                Live Terminals
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#1A1612] tracking-tight">
                Featured <span className="italic text-[#064E3B]">Deployments</span>
              </h2>
            </div>
            <Link
              href="/missions"
              className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] font-bold text-[#1A1612] hover:text-[#064E3B] transition-colors glass bg-white/70 px-5 py-3 rounded-xl border border-[rgba(26,22,18,0.08)]"
            >
              <span>Access All Dossiers</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {missions.length === 0 ? (
            <div className="glass bg-white/60 rounded-[2rem] p-16 text-center shadow-sm border border-[rgba(26,22,18,0.08)]">
              <Activity className="w-12 h-12 text-[#C4A35A]/50 mx-auto mb-4" />
              <h3 className="font-serif text-xl font-semibold text-[#1A1612] mb-2">No Active Dossiers</h3>
              <p className="text-sm text-[#7A736A] max-w-md mx-auto leading-relaxed">
                The network is currently processing operator verifications. Check back soon for live deployments.
              </p>
            </div>
          ) : (
            <div className="flex flex-col space-y-8">
              {missions.slice(0, 3).map((m) => (
                <MissionCard key={m.id} mission={m} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 8. CLOSING CTA */}
      <section className="relative z-10 py-32">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="glass bg-white/70 rounded-[3rem] p-12 sm:p-20 border border-[rgba(26,22,18,0.08)] shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#064E3B] via-[#047857] to-[#C4A35A]" />
            <ShieldCheck className="w-12 h-12 text-[#C4A35A] mx-auto mb-6" />
            <h2 className="font-serif text-3xl sm:text-5xl font-semibold text-[#1A1612] mb-6 leading-tight">
              Ready to bypass <br/><span className="italic text-[#064E3B]">the middlemen?</span>
            </h2>
            <p className="text-base text-[#7A736A] max-w-lg mx-auto mb-10">
              Join the sovereign giving network. Fund a deployment directly and track every dollar to the ground.
            </p>
            <Link
              href="/missions"
              className="inline-flex items-center justify-center gap-2.5 bg-[#1A1612] text-white text-[11px] uppercase tracking-[0.16em] font-bold px-10 py-5 rounded-2xl hover:bg-[#064E3B] hover:-translate-y-1 transition-all duration-300 shadow-xl"
            >
              <span>Explore Active Fields</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#1A1612] text-[#7A736A] py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="relative w-10 h-10 rounded-xl bg-[#F7F4EF] flex items-center justify-center overflow-hidden">
              <img src="/logo.jpg" alt="Shepherd Network" className="w-full h-full object-contain p-1" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-white">
              SHEPHERD NETWORK
            </span>
          </div>
          <p className="text-[10px] uppercase tracking-[0.16em] text-[#7A736A] font-semibold">
            Sovereign Humanitarian Rails · Powered by Stellar
          </p>
        </div>
      </footer>
    </div>
  );
}