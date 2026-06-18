"use client";

import { useState } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { ChevronDown, Plus, GripVertical, Flag, UserPlus, Calendar, MessageSquare } from "lucide-react";
import { patchTask } from "@/app/actions/task";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useTaskPanel } from "@/hooks/use-task-details";

const STATUS_GROUPS = [
  { id: "DONE", label: "COMPLETED", color: "bg-green-500" },
  { id: "IN_PROGRESS", label: "IN PROGRESS", color: "bg-blue-500" },
  { id: "TODO", label: "NOT STARTED", color: "bg-red-500" },
];

export default function ListView({ data, workspaceId }: { data: any[], workspaceId: string }) {
  const [tasks, setTasks] = useState(data);
  const { openTask } = useTaskPanel();

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination || destination.droppableId === source.droppableId) return;

    const newStatus = destination.droppableId;
    // Optimistic UI update
    setTasks(prev => prev.map(t => t.id === draggableId ? { ...t, status: newStatus } : t));
    await patchTask(draggableId, { status: newStatus });
  };

  return (
    <div className="flex flex-col gap-6 bg-[#0d0d0d] min-h-full p-4 custom-scrollbar">
      <DragDropContext onDragEnd={onDragEnd}>
        {STATUS_GROUPS.map((group) => {
          const groupTasks = tasks.filter(t => t.status === group.id);

          return (
            <div key={group.id} className="flex flex-col mb-4">
              {/* Group Header */}
              <div className="flex items-center gap-2 mb-2 group/header">
                <ChevronDown size={14} className="text-slate-500" />
                <div className={cn("px-2 py-0.5 rounded text-[10px] font-bold text-white uppercase shadow-sm", group.color)}>
                  {group.label}
                </div>
                <span className="text-xs text-slate-500 font-medium">{groupTasks.length}</span>
              </div>

              {/* Updated Column Names Header (No Completion Percentage) */}
              <div className="grid grid-cols-12 px-10 py-2 border-b border-white/5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <div className="col-span-4">Name</div>
                <div className="col-span-1 text-center">Assignee</div>
                <div className="col-span-2 text-center">Status</div>
                <div className="col-span-1 text-center">Priority</div>
                <div className="col-span-1 text-center">Comments</div>
                <div className="col-span-3 text-right pr-4">Dates</div>
              </div>

              <Droppable droppableId={group.id}>
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="min-h-[10px]">
                    {groupTasks.map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            onClick={() => openTask(task.id)}
                            className="group grid grid-cols-12 items-center px-4 py-2 border-b border-white/5 hover:bg-white/[0.02] transition cursor-pointer"
                          >
                            {/* Task Title & Tags (col-span-4) */}
                            <div className="col-span-4 flex items-center gap-3">
                              <div {...provided.dragHandleProps} className="opacity-0 group-hover:opacity-100 transition">
                                <GripVertical size={14} className="text-slate-600" />
                              </div>
                              <div className={cn(
                                "w-4 h-4 rounded-full border-2 flex items-center justify-center",
                                group.id === "DONE" ? "border-green-500" : "border-blue-500"
                              )}>
                                {group.id === "DONE" && <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />}
                              </div>
                              <span className="text-sm font-semibold text-slate-200 truncate">{task.title}</span>
                              {task.tags?.slice(0, 1).map((tag: string) => (
                                <span key={tag} className="bg-[#3f3f9b] text-white text-[9px] px-1.5 py-0.5 rounded font-bold uppercase truncate max-w-[80px]">
                                  {tag}
                                </span>
                              ))}
                            </div>

                            {/* Assignee (col-span-1) */}
                            <div className="col-span-1 flex justify-center">
                              {task.assignee ? (
                                <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-[10px] font-bold text-white uppercase shadow-sm">
                                  {task.assignee.name?.[0]}
                                </div>
                              ) : (
                                <UserPlus size={14} className="text-slate-700 hover:text-slate-500" />
                              )}
                            </div>

                            {/* Status Badge (col-span-2) */}
                            <div className="col-span-2 flex justify-center">
                              <div className={cn(
                                "flex items-center gap-2 px-2 py-1 rounded-md text-[9px] font-bold uppercase border",
                                group.id === "IN_PROGRESS" ? "bg-blue-600/20 text-blue-400 border-blue-500/30" : 
                                group.id === "DONE" ? "bg-green-600/20 text-green-400 border-green-500/30" :
                                "bg-slate-600/20 text-slate-400 border-slate-500/30"
                              )}>
                                <div className={cn("w-1 h-1 rounded-full", group.id === "IN_PROGRESS" ? "bg-blue-400" : "bg-green-400")} />
                                {group.label}
                              </div>
                            </div>

                            {/* Priority (col-span-1) */}
                            <div className="col-span-1 flex justify-center">
                              <Flag 
                                size={14} 
                                className={cn(
                                  task.priority === "URGENT" ? "text-red-500" : 
                                  task.priority === "HIGH" ? "text-yellow-500" : 
                                  "text-slate-700"
                                )} 
                              />
                            </div>

                            {/* Comments Count (col-span-1) */}
                            <div className="col-span-1 flex justify-center items-center gap-1 text-slate-600 hover:text-slate-400 transition-colors">
                              <MessageSquare size={13} />
                              <span className="text-[10px] font-medium">{task._count?.comments || 0}</span>
                            </div>

                            {/* Dates (col-span-3) */}
                            <div className="col-span-3 flex items-center justify-end gap-2 text-[10px] text-slate-500 pr-4">
                              <Calendar size={12} className="opacity-50" />
                              <span>{task.startDate ? format(new Date(task.startDate), "MMM d") : "—"}</span>
                              <span className="text-slate-800">→</span>
                              <span className={cn(task.dueDate ? "text-purple-400" : "")}>
                                {task.dueDate ? format(new Date(task.dueDate), "MMM d") : "Due"}
                              </span>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                    <div className="flex items-center gap-2 px-10 py-3 text-slate-600 hover:text-slate-400 cursor-pointer transition text-xs group/add">
                      <Plus size={14} className="group-hover/add:scale-110 transition-transform" /> 
                      <span>Add Task</span>
                    </div>
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </DragDropContext>
    </div>
  );
}