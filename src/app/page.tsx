"use client";

import React, { useState } from "react";
import { ShieldCheck, Heart, UserCheck, FileSpreadsheet } from "lucide-react";
import PaymentWall from "@/components/PaymentWall";
import VerificationFlow from "@/components/VerificationFlow";
import TransparencyFeed from "@/components/TransparencyFeed";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"donor" | "missionary" | "transparency">("donor");

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      {/* Top Header */}
      <header className="bg-white border-b border-gray-200 py-4 px-8 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-blue-600" />
            <span className="font-bold text-lg tracking-tight">The Shepherd&apos;s Network</span>
          </div>

          <div className="flex bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab("donor")}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-semibold transition ${
                activeTab === "donor"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Heart className="w-4 h-4" /> Give to Mission
            </button>
            <button
              onClick={() => setActiveTab("transparency")}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-semibold transition ${
                activeTab === "transparency"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" /> Transparency Ledger
            </button>
            <button
              onClick={() => setActiveTab("missionary")}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-semibold transition ${
                activeTab === "missionary"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <UserCheck className="w-4 h-4" /> Missionary Vetting
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="max-w-6xl mx-auto px-8 py-10">
        {activeTab === "donor" && (
          <div>
            <div className="text-center max-w-xl mx-auto mb-10">
              <span className="text-xs font-bold text-blue-600 tracking-wider uppercase mb-2 block">
                Non-Custodial Giving Portal
              </span>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                Direct-to-Field Humanitarian Aid
              </h1>
              <p className="text-sm text-gray-500 mt-2">
                Giving settled directly onto the Stellar Network. 0% custodial hold, instant transparent verification.
              </p>
            </div>

            <PaymentWall
              missionId={1}
              missionTitle="Clean Water Initiative — Turkana, Kenya 🇰🇪"
              recipientCountry="Kenya"
            />
          </div>
        )}

        {activeTab === "transparency" && (
          <div>
            <div className="text-center max-w-xl mx-auto mb-10">
              <span className="text-xs font-bold text-blue-600 tracking-wider uppercase mb-2 block">
                Public Accounting Layer
              </span>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                Live Field Transparency Feed
              </h1>
              <p className="text-sm text-gray-500 mt-2">
                Removing the cloak: Every dollar received on Stellar mapped directly to verified field receipts and impact.
              </p>
            </div>

            <TransparencyFeed missionId={1} />
          </div>
        )}

        {activeTab === "missionary" && (
          <div>
            <div className="text-center max-w-xl mx-auto mb-10">
              <span className="text-xs font-bold text-blue-600 tracking-wider uppercase mb-2 block">
                Verification Pipeline
              </span>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                Missionary Onboarding & Vetting
              </h1>
              <p className="text-sm text-gray-500 mt-2">
                Submit identification, organizational authorization, and receiving rails for admin audit.
              </p>
            </div>

            <VerificationFlow />
          </div>
        )}
      </div>
    </main>
  );
}