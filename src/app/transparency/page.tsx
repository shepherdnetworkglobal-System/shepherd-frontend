"use client";

import React from "react";
import { Activity } from "lucide-react";
import Navbar from "@/components/Navbar";
import TransparencyFeed from "@/components/TransparencyFeed";

export default function TransparencyPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-blue-200/50">
      <Navbar />

      {/* Ambient glows */}
      <div className="absolute top-24 right-[10%] w-[500px] h-[500px] glow-blue rounded-full pointer-events-none -z-10" />
      <div className="absolute top-[60%] left-[5%] w-[600px] h-[600px] glow-emerald rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-14 lg:py-20">
        {/* Page Header */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm mb-4">
            <Activity className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-[10px] uppercase tracking-widest font-bold text-slate-600">
              Public Audit Channels
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
            Live Transparency <span className="text-blue-600">Ledger</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-600 mt-3 max-w-xl font-medium leading-relaxed">
            Every dollar in. Every receipt out. Verified on the Stellar blockchain and open for public audit.
          </p>
        </div>

        {/* Audit Wrapper panel */}
        <div className="relative rounded-2xl bg-white border border-slate-200/80 p-1 shadow-sm">
          <div className="rounded-xl overflow-hidden bg-white p-6 lg:p-8">
            <TransparencyFeed missionId={1} />
          </div>
        </div>
      </div>
    </div>
  );
}