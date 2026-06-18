"use client";

import { 
  Sparkles, Clock, LayoutGrid, CheckCircle2, 
  BarChart3, PieChart as PieChartIcon, Activity, ChevronRight 
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function DashboardOverview({ tasks }: { tasks: any[] }) {
  const stats = {
    unassigned: tasks.filter(t => !t.assigneeId).length,
    inProgress: tasks.filter(t => t.status === "IN_PROGRESS").length,
    completed: tasks.filter(t => t.status === "DONE").length,
  };

  return (
    <div className="flex flex-col h-full bg-[#0d0d0d] text-slate-300 p-6 overflow-y-auto custom-scrollbar gap-6">
      
      {/* 1. Top Header Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-[11px] text-slate-500 font-medium">
          <span className="flex items-center gap-1.5"><Clock size={14}/> Refreshed: just now</span>
          <span className="flex items-center gap-1.5 px-2 py-0.5 bg-indigo-500/10 text-indigo-400 rounded-full border border-indigo-500/20">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" /> Auto refresh: On
          </span>
        </div>
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition shadow-lg">
          <LayoutGrid size={14} /> + Card
        </button>
      </div>

      {/* 2. Main Content Grid (Matches image_69013b.png) */}
      <div className="grid grid-cols-12 gap-6">
        
        {/* AI Executive Summary (Col-span 6) */}
        <div className="col-span-6 bg-[#111111] rounded-2xl border border-white/5 p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
              <Sparkles size={16} className="text-purple-400" /> AI Executive Summary
            </div>
            <div className="flex gap-3 text-slate-600">
              <Activity size={14} className="hover:text-white cursor-pointer" />
              <ChevronRight size={14} className="hover:text-white cursor-pointer" />
            </div>
          </div>
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white">Executive Summary</h2>
            <p className="text-sm leading-relaxed text-slate-400">
              The team has completed several tasks related to workspace optimizations. Key efforts involve 
              the creation of dynamic dashboard views, drag-and-drop interfaces, and high-fidelity 
              calendar components. These efforts are aimed at enhancing the user experience and 
              streamlining workflow management capabilities.
            </p>
            <div className="pt-4 border-t border-white/5">
              <h3 className="text-xs font-bold text-white uppercase mb-3">Key Efforts & Initiatives</h3>
              <ul className="list-disc list-inside text-sm text-slate-400 space-y-2">
                <li>UI Development: High-fidelity dashboard widgets and navigation components.</li>
                <li>Data Integration: Real-time synchronization with Prisma and Neon DB.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Right Column (Col-span 6) */}
        <div className="col-span-6 flex flex-col gap-6">
          {/* KPI Cards Row */}
          <div className="grid grid-cols-3 gap-4">
            <StatCard label="Unassigned" value={stats.unassigned} />
            <StatCard label="In Progress" value={stats.inProgress} />
            <StatCard label="Completed" value={stats.completed} />
          </div>

          {/* Workload by Status Visualization */}
          <div className="bg-[#111111] rounded-2xl border border-white/5 p-6 flex flex-col gap-6">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Workload by Status</div>
            <div className="relative pt-4 pb-8">
              <div className="h-2 w-full bg-white/5 rounded-full flex overflow-hidden">
                <div className="h-full bg-blue-500" style={{ width: '15%' }} />
                <div className="h-full bg-green-500" style={{ width: '85%' }} />
              </div>
              {/* Tick marks and numbers */}
              <div className="flex justify-between mt-4 text-[10px] text-slate-600 font-bold px-1">
                {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map(n => (
                  <div key={n} className="flex flex-col items-center gap-1">
                    <div className="w-[1px] h-1 bg-slate-700" />
                    {n}
                  </div>
                ))}
              </div>
              <div className="text-center text-[10px] text-slate-500 font-bold mt-2 uppercase">Tasks</div>
            </div>
          </div>
        </div>

        {/* 3. Bottom Row Charts */}
        <div className="col-span-4 bg-[#111111] rounded-2xl border border-white/5 p-6 min-h-[300px]">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-6">Total Tasks by Assignee</div>
          <div className="flex flex-col items-center justify-center h-full">
            <div className="w-40 h-40 rounded-full border-[20px] border-slate-800 flex items-center justify-center relative">
               <div className="absolute inset-0 rounded-full border-[20px] border-red-500" style={{ clipPath: 'inset(0 0 50% 50%)' }} />
               <div className="flex flex-col items-center">
                 <span className="text-xs text-slate-500">Total</span>
                 <span className="text-2xl font-bold text-white">{tasks.length}</span>
               </div>
            </div>
          </div>
        </div>

        <div className="col-span-4 bg-[#111111] rounded-2xl border border-white/5 p-6">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-6">Open Tasks by Assignee</div>
          <div className="flex items-end justify-center h-[200px] gap-4">
             <div className="w-12 bg-red-500/80 rounded-t-sm h-[40%]" />
             <div className="w-12 bg-red-500 rounded-t-sm h-[80%]" />
          </div>
        </div>

        <div className="col-span-4 bg-[#111111] rounded-2xl border border-white/5 p-6 flex flex-col items-center justify-center">
           <BarChart3 size={40} className="text-slate-800 mb-4" />
           <span className="text-slate-600 text-sm font-medium italic">No Results for this Week</span>
        </div>

      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string, value: number }) {
  return (
    <div className="bg-[#111111] rounded-2xl border border-white/5 p-5 flex flex-col gap-1 transition hover:bg-white/[0.02]">
      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{label}</span>
      <div className="flex items-baseline gap-2">
        <span className="text-4xl font-bold text-white">{value}</span>
        <span className="text-[10px] text-slate-600 font-bold uppercase">Tasks</span>
      </div>
    </div>
  );
}