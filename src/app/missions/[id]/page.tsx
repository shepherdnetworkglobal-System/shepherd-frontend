"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  ShieldCheck,
  MapPin,
  DollarSign,
  Users,
  Calendar,
  ArrowLeft,
  Heart,
  CreditCard,
  Wallet,
  CheckCircle2,
  Loader2,
  ArrowRight,
  Receipt,
  FileText,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import PaymentWall from "@/components/PaymentWall";
import { apiRequest } from "@/lib/api";

interface Mission {
  id: number;
  missionary_id: number;
  title: string;
  description: string;
  target_country: string;
  goal_amount_usd: number;
  raised_amount_usd: number;
  status: string;
  created_at: string;
}

interface Receipt {
  id: number;
  title: string;
  amount_spent_usd: number;
  category: string;
  vendor_name: string | null;
  created_at: string;
}

const COUNTRY_FLAGS: Record<string, string> = {
  Kenya: "🇰🇪",
  Philippines: "🇵🇭",
  Nigeria: "🇳🇬",
  Pakistan: "🇵🇰",
};

export default function MissionDetailPage() {
  const params = useParams();
  const missionId = Number(params.id);

  const [mission, setMission] = useState<Mission | null>(null);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [showPayment, setShowPayment] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [mData, rData] = await Promise.all([
          apiRequest(`/api/missions/${missionId}`),
          apiRequest(`/api/accountability/feed/${missionId}`).catch(() => ({ receipts: [] })),
        ]);
        setMission(mData);
        setReceipts(rData.receipts || []);
      } catch {
        setMission(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [missionId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0C0E0D] text-[#E6DED3]">
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-8 h-8 text-[#8FA68E] animate-spin" />
        </div>
      </div>
    );
  }

  if (!mission) {
    return (
      <div className="min-h-screen bg-[#0C0E0D] text-[#E6DED3]">
        <Navbar />
        <div className="max-w-7xl mx-auto px-6 py-20 text-center">
          <h2 className="text-xl font-light text-[#E6DED3]">Mission Pipeline Not Found</h2>
          <Link href="/missions" className="text-xs uppercase tracking-wider font-semibold text-[#8FA68E] mt-4 inline-block">
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
  const flag = COUNTRY_FLAGS[mission.target_country] || "🌍";

  return (
    <div className="min-h-screen bg-[#0C0E0D] text-[#E6DED3] selection:bg-[#8FA68E]/30 selection:text-white">
      <Navbar />

      {/* Atmospheric glowing backdrop vectors */}
      <div className="absolute top-24 left-[10%] w-[500px] h-[500px] glow-sage rounded-full pointer-events-none -z-10" />
      <div className="absolute top-1/2 right-[5%] w-[600px] h-[600px] glow-clay rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10">
        {/* Navigation Breadcrumb */}
        <Link
          href="/missions"
          className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-[#9A9690] hover:text-[#E6DED3] font-semibold mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> <span>Back to Active Fields</span>
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Primary Campaign Header Card */}
            <div className="relative rounded-2xl bg-white/[0.015] border border-white/[0.07] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.03),0_8px_32px_rgba(0,0,0,0.15)] overflow-hidden">
              <div className="h-[2px] w-full bg-gradient-to-r from-[#8FA68E] via-[#B8C7B7] to-[#C08A6A]" />
              <div className="p-8">
                <div className="flex flex-wrap items-center gap-3 mb-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.07]">
                    <span className="text-base leading-none">{flag}</span>
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-[#9A9690]">
                      {mission.target_country} Region
                    </span>
                  </div>
                  <span
                    className={`text-[9px] uppercase tracking-widest font-bold px-2.5 py-1.5 rounded-md border ${
                      mission.status === "ACTIVE"
                        ? "bg-[#8FA68E]/10 text-[#8FA68E] border-[#8FA68E]/20"
                        : "bg-[#C08A6A]/10 text-[#C08A6A] border-[#C08A6A]/20"
                    }`}
                  >
                    {mission.status}
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-light text-[#E6DED3] tracking-tight leading-tight mb-5">
                  {mission.title}
                </h1>

                <p className="text-sm text-[#9A9690] leading-relaxed font-light mb-8 whitespace-pre-wrap">
                  {mission.description}
                </p>

                {/* Progress Visualizer Grid */}
                <div className="bg-white/[0.01] border border-white/[0.05] rounded-xl p-6 space-y-4">
                  <div className="flex items-end justify-between">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider font-semibold text-[#9A9690] block mb-1">
                        Sovereign Allocation Reached
                      </span>
                      <span className="text-2xl sm:text-3xl font-semibold text-[#E6DED3] num-tabular">
                        ${Number(mission.raised_amount_usd).toLocaleString()}
                      </span>
                      <span className="text-xs text-[#9A9690] font-light ml-1.5">
                        of ${Number(mission.goal_amount_usd).toLocaleString()} Cap
                      </span>
                    </div>
                    <span className="text-xl font-semibold text-[#8FA68E] num-tabular">
                      {progress.toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#8FA68E] to-[#C08A6A] rounded-full transition-all duration-1000"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Cryptographic Accountability Section */}
            <div className="rounded-2xl bg-white/[0.015] border border-white/[0.07] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.03),0_8px_32px_rgba(0,0,0,0.15)] p-8">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-10 h-10 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-center">
                  <FileText className="w-5 h-5 text-[#8FA68E]" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-[#E6DED3]">Transparency Ledger</h2>
                  <p className="text-xs text-[#9A9690]">Verified field operator transactions</p>
                </div>
              </div>

              {/* Financial Breakdown Cells */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-[#8FA68E]/5 border border-[#8FA68E]/10 rounded-xl p-5">
                  <DollarSign className="w-4 h-4 text-[#8FA68E] mb-2" />
                  <span className="text-2xl font-semibold text-[#E6DED3] block num-tabular">
                    ${totalSpent.toLocaleString()}
                  </span>
                  <span className="text-[10px] uppercase tracking-wider text-[#9A9690] font-medium block mt-1">Verified Expenditures</span>
                </div>
                <div className="bg-[#C08A6A]/5 border border-[#C08A6A]/10 rounded-xl p-5">
                  <TrendingUp className="w-4 h-4 text-[#C08A6A] mb-2" />
                  <span className="text-2xl font-semibold text-[#E6DED3] block num-tabular">
                    ${Math.max(0, Number(mission.raised_amount_usd) - totalSpent).toLocaleString()}
                  </span>
                  <span className="text-[10px] uppercase tracking-wider text-[#9A9690] font-medium block mt-1">Pending Field Allocations</span>
                </div>
              </div>

              {/* Itemized Receipts */}
              {receipts.length === 0 ? (
                <div className="py-12 border border-dashed border-white/[0.06] rounded-xl text-center">
                  <Receipt className="w-8 h-8 text-[#9A9690]/40 mx-auto mb-3" />
                  <p className="text-xs text-[#9A9690] font-light">
                    No field receipts uploaded to this deployment rail yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-3.5">
                  {receipts.map((r) => (
                    <div key={r.id} className="p-4 rounded-xl bg-white/[0.01] border border-white/[0.05] flex items-center justify-between">
                      <div className="flex items-center gap-3.5">
                        <div className="w-8 h-8 rounded-lg bg-white/[0.02] border border-white/[0.06] flex items-center justify-center">
                          <Receipt className="w-4 h-4 text-[#9A9690]" />
                        </div>
                        <div>
                          <span className="text-xs font-semibold text-[#E6DED3] block tracking-wide">{r.title}</span>
                          <span className="text-[10px] text-[#9A9690] block mt-0.5 font-light">
                            {r.category} {r.vendor_name ? `• ${r.vendor_name}` : ""}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-[#8FA68E] num-tabular">
                        ${Number(r.amount_spent_usd).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column / Sidebar */}
          <div className="space-y-6">
            {/* support Portal Card */}
            <div className="rounded-2xl bg-white/[0.015] border border-white/[0.07] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.03),0_8px_32px_rgba(0,0,0,0.15)] p-6 sticky top-24">
              <h3 className="text-base font-semibold text-[#E6DED3] mb-2">Fund This Deployment</h3>
              <p className="text-xs text-[#9A9690] font-light leading-relaxed mb-6">
                100% of your gift settles instantly on-chain. Shepherd maintains a strict zero-custody routing configuration.
              </p>

              <button
                onClick={() => setShowPayment(true)}
                className="w-full group inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#C08A6A] to-[#D9A487] text-[#0C0E0D] text-xs uppercase tracking-wider font-bold py-4 rounded-xl shadow-[0_0_25px_rgba(192,138,106,0.15)] hover:shadow-[0_0_35px_rgba(192,138,106,0.35)] hover:scale-[1.01] active:scale-[0.99] transition-all duration-200"
              >
                <Heart className="w-3.5 h-3.5 fill-[#0C0E0D]" />
                <span>Deploy Support</span>
              </button>

              <div className="mt-8 pt-6 border-t border-white/[0.05] space-y-3.5">
                {[
                  { icon: ShieldCheck, text: "Verified Mission Operator" },
                  { icon: Wallet, text: "Direct Stellar USDC settlement" },
                  { icon: FileText, text: "Verified Cryptographic Ledgering" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-[10px] uppercase tracking-wider text-[#9A9690] font-medium">
                    <item.icon className="w-4 h-4 text-[#8FA68E]" />
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Operator/Missionary Profile Selector */}
            <Link
              href={`/missionaries/${mission.missionary_id}`}
              className="block rounded-2xl bg-white/[0.015] border border-white/[0.07] hover:border-[#8FA68E]/30 p-6 transition-all duration-300 group"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#1C221F] to-[#121614] border border-white/[0.1] flex items-center justify-center text-[#8FA68E] font-medium text-base shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                  M
                </div>
                <div>
                  <h3 className="text-xs uppercase tracking-wider font-semibold text-[#E6DED3] group-hover:text-white transition duration-200">
                    Sovereign Operator Profile
                  </h3>
                  <span className="text-[10px] text-[#9A9690] block mt-0.5 font-light">Biography, portfolio & credentials</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-[10px] uppercase tracking-wider font-semibold text-[#8FA68E] group-hover:text-[#B8C7B7] transition duration-200">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" /> Checked Identity
                </span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
              </div>
            </Link>

            {/* Technical Parameters Card */}
            <div className="rounded-2xl bg-white/[0.015] border border-white/[0.07] p-6 space-y-4">
              <h3 className="text-[10px] uppercase tracking-widest font-bold text-[#9A9690]">
                Deployment specifications
              </h3>
              {[
                { icon: MapPin, label: "Target Area", value: mission.target_country },
                {
                  icon: Calendar,
                  label: "Initialized",
                  value: new Date(mission.created_at).toLocaleDateString(),
                },
                { icon: DollarSign, label: "Hard Limit", value: `$${Number(mission.goal_amount_usd).toLocaleString()}` },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between text-xs py-1 border-b border-white/[0.03] last:border-0">
                  <div className="flex items-center gap-2.5 text-[#9A9690] font-light">
                    <item.icon className="w-3.5 h-3.5 text-[#9A9690]/80" />
                    <span>{item.label}</span>
                  </div>
                  <span className="font-medium text-[#E6DED3]">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Payment Overlay Modal */}
      {showPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0C0E0D]/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="relative max-w-lg w-full">
            <button
              onClick={() => setShowPayment(false)}
              className="absolute -top-11 right-0 text-xs uppercase tracking-widest font-bold text-[#9A9690] hover:text-[#E6DED3] transition"
            >
              Close Portal
            </button>
            <PaymentWall
              missionId={missionId}
              missionTitle={mission.title}
              recipientCountry={mission.target_country}
            />
          </div>
        </div>
      )}
    </div>
  );
}