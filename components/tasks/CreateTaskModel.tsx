"use client";

import { useEffect, useState } from "react";
import {
  X, Hash, UserPlus, Calendar, Flag, Tag,
  MessageSquare, Plus, Bell, Sparkles, ChevronDown
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createTask } from "@/app/actions/task";
import { StatusBadge } from "./CreateTaskHandles";
import AssigneeSelector from "./AssigneeSelector";
import DatePickerAdvanced from "./DatePickerCustom";
import TagInput from "./TagInput";

export default function CreateTaskModal({ workspaceId, workspaceName, members, isOpen, onClose }: any) {
  const [taskData, setTaskData] = useState({
    title: "",
    description: "",
    status: "TODO",
    priority: "NORMAL",
    assigneeId: null,
    startDate: null as string | null,
    dueDate: null as string | null,
    tags: [] as string[],
    metadata: { startTime: "", dueTime: "" }
  });

  // useEffect(() => {
  //   if (isOpen) {
  //     setTaskData({
  //       title: "",
  //       description: "",
  //       status: "TODO",
  //       priority: "NORMAL",
  //       assigneeId: null,
  //       startDate: null as string | null,
  //       dueDate: null as string | null,
  //       tags: [] as string[],
  //       metadata: { startTime: "", dueTime: "" }
  //     });
  //   }
  // }, [isOpen]);

  const handleUpdate = (field: string, value: any) => {
    setTaskData(prev => ({ ...prev, [field]: value }));
  };

  const handleCreate = async () => {
    if (!taskData.title) return alert("Please enter a task name");

    // Pass the plain object to your Server Action
    await createTask(workspaceId, taskData);

    // isOpen(false);
    setTaskData({
      title: "", description: "", status: "TODO", priority: "NORMAL",
      assigneeId: null, startDate: null, dueDate: null, tags: [],
      metadata: { startTime: "", dueTime: "" }
    });
    onClose();
  };

  // if (!isOpen) return (
  //   <button onClick={() => setIsOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 shadow-lg transition">
  //     <Plus size={14} /> Task
  //   </button>
  // );
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[300] flex items-center justify-center p-4">
      <div className="bg-[#1e1e1e] w-full max-w-3xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">

        {/* Header Tabs */}
        <div className="flex items-center justify-between px-4 border-b border-white/5 bg-[#1a1a1a]">
          <div className="flex gap-6">
            <button className="py-3 text-xs font-bold text-white border-b-2 border-purple-500">Task</button>
            <button className="py-3 text-xs font-bold text-slate-500 hover:text-slate-300">Doc</button>
          </div>
          <X size={16} className="text-slate-500 hover:text-white cursor-pointer" onClick={onClose} />
        </div>

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
          {/* Status & Breadcrumbs */}
          <div className="flex gap-2">
            <StatusBadge currentStatus={taskData.status} onUpdate={(s: string) => handleUpdate("status", s)} />
            <div className="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded border border-white/10 text-[10px] text-slate-300">
              <Hash size={10} className="text-purple-500" /> {workspaceName}
            </div>
          </div>

          {/* Title & Description */}
          <div className="space-y-2">
            <input
              autoFocus
              placeholder="Task Name"
              className="w-full bg-transparent text-xl font-bold text-white outline-none placeholder:text-slate-700"
              value={taskData.title}
              onChange={(e) => handleUpdate("title", e.target.value)}
            />
            <textarea
              placeholder="Add description, or write with AI..."
              className="w-full bg-transparent text-sm text-slate-300 outline-none resize-none min-h-[100px] custom-scrollbar"
              value={taskData.description}
              onChange={(e) => handleUpdate("description", e.target.value)}
            />
          </div>

          {/* Interactive Action Badges */}
          <div className="flex flex-wrap items-center gap-4 py-4 border-t border-white/5">
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] text-slate-500 font-bold uppercase ml-1">Assignee</span>
              <AssigneeSelector
                currentAssigneeId={taskData.assigneeId}
                members={members}
                onChange={(id: string | null) => handleUpdate("assigneeId", id)}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] text-slate-500 font-bold uppercase ml-1">Dates</span>
              <DatePickerAdvanced
                startDate={taskData.startDate ? new Date(taskData.startDate) : undefined}
                dueDate={taskData.dueDate ? new Date(taskData.dueDate) : undefined}
                onChange={(range) => {
                  setTaskData(prev => ({
                    ...prev,
                    startDate: range?.from ? range.from.toISOString() : null,
                    dueDate: range?.to ? range.to.toISOString() : null
                  }));
                }}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] text-slate-500 font-bold uppercase ml-1">Tags</span>
              <TagInput
                tags={taskData.tags}
                onChange={(t: string[]) => handleUpdate("tags", t)}
              />
            </div>
          </div>

          {/* NEW: Comments Section (Matches image_cf8963.png style) */}
          <div className="pt-6 border-t border-white/5 space-y-4">
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              <MessageSquare size={14} /> Comments
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-[10px] font-bold text-white uppercase">Me</div>
              <input
                disabled
                placeholder="Comments are available after task creation..."
                className="bg-transparent text-xs text-slate-500 outline-none w-full italic"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#1a1a1a] border-t border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10 text-[10px] font-bold text-slate-400">
            <Sparkles size={12} className="text-purple-400" /> Templates
          </div>
          <div className="flex items-center gap-4">
            <Bell size={16} className="text-slate-600 hover:text-slate-400 cursor-pointer" />
            <div className="flex overflow-hidden rounded-lg">
              <button
                onClick={handleCreate}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-1.5 text-xs font-bold transition shadow-lg active:scale-95"
              >
                Create Task
              </button>
              <div className="bg-purple-700 px-1.5 flex items-center border-l border-white/10 hover:bg-purple-800 cursor-pointer">
                <ChevronDown size={14} className="text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}