"use client";

import React, { useState } from "react";
import { CheckCircle2, Circle, Clock, AlertCircle, FileText, Send } from "lucide-react";
import { apiRequest } from "@/lib/api";
import FileUpload from "@/components/FileUpload";

export default function VerificationFlow() {
  const [step, setStep] = useState(1);
  const [userId, setUserId] = useState("1");
  const [profileId, setProfileId] = useState<number | null>(null);
  const [country, setCountry] = useState("Kenya");
  const [orgName, setOrgName] = useState("");
  const [stellarAddress, setStellarAddress] = useState("");
  const [mpesaNumber, setMpesaNumber] = useState("");
  const [certUrl, setCertUrl] = useState("");
  const [idUrl, setIdUrl] = useState("");
  const [selfieUrl, setSelfieUrl] = useState("");
  const [status, setStatus] = useState<string>("DRAFT");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const data = await apiRequest("/api/verification/apply", {
        method: "POST",
        body: JSON.stringify({
          user_id: parseInt(userId, 10),
          country,
          organization_name: orgName,
          stellar_payout_address: stellarAddress || null,
          mpesa_phone_number: mpesaNumber || null,
        }),
      });
      setProfileId(data.id);
      setStatus(data.verification_status);
      setStep(2);
      setMessage("Basic details saved! Proceeding to document uploads.");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setMessage(err.message);
      } else {
        setMessage("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUploadDocs = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileId) return;
    setLoading(true);
    setMessage(null);
    try {
      const data = await apiRequest(`/api/verification/documents/${profileId}`, {
        method: "PUT",
        body: JSON.stringify({
          organization_cert_url: certUrl,
          government_id_url: idUrl,
          selfie_url: selfieUrl,
        }),
      });
      setStatus(data.verification_status);
      setStep(3);
      setMessage("Documents submitted successfully for admin review!");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setMessage(err.message);
      } else {
        setMessage("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Missionary Vetting Portal</h2>
          <p className="text-sm text-gray-500">Complete verification to receive a public Shepherd ID</p>
        </div>
        <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-xs font-semibold">
          {status === "APPROVED" ? (
            <CheckCircle2 className="w-4 h-4 text-green-600" />
          ) : status === "UNDER_REVIEW" ? (
            <Clock className="w-4 h-4 text-blue-600" />
          ) : (
            <AlertCircle className="w-4 h-4 text-gray-600" />
          )}
          Status: {status}
        </div>
      </div>

      {message && (
        <div className="mb-6 p-4 rounded-lg text-sm bg-gray-50 text-gray-800 border border-gray-200">
          {message}
        </div>
      )}

      {/* Step Indicator */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100 text-sm font-medium">
        <div className={`flex items-center gap-2 ${step >= 1 ? "text-blue-600" : "text-gray-400"}`}>
          {step > 1 ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
          1. Identity & Rails
        </div>
        <div className={`flex items-center gap-2 ${step >= 2 ? "text-blue-600" : "text-gray-400"}`}>
          {step > 2 ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
          2. Document Uploads
        </div>
        <div className={`flex items-center gap-2 ${step >= 3 ? "text-blue-600" : "text-gray-400"}`}>
          {step >= 3 ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
          3. Verification Review
        </div>
      </div>

      {step === 1 && (
        <form onSubmit={handleApply} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              User ID (Test Account ID)
            </label>
            <input
              type="number"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2.5 text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Country of Mission Field
            </label>
            <input
              type="text"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2.5 text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Organization or Church Body
            </label>
            <input
              type="text"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              placeholder="e.g. Kenya Missions Outreach"
              className="w-full border border-gray-300 rounded-lg p-2.5 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Stellar USDC Payout Address (Public Key)
            </label>
            <input
              type="text"
              value={stellarAddress}
              onChange={(e) => setStellarAddress(e.target.value)}
              placeholder="G..."
              className="w-full border border-gray-300 rounded-lg p-2.5 text-sm font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              M-Pesa Payout Number (Optional)
            </label>
            <input
              type="text"
              value={mpesaNumber}
              onChange={(e) => setMpesaNumber(e.target.value)}
              placeholder="+254700000000"
              className="w-full border border-gray-300 rounded-lg p-2.5 text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white font-medium py-2.5 rounded-lg hover:bg-blue-700 text-sm flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" /> {loading ? "Saving..." : "Continue to Step 2"}
          </button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleUploadDocs} className="space-y-4">
          <FileUpload
            label="Government ID (Passport / National ID)"
            onUploadComplete={(url) => setIdUrl(url)}
            acceptedTypes=".jpg,.jpeg,.png,.pdf"
          />

          <FileUpload
            label="Live Verification Selfie"
            onUploadComplete={(url) => setSelfieUrl(url)}
            acceptedTypes=".jpg,.jpeg,.png"
          />

          <FileUpload
            label="Organization Registration Certificate"
            onUploadComplete={(url) => setCertUrl(url)}
            acceptedTypes=".jpg,.jpeg,.png,.pdf"
          />

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-1/3 bg-gray-100 text-gray-700 font-medium py-2.5 rounded-lg hover:bg-gray-200 text-sm"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-2/3 bg-blue-600 text-white font-medium py-2.5 rounded-lg hover:bg-blue-700 text-sm flex items-center justify-center gap-2"
            >
              <FileText className="w-4 h-4" /> {loading ? "Uploading..." : "Submit Documents"}
            </button>
          </div>
        </form>
      )}

      {step === 3 && (
        <div className="text-center py-6 space-y-4">
          <Clock className="w-12 h-12 text-blue-600 mx-auto" />
          <h3 className="text-lg font-bold text-gray-900">Application Under Review</h3>
          <p className="text-sm text-gray-600 max-w-md mx-auto">
            Your identity and payout configurations have been submitted to the Shepherd admin queue. 
            Once verified, your profile will receive a <strong>Verified Missionary</strong> badge and public Shepherd ID.
          </p>
        </div>
      )}
    </div>
  );
}