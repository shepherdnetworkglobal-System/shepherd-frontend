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
  Info
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

const COUNTRY_CODES: Record<string, string> = {
  Kenya: "ke",
  Philippines: "ph",
  Nigeria: "ng",
  Pakistan: "pk",
  Uganda: "ug",
  India: "in",
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
      // Use defaults if parse fails
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

      new mapboxgl.Marker({ color: "#3b82f6" })
        .setLngLat(coords)
        .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(
          `<div class="p-2 font-sans"><h4 class="font-bold text-slate-900 text-xs">${mission.title}</h4></div>`
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
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      </div>
    );
  }

  if (!mission) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <Navbar />
        <div className="max-w-4xl mx-auto px-6 py-20 text-center">
          <h2 className="text-xl font-bold text-slate-900">Mission Pipeline Not Found</h2>
          <Link href="/missions" className="text-xs uppercase tracking-wider font-bold text-blue-600 hover:text-blue-700 mt-4 inline-block">
            Return to Active Deployments
          </Link>
        </div>
      </div>
    );
  }

  const progress =
    Number(mission.goal_amount_usd) > 0
      ? Math.min((Number(mission.raised_amount_usd) / Number(mission.goal_amount_usd)) * 100, 100)
      : 0;

  const totalSpent = receipts.reduce((sum, r) => sum + Number(r.amount_spent_usd), 0);
  const totalBudgeted = budgetItems.reduce((sum, b) => sum + Number(b.total_cost_usd), 0);

  const countryCode = COUNTRY_CODES[mission.target_country] || "un";
  const beforePhotos = photos.filter(p => p.category === "BEFORE");
  const duringPhotos = photos.filter(p => p.category === "DURING" || p.category === "AFTER");

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-blue-200/50 pb-20">
      <Navbar />

      <div className="absolute top-24 left-[10%] w-[500px] h-[500px] glow-blue rounded-full pointer-events-none -z-10" />
      <div className="absolute top-1/2 right-[5%] w-[600px] h-[600px] glow-emerald rounded-full pointer-events-none -z-10" />

      {/* Changed to max-w-4xl for single column readability */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        
        <Link
          href="/missions"
          className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-slate-500 hover:text-slate-900 font-bold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> <span>Back to Active Fields</span>
        </Link>

        {/* 1. Hero Card */}
        <div className="relative rounded-2xl bg-white border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="h-[4px] w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500" />
          <div className="p-8">
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200">
                <span className={`fi fi-${countryCode} rounded-sm text-sm`} />
                <span className="text-[10px] uppercase tracking-wider font-bold text-slate-600">
                  {mission.target_country} Region
                </span>
              </div>
              <span
                className={`text-[10px] uppercase tracking-widest font-bold px-2.5 py-1.5 rounded-md border ${
                  mission.status === "ACTIVE"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-blue-50 text-blue-700 border-blue-200"
                }`}
              >
                {mission.status}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight mb-5">
              {mission.title}
            </h1>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal mb-8 whitespace-pre-wrap">
              {mission.description}
            </p>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 space-y-4 shadow-sm">
              <div className="flex items-end justify-between">
                <div>
                  <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500 block mb-1">
                    Sovereign Allocation Reached
                  </span>
                  <span className="text-2xl sm:text-3xl font-black text-slate-900">
                    ${Number(mission.raised_amount_usd).toLocaleString()}
                  </span>
                  <span className="text-xs text-slate-500 font-bold ml-1.5">
                    of ${Number(mission.goal_amount_usd).toLocaleString()} goal cap
                  </span>
                </div>
                <span className="text-xl font-black text-blue-600">
                  {progress.toFixed(1)}%
                </span>
              </div>
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden shadow-inner">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-1000"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 2. Direct Support CTA */}
        <div className="rounded-2xl bg-white border border-slate-200/80 shadow-sm p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="w-full sm:w-2/3">
            <h3 className="text-lg font-bold text-slate-900 mb-1.5">Fund This Deployment Directly</h3>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              100% of your gift settles instantly on-chain. Shepherd handles full transparency and zero-custody routing automatically.
            </p>
            <div className="flex items-center gap-4 mt-4">
              <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                <Wallet className="w-3.5 h-3.5 text-emerald-500" /> USDC Settlement
              </div>
              <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                <FileText className="w-3.5 h-3.5 text-emerald-500" /> Cryptographic Ledger
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowPayment(true)}
            className="w-full sm:w-1/3 group inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm uppercase tracking-wider font-bold py-4 px-6 rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 whitespace-nowrap"
          >
            <Heart className="w-4 h-4 fill-white" />
            <span>Deploy Support</span>
          </button>
        </div>

        {/* 3. Sovereign Operator Profile Card */}
        <Link
          href={`/missionaries/${mission.missionary_id}`}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 rounded-2xl bg-white border border-slate-200/80 hover:border-blue-300 p-6 sm:p-8 shadow-sm hover:shadow-md transition-all duration-300 group"
        >
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-full bg-slate-100 border-2 border-slate-200 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
              {mission.missionary?.profile_photo_url ? (
                <img src={mission.missionary.profile_photo_url} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <ShieldCheck className="w-8 h-8 text-slate-400" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 group-hover:text-blue-700 transition duration-200">
                {mission.missionary?.name || "Verified Operator"}
              </h3>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">
                {mission.missionary?.organization_name || "Independent"} • {mission.missionary?.years_of_service || 0} Years Active
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-2.5">
                <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                  <ShieldCheck className="w-3.5 h-3.5" /> Fully Vetted Identity
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center text-[10px] uppercase tracking-wider font-bold text-slate-500 group-hover:text-blue-600 transition duration-200 shrink-0">
            Know More <ArrowRight className="w-4 h-4 ml-1 transition-transform duration-200 group-hover:translate-x-0.5" />
          </div>
        </Link>

        {/* 4. Tech Specs + Mapbox Split Card */}
        <div className="rounded-2xl bg-white border border-slate-200/80 shadow-sm overflow-hidden flex flex-col md:flex-row">
          <div className="p-6 sm:p-8 md:w-1/2 flex flex-col justify-center space-y-5">
            <h3 className="text-[10px] uppercase tracking-widest font-bold text-slate-400">
              Deployment specifications
            </h3>
            {[
              { icon: MapPin, label: "Target Area", value: mission.target_country },
              { icon: Calendar, label: "Initialized", value: new Date(mission.created_at).toLocaleDateString() },
              { icon: DollarSign, label: "Hard Limit", value: `$${Number(mission.goal_amount_usd).toLocaleString()}` },
              { icon: ShieldCheck, label: "Sovereign Escrow", value: "Active" },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between text-xs py-2 border-b border-slate-100 last:border-0 last:pb-0">
                <div className="flex items-center gap-2.5 text-slate-500 font-bold">
                  <item.icon className="w-4 h-4 text-slate-400" />
                  <span>{item.label}</span>
                </div>
                <span className="font-bold text-slate-900">{item.value}</span>
              </div>
            ))}
          </div>
          {mission.map_location ? (
            <div className="md:w-1/2 h-64 md:h-auto border-t md:border-t-0 md:border-l border-slate-200 bg-slate-100 relative">
              <div id="mapbox-sidebar-map" className="absolute inset-0" />
            </div>
          ) : (
            <div className="md:w-1/2 h-64 md:h-auto border-t md:border-t-0 md:border-l border-slate-200 bg-slate-50 flex items-center justify-center">
               <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Map telemetry unavailable</span>
            </div>
          )}
        </div>

        {/* 5. TAB SYSTEM WORKSPACE */}
        <div className="rounded-2xl bg-white border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="flex border-b border-slate-200 overflow-x-auto scrollbar-none bg-slate-50/50">
            {[
              { id: "brief", label: "Mission Brief", icon: FileText },
              { id: "budget", label: "Budget & Receipts", icon: Receipt },
              { id: "checkpoints", label: "Checkpoints", icon: CheckCircle2 },
              { id: "updates", label: "Field Reports", icon: TrendingUp },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex justify-center items-center gap-2 px-6 py-4 border-b-2 text-xs uppercase tracking-wider font-bold transition-all duration-200 whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-blue-600 text-blue-600 bg-white"
                    : "border-transparent text-slate-500 hover:text-slate-950 hover:bg-slate-100/50"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="p-6 sm:p-8">
            {/* 1. MISSION BRIEF TAB */}
            {activeTab === "brief" && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-xs uppercase tracking-wider font-bold text-slate-400 mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-slate-400" />
                    The Problem Statement
                  </h3>
                  <div className="bg-slate-50/70 rounded-xl p-5 border border-slate-200">
                    <p className="text-sm text-slate-700 leading-relaxed font-normal whitespace-pre-wrap">
                      {mission.problem_statement || "No problem statement registered on setup."}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-xs uppercase tracking-wider font-bold text-slate-400 mb-3 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-slate-400" />
                    Operational Objectives
                  </h3>
                  <div className="bg-slate-50/70 rounded-xl p-5 border border-slate-200">
                    <p className="text-sm text-slate-700 leading-relaxed font-normal whitespace-pre-wrap">
                      {mission.mission_objectives || "No operational milestones loaded on setup."}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-xs uppercase tracking-wider font-bold text-slate-400 mb-3 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-slate-400" />
                    Execution Method
                  </h3>
                  <div className="bg-slate-50/70 rounded-xl p-5 border border-slate-200">
                    <p className="text-sm text-slate-700 leading-relaxed font-normal whitespace-pre-wrap">
                      {mission.proposed_process || "No process strategy described."}
                    </p>
                  </div>
                </div>

                {beforePhotos.length > 0 && (
                  <div>
                    <h3 className="text-xs uppercase tracking-wider font-bold text-slate-400 mb-3 flex items-center gap-2">
                      <Camera className="w-4 h-4 text-slate-400" />
                      Initialization Context Photos (BEFORE)
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      {beforePhotos.map((photo) => (
                        <div key={photo.id} className="relative rounded-xl overflow-hidden border border-slate-200 aspect-video group">
                          <img
                            src={photo.image_url}
                            alt={photo.caption || "Deployment Before image"}
                            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                          />
                          {photo.caption && (
                            <div className="absolute inset-x-0 bottom-0 bg-slate-950/80 backdrop-blur-md p-3">
                              <p className="text-[11px] text-white/90 font-medium truncate">{photo.caption}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 2. BUDGET & RECEIPTS TAB */}
            {activeTab === "budget" && (
              <div className="space-y-8">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-5">
                    <span className="text-2xl font-black text-slate-900">${totalSpent.toLocaleString()}</span>
                    <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-600 block mt-1">Verified Spent</span>
                  </div>
                  <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-5">
                    <span className="text-2xl font-black text-slate-900">${totalBudgeted.toLocaleString()}</span>
                    <span className="text-[10px] uppercase tracking-wider font-bold text-indigo-600 block mt-1">Total Target Budget</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-xs uppercase tracking-wider font-bold text-slate-400 mb-4">Budget Line Allocation Breakdown</h3>
                  {budgetItems.length === 0 ? (
                    <p className="text-xs text-slate-500 font-bold">No budget breakdown is declared for this mission.</p>
                  ) : (
                    <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm overflow-x-auto">
                      <table className="w-full text-left border-collapse min-w-[500px]">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase tracking-wider font-bold text-slate-500">
                            <th className="p-4">Item Name</th>
                            <th className="p-4 text-right">Target (USD)</th>
                            <th className="p-4 text-right">Actual Spent</th>
                            <th className="p-4 text-right">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-150">
                          {budgetItems.map((item) => (
                            <tr key={item.id} className="text-xs hover:bg-slate-50/50">
                              <td className="p-4">
                                <span className="font-bold text-slate-900 block">{item.item_name}</span>
                                <span className="text-[9px] uppercase font-semibold text-slate-500 mt-0.5 block">{item.category}</span>
                              </td>
                              <td className="p-4 text-right font-semibold text-slate-700">${Number(item.total_cost_usd).toLocaleString()}</td>
                              <td className="p-4 text-right font-bold text-emerald-600">${Number(item.actual_spent_usd).toLocaleString()}</td>
                              <td className="p-4 text-right">
                                <span className="inline-block text-[9px] font-bold px-2 py-1 rounded bg-slate-100 text-slate-700">
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

                <div>
                  <h3 className="text-xs uppercase tracking-wider font-bold text-slate-400 mb-4">On-Chain Verified Public Receipts</h3>
                  {receipts.length === 0 ? (
                    <div className="py-12 border border-dashed border-slate-300 rounded-xl text-center bg-slate-50">
                      <Receipt className="w-8 h-8 text-slate-400 mx-auto mb-3" />
                      <p className="text-xs text-slate-500 font-bold">No verified expense receipts logged to this platform.</p>
                    </div>
                  ) : (
                    <div className="grid sm:grid-cols-2 gap-4">
                      {receipts.map((rec) => (
                        <div key={rec.id} className="border border-slate-200 bg-white rounded-xl p-4 shadow-sm flex flex-col justify-between">
                          <div>
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <h4 className="font-bold text-xs text-slate-900 leading-snug line-clamp-2">{rec.title}</h4>
                              <span className="text-xs font-black text-emerald-600 shrink-0">${Number(rec.amount_spent_usd).toLocaleString()}</span>
                            </div>
                            <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-3">{rec.category} • {rec.vendor_name || "Unknown Vendor"}</p>
                            {rec.notes && <p className="text-[11px] text-slate-600 leading-normal mb-4 bg-slate-50/50 p-2.5 rounded border border-slate-100">{rec.notes}</p>}
                          </div>
                          <a
                            href={rec.receipt_image_url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-black text-blue-600 hover:text-blue-700 transition"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>Verify Image Document</span>
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 3. TIMELINE & CHECKPOINTS TAB */}
            {activeTab === "checkpoints" && (
              <div className="space-y-8">
                <div className="flex items-center gap-2 bg-slate-50 p-4 border border-slate-200 rounded-xl">
                  <Info className="w-4 h-4 text-blue-600 shrink-0" />
                  <p className="text-[11px] text-slate-600 leading-normal font-medium">
                    The timeline of objectives displays operational weight allocations. To advance complete transparency, checkpoints map progress directly to the ground deployment.
                  </p>
                </div>

                {checkpoints.length === 0 ? (
                  <p className="text-xs text-slate-500 font-bold text-center py-10">No checkpoints are logged for this deployment.</p>
                ) : (
                  <div className="relative border-l border-slate-200 ml-4 pl-8 space-y-8">
                    {checkpoints.map((cp, idx) => {
                      const isCompleted = cp.status === "COMPLETED";
                      return (
                        <div key={cp.id} className="relative">
                          <div className={`absolute -left-[41px] top-1.5 w-6 h-6 rounded-full border-4 bg-white flex items-center justify-center transition-all ${
                            isCompleted ? "border-emerald-500" : "border-slate-300"
                          }`}>
                            {isCompleted && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                          </div>

                          <div className="p-5 border border-slate-200 rounded-xl bg-white shadow-sm hover:border-slate-300 transition-colors">
                            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                              <div className="flex items-center gap-2">
                                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900">{cp.title}</h4>
                                <span className="text-[9px] font-bold bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-200">
                                  Weight: {Number(cp.weight_percent).toFixed(1)}%
                                </span>
                              </div>
                              <span className={`text-[9px] font-black uppercase px-2 py-1 rounded border ${
                                isCompleted
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : cp.status === "IN_PROGRESS"
                                  ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                                  : "bg-slate-50 text-slate-500 border-slate-200"
                              }`}>
                                {cp.status}
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 leading-relaxed font-normal mb-3">{cp.description}</p>
                            
                            {cp.target_date && (
                              <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold">
                                <Clock className="w-3.5 h-3.5" />
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
                  <div className="bg-slate-900 text-white rounded-2xl p-6 relative overflow-hidden shadow-md">
                    <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 bg-[radial-gradient(circle_at_center,white_0%,transparent_70%)] pointer-events-none" />
                    <span className="text-[10px] uppercase tracking-widest font-black text-emerald-400 block mb-1">Impact Generation Analytics</span>
                    <span className="text-3xl font-black leading-none block">
                      +{reports.reduce((acc, r) => acc + (r.people_served_delta || 0), 0).toLocaleString()}
                    </span>
                    <span className="text-[11px] text-slate-300 mt-2 block font-medium">Verified local beneficiaries served and directly impacted on target field</span>
                  </div>
                )}

                {reports.length === 0 ? (
                  <div className="py-12 border border-dashed border-slate-300 rounded-xl text-center bg-slate-50">
                    <TrendingUp className="w-8 h-8 text-slate-400 mx-auto mb-3" />
                    <p className="text-xs text-slate-500 font-bold">No direct field reports submitted by operators yet.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {reports.map((rep) => (
                      <div key={rep.id} className="border border-slate-200 rounded-xl p-6 bg-white shadow-sm hover:border-slate-300 transition-colors">
                        <div className="flex items-start justify-between gap-3 mb-4">
                          <div>
                            <h4 className="font-extrabold text-sm text-slate-900 leading-tight mb-1">{rep.title}</h4>
                            <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">
                              Type: {rep.report_type} • Authored by {rep.author_name || "Head of Operations"}
                            </span>
                          </div>
                          {rep.people_served_delta > 0 && (
                            <span className="text-[10px] font-black uppercase px-2.5 py-1.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                              +{rep.people_served_delta} Served
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed font-normal whitespace-pre-wrap mb-4">{rep.body}</p>
                        <span className="text-[10px] text-slate-400 font-bold block mt-2">
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

        {/* 6. Live Photo Gallery Feed */}
        {duringPhotos.length > 0 && (
          <div className="rounded-2xl bg-white border border-slate-200/80 shadow-sm p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <Camera className="w-5 h-5 text-indigo-600" />
              <div>
                <h2 className="text-md font-bold text-slate-900">Live Field Operations Gallery</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Historical ground reality visual stream</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {duringPhotos.map((photo) => (
                <div key={photo.id} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 group bg-slate-50">
                  <img
                    src={photo.image_url}
                    alt={photo.caption || "Deployment photo"}
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                  />
                  {photo.caption && (
                    <div className="absolute inset-x-0 bottom-0 bg-slate-950/80 backdrop-blur-md p-2">
                      <p className="text-[9px] text-white/90 font-medium truncate">{photo.caption}</p>
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