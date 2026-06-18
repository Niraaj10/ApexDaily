"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import {
    X, Check, Calendar, Flag, Tag, Clock,
    UserPlus, MessageSquare, Paperclip, ChevronDown,
    TagIcon,
    CalendarIcon
} from "lucide-react";
import { patchTask } from "@/app/actions/task";
import { cn } from "@/lib/utils";
import { useTaskPanel } from "@/hooks/use-task-details";
import TagInput from "./TagInput";
import AssigneeSelector from "./AssigneeSelector";
import DatePickerCustom from "./DatePickerCustom";
import DatePickerAdvanced from "./DatePickerCustom";
import DatePickerDual from "./DatePickerCustom";
import { TaskSidePanelSkeleton } from "./askSidePanelSkeleton";

export default function TaskSidePanel() {
    const queryClient = useQueryClient();
    const { isOpen, taskId, closeTask } = useTaskPanel();
    const [stagedData, setStagedData] = useState<any>({});

    const { data: task, isLoading } = useQuery({
        queryKey: ["task-details", taskId],
        queryFn: () => fetch(`/api/tasks/${taskId}`).then(res => res.json()),
        enabled: !!taskId,
    });

    const { data: members } = useQuery({
        queryKey: ["workspace-members", task?.workspaceId],
        queryFn: async () => {
            const res = await fetch(`/api/workspaces/${task?.workspaceId}/members`);
            if (!res.ok) return [];
            return res.json();
        },
        enabled: !!task?.workspaceId, // Only fetch when task data is available
    });

    const mutation = useMutation({
        mutationFn: (updates: any) => patchTask(taskId!, updates),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["task-details", taskId] });
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
            setStagedData({});
        }
    });

    // Debounce sync: Saves 1 second after the last change
    useEffect(() => {
        if (Object.keys(stagedData).length === 0) return;
        const timer = setTimeout(() => mutation.mutate(stagedData), 3000);
        return () => clearTimeout(timer);
    }, [stagedData]);

    const handleStageChange = (field: string, value: any) => {
        let processedValue = value;

        // Convert string date back to ISO for Prisma
        if ((field === "startDate" || field === "dueDate") && value) {
            processedValue = new Date(value).toISOString();
        }

        setStagedData((prev: any) => ({ ...prev, [field]: processedValue }));
    };

    if (!isOpen) return null;

    if (isLoading) return <TaskSidePanelSkeleton />;

    // Helper to get current display value (Staged vs DB)
    const val = (field: string) => stagedData[field] !== undefined ? stagedData[field] : task?.[field];

    return (
        <div className="fixed inset-y-0 right-0 w-full max-w-[600px] rounded-l-4xl overflow-hidden my-5 bg-[#0d0d0d] border  border-white/10 z-[100] shadow-2xl flex flex-col text-[#adadad] animate-in slide-in-from-right duration-300">
            {/* Top Navigation */}
            <div className="flex items-center justify-between p-3 border-b border-white/10 bg-[#121212]">
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-500 bg-white/5 px-2 py-1 rounded">TASK</span>
                    {mutation.isPending && <span className="text-[10px] text-blue-500 animate-pulse">SAVING...</span>}
                </div>
                <button onClick={closeTask} className="hover:text-white transition"><X size={20} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                {/* Title Section */}
                <textarea
                    className="w-full bg-transparent text-4xl font-bold text-white outline-none resize-none placeholder:text-white/20"
                    value={val("title") || ""}
                    onChange={(e) => handleStageChange("title", e.target.value)}
                    placeholder="Task Title"
                />

                {/* Metadata Grid (Matches Schema) */}
                <div className="grid grid-cols-1 gap-4 pt-4 border-t border-white/5">

                    {/* Status Select */}
                    <MetaRow icon={Clock} label="Status">
                        <select
                            value={val("status")}
                            onChange={(e) => handleStageChange("status", e.target.value)}
                            className="bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded uppercase outline-none cursor-pointer"
                        >
                            <option value="TODO">NOT STARTED</option>
                            <option value="IN_PROGRESS">IN PROGRESS</option>
                            <option value="DONE">COMPLETED</option>
                        </select>
                    </MetaRow>

                    {/* Priority Select */}
                    <MetaRow icon={Flag} label="Priority">
                        <select
                            value={val("priority")}
                            onChange={(e) => handleStageChange("priority", e.target.value)}
                            className={cn(
                                "bg-white/5 text-[10px] font-bold px-2 py-1 rounded uppercase outline-none cursor-pointer",
                                val("priority") === "URGENT" ? "text-red-500" : "text-slate-300"
                            )}
                        >
                            <option value="LOW">LOW</option>
                            <option value="MEDIUM">MEDIUM</option>
                            <option value="HIGH">HIGH</option>
                            <option value="URGENT">URGENT</option>
                        </select>
                    </MetaRow>

                    {/* Dates (Start & Due) */}
                    <MetaRow icon={CalendarIcon} label="Dates">
                        <DatePickerAdvanced
                            startDate={val("startDate") ? new Date(val("startDate")) : undefined}
                            dueDate={val("dueDate") ? new Date(val("dueDate")) : undefined}
                            onChange={(range) => {
                                // Direct update to stagedData
                                setStagedData((prev: any) => ({
                                    ...prev,
                                    startDate: range?.from ? range.from.toISOString() : null,
                                    dueDate: range?.to ? range.to.toISOString() : null,
                                }));
                            }}
                        />
                    </MetaRow>

                    {/* Assignee */}
                    <MetaRow icon={UserPlus} label="Assignee">
                        <AssigneeSelector
                            currentAssigneeId={val("assigneeId")}
                            members={members || []}
                            onChange={(id) => handleStageChange("assigneeId", id)}
                        />
                    </MetaRow>

                    {/* Tags (Array Support) */}
                    <MetaRow icon={TagIcon} label="Tags">
                        <TagInput
                            tags={val("tags") || []}
                            onChange={(newTags) => handleStageChange("tags", newTags)}
                        />
                    </MetaRow>
                </div>

                {/* Description Section */}
                <div className="space-y-3 pt-4 border-t border-white/5">
                    <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Description</label>
                    <textarea
                        className="w-full bg-transparent min-h-[250px] outline-none text-sm leading-relaxed placeholder:text-slate-700"
                        value={val("description") || ""}
                        onChange={(e) => handleStageChange("description", e.target.value)}
                        placeholder="Add details for this task..."
                    />
                </div>
            </div>

            {/* Footer (Audit & Interaction) */}
            <div className="p-4 bg-[#0a0a0a] border-t border-white/5 flex justify-between items-center text-[10px] text-slate-600">
                <div className="flex gap-4">
                    <span className="flex items-center gap-1"><MessageSquare size={12} /> {task?._count?.comments || 0}</span>
                    <span className="flex items-center gap-1"><Paperclip size={12} /> {task?._count?.attachments || 0}</span>
                </div>
                <span>Created {task?.createdAt ? new Date(task.createdAt).toLocaleDateString() : ""}</span>
            </div>
        </div>
    );
}

function MetaRow({ icon: Icon, label, children }: any) {
    return (
        <div className="grid grid-cols-12 items-center">
            <div className="col-span-4 flex items-center gap-2 text-xs font-semibold text-slate-500">
                <Icon size={14} className="text-slate-600" /> {label}
            </div>
            <div className="col-span-8">{children}</div>
        </div>
    );
}