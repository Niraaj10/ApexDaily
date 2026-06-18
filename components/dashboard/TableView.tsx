"use client";

import { useState } from "react";
import { 
  Plus, 
  Flag, 
  ChevronDown, 
  Settings2, 
  LayoutGrid,
  Search,
  Users
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useTaskPanel } from "@/hooks/use-task-details";

export default function TableView({ data, workspaceId }: { data: any[], workspaceId: string }) {
  const { openTask } = useTaskPanel();
  const [tasks] = useState(data);

  return (
    <div className="flex flex-col h-full bg-[#0d0d0d] text-slate-300 overflow-hidden">
      {/* 1. Sub-Header Toolbar (Matches image_68a742.png top bar) */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-[#0d0d0d]">
        <div className="flex items-center gap-2">
           <button className="flex items-center gap-1.5 px-3 py-1 bg-indigo-600/20 text-indigo-400 rounded-md text-xs font-semibold border border-indigo-500/30">
             <Users size={14} />
             Shown
           </button>
        </div>
        <div className="flex items-center gap-4 text-slate-500">
           <Search size={16} className="cursor-pointer hover:text-white" />
           <Settings2 size={16} className="cursor-pointer hover:text-white" />
           <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded-md text-xs font-bold flex items-center gap-1">
             <Plus size={14} /> Task <ChevronDown size={14} />
           </button>
        </div>
      </div>

      {/* 2. Table Header */}
      <div className="grid grid-cols-[40px_1fr_200px_150px_200px_150px_100px] border-b border-white/10 bg-[#111111] text-[11px] font-bold text-slate-500 uppercase tracking-wider">
        <div className="px-4 py-2 border-r border-white/5 flex justify-center"><input type="checkbox" className="rounded border-white/10 bg-transparent" /></div>
        <div className="px-4 py-2 border-r border-white/5">Name</div>
        <div className="px-4 py-2 border-r border-white/5">Assignee</div>
        <div className="px-4 py-2 border-r border-white/5">Status</div>
        <div className="px-4 py-2 border-r border-white/5">Due date</div>
        <div className="px-4 py-2 border-r border-white/5">Priority</div>
        <div className="px-4 py-2 flex justify-center cursor-pointer hover:bg-white/5"><Plus size={14} /></div>
      </div>

      {/* 3. Table Rows */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {tasks.map((task, index) => (
          <div 
            key={task.id}
            onClick={() => openTask(task.id)}
            className="grid grid-cols-[40px_1fr_200px_150px_200px_150px_100px] border-b border-white/5 hover:bg-white/[0.02] transition cursor-pointer items-center text-sm"
          >
            {/* Row Number/Checkbox */}
            <div className="px-4 py-2 border-r border-white/5 flex justify-center text-[10px] text-slate-600 font-bold">{index + 1}</div>
            
            {/* Name with Status Circle */}
            <div className="px-4 py-2 border-r border-white/5 flex items-center gap-3 font-medium text-slate-200">
              <div className={cn(
                "w-4 h-4 rounded-full border-2 flex items-center justify-center",
                task.status === "DONE" ? "border-green-500" : "border-blue-500"
              )}>
                {task.status === "DONE" && <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />}
              </div>
              {task.title}
            </div>

            {/* Assignee */}
            <div className="px-4 py-2 border-r border-white/5 flex items-center gap-2">
              {task.assignee ? (
                <>
                  <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-[10px] font-bold text-white uppercase">
                    {task.assignee.name?.[0]}
                  </div>
                  <span className="text-xs text-slate-400">{task.assignee.name}</span>
                </>
              ) : (
                <span className="text-slate-700">—</span>
              )}
            </div>

            {/* Status Badge */}
            <div className="px-4 py-2 border-r border-white/5 flex justify-start">
              <div className={cn(
                "flex items-center gap-2 px-3 py-1 rounded-md text-[10px] font-bold uppercase border",
                task.status === "IN_PROGRESS" ? "bg-blue-600 text-white border-blue-400/50" : 
                task.status === "DONE" ? "bg-green-600/20 text-green-400 border-green-500/30" :
                "bg-slate-600/20 text-slate-400 border-slate-500/30"
              )}>
                 <div className={cn("w-1.5 h-1.5 rounded-full", task.status === "IN_PROGRESS" ? "bg-white" : "bg-green-400")} />
                 {task.status.replace("_", " ")}
              </div>
            </div>

            {/* Due Date */}
            <div className="px-4 py-2 border-r border-white/5 text-xs text-slate-400">
              {task.dueDate ? format(new Date(task.dueDate), "M/d/yy h:mm a") : "—"}
            </div>

            {/* Priority */}
            <div className="px-4 py-2 border-r border-white/5 flex items-center gap-2">
              <Flag size={14} className={cn(
                task.priority === "URGENT" ? "text-red-500" : 
                task.priority === "HIGH" ? "text-yellow-500" : "text-slate-600"
              )} />
              <span className="text-xs">{task.priority || "Normal"}</span>
            </div>

            {/* Actions Empty Space */}
            <div className="px-4 py-2"></div>
          </div>
        ))}
        
        {/* Empty row for adding tasks */}
        <div className="grid grid-cols-[40px_1fr_200px_150px_200px_150px_100px] items-center text-slate-700 hover:text-slate-500 cursor-pointer">
          <div className="px-4 py-2 border-r border-white/5 flex justify-center"><Plus size={14} /></div>
          <div className="px-4 py-2 text-xs italic">Click to add task...</div>
        </div>
      </div>
    </div>
  );
}