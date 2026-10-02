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
      <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-xl shadow-slate-200/50 max-w-3xl mx-auto relative">
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-all"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        )}
        <div className="text-center py-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
          </div>
          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md uppercase tracking-widest border border-emerald-200">
            Settlement Confirmed On-Chain
          </span>
          <h3 className="text-xl font-semibold text-slate-900 tracking-tight mt-3">Donation Settled</h3>
          <p className="text-sm text-slate-600 font-normal mt-2 mb-6 max-w-md mx-auto">
            Your gift of <span className="font-semibold text-slate-900">${activeAmount} {assetType}</span> has settled on the Stellar network directly for <span className="font-semibold text-slate-900">{missionTitle}</span> ({recipientCountry}).
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto mb-6">
            {donationId && (
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col justify-center items-start">
                <span className="font-medium text-slate-500 uppercase tracking-wider text-[9px] mb-1">Shepherd ID</span>
                <span className="font-mono font-semibold text-sm text-slate-900">#{donationId}</span>
              </div>
            )}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-left">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-medium uppercase tracking-wider text-[9px] text-slate-500">Stellar Hash</span>
                <button
                  type="button"
                  onClick={handleCopyHash}
                  className="text-[10px] font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
              <div className="font-mono text-[11px] text-slate-600 truncate bg-white p-2 rounded border border-slate-200 select-all">
                {txHash}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <a
              href={`https://stellar.expert/explorer/testnet/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 border border-slate-200 py-3 rounded-xl hover:bg-slate-50 transition-all"
            >
              Verify on Stellar Expert <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <button
              onClick={() => {
                setCompleted(false);
                setTxHash("");
                setDonationId(null);
                setCustomAmount("");
                setIsCustom(false);
              }}
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl text-xs uppercase tracking-wider font-semibold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.01] transition-all"
            >
              Deploy Another Gift
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xl shadow-slate-200/50 max-w-4xl mx-auto relative overflow-hidden">
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-all z-10"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
      )}

      <div className="grid grid-cols-1 md:grid-cols-12">
        {/* Left Info Column */}
        <div className="md:col-span-5 bg-slate-50/50 p-8 border-b md:border-b-0 md:border-r border-slate-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-[9px] uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md font-semibold border border-emerald-200 w-fit mb-4">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Non-Custodial Flow
            </div>
            <span className="text-[10px] font-semibold text-blue-600 uppercase tracking-widest block">Direct Mission Giving</span>
            <h2 className="text-xl font-semibold text-slate-900 tracking-tight mt-1 leading-snug">{missionTitle}</h2>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Every dollar is dispatched instantly into verified Stellar address endpoints in <strong className="text-slate-900">{recipientCountry}</strong>.
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 text-[11px] text-slate-500 space-y-2">
            <p>• Funds never stop on platform intermediate wallets.</p>
            <p>• Verified directly against Stellar Network Horizon APIs.</p>
          </div>
        </div>

        {/* Right Input Column */}
        <div className="md:col-span-7 p-8">
          {error && (
            <div className="mb-5 p-3.5 bg-red-50 text-red-700 rounded-xl text-xs font-medium border border-red-200 flex items-start gap-2">
              <Info className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>{error}</div>
            </div>
          )}

          <form onSubmit={handleProcessDonation} className="space-y-5">
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-2.5">
                Select Amount (USD)
              </label>
              <div className="grid grid-cols-5 gap-2 mb-2.5">
                {["5", "25", "50", "100", "250"].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => {
                      setAmount(preset);
                      setIsCustom(false);
                    }}
                    className={`py-2 text-sm font-semibold rounded-xl border transition-all ${
                      !isCustom && amount === preset
                        ? "border-blue-600 bg-blue-50 text-blue-700 shadow-sm"
                        : "border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300"
                    }`}
                  >
                    ${preset}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setIsCustom(true)}
                className={`w-full py-2 px-3 text-xs font-medium rounded-xl border text-left flex items-center justify-between transition-all ${
                  isCustom
                    ? "border-blue-600 bg-blue-50/50 text-blue-700"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                <span>Or enter custom amount</span>
                {isCustom && (
                  <div className="flex items-center gap-1 font-semibold text-slate-900">
                    <span>$</span>
                    <input
                      type="number"
                      min="1"
                      step="any"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      placeholder="500"
                      autoFocus
                      className="w-24 bg-white border border-slate-300 rounded px-2 py-0.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                )}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5">
                  Donor Email (Receipt)
                </label>
                <input
                  type="email"
                  value={donorEmail}
                  onChange={(e) => setDonorEmail(e.target.value)}
                  placeholder="donor@example.com"
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-sm font-normal text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5">
                  Asset Type
                </label>
                <div className="grid grid-cols-2 gap-2 h-[42px]">
                  <label className={`flex items-center justify-center gap-2 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${assetType === "XLM" ? "border-blue-600 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
                    <input
                      type="radio"
                      name="asset"
                      checked={assetType === "XLM"}
                      onChange={() => setAssetType("XLM")}
                      className="sr-only"
                    />
                    XLM (Native)
                  </label>
                  <label className={`flex items-center justify-center gap-2 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${assetType === "USDC" ? "border-blue-600 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
                    <input
                      type="radio"
                      name="asset"
                      checked={assetType === "USDC"}
                      onChange={() => setAssetType("USDC")}
                      className="sr-only"
                    />
                    USDC
                  </label>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-2.5">
                Payment Method
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setMethod("wallet")}
                  className={`p-3 text-left rounded-xl border flex flex-col gap-0.5 transition-all ${
                    method === "wallet"
                      ? "border-blue-600 bg-blue-50/80 shadow-sm"
                      : "border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-2 font-semibold text-xs text-slate-900">
                    <Wallet className={`w-3.5 h-3.5 ${method === "wallet" ? "text-blue-600" : "text-slate-400"}`} /> Stellar Wallet
                  </div>
                  <span className="text-[10px] text-slate-500">Freighter Extension</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMethod("card")}
                  className={`p-3 text-left rounded-xl border flex flex-col gap-0.5 transition-all ${
                    method === "card"
                      ? "border-blue-600 bg-blue-50/80 shadow-sm"
                      : "border-slate-200 hover:bg-slate-50 hover:border-slate-300 opacity-80"
                  }`}
                >
                  <div className="flex items-center gap-2 font-semibold text-xs text-slate-900">
                    <CreditCard className={`w-3.5 h-3.5 ${method === "card" ? "text-blue-600" : "text-slate-400"}`} /> Card / Bank
                  </div>
                  <span className="text-[10px] text-slate-500">MoonPay On-Ramp</span>
                </button>
              </div>
            </div>

            {loading && stepStatus && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs font-medium text-blue-800 flex items-center gap-2.5">
                <Loader2 className="w-4 h-4 animate-spin text-blue-600 shrink-0" />
                <span>{stepStatus}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-3 rounded-xl hover:shadow-lg hover:shadow-blue-500/30 text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70 disabled:hover:scale-100"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
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