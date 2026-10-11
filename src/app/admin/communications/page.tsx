"use client";

import React, { useEffect, useState } from "react";
import {
  BookOpen,
  Plus,
  RefreshCw,
  Search,
  CheckCircle2,
  Trash2,
  Edit3,
  Sparkles,
  Bookmark,
  Layers,
  Activity,
  X,
  Eye,
  Star
} from "lucide-react";
import { apiRequest } from "@/lib/api";

interface Scripture {
  id: number;
  reference: string;
  translation: string;
  text: string;
  theme: string;
  placement: string;
  is_active: boolean;
  is_featured: boolean;
  weight: number;
  notes?: string | null;
  created_at?: string | null;
}

export default function SpiritualEngineWorkstation() {
  const [scriptures, setScriptures] = useState<Scripture[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPlacement, setFilterPlacement] = useState("ALL");
  const [filterTheme, setFilterTheme] = useState("ALL");
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingScripture, setEditingScripture] = useState<Scripture | null>(null);
  const [saving, setSaving] = useState(false);

  // Form states
  const [reference, setReference] = useState("2 Corinthians 8:21");
  const [translation, setTranslation] = useState("ESV");
  const [text, setText] = useState("For we aim at what is honorable not only in the Lord's sight but also in the sight of man.");
  const [theme, setTheme] = useState("TRANSPARENCY");
  const [placement, setPlacement] = useState("HOMEPAGE");
  const [isActive, setIsActive] = useState(true);
  const [isFeatured, setIsFeatured] = useState(true);
  const [weight, setWeight] = useState("100");
  const [notes, setNotes] = useState("");

  const fetchScriptures = async () => {
    setLoading(true);
    try {
      const data = await apiRequest("/api/scripture");
      if (Array.isArray(data)) setScriptures(data);
    } catch (err) {
      console.error("Failed to load scriptures:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScriptures();
  }, []);

  const openCreateModal = () => {
    setEditingScripture(null);
    setReference("");
    setTranslation("ESV");
    setText("");
    setTheme("GENERAL");
    setPlacement("HOMEPAGE");
    setIsActive(true);
    setIsFeatured(false);
    setWeight("10");
    setNotes("");
    setShowModal(true);
  };

  const openEditModal = (s: Scripture) => {
    setEditingScripture(s);
    setReference(s.reference);
    setTranslation(s.translation);
    setText(s.text);
    setTheme(s.theme);
    setPlacement(s.placement);
    setIsActive(s.is_active);
    setIsFeatured(s.is_featured);
    setWeight(String(s.weight));
    setNotes(s.notes || "");
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        reference,
        translation,
        text,
        theme,
        placement,
        is_active: isActive,
        is_featured: isFeatured,
        weight: parseInt(weight, 10) || 0,
        notes: notes || null
      };

      if (editingScripture) {
        await apiRequest(`/api/scripture/${editingScripture.id}`, {
          method: "PUT",
          body: JSON.stringify(payload)
        });
      } else {
        await apiRequest("/api/scripture", {
          method: "POST",
          body: JSON.stringify(payload)
        });
      }

      setShowModal(false);
      await fetchScriptures();
    } catch (err: any) {
      alert(err.message || "Failed to save scripture.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this verse?")) return;
    try {
      await apiRequest(`/api/scripture/${id}`, { method: "DELETE" });
      await fetchScriptures();
    } catch (err: any) {
      alert(err.message || "Failed to delete scripture.");
    }
  };

  const handleToggleActive = async (s: Scripture) => {
    try {
      await apiRequest(`/api/scripture/${s.id}`, {
        method: "PUT",
        body: JSON.stringify({ is_active: !s.is_active })
      });
      await fetchScriptures();
    } catch (err: any) {
      alert(err.message || "Failed to toggle status.");
    }
  };

  const filtered = scriptures.filter((s) => {
    const matchSearch =
      s.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.text.toLowerCase().includes(searchTerm.toLowerCase());
    const matchPlacement = filterPlacement === "ALL" || s.placement === filterPlacement;
    const matchTheme = filterTheme === "ALL" || s.theme === filterTheme;
    return matchSearch && matchPlacement && matchTheme;
  });

  const activeCount = scriptures.filter((s) => s.is_active).length;
  const featuredCount = scriptures.filter((s) => s.is_featured).length;

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6 animate-in fade-in duration-300 text-[#3D3832]">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[rgba(26,22,18,0.08)] pb-5">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-[10px] font-bold text-[#064E3B] uppercase tracking-widest bg-[#064E3B]/10 px-2.5 py-0.5 rounded-full border border-[#064E3B]/20">
              Module 01.09
            </span>
            <span className="text-[10px] font-semibold text-[#7A736A] uppercase tracking-wider">Spiritual Engine & Communications</span>
          </div>
          <h1 className="font-serif text-2xl font-semibold text-[#1A1612] tracking-tight flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-[#064E3B]" />
            Spiritual Engine Workstation
          </h1>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={openCreateModal}
            className="px-4 py-2.5 bg-[#064E3B] hover:bg-[#047857] text-white rounded-xl text-[10px] font-semibold uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" /> Add Scripture
          </button>
          
          <button
            onClick={fetchScriptures}
            className="px-3.5 py-2.5 text-[10px] font-semibold text-[#7A736A] bg-white/70 border border-[rgba(26,22,18,0.08)] rounded-xl hover:bg-[#EFEBE4]/50 flex items-center gap-1.5 shadow-sm transition-all uppercase tracking-wider"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Sync
          </button>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Scriptures", value: scriptures.length, icon: Bookmark, color: "text-[#1A1612]" },
          { label: "Active Verses", value: activeCount, icon: CheckCircle2, color: "text-[#064E3B]" },
          { label: "Featured Slots", value: featuredCount, icon: Star, color: "text-[#C4A35A]" },
          { label: "Placements", value: "6 Zones", icon: Layers, color: "text-[#7A736A]" },
        ].map((kpi, idx) => (
          <div key={idx} className="p-4 bg-white/70 backdrop-blur-md border border-[rgba(26,22,18,0.08)] rounded-2xl shadow-sm">
            <div className="flex items-center justify-between text-[10px] font-semibold text-[#7A736A] uppercase tracking-wider mb-1">
              <span>{kpi.label}</span>
              <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
            </div>
            <div className="text-xl font-semibold text-[#1A1612] num-tabular">{kpi.value}</div>
          </div>
        ))}
      </div>

      {/* Controls Bar */}
      <div className="bg-white/70 backdrop-blur-md border border-[rgba(26,22,18,0.08)] rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row gap-3 justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#7A736A] absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search reference or verse text..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-white/50 border border-[rgba(26,22,18,0.08)] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#064E3B] text-[#1A1612]"
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={filterPlacement}
            onChange={(e) => setFilterPlacement(e.target.value)}
            className="text-xs font-semibold bg-white/80 border border-[rgba(26,22,18,0.08)] rounded-xl px-3 py-2 text-[#1A1612]"
          >
            <option value="ALL">All Placements</option>
            <option value="HOMEPAGE">Homepage</option>
            <option value="MISSION_BRIEF">Mission Brief</option>
            <option value="DONATION_WALL">Donation Wall</option>
            <option value="OPERATOR_PROFILE">Operator Profile</option>
            <option value="GLOBAL">Global Fallback</option>
          </select>

          <select
            value={filterTheme}
            onChange={(e) => setFilterTheme(e.target.value)}
            className="text-xs font-semibold bg-white/80 border border-[rgba(26,22,18,0.08)] rounded-xl px-3 py-2 text-[#1A1612]"
          >
            <option value="ALL">All Themes</option>
            <option value="TRANSPARENCY">Transparency</option>
            <option value="GENEROSITY">Generosity</option>
            <option value="STEWARDSHIP">Stewardship</option>
            <option value="FAITH">Faith</option>
            <option value="SERVICE">Service</option>
            <option value="GENERAL">General</option>
          </select>
        </div>
      </div>

      {/* Scriptures Feed */}
      {loading ? (
        <div className="py-20 text-center text-xs font-medium text-[#7A736A]">Loading spiritual engine...</div>
      ) : filtered.length === 0 ? (
        <div className="py-20 bg-white/70 border border-dashed border-[rgba(26,22,18,0.12)] rounded-3xl text-center text-xs font-medium text-[#7A736A]">
          No scriptures found matching filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((s) => (
            <div
              key={s.id}
              className="bg-white/70 backdrop-blur-md border border-[rgba(26,22,18,0.08)] rounded-3xl p-6 shadow-sm hover:border-[#064E3B]/20 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-serif text-lg font-semibold text-[#1A1612]">{s.reference}</span>
                    <span className="text-[9px] uppercase tracking-wider font-semibold text-[#C4A35A] bg-[#C4A35A]/10 px-2 py-0.5 rounded border border-[#C4A35A]/20">
                      {s.translation}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {s.is_featured && (
                      <span className="text-[9px] uppercase tracking-wider font-bold text-[#C4A35A] bg-[#C4A35A]/15 px-2 py-0.5 rounded-full border border-[#C4A35A]/30 flex items-center gap-1">
                        <Star className="w-2.5 h-2.5" /> Featured
                      </span>
                    )}
                    <span
                      className={`text-[9px] uppercase tracking-wider font-bold px-2.5 py-0.5 rounded-full border ${
                        s.is_active
                          ? "bg-[#064E3B]/10 text-[#064E3B] border-[#064E3B]/20"
                          : "bg-gray-100 text-gray-500 border-gray-200"
                      }`}
                    >
                      {s.is_active ? "Active" : "Disabled"}
                    </span>
                  </div>
                </div>

                <p className="font-serif text-base italic text-[#1A1612] leading-relaxed bg-[#F7F4EF]/50 p-4 rounded-2xl border border-[rgba(26,22,18,0.04)]">
                  "{s.text}"
                </p>

                <div className="flex flex-wrap gap-2 text-[9px] uppercase tracking-wider font-semibold text-[#7A736A]">
                  <span className="bg-[#EFEBE4] px-2.5 py-1 rounded-md">Placement: {s.placement}</span>
                  <span className="bg-[#EFEBE4] px-2.5 py-1 rounded-md">Theme: {s.theme}</span>
                  <span className="bg-[#EFEBE4] px-2.5 py-1 rounded-md">Weight: {s.weight}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-[rgba(26,22,18,0.04)]">
                <button
                  onClick={() => handleToggleActive(s)}
                  className="text-[10px] uppercase tracking-wider font-semibold text-[#064E3B] hover:underline"
                >
                  {s.is_active ? "Disable Verse" : "Activate Verse"}
                </button>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(s)}
                    className="p-2 rounded-lg bg-[#EFEBE4]/50 hover:bg-[#EFEBE4] text-[#1A1612] transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(s.id)}
                    className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#1A1612]/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-[#F7F4EF] rounded-[2rem] border border-[rgba(26,22,18,0.08)] shadow-2xl max-w-xl w-full p-8 animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/80 border border-[rgba(26,22,18,0.08)] flex items-center justify-center text-[#7A736A] hover:text-[#1A1612]"
            >
              <X className="w-4 h-4" />
            </button>
            <span className="text-[9px] font-bold text-[#064E3B] uppercase tracking-widest bg-[#064E3B]/10 px-2 py-1 rounded">
              Spiritual Engine Curator
            </span>
            <h2 className="font-serif text-xl font-semibold text-[#1A1612] mt-3 mb-5">
              {editingScripture ? "Edit Scripture Verse" : "Add New Scripture Verse"}
            </h2>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="text-[10px] uppercase tracking-wider font-semibold text-[#7A736A] block mb-1">Bible Reference</label>
                  <input
                    required
                    type="text"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    placeholder="e.g. 2 Corinthians 8:21"
                    className="w-full text-xs font-semibold p-3 bg-white border border-[rgba(26,22,18,0.08)] rounded-xl text-[#1A1612]"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider font-semibold text-[#7A736A] block mb-1">Translation</label>
                  <input
                    required
                    type="text"
                    value={translation}
                    onChange={(e) => setTranslation(e.target.value)}
                    placeholder="ESV"
                    className="w-full text-xs font-semibold p-3 bg-white border border-[rgba(26,22,18,0.08)] rounded-xl text-[#1A1612]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-wider font-semibold text-[#7A736A] block mb-1">Verse Text</label>
                <textarea
                  required
                  rows={3}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Enter complete scripture text..."
                  className="w-full text-xs font-serif italic p-3 bg-white border border-[rgba(26,22,18,0.08)] rounded-xl text-[#1A1612]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase tracking-wider font-semibold text-[#7A736A] block mb-1">Placement Zone</label>
                  <select
                    value={placement}
                    onChange={(e) => setPlacement(e.target.value)}
                    className="w-full text-xs font-semibold p-3 bg-white border border-[rgba(26,22,18,0.08)] rounded-xl text-[#1A1612]"
                  >
                    <option value="HOMEPAGE">Homepage</option>
                    <option value="MISSION_BRIEF">Mission Brief</option>
                    <option value="DONATION_WALL">Donation Wall</option>
                    <option value="OPERATOR_PROFILE">Operator Profile</option>
                    <option value="GLOBAL">Global Fallback</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider font-semibold text-[#7A736A] block mb-1">Theme Tag</label>
                  <select
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                    className="w-full text-xs font-semibold p-3 bg-white border border-[rgba(26,22,18,0.08)] rounded-xl text-[#1A1612]"
                  >
                    <option value="TRANSPARENCY">Transparency</option>
                    <option value="GENEROSITY">Generosity</option>
                    <option value="STEWARDSHIP">Stewardship</option>
                    <option value="FAITH">Faith</option>
                    <option value="SERVICE">Service</option>
                    <option value="GENERAL">General</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-2">
                <label className="p-3 bg-white rounded-xl border border-[rgba(26,22,18,0.08)] flex items-center justify-between cursor-pointer">
                  <span className="text-xs font-semibold text-[#1A1612]">Active</span>
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 rounded text-[#064E3B]"
                  />
                </label>

                <label className="p-3 bg-white rounded-xl border border-[rgba(26,22,18,0.08)] flex items-center justify-between cursor-pointer">
                  <span className="text-xs font-semibold text-[#1A1612]">Featured</span>
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="w-4 h-4 rounded text-[#064E3B]"
                  />
                </label>

                <div>
                  <input
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="Weight (0-100)"
                    className="w-full text-xs font-semibold p-3 bg-white border border-[rgba(26,22,18,0.08)] rounded-xl text-[#1A1612]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full bg-[#064E3B] hover:bg-[#047857] text-white font-semibold py-3.5 rounded-xl text-[10px] uppercase tracking-widest transition-all disabled:opacity-50 mt-2"
              >
                {saving ? "Commiting..." : "Commit Scripture Verse"}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}