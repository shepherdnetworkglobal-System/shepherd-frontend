"use client";

import React, { useState } from "react";
import { CreditCard, Wallet, CheckCircle2, ShieldCheck, ArrowRight, Loader2, ExternalLink, Copy, Check, Info, X, Sparkles } from "lucide-react";
import { apiRequest } from "@/lib/api";
import { connectWallet, sendTestnetPayment, DEFAULT_PLATFORM_RECIPIENT } from "@/lib/stellarWallet";

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
  const [assetType, setAssetType] = useState<"USDC" | "XLM">("USDC");
  const [method, setMethod] = useState<"card" | "wallet">("card");
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
        setStepStatus("Initializing secure Stripe checkout...");
        const res = await apiRequest("/api/donations/create-stripe-checkout", {
          method: "POST",
          body: JSON.stringify({
            mission_id: missionId,
            donor_name: donorName.trim() || null,
            donor_email: donorEmail.trim() || null,
            progress_opt_in: progressOptIn,
            amount_usd: numericAmount,
            origin_url: window.location.origin,
          }),
        });

        if (res.checkout_url) {
          window.location.href = res.checkout_url;
          return;
        } else {
          throw new Error("Failed to initialize Stripe checkout session.");
        }
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
        setError("Payment processing failed. Please verify your Freighter wallet connection or card details.");
      }
    } finally {
      setLoading(false);
      setStepStatus("");
    }
  };

  if (completed) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-[#1A1612]/60 backdrop-blur-xl overflow-y-auto animate-in fade-in duration-200">
        <div className="bg-[#F7F4EF] p-8 sm:p-12 rounded-3xl border border-[#1A1612]/10 shadow-2xl max-w-xl w-full mx-auto relative overflow-hidden my-auto text-center">
          <button
            type="button"
            onClick={() => onClose && onClose()}
            className="absolute top-6 right-6 p-2 text-[#7A736A] hover:text-[#1A1612] bg-white/80 rounded-full transition-all border border-[#1A1612]/10"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="w-16 h-16 rounded-2xl bg-[#064E3B] flex items-center justify-center mx-auto mb-5 shadow-lg shadow-[#064E3B]/20">
            <CheckCircle2 className="w-8 h-8 text-[#E8D5A3]" />
          </div>
          
          <span className="text-xs font-semibold text-[#064E3B] bg-[#064E3B]/10 px-3 py-1 rounded-full uppercase tracking-wider border border-[#064E3B]/20">
            Settlement Confirmed On-Chain
          </span>
          
          <h3 className="font-serif text-3xl font-medium text-[#1A1612] tracking-tight mt-4 mb-2">Donation Deployed</h3>
          
          <p className="text-sm text-[#3D3832] font-normal mb-6 max-w-md mx-auto leading-relaxed">
            Your gift of <span className="font-semibold text-[#1A1612]">${activeAmount} {assetType}</span> has bypassed traditional bank friction and logged to the public ledger for <span className="font-semibold text-[#1A1612]">{missionTitle}</span>.
          </p>

          <div className="bg-white/70 backdrop-blur-md p-5 rounded-2xl border border-[#1A1612]/10 shadow-sm text-left mb-6 max-w-md mx-auto">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium uppercase tracking-wider text-[10px] text-[#7A736A]">Stellar Settlement Hash</span>
              <button
                type="button"
                onClick={handleCopyHash}
                className="text-[11px] font-medium text-[#064E3B] hover:underline flex items-center gap-1"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied" : "Copy Hash"}
              </button>
            </div>
            <div className="font-mono text-xs text-[#1A1612] truncate bg-[#EFEBE4] p-2.5 rounded-xl select-all">
              {txHash}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <a
              href={`https://stellar.expert/explorer/testnet/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-2 text-xs uppercase tracking-wider font-semibold text-[#1A1612] bg-white hover:bg-white/80 border border-[#1A1612]/10 py-3.5 rounded-xl shadow-sm transition-all"
            >
              Verify On Explorer <ExternalLink className="w-4 h-4 text-[#7A736A]" />
            </a>
            <button
              onClick={() => {
                setCompleted(false);
                setTxHash("");
                setDonationId(null);
                setCustomAmount("");
                setIsCustom(false);
              }}
              className="flex-1 bg-[#064E3B] text-white py-3.5 rounded-xl text-xs uppercase tracking-wider font-semibold hover:bg-[#047857] shadow-md transition-all"
            >
              Deploy Another Gift
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-[#1A1612]/60 backdrop-blur-xl overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-[#F7F4EF] rounded-3xl border border-[#1A1612]/10 shadow-2xl max-w-4xl w-full mx-auto relative overflow-hidden flex flex-col md:flex-row my-auto">
        
        {/* Close Button */}
        <button
          type="button"
          onClick={() => onClose && onClose()}
          className="absolute top-5 right-5 p-2 text-[#7A736A] hover:text-[#1A1612] bg-white/80 rounded-full transition-all z-30 shadow-sm border border-[#1A1612]/10"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Column: Context & Transparency Pillar */}
        <div className="md:w-5/12 bg-[#EFEBE4] p-8 sm:p-10 border-b md:border-b-0 md:border-r border-[#1A1612]/10 flex flex-col justify-between relative z-10">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-semibold text-[#064E3B] bg-[#064E3B]/10 px-3 py-1 rounded-full w-fit mb-5 border border-[#064E3B]/20">
              <ShieldCheck className="w-4 h-4 text-[#064E3B]" /> Verified Mission Terminal
            </div>
            <span className="text-xs font-medium text-[#7A736A] uppercase tracking-wider block mb-1">Direct Field Deployment</span>
            <h2 className="font-serif text-2xl sm:text-3xl font-medium text-[#1A1612] tracking-tight leading-snug mb-3">{missionTitle}</h2>
            <p className="text-xs sm:text-sm text-[#3D3832] font-normal leading-relaxed">
              Every dollar is recorded on the public Stellar ledger and dispatched directly to verified boots-on-the-ground operators in <strong className="text-[#1A1612] font-semibold">{recipientCountry}</strong>.
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-[#1A1612]/10 space-y-3">
            <div className="flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-[#C4A35A] shrink-0 mt-0.5" />
              <p className="text-xs font-normal text-[#3D3832]">Zero intermediary platform withholding.</p>
            </div>
            <div className="flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-[#064E3B] shrink-0 mt-0.5" />
              <p className="text-xs font-normal text-[#3D3832]">Public receipt & line-item accountability.</p>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Dual Payment Flow */}
        <div className="md:w-7/12 p-8 sm:p-10 relative z-10 bg-white/70 backdrop-blur-md">
          {error && (
            <div className="mb-5 p-4 bg-red-50 text-red-800 rounded-2xl text-xs font-medium border border-red-200 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed">{error}</div>
            </div>
          )}

          <form onSubmit={handleProcessDonation} className="space-y-5">
            
            {/* Payment Method Rail Selection */}
            <div>
              <label className="block text-xs font-medium text-[#7A736A] uppercase tracking-wider mb-2">
                Select Payment Method
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setMethod("card")}
                  className={`p-3.5 text-left rounded-2xl border transition-all flex flex-col gap-1 ${
                    method === "card"
                      ? "border-[#064E3B] bg-[#064E3B]/10 text-[#064E3B] shadow-sm"
                      : "border-[#1A1612]/10 bg-white text-[#3D3832] hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-2 font-semibold text-xs text-[#1A1612]">
                    <CreditCard className="w-4 h-4 text-[#064E3B]" /> Credit / Debit Card
                  </div>
                  <span className="text-[10px] text-[#7A736A] pl-6 font-normal">Instant via Stripe</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMethod("wallet")}
                  className={`p-3.5 text-left rounded-2xl border transition-all flex flex-col gap-1 ${
                    method === "wallet"
                      ? "border-[#064E3B] bg-[#064E3B]/10 text-[#064E3B] shadow-sm"
                      : "border-[#1A1612]/10 bg-white text-[#3D3832] hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-2 font-semibold text-xs text-[#1A1612]">
                    <Wallet className="w-4 h-4 text-[#064E3B]" /> Stellar Wallet
                  </div>
                  <span className="text-[10px] text-[#7A736A] pl-6 font-normal">Freighter Non-Custodial</span>
                </button>
              </div>
            </div>

            {/* Amount Selection */}
            <div>
              <label className="block text-xs font-medium text-[#7A736A] uppercase tracking-wider mb-2">
                Gift Amount (USD)
              </label>
              <div className="grid grid-cols-5 gap-2 mb-2">
                {["10", "25", "50", "100", "250"].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => {
                      setAmount(preset);
                      setIsCustom(false);
                    }}
                    className={`py-2.5 text-xs font-medium rounded-xl border transition-all ${
                      !isCustom && amount === preset
                        ? "border-[#064E3B] bg-[#064E3B] text-white shadow-sm"
                        : "border-[#1A1612]/10 bg-white text-[#3D3832] hover:bg-slate-50"
                    }`}
                  >
                    ${preset}
                  </button>
                ))}
              </div>
              
              <button
                type="button"
                onClick={() => setIsCustom(true)}
                className={`w-full p-3 text-xs font-normal rounded-xl border text-left flex items-center justify-between transition-all ${
                  isCustom
                    ? "border-[#064E3B] bg-[#064E3B]/5 text-[#1A1612]"
                    : "border-[#1A1612]/10 bg-white text-[#7A736A] hover:bg-slate-50"
                }`}
              >
                <span>Or enter custom USD amount</span>
                {isCustom && (
                  <div className="flex items-center gap-1 font-semibold text-[#1A1612] bg-white px-2.5 py-1 rounded-lg border border-[#1A1612]/20">
                    <span className="text-[#7A736A]">$</span>
                    <input
                      type="number"
                      min="1"
                      step="any"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      placeholder="500"
                      autoFocus
                      className="w-16 bg-transparent border-none p-0 text-xs focus:ring-0 focus:outline-none"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                )}
              </button>
            </div>

            {/* Optional Donor Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-[#7A736A] uppercase tracking-wider mb-1">
                  Your Name (Optional)
                </label>
                <input
                  type="text"
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  placeholder="Anonymous or Full Name"
                  className="w-full bg-white border border-[#1A1612]/10 rounded-xl p-3 text-xs font-normal text-[#1A1612] placeholder-[#7A736A] focus:outline-none focus:border-[#064E3B] transition-all"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#7A736A] uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={donorEmail}
                  onChange={(e) => setDonorEmail(e.target.value)}
                  placeholder="donor@example.com"
                  className="w-full bg-white border border-[#1A1612]/10 rounded-xl p-3 text-xs font-normal text-[#1A1612] placeholder-[#7A736A] focus:outline-none focus:border-[#064E3B] transition-all"
                />
              </div>
            </div>

            {/* Progress Updates Checkbox */}
            <div className="p-3 bg-[#EFEBE4]/60 border border-[#1A1612]/10 rounded-xl">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={progressOptIn}
                  onChange={(e) => setProgressOptIn(e.target.checked)}
                  className="mt-0.5 accent-[#064E3B] w-4 h-4 rounded"
                />
                <span className="text-xs text-[#3D3832] font-normal leading-tight">
                  Opt-in to verified progress dispatches, receipts & field photos for this mission.
                </span>
              </label>
            </div>

            {/* Loading Status Indicator */}
            {loading && stepStatus && (
              <div className="p-3 bg-[#064E3B]/10 border border-[#064E3B]/20 rounded-xl text-xs font-medium text-[#064E3B] flex items-center gap-2.5 animate-pulse">
                <Loader2 className="w-4 h-4 animate-spin text-[#064E3B] shrink-0" />
                <span>{stepStatus}</span>
              </div>
            )}

            {/* Submit Action */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#064E3B] hover:bg-[#047857] text-white font-semibold py-3.5 rounded-xl shadow-md text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all hover:translate-y-[-1px] disabled:opacity-70 disabled:hover:translate-y-0"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  Proceed with ${activeAmount || "0"} Deployment <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}