"use client";

import React from "react";
import { Activity } from "lucide-react";
import Navbar from "@/components/Navbar";
import TransparencyFeed from "@/components/TransparencyFeed";

export default function TransparencyPage() {
  return (
    <div className="min-h-screen bg-[#0C0E0D] text-[#E6DED3] selection:bg-[#8FA68E]/30 selection:text-white">
      <Navbar />

      {/* Atmospheric glowing background blurs */}
      <div className="absolute top-24 right-[10%] w-[500px] h-[500px] glow-sage rounded-full pointer-events-none -z-10" />
      <div className="absolute top-[60%] left-[5%] w-[600px] h-[600px] glow-clay rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-14 lg:py-20">
        {/* Page Header */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.07] mb-4">
            <Activity className="w-3.5 h-3.5 text-[#C08A6A]" />
            <span className="text-[10px] uppercase tracking-widest font-semibold text-[#9A9690]">
              Public Audit Channels
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-light text-[#E6DED3] tracking-tight">
            Live Transparency <span className="font-semibold italic text-[#8FA68E]">Ledger</span>
          </h1>
          <p className="text-sm text-[#9A9690] mt-3 max-w-xl font-light leading-relaxed">
            Cryptographic settlement verified on the Stellar blockchain. Cross-reference donor inputs directly with itemized field operator expenditures.
          </p>
        </div>

        {/* Audit Wrapper panel */}
        <div className="relative rounded-2xl bg-white/[0.01] border border-white/[0.06] p-1 shadow-[0_12px_40px_rgba(0,0,0,0.25)]">
          <div className="rounded-xl overflow-hidden bg-[#151917]/25 backdrop-blur-2xl p-6 lg:p-8">
            <TransparencyFeed missionId={1} />
          </div>
        </div>
      </div>
    </div>
  );
}