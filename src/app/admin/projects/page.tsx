"use client";

import React from "react";
import { Briefcase } from "lucide-react";

export default function ProjectsPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto h-full flex flex-col items-center justify-center animate-in fade-in duration-300">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center mb-6 shadow-sm">
        <Briefcase className="w-8 h-8 text-slate-400" />
      </div>
      <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-2">
        01.02 Projects Module
      </h1>
      <p className="text-sm font-medium text-slate-500 max-w-md text-center leading-relaxed">
        This organizational subsystem is scheduled for the next major engineering cycle. Active operations remain available in the Overview dashboard.
      </p>
    </div>
  );
}