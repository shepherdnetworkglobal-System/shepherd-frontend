"use client";

import React from "react";
import { FileSpreadsheet, ShieldCheck } from "lucide-react";
import Navbar from "@/components/Navbar";
import TransparencyFeed from "@/components/TransparencyFeed";

export default function TransparencyPage() {
  return (
    <div className="min-h-screen bg-gray-50/50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <div className="mb-10">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">
            Public Accounting Layer
          </span>
          <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mt-1 tracking-tight">
            Live Transparency Ledger
          </h1>
          <p className="text-gray-500 mt-2 max-w-xl">
            Every dollar in. Every receipt out. Verified on the Stellar blockchain and open for public audit.
          </p>
        </div>

        <TransparencyFeed missionId={1} />
      </div>
    </div>
  );
}