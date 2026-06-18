"use client";

import { useState } from "react";
import { X, Search, ChevronDown, CheckCircle2, Layout, Sparkles, Target, Calendar, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useTemplate } from "@/app/actions/template";

const TEMPLATES = [
  { id: "task-tracker", name: "Tasks Tracker", desc: "Stay organized with tasks, your way.", icon: CheckCircle2, color: "text-green-500", bg: "bg-green-500/10" },
  { id: "projects", name: "Projects", desc: "Manage projects start to finish.", icon: Layout, color: "text-blue-500", bg: "bg-blue-500/10" },
  { id: "brainstorm", name: "Brainstorm Session", desc: "Spark new ideas together.", icon: Sparkles, color: "text-orange-500", bg: "bg-orange-500/10" },
  { id: "creative", name: "Creative Projects", desc: "Keep creative projects on track.", icon: Target, color: "text-indigo-400", bg: "bg-indigo-500/10" },
  { id: "content-calendar", name: "Content Calendar", desc: "Streamline content creation.", icon: Calendar, color: "text-purple-400", bg: "bg-purple-500/10" },
  { id: "document-hub", name: "Document Hub", desc: "Collaborate on docs in one hub.", icon: FileText, color: "text-red-400", bg: "bg-red-500/10" },
];

export default function CreateProjectModal({ 
  workspaces, 
  isOpen, 
  onClose 
}: { 
  workspaces: {id: string, name: string}[], 
  isOpen: boolean, 
  onClose: () => void 
}) {
  const [selectedWs, setSelectedWs] = useState(workspaces[0]?.id);
  const router = useRouter();

  const handleUseTemplate = async (templateId: string) => {
    const result = await useTemplate(selectedWs, templateId);
    if (result.success) {
      onClose();
      router.push(`/dashboard/projects/${result.projectId}`);
    }
  };

  // if (!isOpen) return (
  //   <button onClick={() => setIsOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition shadow-lg">+ New Project</button>
  // );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-[#111111] w-full max-w-4xl rounded-3xl border border-white/10 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-[#161616]">
          <div className="flex items-center gap-4 flex-1">
            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition text-slate-500"><X size={20} /></button>
            <div className="relative group">
              <select 
                value={selectedWs}
                onChange={(e) => setSelectedWs(e.target.value)}
                className="appearance-none bg-white/5 border border-white/10 rounded-xl px-4 py-2 pr-10 text-xs font-bold text-white outline-none focus:border-indigo-500/50 cursor-pointer"
              >
                {workspaces.map(ws => <option key={ws.id} value={ws.id} className="bg-[#111111]">{ws.name}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Template Grid */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-[#0d0d0d]">
          <div className="grid grid-cols-2 gap-6">
            {TEMPLATES.map((t) => (
              <div 
                key={t.id}
                onClick={() => handleUseTemplate(t.id)}
                className="group p-6 bg-[#161616] border border-white/5 rounded-2xl cursor-pointer hover:border-indigo-500/50 transition-all hover:translate-y-[-4px]"
              >
                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition group-hover:scale-110 shadow-lg", t.bg, t.color)}>
                  <t.icon size={24} />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{t.name}</h3>
                <p className="text-sm text-slate-500 mb-6 leading-relaxed">{t.desc}</p>
                
                {/* Visual Skeleton Decoration */}
                <div className="space-y-3 opacity-20 group-hover:opacity-40 transition">
                   <div className="h-2 w-full bg-white rounded-full" />
                   <div className="h-2 w-3/4 bg-white rounded-full" />
                   <div className="flex gap-2">
                     <div className="w-6 h-6 rounded-full bg-white" />
                     <div className="w-6 h-6 rounded-full bg-white" />
                   </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}