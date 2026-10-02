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
  const [donorName, setDonorName] = useState("");
  const [donorEmail, setDonorEmail] = useState("");
  const [progressOptIn, setProgressOptIn] = useState(true);
  const [loading, setLoading] = useState(false);
  const [stepStatus, setStepStatus] = useState<string>("");
  const [txHash, setTxHash] = useState("");
  const [donationId, setDonationId] = useState<number | null>(null);
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const activeAmount = isCustom ? String(customAmount).trim() : String(amount).trim();

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

    const numericAmount = parseFloat(activeAmount.replace(/[^0-9.]/g, ""));
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

      if (progressOptIn && !donorEmail.trim()) {
        setError("Please enter an email address if you want to receive mission progress updates.");
        setLoading(false);
        return;
      }

      setStepStatus("Creating donation record...");
      const donation = await apiRequest("/api/donations/create", {
        method: "POST",
        body: JSON.stringify({
          mission_id: missionId,
          donor_name: donorName.trim() || null,
          donor_email: donorEmail.trim() || null,
          progress_opt_in: progressOptIn,
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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8 bg-slate-950/60 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
        <div className="bg-white/90 backdrop-blur-2xl p-8 sm:p-12 md:p-14 rounded-[2.5rem] border border-white/80 shadow-2xl shadow-slate-950/20 max-w-2xl w-full mx-auto relative overflow-hidden my-auto">
          {/* Ambient Glow */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-100/60 via-transparent to-transparent opacity-70 pointer-events-none" />
          
          <button
            type="button"
            onClick={() => onClose && onClose()}
            className="absolute top-6 right-6 p-2.5 text-slate-500 hover:text-slate-900 bg-white hover:bg-slate-100 rounded-full transition-all z-20 shadow-md border border-slate-200"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="relative text-center z-10">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-500/30">
              <CheckCircle2 className="w-10 h-10 text-white" />
            </div>
            
            <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100/90 px-3.5 py-1.5 rounded-full uppercase tracking-widest border border-emerald-200/80 shadow-sm">
              Settlement Confirmed On-Chain
            </span>
            
            <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-5 mb-3">Donation Settled</h3>
            
            <p className="text-sm sm:text-base text-slate-600 font-medium mb-8 max-w-md mx-auto leading-relaxed">
              Your gift of <span className="font-bold text-slate-900">${activeAmount} {assetType}</span> has bypassed traditional borders and settled instantly on the Stellar network for <span className="font-bold text-slate-900">{missionTitle}</span>.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto mb-8 text-left">
              {donationId && (
                <div className="bg-white/80 backdrop-blur-md p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-center">
                  <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px] mb-1">Shepherd ID</span>
                  <span className="font-mono font-extrabold text-lg text-slate-900">#{donationId}</span>
                </div>
              )}
              <div className="bg-white/80 backdrop-blur-md p-5 rounded-2xl border border-slate-200/80 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold uppercase tracking-wider text-[10px] text-slate-400">Stellar Hash</span>
                  <button
                    type="button"
                    onClick={handleCopyHash}
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1.5 bg-blue-50 px-2 py-1 rounded-md transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? "Copied" : "Copy"}
                  </button>
                </div>
                <div className="font-mono text-xs text-slate-600 truncate bg-slate-50 p-2.5 rounded-xl border border-slate-200/60 select-all">
                  {txHash}
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
              <a
                href={`https://stellar.expert/explorer/testnet/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-2 text-xs uppercase tracking-wider font-extrabold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200/80 py-4 rounded-2xl shadow-sm transition-all hover:scale-[1.01]"
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
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-2xl text-xs uppercase tracking-wider font-extrabold shadow-xl shadow-blue-600/25 hover:shadow-blue-600/40 transition-all hover:scale-[1.01]"
              >
                Deploy Another Gift
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 md:p-8 bg-slate-950/60 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white/95 backdrop-blur-3xl rounded-[2.5rem] border border-white/80 shadow-[0_20px_60px_rgba(0,0,0,0.2)] max-w-[1020px] w-full mx-auto relative overflow-hidden flex flex-col md:flex-row my-auto">
        
        {/* Background Ambient Glow */}
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-blue-100/50 via-transparent to-transparent pointer-events-none" />

        {/* Always-visible Close Button */}
        <button
          type="button"
          onClick={() => onClose && onClose()}
          className="absolute top-5 right-5 p-2.5 text-slate-500 hover:text-slate-900 bg-white hover:bg-slate-100 rounded-full transition-all z-30 shadow-md border border-slate-200"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Column: Context & Beauty */}
        <div className="md:w-5/12 bg-gradient-to-br from-slate-50/80 via-slate-100/40 to-blue-50/20 p-8 sm:p-10 md:p-12 border-b md:border-b-0 md:border-r border-slate-200/60 flex flex-col justify-between relative z-10">
          <div>
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-emerald-800 bg-emerald-100/80 px-3.5 py-1.5 rounded-full font-bold border border-emerald-200/60 w-fit mb-6 shadow-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> Non-Custodial Rail
            </div>
            <span className="text-[11px] font-extrabold text-blue-600 uppercase tracking-widest block mb-2">Direct Mission Giving</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight mb-4">{missionTitle}</h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
              Every dollar is dispatched instantly into verified Stellar address endpoints in <strong className="text-slate-900">{recipientCountry}</strong>.
            </p>
          </div>

          <div className="mt-8 pt-8 border-t border-slate-200/60 space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                <div className="w-2 h-2 rounded-full bg-blue-600" />
              </div>
              <p className="text-xs font-semibold text-slate-600">Funds never stop on intermediate platform wallets.</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                <div className="w-2 h-2 rounded-full bg-emerald-600" />
              </div>
              <p className="text-xs font-semibold text-slate-600">Verified directly against Stellar Horizon APIs.</p>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Giving Controls */}
        <div className="md:w-7/12 p-8 sm:p-10 md:p-12 relative z-10 bg-white/60">
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-2xl text-xs sm:text-sm font-semibold border border-red-200 flex items-start gap-3 shadow-sm">
              <Info className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed">{error}</div>
            </div>
          )}

          <form onSubmit={handleProcessDonation} className="space-y-6">
            
            {/* Amount Selection */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2.5">
                Select Amount (USD)
              </label>
              <div className="grid grid-cols-5 gap-2 sm:gap-2.5 mb-2.5">
                {["5", "25", "50", "100", "250"].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => {
                      setAmount(preset);
                      setIsCustom(false);
                    }}
                    className={`py-3 text-sm font-bold rounded-2xl border transition-all ${
                      !isCustom && amount === preset
                        ? "border-blue-600 bg-blue-600 text-white shadow-md shadow-blue-600/25 scale-[1.02]"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300"
                    }`}
                  >
                    ${preset}
                  </button>
                ))}
              </div>
              
              <button
                type="button"
                onClick={() => setIsCustom(true)}
                className={`w-full p-3.5 text-xs sm:text-sm font-semibold rounded-2xl border text-left flex items-center justify-between transition-all ${
                  isCustom
                    ? "border-blue-500 bg-blue-50/60 text-blue-900 ring-4 ring-blue-500/10"
                    : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                }`}
              >
                <span>Or enter custom amount</span>
                {isCustom && (
                  <div className="flex items-center gap-1.5 font-bold text-slate-900 bg-white px-3 py-1 rounded-xl border border-slate-300 shadow-sm">
                    <span className="text-slate-400">$</span>
                    <input
                      type="number"
                      min="1"
                      step="any"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      placeholder="500"
                      autoFocus
                      className="w-20 bg-transparent border-none p-0 text-sm focus:ring-0 focus:outline-none"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                )}
              </button>
            </div>

            {/* Optional Donor Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                  Your Name (Optional)
                </label>
                <input
                  type="text"
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  placeholder="e.g. Sarah Jenkins or Anonymous"
                  className="w-full bg-white border border-slate-200 rounded-2xl p-3.5 text-xs sm:text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                  Donor Email (Optional)
                </label>
                <input
                  type="email"
                  value={donorEmail}
                  onChange={(e) => setDonorEmail(e.target.value)}
                  placeholder="donor@example.com"
                  className="w-full bg-white border border-slate-200 rounded-2xl p-3.5 text-xs sm:text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm"
                />
              </div>
            </div>

            {/* Email Progress Updates Checkbox */}
            <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={progressOptIn}
                  onChange={(e) => setProgressOptIn(e.target.checked)}
                  className="mt-0.5 accent-blue-600 w-4 h-4 rounded"
                />
                <span className="text-xs font-semibold text-slate-700 leading-snug">
                  Keep me updated on this mission's progress (receipts, milestones & field updates via email).
                </span>
              </label>
            </div>

            {/* Asset Type Selection */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                Settlement Asset
              </label>
              <div className="grid grid-cols-2 gap-2.5 h-[48px]">
                <label className={`flex items-center justify-center gap-2 rounded-2xl border text-xs font-bold cursor-pointer transition-all ${assetType === "XLM" ? "border-blue-600 bg-blue-50 text-blue-700 shadow-sm" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`}>
                  <input type="radio" name="asset" checked={assetType === "XLM"} onChange={() => setAssetType("XLM")} className="sr-only" />
                  XLM
                </label>
                <label className={`flex items-center justify-center gap-2 rounded-2xl border text-xs font-bold cursor-pointer transition-all ${assetType === "USDC" ? "border-blue-600 bg-blue-50 text-blue-700 shadow-sm" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`}>
                  <input type="radio" name="asset" checked={assetType === "USDC"} onChange={() => setAssetType("USDC")} className="sr-only" />
                  USDC
                </label>
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2.5">
                Payment Rail
              </label>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <button
                  type="button"
                  onClick={() => setMethod("wallet")}
                  className={`p-4 text-left rounded-2xl border flex flex-col gap-1 transition-all ${
                    method === "wallet"
                      ? "border-blue-600 bg-blue-50/80 shadow-md ring-4 ring-blue-500/10"
                      : "border-slate-200 bg-white hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-xs sm:text-sm text-slate-900">
                    <div className={`p-1.5 rounded-lg ${method === "wallet" ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-400"}`}>
                      <Wallet className="w-4 h-4" />
                    </div>
                    Stellar Wallet
                  </div>
                  <span className="text-[11px] font-medium text-slate-500 pl-7">Freighter Extension</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMethod("card")}
                  className={`p-4 text-left rounded-2xl border flex flex-col gap-1 transition-all ${
                    method === "card"
                      ? "border-blue-600 bg-blue-50/80 shadow-md ring-4 ring-blue-500/10"
                      : "border-slate-200 bg-white hover:bg-slate-50 opacity-80"
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-xs sm:text-sm text-slate-900">
                    <div className={`p-1.5 rounded-lg ${method === "card" ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-400"}`}>
                      <CreditCard className="w-4 h-4" />
                    </div>
                    Card / Bank
                  </div>
                  <span className="text-[11px] font-medium text-slate-500 pl-7">MoonPay On-Ramp</span>
                </button>
              </div>
            </div>

            {/* Status Indicator */}
            {loading && stepStatus && (
              <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-2xl text-xs sm:text-sm font-semibold text-blue-800 flex items-center gap-3 animate-pulse">
                <Loader2 className="w-4 h-4 animate-spin text-blue-600 shrink-0" />
                <span>{stepStatus}</span>
              </div>
            )}

            {/* Submit Action */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-extrabold py-4 sm:py-4.5 rounded-2xl hover:shadow-xl hover:shadow-blue-600/30 text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70 disabled:hover:scale-100"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Confirm & Deploy ${activeAmount || "0"} <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}