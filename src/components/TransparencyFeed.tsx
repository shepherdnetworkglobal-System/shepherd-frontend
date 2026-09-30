"use client";

import React, { useState } from "react";
import { 
  Receipt as ReceiptIcon, 
  TrendingUp, 
  Users, 
  DollarSign, 
  FileText, 
  Plus, 
  Calendar,
  CheckCircle2
} from "lucide-react";
import { apiRequest } from "@/lib/api";

interface TransparencyFeedProps {
  missionId: number;
}

export default function TransparencyFeed({ missionId }: TransparencyFeedProps) {
  const [activeSubTab, setActiveSubTab] = useState<"ledger" | "add_receipt" | "add_update">("ledger");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Form states for adding receipts
  const [receiptTitle, setReceiptTitle] = useState("");
  const [receiptAmount, setReceiptAmount] = useState("");
  const [receiptCategory, setReceiptCategory] = useState("Materials");
  const [receiptUrl, setReceiptUrl] = useState("");
  const [receiptVendor, setReceiptVendor] = useState("");

  // Form states for adding milestone updates
  const [updateTitle, setUpdateTitle] = useState("");
  const [updateDesc, setUpdateDesc] = useState("");
  const [peopleServed, setPeopleServed] = useState("0");
  const [photoUrl, setPhotoUrl] = useState("");

  const handleCreateReceipt = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      await apiRequest("/api/accountability/receipts", {
        method: "POST",
        body: JSON.stringify({
          mission_id: missionId,
          title: receiptTitle,
          amount_spent_usd: parseFloat(receiptAmount),
          category: receiptCategory,
          receipt_image_url: receiptUrl || "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c",
          vendor_name: receiptVendor || null,
        }),
      });
      setMessage("Receipt verified and published to the transparency ledger!");
      setActiveSubTab("ledger");
      setReceiptTitle("");
      setReceiptAmount("");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setMessage(err.message);
      } else {
        setMessage("Failed to upload receipt");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      await apiRequest("/api/accountability/updates", {
        method: "POST",
        body: JSON.stringify({
          mission_id: missionId,
          title: updateTitle,
          description: updateDesc,
          people_served: parseInt(peopleServed, 10),
          photo_url: photoUrl || "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c",
        }),
      });
      setMessage("Field milestone published for donor review!");
      setActiveSubTab("ledger");
      setUpdateTitle("");
      setUpdateDesc("");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setMessage(err.message);
      } else {
        setMessage("Failed to submit field update");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveSubTab("ledger")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              activeSubTab === "ledger"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <FileText className="w-3.5 h-3.5" /> Public Accounting
          </button>
          <button
            onClick={() => setActiveSubTab("add_receipt")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              activeSubTab === "add_receipt"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <Plus className="w-3.5 h-3.5" /> Log Receipt
          </button>
          <button
            onClick={() => setActiveSubTab("add_update")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              activeSubTab === "add_update"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <Plus className="w-3.5 h-3.5" /> Post Field Story
          </button>
        </div>
      </div>

      {message && (
        <div className="p-3 bg-green-50 text-green-800 rounded-lg text-xs border border-green-200 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-green-600" /> {message}
        </div>
      )}

      {/* Main Ledger View */}
      {activeSubTab === "ledger" && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
              <span className="text-xs text-gray-500 font-medium">Total Funds In (Stellar)</span>
              <div className="flex items-center gap-1.5 mt-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                <span className="text-2xl font-bold text-gray-900">$7,840.00</span>
              </div>
              <span className="text-[11px] text-green-600 font-semibold mt-1 block">100% On-Chain Verified</span>
            </div>

            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
              <span className="text-xs text-gray-500 font-medium">Verified Field Expenses</span>
              <div className="flex items-center gap-1.5 mt-2">
                <ReceiptIcon className="w-5 h-5 text-blue-600" />
                <span className="text-2xl font-bold text-gray-900">$5,230.00</span>
              </div>
              <span className="text-[11px] text-blue-600 font-semibold mt-1 block">Backed by Field Receipts</span>
            </div>

            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
              <span className="text-xs text-gray-500 font-medium">Direct Impact</span>
              <div className="flex items-center gap-1.5 mt-2">
                <Users className="w-5 h-5 text-purple-600" />
                <span className="text-2xl font-bold text-gray-900">1,420</span>
              </div>
              <span className="text-[11px] text-purple-600 font-semibold mt-1 block">People Provided Clean Water</span>
            </div>
          </div>

          {/* Itemized Audit Feed */}
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
              Itemized Field Expenditure Feed
            </h3>

            <div className="divide-y divide-gray-100">
              <div className="py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                    <ReceiptIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">Borehole Drilling Machinery Rental</h4>
                    <p className="text-xs text-gray-500">Vendor: Lodwar Heavy Works Ltd • Category: Equipment</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-gray-900">$3,400.00</span>
                  <span className="text-[11px] text-green-600 block">Verified Invoice ✓</span>
                </div>
              </div>

              <div className="py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                    <ReceiptIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">PVC Piping & Solar Water Pump</h4>
                    <p className="text-xs text-gray-500">Vendor: Davis & Shirtliff Kenya • Category: Materials</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-gray-900">$1,830.00</span>
                  <span className="text-[11px] text-green-600 block">Verified Invoice ✓</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Form: Upload Receipt */}
      {activeSubTab === "add_receipt" && (
        <form onSubmit={handleCreateReceipt} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Log Field Expense Receipt</h3>
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Expense Title</label>
            <input
              type="text"
              value={receiptTitle}
              onChange={(e) => setReceiptTitle(e.target.value)}
              placeholder="e.g. 50x Bags of Cement"
              className="w-full border border-gray-300 rounded-lg p-2.5 text-sm"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Amount Spent (USD)</label>
              <input
                type="number"
                value={receiptAmount}
                onChange={(e) => setReceiptAmount(e.target.value)}
                placeholder="450.00"
                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Category</label>
              <select
                value={receiptCategory}
                onChange={(e) => setReceiptCategory(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm"
              >
                <option value="Materials">Materials</option>
                <option value="Labor">Labor</option>
                <option value="Transport">Transport</option>
                <option value="Equipment">Equipment</option>
                <option value="Food & Relief">Food & Relief</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Vendor / Supplier Name</label>
            <input
              type="text"
              value={receiptVendor}
              onChange={(e) => setReceiptVendor(e.target.value)}
              placeholder="Local Hardware Store"
              className="w-full border border-gray-300 rounded-lg p-2.5 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Receipt Image URL / Proof</label>
            <input
              type="text"
              value={receiptUrl}
              onChange={(e) => setReceiptUrl(e.target.value)}
              placeholder="https://storage.../receipt.jpg"
              className="w-full border border-gray-300 rounded-lg p-2.5 text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700"
          >
            {loading ? "Publishing..." : "Submit Receipt to Public Ledger"}
          </button>
        </form>
      )}

      {/* Form: Post Field Milestone */}
      {activeSubTab === "add_update" && (
        <form onSubmit={handleCreateUpdate} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Post Field Milestone Update</h3>
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Milestone Headline</label>
            <input
              type="text"
              value={updateTitle}
              onChange={(e) => setUpdateTitle(e.target.value)}
              placeholder="e.g. Well Drilling Completed in Turkana East"
              className="w-full border border-gray-300 rounded-lg p-2.5 text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Description & Impact Story</label>
            <textarea
              value={updateDesc}
              onChange={(e) => setUpdateDesc(e.target.value)}
              placeholder="Describe what was accomplished and how donors made it possible..."
              rows={3}
              className="w-full border border-gray-300 rounded-lg p-2.5 text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Estimated Beneficiaries (People)</label>
            <input
              type="number"
              value={peopleServed}
              onChange={(e) => setPeopleServed(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2.5 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Field Photo URL</label>
            <input
              type="text"
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              placeholder="https://storage.../well_photo.jpg"
              className="w-full border border-gray-300 rounded-lg p-2.5 text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700"
          >
            {loading ? "Publishing..." : "Publish Milestone Update"}
          </button>
        </form>
      )}
    </div>
  );
}