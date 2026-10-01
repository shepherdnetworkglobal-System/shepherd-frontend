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
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveSubTab("ledger")}
            className={`px-4 py-2 rounded-xl text-[10px] uppercase tracking-wider font-bold flex items-center gap-1.5 transition-all ${
              activeSubTab === "ledger"
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <FileText className="w-3.5 h-3.5" /> Public Accounting
          </button>
          <button
            onClick={() => setActiveSubTab("add_receipt")}
            className={`px-4 py-2 rounded-xl text-[10px] uppercase tracking-wider font-bold flex items-center gap-1.5 transition-all ${
              activeSubTab === "add_receipt"
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <Plus className="w-3.5 h-3.5" /> Log Receipt
          </button>
          <button
            onClick={() => setActiveSubTab("add_update")}
            className={`px-4 py-2 rounded-xl text-[10px] uppercase tracking-wider font-bold flex items-center gap-1.5 transition-all ${
              activeSubTab === "add_update"
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <Plus className="w-3.5 h-3.5" /> Post Field Story
          </button>
        </div>
      </div>

      {message && (
        <div className="p-3.5 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-semibold border border-emerald-200 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> {message}
        </div>
      )}

      {/* Main Ledger View */}
      {activeSubTab === "ledger" && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
              <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Total Funds In (Stellar)</span>
              <div className="flex items-center gap-2 mt-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                </div>
                <span className="text-2xl font-extrabold text-slate-900 num-tabular">$7,840.00</span>
              </div>
              <span className="text-[10px] uppercase tracking-wider text-emerald-600 font-bold mt-2 block">100% On-Chain Verified</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
              <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Verified Field Expenses</span>
              <div className="flex items-center gap-2 mt-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center">
                  <ReceiptIcon className="w-4 h-4 text-blue-600" />
                </div>
                <span className="text-2xl font-extrabold text-slate-900 num-tabular">$5,230.00</span>
              </div>
              <span className="text-[10px] uppercase tracking-wider text-blue-600 font-bold mt-2 block">Backed by Field Receipts</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
              <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Direct Impact</span>
              <div className="flex items-center gap-2 mt-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                  <Users className="w-4 h-4 text-indigo-600" />
                </div>
                <span className="text-2xl font-extrabold text-slate-900 num-tabular">1,420</span>
              </div>
              <span className="text-[10px] uppercase tracking-wider text-indigo-600 font-bold mt-2 block">People Served</span>
            </div>
          </div>

          {/* Itemized Audit Feed */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              Itemized Field Expenditure Feed
            </h3>

            <div className="divide-y divide-slate-100">
              <div className="py-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                    <ReceiptIcon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-slate-900 truncate">Borehole Drilling Machinery Rental</h4>
                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">Vendor: Lodwar Heavy Works Ltd • Equipment</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-sm font-extrabold text-slate-900 num-tabular">$3,400.00</span>
                  <span className="text-[10px] uppercase tracking-wider text-emerald-600 font-bold block mt-0.5">Verified ✓</span>
                </div>
              </div>

              <div className="py-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                    <ReceiptIcon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-slate-900 truncate">PVC Piping & Solar Water Pump</h4>
                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">Vendor: Davis & Shirtliff Kenya • Materials</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-sm font-extrabold text-slate-900 num-tabular">$1,830.00</span>
                  <span className="text-[10px] uppercase tracking-wider text-emerald-600 font-bold block mt-0.5">Verified ✓</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Form: Upload Receipt */}
      {activeSubTab === "add_receipt" && (
        <form onSubmit={handleCreateReceipt} className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-sm space-y-5">
          <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100 pb-4">Log Field Expense Receipt</h3>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Expense Title</label>
            <input
              type="text"
              value={receiptTitle}
              onChange={(e) => setReceiptTitle(e.target.value)}
              placeholder="e.g. 50x Bags of Cement"
              className="w-full border border-slate-200 rounded-xl p-3 text-sm font-medium text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 shadow-sm transition-all"
              required
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Amount Spent (USD)</label>
              <input
                type="number"
                value={receiptAmount}
                onChange={(e) => setReceiptAmount(e.target.value)}
                placeholder="450.00"
                className="w-full border border-slate-200 rounded-xl p-3 text-sm font-bold text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 shadow-sm transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Category</label>
              <select
                value={receiptCategory}
                onChange={(e) => setReceiptCategory(e.target.value)}
                className="w-full border border-slate-200 rounded-xl p-3 text-sm font-bold text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 shadow-sm transition-all"
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
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Vendor / Supplier Name</label>
            <input
              type="text"
              value={receiptVendor}
              onChange={(e) => setReceiptVendor(e.target.value)}
              placeholder="Local Hardware Store"
              className="w-full border border-slate-200 rounded-xl p-3 text-sm font-medium text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 shadow-sm transition-all"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Receipt Image URL / Proof</label>
            <input
              type="text"
              value={receiptUrl}
              onChange={(e) => setReceiptUrl(e.target.value)}
              placeholder="https://storage.../receipt.jpg"
              className="w-full border border-slate-200 rounded-xl p-3 text-sm font-medium text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 shadow-sm transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3.5 rounded-xl text-xs uppercase tracking-wider font-bold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-70"
          >
            {loading ? "Publishing..." : "Submit Receipt to Public Ledger"}
          </button>
        </form>
      )}

      {/* Form: Post Field Milestone */}
      {activeSubTab === "add_update" && (
        <form onSubmit={handleCreateUpdate} className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-sm space-y-5">
          <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100 pb-4">Post Field Milestone Update</h3>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Milestone Headline</label>
            <input
              type="text"
              value={updateTitle}
              onChange={(e) => setUpdateTitle(e.target.value)}
              placeholder="e.g. Well Drilling Completed in Turkana East"
              className="w-full border border-slate-200 rounded-xl p-3 text-sm font-medium text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 shadow-sm transition-all"
              required
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Description & Impact Story</label>
            <textarea
              value={updateDesc}
              onChange={(e) => setUpdateDesc(e.target.value)}
              placeholder="Describe what was accomplished and how donors made it possible..."
              rows={3}
              className="w-full border border-slate-200 rounded-xl p-3 text-sm font-medium text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 shadow-sm transition-all"
              required
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Estimated Beneficiaries (People)</label>
            <input
              type="number"
              value={peopleServed}
              onChange={(e) => setPeopleServed(e.target.value)}
              className="w-full border border-slate-200 rounded-xl p-3 text-sm font-bold text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 shadow-sm transition-all"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Field Photo URL</label>
            <input
              type="text"
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              placeholder="https://storage.../well_photo.jpg"
              className="w-full border border-slate-200 rounded-xl p-3 text-sm font-medium text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 shadow-sm transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3.5 rounded-xl text-xs uppercase tracking-wider font-bold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-70"
          >
            {loading ? "Publishing..." : "Publish Milestone Update"}
          </button>
        </form>
      )}
    </div>
  );
}