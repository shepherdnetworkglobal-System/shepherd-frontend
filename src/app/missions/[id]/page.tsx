"use client";

import React, { useEffect, useState, useRef } from "react";
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
  User,
  Activity,
  X
} from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import PaymentWall from "@/components/PaymentWall";
import { apiRequest } from "@/lib/api";
import "flag-icons/css/flag-icons.min.css";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

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
  const [activeBriefModal, setActiveBriefModal] = useState<"problem" | "objectives" | "method" | null>(null);
  const [loading, setLoading] = useState(true);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

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

  // Native Mapbox Telemetry Renderer
  useEffect(() => {
    if (loading || !mission || !mapContainerRef.current) return;

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";
    if (!token) return;

    mapboxgl.accessToken = token;

    const countryFallbacks: Record<string, [number, number]> = {
      Kenya: [36.8219, -1.2921],
      Philippines: [120.9842, 14.5995],
      Nigeria: [7.4951, 9.0820],
      Pakistan: [73.0479, 33.6844],
      Uganda: [32.5825, 0.3476],
      India: [77.2090, 28.6139],
      Brazil: [-47.9292, -15.7801],
      Tanzania: [35.7516, -6.1630],
      Ghana: [-0.1869, 5.6037]
    };

    let coords: [number, number] = countryFallbacks[mission.target_country] || [36.8219, -1.2921];

    if (mission.map_location) {
      try {
        const parts = mission.map_location.split(",").map(p => parseFloat(p.trim()));
        if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
          // Mapbox standard is [longitude, latitude]
          if (Math.abs(parts[0]) <= 90 && Math.abs(parts[1]) <= 180) {
            coords = [parts[1], parts[0]];
          } else {
            coords = [parts[0], parts[1]];
          }
        }
      } catch (err) {
        console.warn("Using country default coordinates:", err);
      }
    }

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: coords,
      zoom: 6,
      attributionControl: false,
      cooperativeGestures: true
    });

    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right");

    new mapboxgl.Marker({ color: "#064E3B" })
      .setLngLat(coords)
      .addTo(map);

    map.on("load", () => {
      map.resize();
    });

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [mission, loading]);

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
      <div className="fixed top-0 left-[10%] w-[500px] h-[500px] glow-taupe rounded-full pointer-events-none -translate-y-1/2 -z-10 opacity-70" />
      <div className="fixed top-1/4 right-[-5%] w-[600px] h-[600px] glow-emerald rounded-full pointer-events-none -z-10 opacity-50" />
      <div className="fixed bottom-0 left-[20%] w-[700px] h-[700px] glow-gold rounded-full pointer-events-none translate-y-1/3 -z-10 opacity-40" />

      {/* EXPANDED TO MAX-W-7XL */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10 space-y-12">
        
        <Link
          href="/missions"
          className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.16em] text-[#7A736A] hover:text-[#1A1612] font-semibold transition-colors mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> <span>Back to Active Fields</span>
        </Link>

        {/* SECTION 1: BENTO BOX COLLAGE */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Main Left Intro Panel (Spans 8 columns) */}
          <div className="lg:col-span-8 flex flex-col justify-between rounded-3xl glass border border-[rgba(26,22,18,0.08)] bg-white/70 backdrop-blur-2xl shadow-sm p-8 lg:p-12 relative overflow-hidden">
            {/* Top Hairline */}
            <div className="absolute top-0 left-0 h-[2px] w-full bg-gradient-to-r from-[#064E3B] via-[#047857] to-[#C4A35A]" />
            
            <div className="space-y-6">
              <div className="flex flex-wrap items-center gap-3">
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

              <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-semibold text-[#1A1612] tracking-tight leading-snug">
                {mission.title}
              </h1>

              <p className="text-base lg:text-lg text-[#3D3832]/90 leading-relaxed font-normal max-w-3xl whitespace-pre-wrap">
                {mission.description}
              </p>
            </div>

            <div className="mt-12 pt-8 border-t border-[rgba(26,22,18,0.06)] grid grid-cols-1 sm:grid-cols-2 gap-8 items-center">
              <div>
                <span className="text-[10px] uppercase tracking-[0.16em] font-semibold text-[#7A736A] block mb-2">
                  Sovereign Capital Deployed
                </span>
                <div className="flex items-end gap-2 mb-3">
                  <span className="text-4xl font-semibold text-[#1A1612] num-tabular leading-none">
                    ${Number(mission.raised_amount_usd).toLocaleString()}
                  </span>
                  <span className="text-sm text-[#7A736A] font-medium mb-1">
                    / ${Number(mission.goal_amount_usd).toLocaleString()}
                  </span>
                </div>
                <div className="w-full h-2 bg-[#E3DDD3] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#064E3B] to-[#C4A35A] rounded-full transition-all duration-1000"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
              <button
                onClick={() => setShowPayment(true)}
                className="w-full group inline-flex items-center justify-center gap-2 bg-[#064E3B] text-white text-[11px] uppercase tracking-[0.14em] font-semibold py-5 px-6 rounded-2xl shadow-[0_12px_32px_-8px_rgba(6,78,59,0.35)] hover:bg-[#047857] hover:shadow-[0_16px_40px_-8px_rgba(6,78,59,0.5)] hover:-translate-y-1 active:translate-y-0 active:scale-[0.98] transition-all duration-300"
              >
                <Heart className="w-4 h-4 text-white fill-white/20" />
                <span>Fund Deployment Directly</span>
              </button>
            </div>
          </div>

          {/* Right Side Stack (Spans 4 columns) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            
            {/* Operator Card */}
            <Link
              href={`/missionaries/${mission.missionary_id}`}
              className="rounded-3xl glass bg-white/70 border border-[rgba(26,22,18,0.08)] hover:border-[#064E3B]/30 p-6 shadow-sm hover-lift transition-all duration-300 group flex items-center gap-4"
            >
              <div className="w-16 h-16 rounded-full bg-[#EFEBE4] border-2 border-white flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                {mission.missionary?.profile_photo_url ? (
                  <img src={mission.missionary.profile_photo_url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-6 h-6 text-[#064E3B]/40" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[9px] uppercase tracking-[0.16em] font-semibold text-[#7A736A] block mb-1">Lead Operator</span>
                <h3 className="font-serif text-lg font-semibold text-[#1A1612] group-hover:text-[#064E3B] transition duration-300 truncate">
                  {mission.missionary?.name || "Verified Operator"}
                </h3>
                <div className="flex items-center gap-1.5 text-[9px] uppercase tracking-[0.14em] text-[#064E3B] mt-1 font-semibold">
                  <ShieldCheck className="w-3 h-3" /> Fully Vetted
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-[#7A736A] group-hover:text-[#064E3B] group-hover:translate-x-1 transition-all shrink-0" />
            </Link>

            {/* Specs & Map Card */}
            <div className="rounded-3xl glass bg-white/70 border border-[rgba(26,22,18,0.08)] shadow-sm flex flex-col flex-1 overflow-hidden">
              <div className="h-44 bg-[#EFEBE4]/50 relative shrink-0 overflow-hidden">
                <div ref={mapContainerRef} className="absolute inset-0 w-full h-full z-0" />
                <div className="absolute top-3 left-3 z-10 bg-white/85 backdrop-blur-md border border-[rgba(26,22,18,0.08)] rounded-full px-2.5 py-1 flex items-center gap-1.5 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-[#064E3B] animate-pulse" />
                  <span className="text-[9px] uppercase tracking-[0.14em] font-semibold text-[#1A1612]">
                    Telemetry Live
                  </span>
                </div>
              </div>
              <div className="p-6 flex flex-col justify-center flex-1 space-y-4 relative z-10 bg-white/80 backdrop-blur-md">
                {[
                  { icon: MapPin, label: "Target Area", value: mission.target_country },
                  { icon: Calendar, label: "Initialized", value: new Date(mission.created_at).toLocaleDateString() },
                  { icon: DollarSign, label: "Hard Limit", value: `$${Number(mission.goal_amount_usd).toLocaleString()}` },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-xs py-2 border-b border-[rgba(26,22,18,0.04)] last:border-0 last:pb-0">
                    <div className="flex items-center gap-2.5 text-[#7A736A] font-semibold">
                      <item.icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </div>
                    <span className="font-semibold text-[#1A1612]">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* SECTION 2: END-TO-END WORKSTATION TABS */}
        <div className="pt-8">
          {/* Floating Glass Tab Bar */}
          <div className="flex justify-center mb-10">
            <div className="inline-flex items-center gap-2 p-1.5 rounded-2xl glass bg-white/60 border border-[rgba(26,22,18,0.08)] shadow-sm overflow-x-auto scrollbar-none max-w-full">
              {[
                { id: "brief", label: "Mission Brief", icon: FileText },
                { id: "budget", label: "Budget & Receipts", icon: Receipt },
                { id: "checkpoints", label: "Checkpoints", icon: CheckCircle2 },
                { id: "updates", label: "Field Reports", icon: TrendingUp },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] uppercase tracking-[0.16em] font-semibold transition-all duration-300 whitespace-nowrap ${
                    activeTab === tab.id
                      ? "bg-[#064E3B] text-white shadow-md"
                      : "text-[#7A736A] hover:text-[#1A1612] hover:bg-white/50"
                  }`}
                >
                  <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? "text-white" : "text-[#C4A35A]"}`} />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content Area */}
          <div className="rounded-3xl glass bg-white/60 border border-[rgba(26,22,18,0.08)] shadow-sm p-8 sm:p-12">
            
            {/* 1. MISSION BRIEF TAB */}
            {activeTab === "brief" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                
                {/* Problem Preview Card */}
                <section 
                  onClick={() => setActiveBriefModal("problem")}
                  className="bg-white/50 rounded-3xl p-8 border border-[rgba(26,22,18,0.04)] shadow-sm hover-lift cursor-pointer group flex flex-col relative overflow-hidden"
                >
                  <h3 className="font-serif text-xl font-semibold text-[#1A1612] mb-4 flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-[#C4A35A]" /> The Problem
                  </h3>
                  <div className="relative h-[120px] overflow-hidden">
                    <p className="text-sm text-[#3D3832]/90 leading-relaxed font-normal whitespace-pre-wrap">
                      {mission.problem_statement || "No problem statement registered on setup."}
                    </p>
                    <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-white to-transparent" />
                  </div>
                  <div className="mt-4 pt-5 border-t border-[rgba(26,22,18,0.04)] flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-[0.16em] font-semibold text-[#064E3B]">Read Full Context</span>
                    <ArrowRight className="w-4 h-4 text-[#064E3B] group-hover:translate-x-1 transition-transform" />
                  </div>
                </section>

                {/* Objectives Preview Card */}
                <section 
                  onClick={() => setActiveBriefModal("objectives")}
                  className="bg-white/50 rounded-3xl p-8 border border-[rgba(26,22,18,0.04)] shadow-sm hover-lift cursor-pointer group flex flex-col relative overflow-hidden"
                >
                  <h3 className="font-serif text-xl font-semibold text-[#1A1612] mb-4 flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#064E3B]" /> Objectives
                  </h3>
                  <div className="relative h-[120px] overflow-hidden">
                    <p className="text-sm text-[#3D3832]/90 leading-relaxed font-normal whitespace-pre-wrap">
                      {mission.mission_objectives || "No operational milestones loaded on setup."}
                    </p>
                    <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-white to-transparent" />
                  </div>
                  <div className="mt-4 pt-5 border-t border-[rgba(26,22,18,0.04)] flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-[0.16em] font-semibold text-[#064E3B]">Read Full Context</span>
                    <ArrowRight className="w-4 h-4 text-[#064E3B] group-hover:translate-x-1 transition-transform" />
                  </div>
                </section>

                {/* Implementation Preview Card */}
                <section 
                  onClick={() => setActiveBriefModal("method")}
                  className="bg-white/50 rounded-3xl p-8 border border-[rgba(26,22,18,0.04)] shadow-sm hover-lift cursor-pointer group flex flex-col relative overflow-hidden"
                >
                  <h3 className="font-serif text-xl font-semibold text-[#1A1612] mb-4 flex items-center gap-3">
                    <Layers className="w-5 h-5 text-[#7A736A]" /> Implementation
                  </h3>
                  <div className="relative h-[120px] overflow-hidden">
                    {checkpoints && checkpoints.length > 0 ? (
                      <div className="space-y-4">
                        {checkpoints.map((cp, idx) => (
                          <div key={cp.id}>
                            <h4 className="text-xs font-semibold text-[#1A1612] mb-1">Phase {idx + 1}: {cp.title}</h4>
                            <p className="text-xs text-[#3D3832]/80 line-clamp-2">{cp.description}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-[#3D3832]/90 leading-relaxed font-normal whitespace-pre-wrap">
                        {mission.proposed_process || "No process strategy described."}
                      </p>
                    )}
                    <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-white to-transparent" />
                  </div>
                  <div className="mt-4 pt-5 border-t border-[rgba(26,22,18,0.04)] flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-[0.16em] font-semibold text-[#064E3B]">View Full Strategy</span>
                    <ArrowRight className="w-4 h-4 text-[#064E3B] group-hover:translate-x-1 transition-transform" />
                  </div>
                </section>

                {/* Before Photos */}
                {beforePhotos.length > 0 && (
                  <section className="md:col-span-3 mt-4">
                    <h3 className="font-serif text-xl font-semibold text-[#1A1612] mb-6 flex items-center gap-2.5">
                      <Camera className="w-5 h-5 text-[#3D3832]" />
                      Ground Reality (Before Initiation)
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {beforePhotos.map((photo) => (
                        <div key={photo.id} className="relative rounded-2xl overflow-hidden border border-[rgba(26,22,18,0.08)] aspect-square group shadow-sm">
                          <img
                            src={photo.url || photo.image_url}
                            alt={photo.caption || "Deployment Before image"}
                            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                          />
                          {photo.caption && (
                            <div className="absolute inset-x-0 bottom-0 bg-[#1A1612]/80 backdrop-blur-md p-3">
                              <p className="text-[10px] text-white/90 font-medium truncate">{photo.caption}</p>
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
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  
                  {/* Summary Cards */}
                  <div className="lg:col-span-4 space-y-5">
                    <div className="bg-[#064E3B]/5 border border-[#064E3B]/10 rounded-2xl p-8 hover-lift">
                      <span className="text-4xl font-semibold text-[#064E3B] num-tabular block mb-1">${totalSpent.toLocaleString()}</span>
                      <span className="text-[10px] uppercase tracking-[0.16em] font-semibold text-[#064E3B]">Verified Spent on Ground</span>
                    </div>
                    <div className="bg-[#1A1612]/5 border border-[#1A1612]/10 rounded-2xl p-8 hover-lift">
                      <span className="text-4xl font-semibold text-[#1A1612] num-tabular block mb-1">${totalBudgeted.toLocaleString()}</span>
                      <span className="text-[10px] uppercase tracking-[0.16em] font-semibold text-[#7A736A]">Total Target Budget</span>
                    </div>
                  </div>

                  {/* Wide Ledger Table */}
                  <div className="lg:col-span-8">
                    <h3 className="font-serif text-2xl font-semibold text-[#1A1612] mb-6">Ledger Allocation</h3>
                    {budgetItems.length === 0 ? (
                      <p className="text-sm text-[#7A736A] font-medium">No budget breakdown is declared for this mission.</p>
                    ) : (
                      <div className="border border-[rgba(26,22,18,0.08)] rounded-2xl overflow-hidden shadow-sm overflow-x-auto bg-white/50">
                        <table className="w-full text-left border-collapse min-w-[600px]">
                          <thead>
                            <tr className="bg-[#EFEBE4]/50 border-b border-[rgba(26,22,18,0.08)] text-[9px] uppercase tracking-[0.18em] font-semibold text-[#7A736A]">
                              <th className="p-6">Line Item</th>
                              <th className="p-6 text-right">Target (USD)</th>
                              <th className="p-6 text-right">Actual Spent</th>
                              <th className="p-6 text-right">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[rgba(26,22,18,0.04)]">
                            {budgetItems.map((item) => (
                              <tr key={item.id} className="text-xs hover:bg-[#EFEBE4]/30 transition-colors">
                                <td className="p-6">
                                  <span className="font-semibold text-[#1A1612] block mb-1.5 text-sm">{item.item_name}</span>
                                  <span className="text-[9px] uppercase tracking-[0.14em] font-semibold text-[#C4A35A] block">{item.category}</span>
                                </td>
                                <td className="p-6 text-right font-semibold text-[#3D3832] num-tabular text-sm">${Number(item.total_cost_usd).toLocaleString()}</td>
                                <td className="p-6 text-right font-semibold text-[#064E3B] num-tabular text-sm">${Number(item.actual_spent_usd).toLocaleString()}</td>
                                <td className="p-6 text-right">
                                  <span className="inline-block text-[9px] uppercase tracking-[0.14em] font-semibold px-2.5 py-1.5 rounded-full bg-[#EFEBE4] text-[#3D3832]">
                                    {item.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-8 border-t border-[rgba(26,22,18,0.06)]">
                  <h3 className="font-serif text-2xl font-semibold text-[#1A1612] mb-6">Verified Field Receipts</h3>
                  {receipts.length === 0 ? (
                    <div className="py-16 border border-dashed border-[rgba(26,22,18,0.15)] rounded-2xl text-center bg-white/40">
                      <Receipt className="w-10 h-10 text-[#7A736A]/50 mx-auto mb-4" />
                      <p className="text-sm text-[#7A736A] font-medium">No verified expense receipts logged to this platform.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {receipts.map((rec) => (
                        <div key={rec.id} className="border border-[rgba(26,22,18,0.08)] bg-white/60 rounded-2xl p-6 shadow-sm flex flex-col justify-between hover-lift">
                          <div>
                            <div className="flex items-start justify-between gap-3 mb-3">
                              <h4 className="font-semibold text-base text-[#1A1612] leading-snug line-clamp-2">{rec.title}</h4>
                              <span className="text-base font-semibold text-[#064E3B] num-tabular shrink-0">${Number(rec.amount_spent_usd).toLocaleString()}</span>
                            </div>
                            <p className="text-[9px] uppercase tracking-[0.16em] text-[#7A736A] font-semibold mb-5">{rec.category} • {rec.vendor_name || "Unknown Vendor"}</p>
                            {rec.notes && <p className="text-xs text-[#3D3832] leading-relaxed mb-6 bg-[#EFEBE4]/50 p-4 rounded-xl border border-[rgba(26,22,18,0.04)]">{rec.notes}</p>}
                          </div>
                          <a
                            href={rec.receipt_image_url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.16em] font-semibold text-[#C4A35A] hover:text-[#1A1612] transition-colors"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Verify Source Document</span>
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 3. TIMELINE & CHECKPOINTS TAB (EXPANDED TO WIDE GRID) */}
            {activeTab === "checkpoints" && (
              <div className="space-y-12">
                <div className="flex items-center gap-4 bg-[#EFEBE4]/50 p-6 border border-[rgba(26,22,18,0.06)] rounded-2xl">
                  <Info className="w-6 h-6 text-[#C4A35A] shrink-0" />
                  <p className="text-sm text-[#3D3832] leading-relaxed font-medium">
                    The operational timeline tracks ground deployment via weighted phases. Photos taken during each phase are logged directly to the respective checkpoint grid.
                  </p>
                </div>

                {checkpoints.length === 0 ? (
                  <p className="text-sm text-[#7A736A] font-medium text-center py-12">No checkpoints are logged for this deployment.</p>
                ) : (
                  <div className="relative border-l-[3px] border-[rgba(26,22,18,0.08)] ml-6 pl-10 space-y-14">
                    {checkpoints.map((cp, index) => {
                      const isCompleted = cp.status === "COMPLETED";
                      const checkpointPhotos = photos.filter(p => p.checkpoint_id === cp.id);

                      return (
                        <div key={cp.id} className="relative">
                          {/* Timeline Dot */}
                          <div className={`absolute -left-[57px] top-1.5 w-8 h-8 rounded-full border-[4px] bg-[#F7F4EF] flex items-center justify-center transition-colors ${
                            isCompleted ? "border-[#064E3B]" : "border-[rgba(26,22,18,0.2)]"
                          }`}>
                            {isCompleted && <div className="w-3 h-3 rounded-full bg-[#064E3B]" />}
                          </div>

                          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                            
                            {/* Left Column: Phase Number + Badges + Detailed Context Description */}
                            <div className="lg:col-span-4 flex flex-col items-start gap-3">
                              <h4 className="font-serif text-xl font-semibold text-[#1A1612] leading-snug">Phase {index + 1}</h4>
                              <div className="flex flex-wrap gap-2">
                                <span className="text-[10px] uppercase tracking-[0.16em] font-semibold bg-[#EFEBE4] text-[#7A736A] px-3 py-1 rounded-full">
                                  Weight: {Number(cp.weight_percent).toFixed(1)}%
                                </span>
                                <span className={`text-[10px] uppercase tracking-[0.16em] font-semibold px-3 py-1 rounded-full border ${
                                  isCompleted
                                    ? "bg-[#064E3B]/10 text-[#064E3B] border-[#064E3B]/20"
                                    : cp.status === "IN_PROGRESS"
                                    ? "bg-[#C4A35A]/15 text-[#1A1612] border-[#C4A35A]/30"
                                    : "bg-transparent text-[#7A736A] border-[rgba(26,22,18,0.15)]"
                                }`}>
                                  {cp.status}
                                </span>
                              </div>

                              {/* Detailed Context Paragraph on Left */}
                              {cp.description && (
                                <p className="text-xs sm:text-sm text-[#7A736A] leading-relaxed font-normal mt-1">
                                  {cp.description}
                                </p>
                              )}

                              {cp.target_date && (
                                <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-[#7A736A] font-semibold mt-1 pt-3 border-t border-[rgba(26,22,18,0.06)] w-full">
                                  <Clock className="w-3.5 h-3.5" />
                                  <span>Target: {new Date(cp.target_date).toLocaleDateString()}</span>
                                </div>
                              )}
                            </div>

                            {/* Right Column: Definitive Phase Title Heading Above Pictures */}
                            <div className="lg:col-span-8 p-6 sm:p-8 border border-[rgba(26,22,18,0.08)] rounded-3xl bg-white/60 shadow-sm hover:border-[rgba(26,22,18,0.15)] transition-colors flex flex-col justify-center">
                              
                              {/* Definitive Phase Title Heading */}
                              <h3 className="font-serif text-lg sm:text-xl font-semibold text-[#1A1612] leading-snug mb-4">
                                {cp.title}
                              </h3>

                              {/* Phase Media Gallery */}
                              {checkpointPhotos.length > 0 ? (
                                <div className="border-t border-[rgba(26,22,18,0.06)] pt-6 mt-6">
                                  <h5 className="text-[10px] uppercase tracking-[0.16em] font-semibold text-[#C4A35A] mb-4 flex items-center gap-2">
                                    <Camera className="w-4 h-4" /> Phase Evidence Captured
                                  </h5>
                                  <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none snap-x">
                                    {checkpointPhotos.map(photo => (
                                      <div key={photo.id} className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-2xl overflow-hidden shrink-0 snap-start border border-[rgba(26,22,18,0.08)] bg-[#EFEBE4] group">
                                        <a href={photo.url || photo.image_url} target="_blank" rel="noreferrer">
                                          <img src={photo.url || photo.image_url} alt="Checkpoint proof" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                        </a>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ) : (
                                <div className="py-8 border border-dashed border-[rgba(26,22,18,0.12)] rounded-2xl flex flex-col items-center justify-center bg-white/30 mt-4">
                                  <Camera className="w-6 h-6 text-[#7A736A]/30 mb-2" />
                                  <span className="text-[10px] uppercase tracking-[0.16em] font-semibold text-[#7A736A]">Awaiting Phase Evidence</span>
                                </div>
                              )}
                            </div>
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
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
                {/* Metrics Sidebar */}
                <div className="xl:col-span-4 space-y-6">
                  {summary?.counts?.field_reports > 0 && (
                    <div className="bg-[#1A1612] text-white rounded-3xl p-10 relative overflow-hidden shadow-lg hover-lift">
                      <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-20 bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-[#C4A35A] to-transparent pointer-events-none" />
                      <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#C4A35A] block mb-3">Impact Generation</span>
                      <span className="font-serif text-6xl font-semibold leading-none block mb-3 num-tabular">
                        +{reports.reduce((acc, r) => acc + (r.people_served_delta || 0), 0).toLocaleString()}
                      </span>
                      <span className="text-xs text-[#7A736A] font-medium">Verified ground beneficiaries served to date</span>
                    </div>
                  )}
                  <div className="glass rounded-3xl border border-[rgba(26,22,18,0.08)] p-8">
                    <Activity className="w-8 h-8 text-[#064E3B] mb-4" />
                    <h3 className="font-serif text-xl font-semibold text-[#1A1612] mb-2">Immutable Dispatches</h3>
                    <p className="text-sm text-[#7A736A] leading-relaxed">
                      Reports are logged directly from field operators. Data flows in real-time, building a chronological trust layer mapping capital directly to human impact.
                    </p>
                  </div>
                </div>

                {/* Reports Feed */}
                <div className="xl:col-span-8">
                  {reports.length === 0 ? (
                    <div className="py-20 border border-dashed border-[rgba(26,22,18,0.15)] rounded-3xl text-center bg-white/40">
                      <TrendingUp className="w-12 h-12 text-[#7A736A]/50 mx-auto mb-4" />
                      <p className="text-base text-[#7A736A] font-medium">No direct field reports submitted by operators yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-8">
                      {reports.map((rep) => (
                        <div key={rep.id} className="border border-[rgba(26,22,18,0.08)] rounded-3xl p-8 sm:p-10 bg-white/60 shadow-sm hover:border-[rgba(26,22,18,0.15)] transition-colors hover-lift">
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-5 mb-6">
                            <div>
                              <h4 className="font-serif text-2xl font-semibold text-[#1A1612] leading-tight mb-2">{rep.title}</h4>
                              <span className="text-[11px] uppercase tracking-[0.16em] text-[#7A736A] font-semibold block">
                                Type: {rep.report_type} • Authored by {rep.author_name || "Head of Operations"}
                              </span>
                            </div>
                            {rep.people_served_delta > 0 && (
                              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] px-4 py-2 rounded-full bg-[#064E3B]/10 text-[#064E3B] border border-[#064E3B]/20 shrink-0 self-start">
                                +{rep.people_served_delta} Served
                              </span>
                            )}
                          </div>
                          <p className="text-base text-[#3D3832]/90 leading-relaxed font-normal whitespace-pre-wrap mb-8">{rep.body}</p>
                          <span className="text-[10px] uppercase tracking-[0.16em] text-[#7A736A] font-semibold block pt-6 border-t border-[rgba(26,22,18,0.06)]">
                            Logged: {new Date(rep.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* FLOATING LANDSCAPE DIALOGUE FOR MISSION BRIEF */}
      {activeBriefModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 lg:p-12">
          {/* Blur Backdrop */}
          <div 
            className="absolute inset-0 bg-[#1A1612]/40 backdrop-blur-sm transition-opacity" 
            onClick={() => setActiveBriefModal(null)} 
          />
          
          {/* Modal Container */}
          <div className="relative w-full max-w-5xl max-h-[85vh] flex flex-col rounded-3xl glass bg-[#F7F4EF]/95 border border-[rgba(26,22,18,0.08)] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="flex items-center justify-between p-6 sm:p-8 border-b border-[rgba(26,22,18,0.06)] bg-white/50 shrink-0">
              <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#1A1612] flex items-center gap-3">
                {activeBriefModal === "problem" && <><AlertTriangle className="w-6 h-6 text-[#C4A35A]" /> The Problem Statement</>}
                {activeBriefModal === "objectives" && <><CheckCircle2 className="w-6 h-6 text-[#064E3B]" /> Operational Objectives</>}
                {activeBriefModal === "method" && <><Layers className="w-6 h-6 text-[#7A736A]" /> Implementation Strategy</>}
              </h2>
              <button 
                onClick={() => setActiveBriefModal(null)}
                className="w-10 h-10 rounded-full bg-white border border-[rgba(26,22,18,0.08)] flex items-center justify-center text-[#7A736A] hover:text-[#1A1612] hover:bg-[#EFEBE4] transition-colors shadow-sm shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content Body */}
            <div className="p-6 sm:p-10 overflow-y-auto bg-white/40 flex-1 scrollbar-none">
              <div className="max-w-4xl mx-auto">
                {activeBriefModal === "problem" && (
                  <p className="text-base sm:text-lg text-[#3D3832] leading-relaxed font-normal whitespace-pre-wrap">
                    {mission.problem_statement || "No problem statement registered on setup."}
                  </p>
                )}
                {activeBriefModal === "objectives" && (
                  <p className="text-base sm:text-lg text-[#3D3832] leading-relaxed font-normal whitespace-pre-wrap">
                    {mission.mission_objectives || "No operational milestones loaded on setup."}
                  </p>
                )}
                {activeBriefModal === "method" && (
                  <div>
                    {checkpoints && checkpoints.length > 0 ? (
                      <div className="space-y-10">
                        {checkpoints.map((cp, idx) => (
                          <div key={cp.id} className="pb-8 border-b border-[rgba(26,22,18,0.04)] last:border-0 last:pb-0">
                            <h4 className="font-serif text-xl sm:text-2xl font-semibold text-[#1A1612] mb-3">
                              Phase {idx + 1}: {cp.title}
                            </h4>
                            {cp.description && (
                              <p className="text-base sm:text-lg text-[#3D3832]/90 leading-relaxed font-normal whitespace-pre-wrap">
                                {cp.description}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-base sm:text-lg text-[#3D3832] leading-relaxed font-normal whitespace-pre-wrap">
                        {mission.proposed_process || "No process strategy described."}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

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