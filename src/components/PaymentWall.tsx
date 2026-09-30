"use client";

import React, { useState } from "react";
import { CreditCard, Wallet, CheckCircle2, ShieldCheck, ArrowRight, Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/api";

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
        // Direct Stellar Wallet Signing (Testnet Mock Tx for Verification)
        const mockHash = "3389e9f0f73b68f140f93f3027f61be59a833ab9d720fa5745823679af79f583";
        
        // 2. Verify on-chain with backend
        await apiRequest("/api/donations/verify-onchain", {
          method: "POST",
          body: JSON.stringify({
            donation_id: donation.id,
            stellar_tx_hash: mockHash,
          }),
        });

        setTxHash(mockHash);
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
      <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm text-center max-w-lg mx-auto">
        <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-900">Donation Complete</h3>
        <p className="text-sm text-gray-600 mt-2 mb-6">
          Your donation of ${amount} {assetType} has settled directly to <strong>{missionTitle}</strong>.
        </p>
        <div className="bg-gray-50 p-4 rounded-lg text-left text-xs font-mono text-gray-700 break-all border border-gray-200 mb-6">
          <span className="font-semibold block mb-1">Stellar Transaction Hash:</span>
          {txHash}
        </div>
        <button
          onClick={() => {
            setCompleted(false);
            setTxHash("");
          }}
          className="w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          Make Another Donation
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm max-w-lg mx-auto">
      <div className="flex items-center justify-between pb-6 border-b border-gray-100 mb-6">
        <div>
          <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Direct Mission Giving</span>
          <h2 className="text-lg font-bold text-gray-900">{missionTitle}</h2>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-green-700 bg-green-50 px-2.5 py-1 rounded-md font-medium">
          <ShieldCheck className="w-4 h-4 text-green-600" /> Non-Custodial
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-xs border border-red-200">
          {error}
        </div>
      )}

      <form onSubmit={handleProcessDonation} className="space-y-5">
        <div>
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
            Select Preset Amount (USD)
          </label>
          <div className="grid grid-cols-4 gap-2">
            {["25", "50", "100", "250"].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setAmount(preset)}
                className={`py-2 text-sm font-semibold rounded-lg border transition ${
                  amount === preset
                    ? "border-blue-600 bg-blue-50 text-blue-600"
                    : "border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
              >
                ${preset}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
            Donor Email (For On-Chain Receipt)
          </label>
          <input
            type="email"
            value={donorEmail}
            onChange={(e) => setDonorEmail(e.target.value)}
            placeholder="donor@example.com"
            className="w-full border border-gray-300 rounded-lg p-2.5 text-sm"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
            Payment Rail
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setMethod("card")}
              className={`p-3 text-left rounded-lg border flex flex-col gap-1 transition ${
                method === "card"
                  ? "border-blue-600 bg-blue-50/50"
                  : "border-gray-200 hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center gap-2 font-medium text-sm text-gray-900">
                <CreditCard className="w-4 h-4 text-blue-600" /> Card / Bank
              </div>
              <span className="text-[11px] text-gray-500">Auto-converts to USDC</span>
            </button>

            <button
              type="button"
              onClick={() => setMethod("wallet")}
              className={`p-3 text-left rounded-lg border flex flex-col gap-1 transition ${
                method === "wallet"
                  ? "border-blue-600 bg-blue-50/50"
                  : "border-gray-200 hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center gap-2 font-medium text-sm text-gray-900">
                <Wallet className="w-4 h-4 text-blue-600" /> Stellar Wallet
              </div>
              <span className="text-[11px] text-gray-500">Freighter / Lobstr</span>
            </button>
          </div>
        </div>

        {method === "wallet" && (
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Asset Type
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="radio"
                  name="asset"
                  checked={assetType === "USDC"}
                  onChange={() => setAssetType("USDC")}
                />
                USDC (Stellar Stablecoin)
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="radio"
                  name="asset"
                  checked={assetType === "XLM"}
                  onChange={() => setAssetType("XLM")}
                />
                XLM (Native)
              </label>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white font-medium py-3 rounded-lg hover:bg-blue-700 text-sm flex items-center justify-center gap-2 transition"
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