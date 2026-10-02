"use client";

import React, { useState } from "react";
import { CreditCard, Wallet, CheckCircle2, ShieldCheck, ArrowRight, Loader2, ExternalLink, Copy, Check, Info } from "lucide-react";
import { apiRequest } from "@/lib/api";
import { connectWallet, sendTestnetPayment, DEFAULT_PLATFORM_RECIPIENT } from "@/lib/stellarWallet";

import { X } from "lucide-react";

interface PaymentWallProps {
  missionId: number;
  missionTitle: string;
  recipientCountry: string;
  onClose?: () => void;
}

export default function PaymentWall({ missionId, missionTitle, recipientCountry, onClose }: PaymentWallProps) {
  const [amount, setAmount] = useState("25");
  const [customAmount, setCustomAmount] = useState("");
  const [isCustom, setIsCustom] = useState(false);
  const [assetType, setAssetType] = useState<"USDC" | "XLM">("XLM");
  const [method, setMethod] = useState<"wallet" | "card">("wallet");
  const [donorEmail, setDonorEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [stepStatus, setStepStatus] = useState<string>("");
  const [txHash, setTxHash] = useState("");
  const [donationId, setDonationId] = useState<number | null>(null);
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const activeAmount = isCustom ? customAmount : amount;

  const handleCopyHash = () => {
    if (txHash) {
      navigator.clipboard.writeText(txHash);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleProcessDonation = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const numericAmount = parseFloat(activeAmount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setError("Please enter a valid donation amount greater than 0.");
      setLoading(false);
      return;
    }

    try {
      if (method === "card") {
        setError("Card payment on-ramp (MoonPay) is scheduled for Milestone 2. Please select 'Stellar Wallet' to deploy funds on-chain now.");
        setLoading(false);
        return;
      }

      setStepStatus("Connecting to Freighter wallet...");
      const senderPublicKey = await connectWallet();

      setStepStatus("Creating donation record...");
      const donation = await apiRequest("/api/donations/create", {
        method: "POST",
        body: JSON.stringify({
          mission_id: missionId,
          donor_email: donorEmail,
          amount_usd: numericAmount,
          asset_type: assetType,
        }),
      });

      setDonationId(donation.id);

      setStepStatus("Awaiting Freighter signature...");
      const { hash } = await sendTestnetPayment({
        senderPublicKey,
        recipientPublicKey: DEFAULT_PLATFORM_RECIPIENT,
        amount: activeAmount,
        memoText: `SHEPHERD #${donation.id}`,
      });

      setStepStatus("Verifying on-chain settlement with Horizon...");
      await apiRequest("/api/donations/verify-onchain", {
        method: "POST",
        body: JSON.stringify({
          donation_id: donation.id,
          stellar_tx_hash: hash,
        }),
      });

      setTxHash(hash);
      setCompleted(true);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Payment processing failed. Please verify your Freighter connection and balance.");
      }
    } finally {
      setLoading(false);
      setStepStatus("");
    }
  };

  if (completed) {
    return (
      <div className="bg-white/80 backdrop-blur-2xl p-10 md:p-14 rounded-[2rem] border border-white/60 shadow-2xl shadow-blue-900/10 max-w-2xl mx-auto relative overflow-hidden">
        {/* Soft Ambient Glow Behind Success */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-100/50 via-transparent to-transparent opacity-60 pointer-events-none" />
        
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-6 right-6 p-2.5 text-slate-400 hover:text-slate-700 bg-white/50 hover:bg-white rounded-full transition-all z-10 shadow-sm border border-slate-200/50"
          >
            <X className="w-5 h-5" />
          </button>
        )}
        
        <div className="relative text-center z-10">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-500/30">
            <CheckCircle2 className="w-10 h-10 text-white" />
          </div>
          
          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100/80 px-3 py-1.5 rounded-full uppercase tracking-widest border border-emerald-200/50 backdrop-blur-sm">
            Settlement Confirmed On-Chain
          </span>
          
          <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-5 mb-3">Donation Settled</h3>
          
          <p className="text-base text-slate-600 font-medium mb-8 max-w-md mx-auto leading-relaxed">
            Your gift of <span className="font-bold text-slate-900">${activeAmount} {assetType}</span> has bypassed traditional borders and settled instantly on the Stellar network for <span className="font-bold text-slate-900">{missionTitle}</span>.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto mb-8 text-left">
            {donationId && (
              <div className="bg-white/60 backdrop-blur-md p-5 rounded-2xl border border-white/80 shadow-sm flex flex-col justify-center">
                <span className="font-semibold text-slate-500 uppercase tracking-wider text-[10px] mb-1.5">Shepherd ID</span>
                <span className="font-mono font-bold text-lg text-slate-900">#{donationId}</span>
              </div>
            )}
            <div className="bg-white/60 backdrop-blur-md p-5 rounded-2xl border border-white/80 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold uppercase tracking-wider text-[10px] text-slate-500">Stellar Hash</span>
                <button
                  type="button"
                  onClick={handleCopyHash}
                  className="text-[11px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1.5 bg-blue-50/50 px-2 py-1 rounded-md"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
              <div className="font-mono text-xs text-slate-600 truncate bg-slate-50/50 p-2.5 rounded-xl border border-slate-200/50 select-all">
                {txHash}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
            <a
              href={`https://stellar.expert/explorer/testnet/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-2 text-sm font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 py-4 rounded-2xl shadow-sm transition-all"
            >
              View on Explorer <ExternalLink className="w-4 h-4 text-slate-400" />
            </a>
            <button
              onClick={() => {
                setCompleted(false);
                setTxHash("");
                setDonationId(null);
                setCustomAmount("");
                setIsCustom(false);
              }}
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-2xl text-sm uppercase tracking-wider font-extrabold shadow-xl shadow-blue-600/25 hover:shadow-blue-600/40 hover:-translate-y-0.5 active:translate-y-0 transition-all"
            >
              Deploy Another Gift
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/70 backdrop-blur-3xl rounded-[2.5rem] border border-white shadow-[0_8px_40px_rgb(0,0,0,0.04)] max-w-[1000px] mx-auto relative overflow-hidden flex flex-col md:flex-row">
      
      {/* Background Ambient Glow */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-blue-100/40 via-transparent to-transparent pointer-events-none" />

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="absolute top-6 right-6 p-2.5 text-slate-400 hover:text-slate-700 bg-white/50 hover:bg-white rounded-full transition-all z-20 shadow-sm border border-slate-200/50"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
      )}

      {/* Left Column: Context & Beauty */}
      <div className="md:w-5/12 bg-gradient-to-br from-slate-50/50 to-slate-100/30 p-10 md:p-14 border-b md:border-b-0 md:border-r border-slate-200/50 flex flex-col justify-between relative z-10">
        <div>
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-emerald-700 bg-emerald-100/60 px-3 py-1.5 rounded-full font-bold border border-emerald-200/50 w-fit mb-6 backdrop-blur-sm">
            <ShieldCheck className="w-4 h-4 text-emerald-600" /> Non-Custodial Flow
          </div>
          <span className="text-xs font-extrabold text-blue-600 uppercase tracking-widest block mb-2 opacity-90">Direct Mission Giving</span>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight leading-tight mb-4">{missionTitle}</h2>
          <p className="text-sm text-slate-600 leading-relaxed font-medium">
            Every dollar is dispatched instantly into verified Stellar address endpoints in <strong className="text-slate-900">{recipientCountry}</strong>.
          </p>
        </div>

        <div className="mt-10 pt-8 border-t border-slate-200/50">
          <ul className="space-y-4 text-xs font-medium text-slate-500">
            <li className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-blue-100/50 flex items-center justify-center shrink-0 mt-0.5">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
              </div>
              <p>Funds never stop on platform intermediate wallets.</p>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-emerald-100/50 flex items-center justify-center shrink-0 mt-0.5">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
              </div>
              <p>Verified directly against Stellar Network Horizon APIs.</p>
            </li>
          </ul>
        </div>
      </div>

      {/* Right Column: Interactive Form */}
      <div className="md:w-7/12 p-10 md:p-14 relative z-10 bg-white/40">
        {error && (
          <div className="mb-8 p-4 bg-red-50/80 backdrop-blur-sm text-red-700 rounded-2xl text-sm font-semibold border border-red-200 flex items-start gap-3 shadow-sm">
            <Info className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">{error}</div>
          </div>
        )}

        <form onSubmit={handleProcessDonation} className="space-y-8">
          
          {/* Amount Selection */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-3">
              Select Amount (USD)
            </label>
            <div className="flex flex-wrap gap-3 mb-3">
              {["5", "25", "50", "100", "250"].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => {
                    setAmount(preset);
                    setIsCustom(false);
                  }}
                  className={`flex-1 min-w-[70px] py-3.5 text-sm font-bold rounded-2xl border transition-all ${
                    !isCustom && amount === preset
                      ? "border-blue-600 bg-blue-600 text-white shadow-md shadow-blue-600/20"
                      : "border-slate-200/80 bg-white/60 text-slate-700 hover:bg-white hover:border-slate-300"
                  }`}
                >
                  ${preset}
                </button>
              ))}
            </div>
            <div className="relative group">
              <button
                type="button"
                onClick={() => setIsCustom(true)}
                className={`w-full p-4 text-sm font-semibold rounded-2xl border text-left flex items-center justify-between transition-all ${
                  isCustom
                    ? "border-blue-500 bg-blue-50/50 text-blue-900 ring-4 ring-blue-500/10"
                    : "border-slate-200/80 bg-white/60 text-slate-500 hover:bg-white"
                }`}
              >
                <span>Or enter custom amount</span>
                {isCustom && (
                  <div className="flex items-center gap-1.5 font-bold text-slate-900 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
                    <span className="text-slate-400">$</span>
                    <input
                      type="number"
                      min="1"
                      step="any"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      placeholder="500"
                      autoFocus
                      className="w-24 bg-transparent border-none p-0 text-sm focus:ring-0 focus:outline-none"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                )}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Email Input */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-3">
                Donor Email (Receipt)
              </label>
              <input
                type="email"
                value={donorEmail}
                onChange={(e) => setDonorEmail(e.target.value)}
                placeholder="donor@example.com"
                className="w-full bg-white/60 border border-slate-200/80 rounded-2xl p-4 text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm"
                required
              />
            </div>

            {/* Asset Type */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-3">
                Asset Type
              </label>
              <div className="grid grid-cols-2 gap-3 h-[54px]">
                <label className={`flex items-center justify-center gap-2 rounded-2xl border text-xs font-bold cursor-pointer transition-all ${assetType === "XLM" ? "border-blue-500 bg-blue-50/80 text-blue-700 shadow-sm" : "border-slate-200/80 bg-white/60 text-slate-500 hover:bg-white"}`}>
                  <input type="radio" name="asset" checked={assetType === "XLM"} onChange={() => setAssetType("XLM")} className="sr-only" />
                  XLM
                </label>
                <label className={`flex items-center justify-center gap-2 rounded-2xl border text-xs font-bold cursor-pointer transition-all ${assetType === "USDC" ? "border-blue-500 bg-blue-50/80 text-blue-700 shadow-sm" : "border-slate-200/80 bg-white/60 text-slate-500 hover:bg-white"}`}>
                  <input type="radio" name="asset" checked={assetType === "USDC"} onChange={() => setAssetType("USDC")} className="sr-only" />
                  USDC
                </label>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-3">
              Payment Rail
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setMethod("wallet")}
                className={`p-5 text-left rounded-2xl border flex flex-col gap-1.5 transition-all ${
                  method === "wallet"
                    ? "border-blue-500 bg-blue-50/80 shadow-md ring-4 ring-blue-500/10"
                    : "border-slate-200/80 bg-white/60 hover:bg-white"
                }`}
              >
                <div className="flex items-center gap-2.5 font-bold text-sm text-slate-900">
                  <div className={`p-1.5 rounded-lg ${method === "wallet" ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-400"}`}>
                    <Wallet className="w-4 h-4" />
                  </div>
                  Stellar Wallet
                </div>
                <span className="text-xs font-medium text-slate-500 ml-9">Freighter Extension</span>
              </button>

              <button
                type="button"
                onClick={() => setMethod("card")}
                className={`p-5 text-left rounded-2xl border flex flex-col gap-1.5 transition-all ${
                  method === "card"
                    ? "border-blue-500 bg-blue-50/80 shadow-md ring-4 ring-blue-500/10"
                    : "border-slate-200/80 bg-white/60 hover:bg-white opacity-70 hover:opacity-100"
                }`}
              >
                <div className="flex items-center gap-2.5 font-bold text-sm text-slate-900">
                  <div className={`p-1.5 rounded-lg ${method === "card" ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-400"}`}>
                    <CreditCard className="w-4 h-4" />
                  </div>
                  Card / Bank
                </div>
                <span className="text-xs font-medium text-slate-500 ml-9">MoonPay On-Ramp</span>
              </button>
            </div>
          </div>

          {/* Status Indicator */}
          {loading && stepStatus && (
            <div className="p-4 bg-blue-50/80 backdrop-blur-sm border border-blue-200/60 rounded-2xl text-sm font-semibold text-blue-800 flex items-center gap-3 animate-pulse">
              <Loader2 className="w-5 h-5 animate-spin text-blue-600 shrink-0" />
              <span>{stepStatus}</span>
            </div>
          )}

          {/* Submit Action */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-extrabold py-5 rounded-2xl hover:shadow-xl hover:shadow-blue-600/30 text-sm uppercase tracking-wider flex items-center justify-center gap-2.5 transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:hover:translate-y-0"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Confirm & Deploy ${activeAmount || "0"} <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}