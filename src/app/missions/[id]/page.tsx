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
        <div className="max-w-7xl mx-auto px-6 py-20 text-center">
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
  const flag = COUNTRY_FLAGS[mission.target_country] || "🌍";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-blue-200/50">
      <Navbar />

      {/* Atmospheric glowing backdrop vectors */}
      <div className="absolute top-24 left-[10%] w-[500px] h-[500px] glow-blue rounded-full pointer-events-none -z-10" />
      <div className="absolute top-1/2 right-[5%] w-[600px] h-[600px] glow-emerald rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10">
        {/* Navigation Breadcrumb */}
        <Link
          href="/missions"
          className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-slate-500 hover:text-slate-900 font-bold mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> <span>Back to Active Fields</span>
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Primary Campaign Header Card */}
            <div className="relative rounded-2xl bg-white border border-slate-200/80 shadow-sm overflow-hidden">
              <div className="h-[4px] w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500" />
              <div className="p-8">
                <div className="flex flex-wrap items-center gap-3 mb-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200">
                    <span className="text-base leading-none">{flag}</span>
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

                <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-medium mb-8 whitespace-pre-wrap">
                  {mission.description}
                </p>

                {/* Progress Visualizer Grid */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 space-y-4 shadow-sm">
                  <div className="flex items-end justify-between">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500 block mb-1">
                        Sovereign Allocation Reached
                      </span>
                      <span className="text-2xl sm:text-3xl font-black text-slate-900 num-tabular">
                        ${Number(mission.raised_amount_usd).toLocaleString()}
                      </span>
                      <span className="text-xs text-slate-500 font-bold ml-1.5">
                        of ${Number(mission.goal_amount_usd).toLocaleString()} Cap
                      </span>
                    </div>
                    <span className="text-xl font-black text-blue-600 num-tabular">
                      {progress.toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden shadow-inner">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-1000"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Cryptographic Accountability Section */}
            <div className="rounded-2xl bg-white border border-slate-200/80 shadow-sm p-8">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Transparency Ledger</h2>
                  <p className="text-xs font-bold text-slate-500">Verified field operator transactions</p>
                </div>
              </div>

              {/* Financial Breakdown Cells */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-5 shadow-sm">
                  <DollarSign className="w-4 h-4 text-emerald-600 mb-2" />
                  <span className="text-2xl font-black text-slate-900 block num-tabular">
                    ${totalSpent.toLocaleString()}
                  </span>
                  <span className="text-[10px] uppercase tracking-wider text-emerald-600 font-bold block mt-1">Verified Expenditures</span>
                </div>
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 shadow-sm">
                  <TrendingUp className="w-4 h-4 text-blue-600 mb-2" />
                  <span className="text-2xl font-black text-slate-900 block num-tabular">
                    ${Math.max(0, Number(mission.raised_amount_usd) - totalSpent).toLocaleString()}
                  </span>
                  <span className="text-[10px] uppercase tracking-wider text-blue-600 font-bold block mt-1">Pending Field Allocations</span>
                </div>
              </div>

              {/* Itemized Receipts */}
              {receipts.length === 0 ? (
                <div className="py-12 border border-dashed border-slate-300 rounded-xl text-center bg-slate-50">
                  <Receipt className="w-8 h-8 text-slate-400 mx-auto mb-3" />
                  <p className="text-xs text-slate-500 font-bold">
                    No field receipts uploaded to this deployment rail yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-3.5">
                  {receipts.map((r) => (
                    <div key={r.id} className="p-4 rounded-xl bg-white border border-slate-200 flex items-center justify-between hover:border-slate-300 transition-colors shadow-sm">
                      <div className="flex items-center gap-3.5">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                          <Receipt className="w-4 h-4 text-slate-500" />
                        </div>
                        <div>
                          <span className="text-sm font-bold text-slate-900 block tracking-wide">{r.title}</span>
                          <span className="text-[10px] uppercase tracking-wider text-slate-500 block mt-0.5 font-bold">
                            {r.category} {r.vendor_name ? `• ${r.vendor_name}` : ""}
                          </span>
                        </div>
                      </div>
                      <span className="text-sm font-black text-emerald-600 num-tabular">
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
            <div className="rounded-2xl bg-white border border-slate-200/80 shadow-sm p-6 sticky top-24">
              <h3 className="text-base font-bold text-slate-900 mb-2">Fund This Deployment</h3>
              <p className="text-xs text-slate-600 font-medium leading-relaxed mb-6">
                100% of your gift settles instantly on-chain. Shepherd maintains a strict zero-custody routing configuration.
              </p>

              <button
                onClick={() => setShowPayment(true)}
                className="w-full group inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs uppercase tracking-wider font-bold py-4 rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
              >
                <Heart className="w-3.5 h-3.5 fill-white" />
                <span>Deploy Support</span>
              </button>

              <div className="mt-8 pt-6 border-t border-slate-100 space-y-3.5">
                {[
                  { icon: ShieldCheck, text: "Verified Mission Operator" },
                  { icon: Wallet, text: "Direct Stellar USDC settlement" },
                  { icon: FileText, text: "Verified Cryptographic Ledgering" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                    <item.icon className="w-4 h-4 text-emerald-500" />
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Operator/Missionary Profile Selector */}
            <Link
              href={`/missionaries/${mission.missionary_id}`}
              className="block rounded-2xl bg-white border border-slate-200/80 hover:border-blue-300 p-6 shadow-sm hover:shadow-md transition-all duration-300 group"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-black text-lg shadow-inner">
                  {mission.title ? mission.title.charAt(0) : "M"}
                </div>
                <div>
                  <h3 className="text-xs uppercase tracking-wider font-bold text-slate-900 group-hover:text-blue-700 transition duration-200">
                    Sovereign Operator Profile
                  </h3>
                  <span className="text-[10px] uppercase tracking-wider text-slate-500 block mt-0.5 font-bold">Biography & credentials</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-[10px] uppercase tracking-wider font-bold text-emerald-600 group-hover:text-emerald-700 transition duration-200">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" /> Checked Identity
                </span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5 text-slate-400 group-hover:text-blue-600" />
              </div>
            </Link>

            {/* Technical Parameters Card */}
            <div className="rounded-2xl bg-white border border-slate-200/80 shadow-sm p-6 space-y-4">
              <h3 className="text-[10px] uppercase tracking-widest font-bold text-slate-400">
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
                <div key={i} className="flex items-center justify-between text-xs py-2 border-b border-slate-100 last:border-0 last:pb-0">
                  <div className="flex items-center gap-2.5 text-slate-500 font-bold">
                    <item.icon className="w-3.5 h-3.5 text-slate-400" />
                    <span>{item.label}</span>
                  </div>
                  <span className="font-bold text-slate-900">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Payment Overlay Modal */}
      {showPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="relative max-w-lg w-full">
            <button
              onClick={() => setShowPayment(false)}
              className="absolute -top-11 right-0 text-xs uppercase tracking-widest font-bold text-slate-300 hover:text-white transition"
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