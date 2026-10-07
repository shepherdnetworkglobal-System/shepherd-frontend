"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, Activity, ArrowUpRight, Menu, X } from "lucide-react";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === "/" && pathname === "/") return true;
    if (path !== "/" && pathname?.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="sticky top-0 z-50 w-full pt-4 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <div className="glass-strong rounded-2xl shadow-[0_8px_40px_-12px_rgba(26,22,18,0.12)] px-4 sm:px-6">
          <div className="flex items-center justify-between h-[4.25rem]">
            {/* Brand */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-white border border-[rgba(26,22,18,0.08)] flex items-center justify-center shadow-sm group-hover:shadow-md group-hover:scale-[1.03] transition-all duration-300">
                <img
                  src="/logo.jpg"
                  alt="Shepherd Network"
                  className="w-full h-full object-contain p-1"
                />
              </div>
              <div className="flex flex-col leading-tight">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-semibold tracking-wide text-[#1A1612] font-sans">
                    SHEPHERD
                  </span>
                  <span className="text-[8px] uppercase tracking-[0.14em] px-1.5 py-0.5 rounded-md bg-[#D1FAE5] text-[#0F9F6E] border border-[#0F9F6E]/20 font-semibold">
                    Verified
                  </span>
                </div>
                <span className="text-[10px] text-[#7A736A] tracking-[0.12em] uppercase font-medium mt-0.5">
                  Humanitarian Rails
                </span>
              </div>
            </Link>

            {/* Desktop Navigation — floating pill cluster */}
            <nav className="hidden md:flex items-center gap-1 p-1 rounded-full bg-[#EFEBE4]/70 border border-[rgba(26,22,18,0.06)]">
              <Link
                href="/"
                className={`px-4 py-2 text-[11px] uppercase tracking-[0.12em] font-semibold rounded-full transition-all duration-300 ${
                  isActive("/")
                    ? "bg-white text-[#1A1612] shadow-sm border border-[rgba(26,22,18,0.06)]"
                    : "text-[#7A736A] hover:text-[#1A1612] hover:bg-white/60"
                }`}
              >
                Overview
              </Link>
              <Link
                href="/missions"
                className={`px-4 py-2 text-[11px] uppercase tracking-[0.12em] font-semibold rounded-full transition-all duration-300 flex items-center gap-1.5 ${
                  isActive("/missions")
                    ? "bg-white text-[#1A1612] shadow-sm border border-[rgba(26,22,18,0.06)]"
                    : "text-[#7A736A] hover:text-[#1A1612] hover:bg-white/60"
                }`}
              >
                <Compass className="w-3.5 h-3.5 text-[#3B4FD9]" />
                Missions
              </Link>
              <Link
                href="/transparency"
                className={`px-4 py-2 text-[11px] uppercase tracking-[0.12em] font-semibold rounded-full transition-all duration-300 flex items-center gap-1.5 ${
                  isActive("/transparency")
                    ? "bg-white text-[#1A1612] shadow-sm border border-[rgba(26,22,18,0.06)]"
                    : "text-[#7A736A] hover:text-[#1A1612] hover:bg-white/60"
                }`}
              >
                <Activity className="w-3.5 h-3.5 text-[#0F9F6E]" />
                Ledger
              </Link>
            </nav>

            {/* CTA Group */}
            <div className="hidden md:flex items-center gap-3">
              <Link
                href="/admin"
                className="text-[11px] uppercase tracking-[0.12em] text-[#7A736A] hover:text-[#1A1612] font-semibold transition-colors duration-200"
              >
                Admin
              </Link>
              <Link
                href="/missions"
                className="group relative inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#3B4FD9] text-white text-[11px] uppercase tracking-[0.12em] font-semibold shadow-[0_8px_24px_-6px_rgba(59,79,217,0.45)] hover:bg-[#2A3BB0] hover:shadow-[0_12px_28px_-6px_rgba(59,79,217,0.55)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-300"
              >
                <span>Deploy Funds</span>
                <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2.5 rounded-xl bg-[#EFEBE4] border border-[rgba(26,22,18,0.08)] text-[#1A1612] hover:bg-[#E8D5A3]/40 transition pressable"
              aria-label="Toggle Navigation"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {/* Mobile Dropdown */}
          {mobileOpen && (
            <div className="md:hidden pb-5 pt-2 border-t border-[rgba(26,22,18,0.06)] space-y-1.5">
              {[
                { href: "/", label: "Overview" },
                { href: "/missions", label: "Active Missions" },
                { href: "/transparency", label: "Public Ledger" },
                { href: "/admin", label: "Admin Portal" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="block px-4 py-3 rounded-xl text-sm font-semibold text-[#3D3832] hover:bg-[#EFEBE4] transition"
                >
                  {item.label}
                </Link>
              ))}
              <div className="pt-2 px-2">
                <Link
                  href="/missions"
                  onClick={() => setMobileOpen(false)}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#3B4FD9] text-white text-[11px] uppercase tracking-[0.12em] font-semibold shadow-[0_8px_24px_-6px_rgba(59,79,217,0.45)]"
                >
                  <span>Deploy Funds</span>
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}