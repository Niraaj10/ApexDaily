"use client";

import { useState } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Plus, MoreHorizontal, Calendar, Flag, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import { patchTask } from "@/app/actions/task";
import { cn } from "@/lib/utils";
import { useTaskPanel } from "@/hooks/use-task-details";

const STATUS_COLUMNS = [
  { id: "TODO", label: "TO DO", color: "border-slate-500/50 bg-slate-500/10 text-slate-400" },
  { id: "IN_PROGRESS", label: "IN PROGRESS", color: "border-blue-500/50 bg-blue-500/10 text-blue-400" },
  { id: "DONE", label: "COMPLETE", color: "border-green-500/50 bg-green-500/10 text-green-400" },
];

export default function BoardView({ data, workspaceId }: { data: any[], workspaceId: string }) {
  const [tasks, setTasks] = useState(data);
  const { openTask } = useTaskPanel();

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) return;

    const newStatus = destination.droppableId;
    // Optimistic UI Update
    setTasks(prev => prev.map(t => t.id === draggableId ? { ...t, status: newStatus } : t));
    await patchTask(draggableId, { status: newStatus });
  };

  return (
    <div className="flex h-full w-full gap-4 p-6 overflow-x-auto bg-[#0d0d0d] custom-scrollbar">
      <DragDropContext onDragEnd={onDragEnd}>
        {STATUS_COLUMNS.map((column) => (
          <div key={column.id} className="flex flex-col min-w-[320px] max-w-[320px] h-full">
            {/* Column Header */}
            <div className="flex items-center justify-between mb-4 px-2">
              <div className="flex items-center gap-2">
                <div className={cn("px-2 py-0.5 rounded text-[10px] font-bold uppercase border", column.color)}>
                  {column.label}
                </div>
                <span className="text-xs text-slate-500 font-medium">
                  {tasks.filter(t => t.status === column.id).length}
                </span>
              </div>
              <div className="flex items-center gap-1 text-slate-500">
                <Plus size={16} className="cursor-pointer hover:text-white transition" />
                <MoreHorizontal size={16} className="cursor-pointer hover:text-white transition" />
              </div>
            </div>

            {/* Droppable Area */}
            <Droppable droppableId={column.id}>
              {(provided) => (
                <div 
                  {...provided.droppableProps} 
                  ref={provided.innerRef}
                  className="flex-1 flex flex-col gap-3 min-h-[150px]"
                >
                  {tasks
                    .filter(t => t.status === column.id)
                    .map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            onClick={() => openTask(task.id)}
                            className="bg-[#181818] border border-white/5 rounded-xl p-4 shadow-sm hover:border-white/20 transition cursor-pointer group"
                          >
                            <div className="space-y-3">
                              <h3 className="text-sm font-semibold text-slate-200 group-hover:text-white">
                                {task.title}
                              </h3>

                              {/* Task Card Metadata (Matches image_1fe83a.png) */}
                              <div className="flex flex-wrap items-center gap-3">
                                {task.assignee && (
                                  <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-[10px] font-bold text-white uppercase border border-[#181818]">
                                    {task.assignee.name?.[0]}
                                  </div>
                                )}
                                
                                <div className="flex items-center gap-1.5 px-2 py-1 bg-white/5 rounded-md text-[10px] font-medium text-slate-400">
                                  <Calendar size={12} className={cn(task.status === "DONE" ? "text-green-500" : "text-red-400")} />
                                  <span>{task.dueDate ? format(new Date(task.dueDate), "MM/dd/yy, h:mm a") : "Set date"}</span>
                                </div>
                              </div>

                              {/* Priority Flag */}
                              <div className={cn(
                                "inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold uppercase border",
                                task.priority === "URGENT" ? "bg-red-500/10 text-red-500 border-red-500/20" : "bg-white/5 text-slate-500 border-white/5"
                              )}>
                                <Flag size={10} />
                                {task.priority || "Normal"}
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                  {provided.placeholder}
                  
                  {/* Inline Add Task */}
                  <button className="flex items-center gap-2 px-2 py-2 text-slate-500 hover:text-blue-500 transition text-xs font-medium group">
                    <Plus size={14} /> Add Task
                  </button>
                </div>
              )}
            </Droppable>
          </div>
        ))}
        </DragDropContext>
      </div>
    );
}