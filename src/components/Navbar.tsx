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
    <header className="sticky top-0 z-50 w-full backdrop-blur-2xl bg-[#0C0E0D]/75 border-b border-white/[0.07] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-3.5 group">
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-[#1C221F] to-[#121614] border border-white/[0.1] flex items-center justify-center shadow-[0_0_20px_rgba(143,166,142,0.12)] group-hover:border-[#8FA68E]/40 group-hover:shadow-[0_0_25px_rgba(143,166,142,0.25)] transition-all duration-300">
              <ShieldCheck className="w-5 h-5 text-[#8FA68E] transition-transform duration-300 group-hover:scale-105" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-base font-semibold text-[#E6DED3] tracking-tight">
                  Shepherd
                </span>
                <span className="text-xs uppercase tracking-widest px-1.5 py-0.5 rounded-md bg-[#8FA68E]/10 text-[#8FA68E] border border-[#8FA68E]/20 font-medium">
                  Protocol
                </span>
              </div>
              <span className="text-[11px] text-[#9A9690] tracking-wider uppercase font-medium">
                Verified Humanitarian Rails
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1.5 p-1 rounded-full bg-white/[0.025] border border-white/[0.06] backdrop-blur-xl">
            <Link
              href="/"
              className={`px-4 py-2 text-xs uppercase tracking-wider font-medium rounded-full transition-all duration-200 ${
                isActive("/")
                  ? "bg-white/[0.08] text-[#E6DED3] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]"
                  : "text-[#9A9690] hover:text-[#E6DED3] hover:bg-white/[0.04]"
              }`}
            >
              Overview
            </Link>
            <Link
              href="/missions"
              className={`px-4 py-2 text-xs uppercase tracking-wider font-medium rounded-full transition-all duration-200 flex items-center gap-1.5 ${
                isActive("/missions")
                  ? "bg-white/[0.08] text-[#E6DED3] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]"
                  : "text-[#9A9690] hover:text-[#E6DED3] hover:bg-white/[0.04]"
              }`}
            >
              <Compass className="w-3.5 h-3.5 text-[#8FA68E]" />
              Field Missions
            </Link>
            <Link
              href="/transparency"
              className={`px-4 py-2 text-xs uppercase tracking-wider font-medium rounded-full transition-all duration-200 flex items-center gap-1.5 ${
                isActive("/transparency")
                  ? "bg-white/[0.08] text-[#E6DED3] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]"
                  : "text-[#9A9690] hover:text-[#E6DED3] hover:bg-white/[0.04]"
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-[#C08A6A]" />
              Public Ledger
            </Link>
          </nav>

          {/* CTA Group */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/admin"
              className="text-xs uppercase tracking-wider text-[#9A9690] hover:text-[#E6DED3] px-3.5 py-2 font-medium transition-colors"
            >
              Admin Portal
            </Link>
            <Link
              href="/missions"
              className="group relative inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#C08A6A] to-[#D9A487] text-[#0C0E0D] text-xs uppercase tracking-wider font-semibold shadow-[0_0_25px_rgba(192,138,106,0.25)] hover:shadow-[0_0_35px_rgba(192,138,106,0.45)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            >
              <span>Deploy Funds</span>
              <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-[#E6DED3] hover:bg-white/[0.06] transition"
            aria-label="Toggle Navigation"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Dropdown Panel */}
        {mobileOpen && (
          <div className="md:hidden pb-6 pt-3 border-t border-white/[0.08] space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
            <Link
              href="/"
              onClick={() => setMobileOpen(false)}
              className="block px-4 py-3 rounded-xl text-sm font-medium text-[#E6DED3] hover:bg-white/[0.05] transition"
            >
              Overview
            </Link>
            <Link
              href="/missions"
              onClick={() => setMobileOpen(false)}
              className="block px-4 py-3 rounded-xl text-sm font-medium text-[#E6DED3] hover:bg-white/[0.05] transition"
            >
              Field Missions
            </Link>
            <Link
              href="/transparency"
              onClick={() => setMobileOpen(false)}
              className="block px-4 py-3 rounded-xl text-sm font-medium text-[#E6DED3] hover:bg-white/[0.05] transition"
            >
              Public Ledger
            </Link>
            <Link
              href="/admin"
              onClick={() => setMobileOpen(false)}
              className="block px-4 py-3 rounded-xl text-sm font-medium text-[#9A9690] hover:text-[#E6DED3] transition"
            >
              Admin Portal
            </Link>
            <div className="pt-2 px-2">
              <Link
                href="/missions"
                onClick={() => setMobileOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-[#C08A6A] to-[#D9A487] text-[#0C0E0D] text-xs uppercase tracking-wider font-semibold shadow-[0_0_20px_rgba(192,138,106,0.3)]"
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