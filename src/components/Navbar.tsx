"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck, Compass, Activity, ArrowUpRight, Menu, X } from "lucide-react";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === "/" && pathname === "/") return true;
    if (path !== "/" && pathname?.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-2xl bg-white/80 border-b border-slate-200/80 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-3.5 group">
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 border border-blue-500/20 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/30 transition-all duration-300">
              <ShieldCheck className="w-5 h-5 text-white transition-transform duration-300 group-hover:scale-105" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-base font-bold text-slate-900 tracking-tight">
                  Shepherd
                </span>
                <span className="text-xs uppercase tracking-widest px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                  Verified
                </span>
              </div>
              <span className="text-[11px] text-slate-500 tracking-wider uppercase font-medium">
                Humanitarian Rails
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1.5 p-1 rounded-full bg-slate-100/50 border border-slate-200/60">
            <Link
              href="/"
              className={`px-4 py-2 text-xs uppercase tracking-wider font-bold rounded-full transition-all duration-200 ${
                isActive("/")
                  ? "bg-white text-slate-900 shadow-sm border border-slate-200/50"
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/50"
              }`}
            >
              Overview
            </Link>
            <Link
              href="/missions"
              className={`px-4 py-2 text-xs uppercase tracking-wider font-bold rounded-full transition-all duration-200 flex items-center gap-1.5 ${
                isActive("/missions")
                  ? "bg-white text-slate-900 shadow-sm border border-slate-200/50"
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/50"
              }`}
            >
              <Compass className="w-3.5 h-3.5 text-blue-600" />
              Active Missions
            </Link>
            <Link
              href="/transparency"
              className={`px-4 py-2 text-xs uppercase tracking-wider font-bold rounded-full transition-all duration-200 flex items-center gap-1.5 ${
                isActive("/transparency")
                  ? "bg-white text-slate-900 shadow-sm border border-slate-200/50"
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/50"
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-emerald-600" />
              Public Ledger
            </Link>
          </nav>

          {/* CTA Group */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/admin"
              className="text-xs uppercase tracking-wider text-slate-500 hover:text-slate-900 font-bold transition-colors"
            >
              Admin
            </Link>
            <Link
              href="/missions"
              className="group relative inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs uppercase tracking-wider font-bold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            >
              <span>Deploy Funds</span>
              <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200 transition"
            aria-label="Toggle Navigation"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Dropdown Panel */}
        {mobileOpen && (
          <div className="md:hidden pb-6 pt-3 border-t border-slate-100 space-y-2 animate-in fade-in duration-200">
            <Link
              href="/"
              onClick={() => setMobileOpen(false)}
              className="block px-4 py-3 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition"
            >
              Overview
            </Link>
            <Link
              href="/missions"
              onClick={() => setMobileOpen(false)}
              className="block px-4 py-3 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition"
            >
              Active Missions
            </Link>
            <Link
              href="/transparency"
              onClick={() => setMobileOpen(false)}
              className="block px-4 py-3 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition"
            >
              Public Ledger
            </Link>
            <Link
              href="/admin"
              onClick={() => setMobileOpen(false)}
              className="block px-4 py-3 rounded-xl text-sm font-bold text-slate-500 hover:text-slate-900 transition"
            >
              Admin Portal
            </Link>
            <div className="pt-2 px-2">
              <Link
                href="/missions"
                onClick={() => setMobileOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs uppercase tracking-wider font-bold shadow-lg shadow-blue-500/25"
              >
                <span>Deploy Funds</span>
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}