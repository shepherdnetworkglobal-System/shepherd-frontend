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
      <div className="min-h-screen bg-gray-50/50">
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      </div>
    );
  }

  if (!mission) {
    return (
      <div className="min-h-screen bg-gray-50/50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-6 py-20 text-center">
          <h2 className="text-2xl font-bold text-gray-900">Mission Not Found</h2>
          <Link href="/missions" className="text-blue-600 text-sm font-semibold mt-4 inline-block">
            Back to Missions
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
    <div className="min-h-screen bg-gray-50/50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10">
        {/* Breadcrumb */}
        <Link
          href="/missions"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 font-medium mb-6 transition"
        >
          <ArrowLeft className="w-4 h-4" /> All Missions
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content (2 cols) */}
          <div className="lg:col-span-2 space-y-8">
            {/* Mission Header Card */}
            <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
              <div className="p-8">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">{flag}</span>
                  <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                    {mission.target_country}
                  </span>
                  <span
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                      mission.status === "ACTIVE"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-blue-50 text-blue-700 border border-blue-200"
                    }`}
                  >
                    {mission.status}
                  </span>
                </div>

                <h1 className="text-2xl lg:text-3xl font-extrabold text-gray-900 tracking-tight mb-4">
                  {mission.title}
                </h1>

                <p className="text-gray-600 leading-relaxed mb-8">{mission.description}</p>

                {/* Progress */}
                <div className="bg-gray-50 rounded-xl p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-2xl font-extrabold text-gray-900">
                        ${Number(mission.raised_amount_usd).toLocaleString()}
                      </span>
                      <span className="text-gray-400 font-medium ml-1">
                        of ${Number(mission.goal_amount_usd).toLocaleString()}
                      </span>
                    </div>
                    <span className="text-lg font-extrabold text-blue-600">
                      {progress.toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-1000"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Transparency Section */}
            <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Transparency Ledger</h2>
                  <p className="text-xs text-gray-500">Verified field expenditures</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                  <DollarSign className="w-4 h-4 text-emerald-600 mb-1" />
                  <span className="text-xl font-extrabold text-gray-900 block">
                    ${totalSpent.toLocaleString()}
                  </span>
                  <span className="text-xs text-emerald-600 font-medium">Verified Spent</span>
                </div>
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                  <TrendingUp className="w-4 h-4 text-blue-600 mb-1" />
                  <span className="text-xl font-extrabold text-gray-900 block">
                    ${(Number(mission.raised_amount_usd) - totalSpent).toLocaleString()}
                  </span>
                  <span className="text-xs text-blue-600 font-medium">Unallocated</span>
                </div>
              </div>

              {receipts.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-6">
                  No field receipts uploaded yet. Check back soon.
                </p>
              ) : (
                <div className="divide-y divide-gray-100">
                  {receipts.map((r) => (
                    <div key={r.id} className="py-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Receipt className="w-4 h-4 text-gray-400" />
                        <div>
                          <span className="text-sm font-semibold text-gray-900">{r.title}</span>
                          <span className="text-xs text-gray-400 block">
                            {r.category} {r.vendor_name ? `• ${r.vendor_name}` : ""}
                          </span>
                        </div>
                      </div>
                      <span className="text-sm font-bold text-gray-900">
                        ${Number(r.amount_spent_usd).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar (1 col) */}
          <div className="space-y-6">
            {/* Donate Card */}
            <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-6 sticky top-24">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Support This Mission</h3>
              <p className="text-sm text-gray-500 mb-6">
                100% of your gift settles directly to the field via Stellar.
              </p>

              <button
                onClick={() => setShowPayment(true)}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all flex items-center justify-center gap-2"
              >
                <Heart className="w-4 h-4" /> Give Now
              </button>

              <div className="mt-6 space-y-3">
                {[
                  { icon: ShieldCheck, text: "Verified Missionary" },
                  { icon: Wallet, text: "Stellar USDC Settlement" },
                  { icon: FileText, text: "Public Receipt Tracking" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-xs text-gray-500">
                    <item.icon className="w-4 h-4 text-emerald-500" />
                    {item.text}
                  </div>
                ))}
              </div>
            </div>

            {/* Missionary Card */}
            <Link
              href={`/missionaries/${mission.missionary_id}`}
              className="block bg-white rounded-2xl border border-gray-200/80 shadow-sm p-6 hover:shadow-lg hover:border-blue-200 transition-all group"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                  J
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 group-hover:text-blue-700 transition">
                    View Missionary Profile
                  </h3>
                  <span className="text-xs text-gray-500">Biography, portfolio & track record</span>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 ml-auto transition" />
              </div>
              <div className="flex items-center gap-2 text-xs text-emerald-600 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" /> Verified Missionary
              </div>
            </Link>

            {/* Mission Info Card */}
            <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-6 space-y-4">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                Mission Details
              </h3>
              {[
                { icon: MapPin, label: "Location", value: mission.target_country },
                {
                  icon: Calendar,
                  label: "Created",
                  value: new Date(mission.created_at).toLocaleDateString(),
                },
                { icon: DollarSign, label: "Goal", value: `$${Number(mission.goal_amount_usd).toLocaleString()}` },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <item.icon className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-500 w-20">{item.label}</span>
                  <span className="font-semibold text-gray-900">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="relative max-w-lg w-full">
            <button
              onClick={() => setShowPayment(false)}
              className="absolute -top-10 right-0 text-white/80 hover:text-white text-sm font-semibold"
            >
              Close
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