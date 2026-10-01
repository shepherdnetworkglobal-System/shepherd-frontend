"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShieldCheck,
  XCircle,
  Home,
  Users,
  Briefcase,
  Building,
  Box,
  Lock,
  DollarSign,
  Globe2,
  Handshake,
  Megaphone,
  LogOut
} from "lucide-react";
import { apiRequest } from "@/lib/api";

const OS_MODULES = [
  { id: "overview", label: "Command Dashboard", icon: Home, path: "/admin" },
  { id: "leadership", label: "01.01 Leadership", icon: Users, path: "/admin/leadership" },
  { id: "projects", label: "01.02 Projects", icon: Briefcase, path: "/admin/projects" },
  { id: "organization", label: "01.03 Organization", icon: Building, path: "/admin/organization" },
  { id: "product", label: "01.04 Product", icon: Box, path: "/admin/product" },
  { id: "trust", label: "01.05 Trust & Verif", icon: Lock, path: "/admin/trust" },
  { id: "finance", label: "01.06 Finance", icon: DollarSign, path: "/admin/finance" },
  { id: "missions", label: "01.07 Missions", icon: Globe2, path: "/admin/missions" },
  { id: "partnerships", label: "01.08 Partnerships", icon: Handshake, path: "/admin/partnerships" },
  { id: "communications", label: "01.09 Communications", icon: Megaphone, path: "/admin/communications" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState(true);

  // Login States
  const [loginEmail, setLoginEmail] = useState("admin@shepherd.network");
  const [loginPassword, setLoginPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("shepherd_token");
    const role = localStorage.getItem("shepherd_role");
    if (token && role === "ADMIN") {
      setIsAuthenticated(true);
    }
    setIsChecking(false);
  }, []);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);
    try {
      const data = await apiRequest("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });

      if (data.role !== "ADMIN") {
        throw new Error("Access denied: You must be an administrator.");
      }

      localStorage.setItem("shepherd_token", data.access_token);
      localStorage.setItem("shepherd_role", data.role);
      setIsAuthenticated(true);
    } catch (err: unknown) {
      setAuthError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("shepherd_token");
    localStorage.removeItem("shepherd_role");
    setIsAuthenticated(false);
  };

  if (isChecking) {
    return <div className="min-h-screen bg-slate-50" />; // Empty state during flash check
  }

  // Auth Gate
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 relative overflow-hidden flex items-center justify-center p-4">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] glow-blue rounded-full pointer-events-none -z-10" />
        <div className="max-w-md w-full bg-white/80 backdrop-blur-xl border border-slate-200/80 rounded-2xl p-8 shadow-xl text-slate-900">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-md">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold tracking-tight">Shepherd Admin</h2>
              <p className="text-[10px] uppercase tracking-widest font-bold text-slate-500">Command Center Login</p>
            </div>
          </div>

          {authError && (
            <div className="mb-6 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-semibold flex items-center gap-2">
              <XCircle className="w-4 h-4 shrink-0" /> {authError}
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-5">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">Email</label>
              <input type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-bold focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none" required />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">Passphrase</label>
              <input type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-bold focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none" required />
            </div>
            <button type="submit" disabled={authLoading} className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-3.5 rounded-xl text-xs uppercase tracking-wider shadow-lg hover:shadow-blue-500/40 transition-all">
              {authLoading ? "Authenticating..." : "Authorize Access"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Authenticated Command Center Shell
  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen sticky top-0 shrink-0 shadow-sm z-30">
        <div className="p-6 flex items-center gap-3 border-b border-slate-100">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-md">
            <ShieldCheck className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-extrabold text-slate-900 tracking-tight leading-none">Command Center</h1>
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Shepherd OS</span>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {OS_MODULES.map((mod) => {
            const isActive = pathname === mod.path;
            return (
              <Link
                key={mod.id}
                href={mod.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                  isActive 
                    ? "bg-blue-50 text-blue-700 font-bold" 
                    : "text-slate-600 font-medium hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <mod.icon className={`w-4 h-4 ${isActive ? "text-blue-600" : "text-slate-400"}`} />
                <span className="text-xs">{mod.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button onClick={handleLogout} className="flex items-center gap-2 w-full px-3 py-2.5 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 transition-all">
            <LogOut className="w-4 h-4" /> Terminate Session
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 overflow-y-auto h-screen relative">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] glow-blue rounded-full pointer-events-none -z-10" />
        {children}
      </main>
    </div>
  );
}