"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  ShieldCheck,
  MapPin,
  DollarSign,
  Calendar,
  ArrowLeft,
  Heart,
  Wallet,
  CheckCircle2,
  Loader2,
  ArrowRight,
  Receipt,
  FileText,
  TrendingUp,
  AlertTriangle,
  Clock,
  Camera,
  ExternalLink,
  Layers,
  Info,
  User
} from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import PaymentWall from "@/components/PaymentWall";
import { apiRequest } from "@/lib/api";
import "flag-icons/css/flag-icons.min.css";

interface Mission {
  id: number;
  missionary_id: number;
  missionary?: {
    name: string;
    shepherd_id: string;
    organization_name: string;
    profile_photo_url: string;
    years_of_service: number;
    affiliation: string;
  };
  title: string;
  description: string;
  target_country: string;
  goal_amount_usd: number;
  raised_amount_usd: number;
  status: string;
  created_at: string;
  problem_statement?: string;
  mission_objectives?: string;
  proposed_process?: string;
  map_location?: string;
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

export default function MissionDetailPage() {
  const params = useParams();
  const missionId = Number(params.id);

  const [mission, setMission] = useState<Mission | null>(null);
  const [summary, setSummary] = useState<any>(null);
  const [budgetItems, setBudgetItems] = useState<any[]>([]);
  const [checkpoints, setCheckpoints] = useState<any[]>([]);
  const [receipts, setReceipts] = useState<any[]>([]);
  const [photos, setPhotos] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  
  const [activeTab, setActiveTab] = useState<"brief" | "budget" | "checkpoints" | "updates">("brief");
  const [showPayment, setShowPayment] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [
          mData,
          summaryData,
          budgetData,
          checkpointData,
          receiptData,
          photoData,
          reportData
        ] = await Promise.all([
          apiRequest(`/api/missions/${missionId}`),
          apiRequest(`/api/projects/summary/${missionId}`).catch(() => null),
          apiRequest(`/api/projects/budget/${missionId}`).catch(() => []),
          apiRequest(`/api/projects/checkpoints/${missionId}`).catch(() => []),
          apiRequest(`/api/projects/receipts/${missionId}`).catch(() => []),
          apiRequest(`/api/projects/photos/${missionId}`).catch(() => []),
          apiRequest(`/api/projects/reports/${missionId}`).catch(() => [])
        ]);

        setMission(mData);
        setSummary(summaryData);
        setBudgetItems(budgetData.filter((b: any) => b.is_public !== false));
        setCheckpoints(checkpointData.filter((c: any) => c.is_public !== false));
        setReceipts(receiptData.filter((r: any) => r.is_public !== false));
        setPhotos(photoData.filter((p: any) => p.is_public !== false));
        setReports(reportData.filter((r: any) => r.is_public !== false));
      } catch (err) {
        console.error("Failed loading complete mission context", err);
        setMission(null);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [missionId]);

  // Mapbox initialization
  useEffect(() => {
    if (!mission?.map_location) return;

    const token = "pk.eyJ1Ijoic2hlcGhlcmRuZXR3b3JrIiwiYSI6ImNsd3B6YmZ4dzAxbXYya28xdHpqNXdtYnoifQ.fallback_token"; 
    
    let coords: [number, number] = [36.8219, -1.2921]; 
    try {
      const parts = mission.map_location.split(",").map(p => parseFloat(p.trim()));
      if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        if (Math.abs(parts[0]) > 90) coords = [parts[0], parts[1]];
        else coords = [parts[1], parts[0]];
      }
    } catch {
      // fallback
    }

    const link = document.createElement("link");
    link.href = "https://api.mapbox.com/mapbox-gl-js/v3.1.2/mapbox-gl.css";
    link.rel = "stylesheet";
    document.head.appendChild(link);

    const script = document.createElement("script");
    script.src = "https://api.mapbox.com/mapbox-gl-js/v3.1.2/mapbox-gl.js";
    script.async = true;
    document.body.appendChild(script);

    script.onload = () => {
      const mapboxgl = (window as any).mapboxgl;
      if (!mapboxgl) return;
      mapboxgl.accessToken = token;

      const map = new mapboxgl.Map({
        container: "mapbox-sidebar-map",
        style: "mapbox://styles/mapbox/light-v11",
        center: coords,
        zoom: 7,
        cooperativeGestures: true
      });

      new mapboxgl.Marker({ color: "#064E3B" })
        .setLngLat(coords)
        .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(
          `<div class="p-2 font-sans"><h4 class="font-semibold text-[#1A1612] text-xs">${mission.title}</h4></div>`
        ))
        .addTo(map);

      map.addControl(new mapboxgl.NavigationControl(), "top-right");
    };

    return () => {
      link.remove();
      script.remove();
    };
  }, [mission]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F4EF] text-[#1A1612]">
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-8 h-8 text-[#064E3B] animate-spin" />
        </div>
      </div>
    );
  }

  if (!mission) {
    return (
      <div className="min-h-screen bg-[#F7F4EF] text-[#1A1612]">
        <Navbar />
        <div className="max-w-4xl mx-auto px-6 py-20 text-center">
          <h2 className="font-serif text-2xl font-semibold text-[#1A1612]">Mission Pipeline Not Found</h2>
          <Link href="/missions" className="text-xs uppercase tracking-[0.14em] font-semibold text-[#064E3B] hover:text-[#047857] mt-4 inline-block transition-colors">
            Return to Active Deployments
          </Link>
        </div>
      </div>
    );
  }

  const progress = Number(mission.goal_amount_usd) > 0
    ? Math.min((Number(mission.raised_amount_usd) / Number(mission.goal_amount_usd)) * 100, 100)
    : 0;

  const totalSpent = receipts.reduce((sum, r) => sum + Number(r.amount_spent_usd), 0);
  const totalBudgeted = budgetItems.reduce((sum, b) => sum + Number(b.total_cost_usd), 0);

  const isoCode = ISO_COUNTRY_CODES[mission.target_country] || "un";
  const beforePhotos = photos.filter(p => p.category === "BEFORE");
  const duringPhotos = photos.filter(p => p.category === "DURING" || p.category === "AFTER");

  return (
    <div className="min-h-screen bg-[#F7F4EF] text-[#3D3832] selection:bg-[#064E3B]/10 pb-24 overflow-x-hidden">
      <Navbar />

      {/* V7 Editorial Ambient Orbs */}
      <div className="fixed top-24 left-[10%] w-[500px] h-[500px] glow-taupe rounded-full pointer-events-none -z-10" />
      <div className="fixed top-1/2 right-[5%] w-[600px] h-[600px] glow-emerald rounded-full pointer-events-none -z-10 opacity-70" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 relative z-10">
        
        <Link
          href="/missions"
          className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.16em] text-[#7A736A] hover:text-[#1A1612] font-semibold transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> <span>Back to Active Fields</span>
        </Link>

        {/* 1. Hero Card */}
        <div className="relative rounded-3xl glass border border-[rgba(26,22,18,0.08)] bg-white/70 backdrop-blur-xl shadow-sm overflow-hidden">
          <div className="h-[2px] w-full bg-gradient-to-r from-[#064E3B] via-[#047857] to-[#C4A35A]" />
          <div className="p-8 sm:p-10">
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#EFEBE4]/50 border border-[rgba(26,22,18,0.05)]">
                <span className={`fi fi-${isoCode} rounded-sm text-sm`} />
                <span className="text-[10px] uppercase tracking-[0.16em] font-semibold text-[#7A736A]">
                  {mission.target_country} Region
                </span>
              </div>
              <span
                className={`text-[9px] uppercase tracking-[0.16em] font-semibold px-2.5 py-1.5 rounded-full border ${
                  mission.status === "ACTIVE"
                    ? "bg-[#064E3B]/10 text-[#064E3B] border-[#064E3B]/20"
                    : "bg-[#C4A35A]/15 text-[#1A1612] border-[#C4A35A]/30"
                }`}
              >
                {mission.status}
              </span>
            </div>

            <h1 className="font-serif text-3xl sm:text-5xl font-semibold text-[#1A1612] tracking-tight leading-[1.1] mb-6">
              {mission.title}
            </h1>

            <p className="text-sm sm:text-base text-[#3D3832]/90 leading-relaxed font-normal mb-10 whitespace-pre-wrap">
              {mission.description}
            </p>

            <div className="bg-[#EFEBE4]/50 border border-[rgba(26,22,18,0.05)] rounded-2xl p-6 sm:p-8 space-y-4">
              <div className="flex items-end justify-between">
                <div>
                  <span className="text-[10px] uppercase tracking-[0.16em] font-semibold text-[#7A736A] block mb-2">
                    Sovereign Capital Deployed
                  </span>
                  <span className="text-3xl sm:text-4xl font-semibold text-[#1A1612] num-tabular">
                    ${Number(mission.raised_amount_usd).toLocaleString()}
                  </span>
                  <span className="text-xs text-[#7A736A] font-medium ml-2">
                    of ${Number(mission.goal_amount_usd).toLocaleString()} limit
                  </span>
                </div>
                <span className="text-xl sm:text-2xl font-semibold text-[#064E3B] num-tabular">
                  {progress.toFixed(1)}%
                </span>
              </div>
              <div className="w-full h-2 bg-[#E3DDD3] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#064E3B] to-[#C4A35A] rounded-full transition-all duration-1000"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 2. Direct Support CTA */}
        <div className="rounded-3xl glass bg-white/70 border border-[rgba(26,22,18,0.08)] shadow-sm p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 hover-lift">
          <div className="w-full sm:w-2/3">
            <h3 className="font-serif text-xl font-semibold text-[#1A1612] mb-2">Fund This Deployment</h3>
            <p className="text-sm text-[#7A736A] leading-relaxed">
              100% of your gift settles instantly on-chain. Shepherd handles full transparency and zero-custody routing automatically.
            </p>
            <div className="flex flex-wrap items-center gap-4 mt-4">
              <div className="flex items-center gap-1.5 text-[9px] uppercase tracking-[0.16em] text-[#3D3832] font-semibold">
                <Wallet className="w-3.5 h-3.5 text-[#064E3B]" /> USDC Settlement
              </div>
              <div className="flex items-center gap-1.5 text-[9px] uppercase tracking-[0.16em] text-[#3D3832] font-semibold">
                <FileText className="w-3.5 h-3.5 text-[#064E3B]" /> Cryptographic Ledger
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowPayment(true)}
            className="w-full sm:w-1/3 group inline-flex items-center justify-center gap-2 bg-[#064E3B] text-white text-[11px] uppercase tracking-[0.14em] font-semibold py-4 px-6 rounded-2xl shadow-[0_12px_32px_-8px_rgba(6,78,59,0.35)] hover:bg-[#047857] hover:shadow-[0_16px_40px_-8px_rgba(6,78,59,0.5)] hover:-translate-y-1 active:translate-y-0 active:scale-[0.98] transition-all duration-300 whitespace-nowrap"
          >
            <Heart className="w-4 h-4 text-white fill-white/20" />
            <span>Deploy Capital</span>
          </button>
        </div>

        {/* 3. Sovereign Operator Profile Card */}
        <Link
          href={`/missionaries/${mission.missionary_id}`}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 rounded-3xl glass bg-white/70 border border-[rgba(26,22,18,0.08)] hover:border-[#064E3B]/30 p-6 sm:p-8 shadow-sm hover:shadow-md hover-lift transition-all duration-300 group"
        >
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#EFEBE4] border-2 border-white flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
              {mission.missionary?.profile_photo_url ? (
                <img src={mission.missionary.profile_photo_url} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User className="w-8 h-8 text-[#064E3B]/40" />
              )}
            </div>
            <div>
              <span className="text-[9px] uppercase tracking-[0.16em] font-semibold text-[#7A736A] block mb-1">Lead Operator</span>
              <h3 className="font-serif text-xl font-semibold text-[#1A1612] group-hover:text-[#064E3B] transition duration-300">
                {mission.missionary?.name || "Verified Operator"}
              </h3>
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.14em] text-[#7A736A] mt-1.5">
                <span className="font-semibold text-[#3D3832]">{mission.missionary?.organization_name || "Independent"}</span>
                {mission.missionary?.shepherd_id && (
                  <>
                    <span>•</span>
                    <span className="font-mono tracking-tight">{mission.missionary.shepherd_id}</span>
                  </>
                )}
              </div>
              <div className="inline-flex items-center gap-1.5 text-[9px] uppercase tracking-[0.16em] font-semibold text-[#064E3B] bg-[#064E3B]/10 px-2.5 py-1 rounded-full mt-3">
                <ShieldCheck className="w-3.5 h-3.5" /> Fully Vetted Identity
              </div>
            </div>
          </div>
          <div className="flex items-center text-[10px] uppercase tracking-[0.16em] font-semibold text-[#7A736A] group-hover:text-[#064E3B] transition duration-200 shrink-0">
            View Profile <ArrowRight className="w-4 h-4 ml-1.5 transition-transform duration-300 group-hover:translate-x-1" />
          </div>
        </Link>

        {/* 4. Tech Specs + Mapbox Split Card */}
        <div className="rounded-3xl glass bg-white/70 border border-[rgba(26,22,18,0.08)] shadow-sm overflow-hidden flex flex-col md:flex-row relative z-10">
          <div className="p-6 sm:p-8 md:w-1/2 flex flex-col justify-center space-y-6">
            <h3 className="text-[10px] uppercase tracking-[0.18em] font-semibold text-[#7A736A]">
              Deployment Specs
            </h3>
            <div className="space-y-4">
              {[
                { icon: MapPin, label: "Target Area", value: mission.target_country },
                { icon: Calendar, label: "Initialized", value: new Date(mission.created_at).toLocaleDateString() },
                { icon: DollarSign, label: "Hard Limit", value: `$${Number(mission.goal_amount_usd).toLocaleString()}` },
                { icon: ShieldCheck, label: "Sovereign Escrow", value: "Active", accent: "text-[#064E3B]" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between text-xs py-2 border-b border-[rgba(26,22,18,0.04)] last:border-0 last:pb-0">
                  <div className="flex items-center gap-2.5 text-[#7A736A] font-semibold">
                    <item.icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  <span className={`font-semibold ${item.accent || "text-[#1A1612]"}`}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
          {mission.map_location ? (
            <div className="md:w-1/2 h-64 md:h-auto border-t md:border-t-0 md:border-l border-[rgba(26,22,18,0.08)] relative z-0">
              <div id="mapbox-sidebar-map" className="absolute inset-0" />
            </div>
          ) : (
            <div className="md:w-1/2 h-64 md:h-auto border-t md:border-t-0 md:border-l border-[rgba(26,22,18,0.08)] bg-[#EFEBE4]/50 flex items-center justify-center">
               <span className="text-[10px] font-semibold text-[#7A736A] uppercase tracking-[0.16em]">Map telemetry unavailable</span>
            </div>
          )}
        </div>

        {/* 5. TAB SYSTEM WORKSPACE */}
        <div className="rounded-3xl glass bg-white/70 border border-[rgba(26,22,18,0.08)] shadow-sm overflow-hidden mt-8">
          <div className="flex border-b border-[rgba(26,22,18,0.08)] overflow-x-auto scrollbar-none bg-[#EFEBE4]/30">
            {[
              { id: "brief", label: "Mission Brief", icon: FileText },
              { id: "budget", label: "Budget & Receipts", icon: Receipt },
              { id: "checkpoints", label: "Checkpoints", icon: CheckCircle2 },
              { id: "updates", label: "Field Reports", icon: TrendingUp },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex justify-center items-center gap-2 px-6 py-5 border-b-[3px] text-[10px] uppercase tracking-[0.16em] font-semibold transition-all duration-300 whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-[#064E3B] text-[#064E3B] bg-white/50"
                    : "border-transparent text-[#7A736A] hover:text-[#1A1612] hover:bg-white/30"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="p-6 sm:p-10">
            {/* 1. MISSION BRIEF TAB */}
            {activeTab === "brief" && (
              <div className="space-y-10">
                <section>
                  <h3 className="font-serif text-xl font-semibold text-[#1A1612] mb-4 flex items-center gap-2.5">
                    <AlertTriangle className="w-5 h-5 text-[#C4A35A]" />
                    The Problem Statement
                  </h3>
                  <div className="bg-white/50 rounded-2xl p-6 border border-[rgba(26,22,18,0.04)] shadow-sm">
                    <p className="text-sm text-[#3D3832] leading-relaxed font-normal whitespace-pre-wrap">
                      {mission.problem_statement || "No problem statement registered on setup."}
                    </p>
                  </div>
                </section>

                <section>
                  <h3 className="font-serif text-xl font-semibold text-[#1A1612] mb-4 flex items-center gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-[#064E3B]" />
                    Operational Objectives
                  </h3>
                  <div className="bg-white/50 rounded-2xl p-6 border border-[rgba(26,22,18,0.04)] shadow-sm">
                    <p className="text-sm text-[#3D3832] leading-relaxed font-normal whitespace-pre-wrap">
                      {mission.mission_objectives || "No operational milestones loaded on setup."}
                    </p>
                  </div>
                </section>

                <section>
                  <h3 className="font-serif text-xl font-semibold text-[#1A1612] mb-4 flex items-center gap-2.5">
                    <Layers className="w-5 h-5 text-[#7A736A]" />
                    Execution Method
                  </h3>
                  <div className="bg-white/50 rounded-2xl p-6 border border-[rgba(26,22,18,0.04)] shadow-sm">
                    <p className="text-sm text-[#3D3832] leading-relaxed font-normal whitespace-pre-wrap">
                      {mission.proposed_process || "No process strategy described."}
                    </p>
                  </div>
                </section>

                {beforePhotos.length > 0 && (
                  <section>
                    <h3 className="font-serif text-xl font-semibold text-[#1A1612] mb-4 flex items-center gap-2.5">
                      <Camera className="w-5 h-5 text-[#3D3832]" />
                      Ground Reality (Before)
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      {beforePhotos.map((photo) => (
                        <div key={photo.id} className="relative rounded-2xl overflow-hidden border border-[rgba(26,22,18,0.08)] aspect-video group shadow-sm">
                          <img
                            src={photo.url || photo.image_url}
                            alt={photo.caption || "Deployment Before image"}
                            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                          />
                          {photo.caption && (
                            <div className="absolute inset-x-0 bottom-0 bg-[#1A1612]/80 backdrop-blur-md p-3">
                              <p className="text-[11px] text-white/90 font-medium truncate">{photo.caption}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            )}

            {/* 2. BUDGET & RECEIPTS TAB */}
            {activeTab === "budget" && (
              <div className="space-y-10">
                <div className="grid grid-cols-2 gap-5">
                  <div className="bg-[#064E3B]/5 border border-[#064E3B]/10 rounded-2xl p-6">
                    <span className="text-3xl font-semibold text-[#064E3B] num-tabular block">${totalSpent.toLocaleString()}</span>
                    <span className="text-[10px] uppercase tracking-[0.16em] font-semibold text-[#064E3B] block mt-1.5">Verified Spent</span>
                  </div>
                  <div className="bg-[#1A1612]/5 border border-[#1A1612]/10 rounded-2xl p-6">
                    <span className="text-3xl font-semibold text-[#1A1612] num-tabular block">${totalBudgeted.toLocaleString()}</span>
                    <span className="text-[10px] uppercase tracking-[0.16em] font-semibold text-[#7A736A] block mt-1.5">Total Target Budget</span>
                  </div>
                </div>

                <section>
                  <h3 className="font-serif text-xl font-semibold text-[#1A1612] mb-5">Ledger Allocation</h3>
                  {budgetItems.length === 0 ? (
                    <p className="text-sm text-[#7A736A] font-medium">No budget breakdown is declared for this mission.</p>
                  ) : (
                    <div className="border border-[rgba(26,22,18,0.08)] rounded-2xl overflow-hidden shadow-sm overflow-x-auto bg-white/50">
                      <table className="w-full text-left border-collapse min-w-[500px]">
                        <thead>
                          <tr className="bg-[#EFEBE4]/50 border-b border-[rgba(26,22,18,0.08)] text-[9px] uppercase tracking-[0.18em] font-semibold text-[#7A736A]">
                            <th className="p-5">Item Name</th>
                            <th className="p-5 text-right">Target (USD)</th>
                            <th className="p-5 text-right">Actual Spent</th>
                            <th className="p-5 text-right">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[rgba(26,22,18,0.04)]">
                          {budgetItems.map((item) => (
                            <tr key={item.id} className="text-xs hover:bg-[#EFEBE4]/30 transition-colors">
                              <td className="p-5">
                                <span className="font-semibold text-[#1A1612] block mb-1">{item.item_name}</span>
                                <span className="text-[9px] uppercase tracking-[0.14em] font-semibold text-[#7A736A] block">{item.category}</span>
                              </td>
                              <td className="p-5 text-right font-semibold text-[#3D3832] num-tabular">${Number(item.total_cost_usd).toLocaleString()}</td>
                              <td className="p-5 text-right font-semibold text-[#064E3B] num-tabular">${Number(item.actual_spent_usd).toLocaleString()}</td>
                              <td className="p-5 text-right">
                                <span className="inline-block text-[9px] uppercase tracking-[0.14em] font-semibold px-2 py-1 rounded bg-[#EFEBE4] text-[#3D3832]">
                                  {item.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </section>

                <section>
                  <h3 className="font-serif text-xl font-semibold text-[#1A1612] mb-5">Verified Field Receipts</h3>
                  {receipts.length === 0 ? (
                    <div className="py-14 border border-dashed border-[rgba(26,22,18,0.15)] rounded-2xl text-center bg-white/40">
                      <Receipt className="w-8 h-8 text-[#7A736A]/50 mx-auto mb-3" />
                      <p className="text-sm text-[#7A736A] font-medium">No verified expense receipts logged to this platform.</p>
                    </div>
                  ) : (
                    <div className="grid sm:grid-cols-2 gap-5">
                      {receipts.map((rec) => (
                        <div key={rec.id} className="border border-[rgba(26,22,18,0.08)] bg-white/60 rounded-2xl p-5 shadow-sm flex flex-col justify-between hover-lift">
                          <div>
                            <div className="flex items-start justify-between gap-3 mb-2">
                              <h4 className="font-semibold text-sm text-[#1A1612] leading-snug line-clamp-2">{rec.title}</h4>
                              <span className="text-sm font-semibold text-[#064E3B] num-tabular shrink-0">${Number(rec.amount_spent_usd).toLocaleString()}</span>
                            </div>
                            <p className="text-[9px] uppercase tracking-[0.16em] text-[#7A736A] font-semibold mb-4">{rec.category} • {rec.vendor_name || "Unknown Vendor"}</p>
                            {rec.notes && <p className="text-[11px] text-[#3D3832] leading-relaxed mb-5 bg-[#EFEBE4]/50 p-3 rounded-xl border border-[rgba(26,22,18,0.04)]">{rec.notes}</p>}
                          </div>
                          <a
                            href={rec.receipt_image_url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 text-[9px] uppercase tracking-[0.16em] font-semibold text-[#C4A35A] hover:text-[#1A1612] transition-colors"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>Verify Source Document</span>
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              </div>
            )}

            {/* 3. TIMELINE & CHECKPOINTS TAB (NOW WITH PHOTOS) */}
            {activeTab === "checkpoints" && (
              <div className="space-y-8">
                <div className="flex items-center gap-3 bg-[#C4A35A]/10 p-5 border border-[#C4A35A]/20 rounded-2xl">
                  <Info className="w-5 h-5 text-[#C4A35A] shrink-0" />
                  <p className="text-[11px] text-[#3D3832] leading-relaxed font-medium">
                    The operational timeline tracks ground deployment via weighted phases. Photos taken during each phase are logged directly to the respective checkpoint below.
                  </p>
                </div>

                {checkpoints.length === 0 ? (
                  <p className="text-sm text-[#7A736A] font-medium text-center py-12">No checkpoints are logged for this deployment.</p>
                ) : (
                  <div className="relative border-l-2 border-[rgba(26,22,18,0.08)] ml-4 pl-8 space-y-10">
                    {checkpoints.map((cp) => {
                      const isCompleted = cp.status === "COMPLETED";
                      const checkpointPhotos = photos.filter(p => p.checkpoint_id === cp.id);

                      return (
                        <div key={cp.id} className="relative">
                          {/* Timeline Dot */}
                          <div className={`absolute -left-[43px] top-1.5 w-6 h-6 rounded-full border-[3px] bg-[#F7F4EF] flex items-center justify-center transition-colors ${
                            isCompleted ? "border-[#064E3B]" : "border-[rgba(26,22,18,0.2)]"
                          }`}>
                            {isCompleted && <div className="w-2 h-2 rounded-full bg-[#064E3B]" />}
                          </div>

                          <div className="p-6 border border-[rgba(26,22,18,0.08)] rounded-2xl bg-white/60 shadow-sm hover:border-[rgba(26,22,18,0.15)] transition-colors">
                            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                              <div className="flex items-center gap-3">
                                <h4 className="font-serif text-lg font-semibold text-[#1A1612]">{cp.title}</h4>
                                <span className="text-[9px] uppercase tracking-[0.16em] font-semibold bg-[#EFEBE4] text-[#7A736A] px-2 py-1 rounded-full">
                                  Weight: {Number(cp.weight_percent).toFixed(1)}%
                                </span>
                              </div>
                              <span className={`text-[9px] uppercase tracking-[0.16em] font-semibold px-2.5 py-1 rounded-full border ${
                                isCompleted
                                  ? "bg-[#064E3B]/10 text-[#064E3B] border-[#064E3B]/20"
                                  : cp.status === "IN_PROGRESS"
                                  ? "bg-[#C4A35A]/15 text-[#1A1612] border-[#C4A35A]/30"
                                  : "bg-transparent text-[#7A736A] border-[rgba(26,22,18,0.15)]"
                              }`}>
                                {cp.status}
                              </span>
                            </div>
                            
                            {cp.description && (
                              <p className="text-sm text-[#3D3832] leading-relaxed font-normal mb-5">{cp.description}</p>
                            )}

                            {/* Phase Media Gallery */}
                            {checkpointPhotos.length > 0 && (
                              <div className="mt-5 mb-5 border-t border-[rgba(26,22,18,0.06)] pt-5">
                                <h5 className="text-[10px] uppercase tracking-[0.16em] font-semibold text-[#7A736A] mb-3 flex items-center gap-1.5">
                                  <Camera className="w-3 h-3" /> Phase Evidence
                                </h5>
                                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none snap-x">
                                  {checkpointPhotos.map(photo => (
                                    <div key={photo.id} className="relative w-32 h-32 rounded-xl overflow-hidden shrink-0 snap-start border border-[rgba(26,22,18,0.08)] bg-[#EFEBE4]">
                                      <a href={photo.url || photo.image_url} target="_blank" rel="noreferrer">
                                        <img src={photo.url || photo.image_url} alt="Checkpoint proof" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                                      </a>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {cp.target_date && (
                              <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.16em] text-[#7A736A] font-semibold border-t border-[rgba(26,22,18,0.06)] pt-4 mt-2">
                                <Clock className="w-3 h-3" />
                                <span>Target Date: {new Date(cp.target_date).toLocaleDateString()}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* 4. FIELD REPORTS TAB */}
            {activeTab === "updates" && (
              <div className="space-y-8">
                {summary?.counts?.field_reports > 0 && (
                  <div className="bg-[#1A1612] text-white rounded-3xl p-8 relative overflow-hidden shadow-lg">
                    <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-20 bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-[#C4A35A] to-transparent pointer-events-none" />
                    <span className="text-[9px] uppercase tracking-[0.2em] font-semibold text-[#C4A35A] block mb-2">Impact Generation</span>
                    <span className="font-serif text-5xl font-semibold leading-none block mb-2 num-tabular">
                      +{reports.reduce((acc, r) => acc + (r.people_served_delta || 0), 0).toLocaleString()}
                    </span>
                    <span className="text-[11px] uppercase tracking-[0.14em] text-[#7A736A] font-semibold">Verified ground beneficiaries</span>
                  </div>
                )}

                {reports.length === 0 ? (
                  <div className="py-14 border border-dashed border-[rgba(26,22,18,0.15)] rounded-2xl text-center bg-white/40">
                    <TrendingUp className="w-8 h-8 text-[#7A736A]/50 mx-auto mb-3" />
                    <p className="text-sm text-[#7A736A] font-medium">No direct field reports submitted by operators yet.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {reports.map((rep) => (
                      <div key={rep.id} className="border border-[rgba(26,22,18,0.08)] rounded-2xl p-6 sm:p-8 bg-white/60 shadow-sm hover:border-[rgba(26,22,18,0.15)] transition-colors">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-5">
                          <div>
                            <h4 className="font-serif text-xl font-semibold text-[#1A1612] leading-tight mb-2">{rep.title}</h4>
                            <span className="text-[10px] uppercase tracking-[0.16em] text-[#7A736A] font-semibold block">
                              Type: {rep.report_type} • Authored by {rep.author_name || "Head of Operations"}
                            </span>
                          </div>
                          {rep.people_served_delta > 0 && (
                            <span className="text-[10px] font-semibold uppercase tracking-[0.14em] px-3 py-1.5 rounded-full bg-[#064E3B]/10 text-[#064E3B] border border-[#064E3B]/20 shrink-0 self-start">
                              +{rep.people_served_delta} Served
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-[#3D3832] leading-relaxed font-normal whitespace-pre-wrap mb-5">{rep.body}</p>
                        <span className="text-[10px] uppercase tracking-[0.16em] text-[#7A736A] font-semibold block pt-5 border-t border-[rgba(26,22,18,0.06)]">
                          Logged: {new Date(rep.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 6. Live Photo Gallery Feed (DURING/AFTER) */}
        {duringPhotos.length > 0 && (
          <div className="mt-8">
            <div className="flex items-center gap-3 mb-6 px-2">
              <Camera className="w-5 h-5 text-[#C4A35A]" />
              <div>
                <h2 className="font-serif text-2xl font-semibold text-[#1A1612]">Live Field Gallery</h2>
                <p className="text-[10px] font-semibold text-[#7A736A] uppercase tracking-[0.16em] mt-1">Unfiltered ground visual stream</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {duringPhotos.map((photo) => (
                <div key={photo.id} className="relative aspect-square rounded-2xl overflow-hidden border border-[rgba(26,22,18,0.08)] group bg-[#EFEBE4]/50 shadow-sm">
                  <a href={photo.url || photo.image_url} target="_blank" rel="noreferrer">
                    <img
                      src={photo.url || photo.image_url}
                      alt={photo.caption || "Deployment photo"}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                    />
                  </a>
                  {photo.caption && (
                    <div className="absolute inset-x-0 bottom-0 bg-[#1A1612]/80 backdrop-blur-md p-3">
                      <p className="text-[10px] text-white/90 font-medium truncate">{photo.caption}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {showPayment && (
        <PaymentWall
          missionId={missionId}
          missionTitle={mission.title}
          recipientCountry={mission.target_country}
          onClose={() => setShowPayment(false)}
        />
      )}
    </div>
  );
}