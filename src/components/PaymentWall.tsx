"use client";

import React, { useState } from "react";
import { CreditCard, Wallet, CheckCircle2, ShieldCheck, ArrowRight, Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/api";
import { connectWallet, sendTestnetPayment, DEFAULT_PLATFORM_RECIPIENT } from "@/lib/stellarWallet";

interface PaymentWallProps {
  missionId: number;
  missionTitle: string;
  recipientCountry: string;
}

export default function PaymentWall({ missionId, missionTitle, recipientCountry }: PaymentWallProps) {
  const [amount, setAmount] = useState("50");
  const [assetType, setAssetType] = useState<"USDC" | "XLM">("USDC");
  const [method, setMethod] = useState<"card" | "wallet">("card");
  const [donorEmail, setDonorEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState("");
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleProcessDonation = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. Create Pending Donation Record
      const donation = await apiRequest("/api/donations/create", {
        method: "POST",
        body: JSON.stringify({
          mission_id: missionId,
          donor_email: donorEmail,
          amount_usd: parseFloat(amount),
          asset_type: assetType,
        }),
      });

      if (method === "card") {
        // Direct to MoonPay / On-ramp Flow (Non-Custodial)
        alert(
          `Redirecting to MoonPay On-Ramp for $${amount} USD settlement directly into the missionary's verified ${recipientCountry} Stellar account.`
        );
      } else {
        // Real Stellar Wallet Signing via Freighter (Testnet)
        const senderPublicKey = await connectWallet();
        
        const { hash } = await sendTestnetPayment({
          senderPublicKey,
          recipientPublicKey: DEFAULT_PLATFORM_RECIPIENT,
          amount,
          memoText: `DONATION #${donation.id}`,
        });

        // 2. Verify real on-chain hash with backend
        await apiRequest("/api/donations/verify-onchain", {
          method: "POST",
          body: JSON.stringify({
            donation_id: donation.id,
            stellar_tx_hash: hash,
          }),
        });

        setTxHash(hash);
        setCompleted(true);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Payment processing failed");
      }
    } finally {
      setLoading(false);
    }
  };

  if (completed) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-xl shadow-slate-200/50 text-center max-w-lg mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto mb-5">
          <CheckCircle2 className="w-8 h-8 text-emerald-600" />
        </div>
        <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Donation Settled</h3>
        <p className="text-sm text-slate-600 font-medium mt-2 mb-6 leading-relaxed">
          Your gift of <span className="font-bold text-slate-900 num-tabular">${amount} {assetType}</span> has settled on-chain to <strong className="text-slate-900">{missionTitle}</strong>.
        </p>
        <div className="bg-slate-50 p-4 rounded-xl text-left text-xs font-mono text-slate-700 break-all border border-slate-200 mb-6">
          <span className="font-bold uppercase tracking-wider text-[10px] text-slate-500 block mb-1.5">Stellar Transaction Hash</span>
          {txHash}
        </div>
        <button
          onClick={() => {
            setCompleted(false);
            setTxHash("");
          }}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3.5 rounded-xl text-xs uppercase tracking-wider font-bold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.01] active:scale-[0.99] transition-all"
        >
          Make Another Donation
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-xl shadow-slate-200/50 max-w-lg mx-auto">
      <div className="flex items-start justify-between pb-6 border-b border-slate-100 mb-6 gap-4">
        <div>
          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Direct Mission Giving</span>
          <h2 className="text-lg font-extrabold text-slate-900 tracking-tight mt-1 leading-snug">{missionTitle}</h2>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-md font-bold border border-emerald-200 shrink-0">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Non-Custodial
        </div>
      </div>

      {error && (
        <div className="mb-5 p-3.5 bg-red-50 text-red-700 rounded-xl text-xs font-semibold border border-red-200">
          {error}
        </div>
      )}

      <form onSubmit={handleProcessDonation} className="space-y-5">
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2.5">
            Select Amount (USD)
          </label>
          <div className="grid grid-cols-4 gap-2.5">
            {["25", "50", "100", "250"].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setAmount(preset)}
                className={`py-2.5 text-sm font-bold rounded-xl border transition-all ${
                  amount === preset
                    ? "border-blue-600 bg-blue-50 text-blue-700 shadow-sm"
                    : "border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300"
                }`}
              >
                ${preset}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
            Donor Email (On-Chain Receipt)
          </label>
          <input
            type="email"
            value={donorEmail}
            onChange={(e) => setDonorEmail(e.target.value)}
            placeholder="donor@example.com"
            className="w-full border border-slate-200 rounded-xl p-3 text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm"
            required
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2.5">
            Payment Rail
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setMethod("card")}
              className={`p-4 text-left rounded-xl border flex flex-col gap-1.5 transition-all ${
                method === "card"
                  ? "border-blue-600 bg-blue-50/80 shadow-sm"
                  : "border-slate-200 hover:bg-slate-50 hover:border-slate-300"
              }`}
            >
              <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
                <CreditCard className={`w-4 h-4 ${method === "card" ? "text-blue-600" : "text-slate-400"}`} /> Card / Bank
              </div>
              <span className="text-[11px] text-slate-500 font-medium">Auto-converts to USDC</span>
            </button>

            <button
              type="button"
              onClick={() => setMethod("wallet")}
              className={`p-4 text-left rounded-xl border flex flex-col gap-1.5 transition-all ${
                method === "wallet"
                  ? "border-blue-600 bg-blue-50/80 shadow-sm"
                  : "border-slate-200 hover:bg-slate-50 hover:border-slate-300"
              }`}
            >
              <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
                <Wallet className={`w-4 h-4 ${method === "wallet" ? "text-blue-600" : "text-slate-400"}`} /> Stellar Wallet
              </div>
              <span className="text-[11px] text-slate-500 font-medium">Freighter / Lobstr</span>
            </button>
          </div>
        </div>

        {method === "wallet" && (
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
              Asset Type
            </label>
            <div className="flex gap-5">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 cursor-pointer">
                <input
                  type="radio"
                  name="asset"
                  checked={assetType === "USDC"}
                  onChange={() => setAssetType("USDC")}
                  className="accent-blue-600"
                />
                USDC (Stablecoin)
              </label>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 cursor-pointer">
                <input
                  type="radio"
                  name="asset"
                  checked={assetType === "XLM"}
                  onChange={() => setAssetType("XLM")}
                  className="accent-blue-600"
                />
                XLM (Native)
              </label>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-3.5 rounded-xl hover:shadow-lg hover:shadow-blue-500/30 text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70 disabled:hover:scale-100"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              Confirm & Donate ${amount} <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}