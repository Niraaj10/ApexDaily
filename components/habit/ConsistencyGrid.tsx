"use client";

import { useState, useTransition } from "react";
import { format, eachDayOfInterval, startOfMonth, endOfMonth, isSameDay } from "date-fns";
import { Plus, Check, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import CreateHabitModal from "./CreateHabitMoal";
import { deleteHabit, toggleHabit } from "@/app/actions/habits";

export default function ConsistencyGrid({ habits, workspaceId }: any) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  // 1. Get REAL dates for the current month
  const today = new Date();
  const days = eachDayOfInterval({
    start: startOfMonth(today),
    end: endOfMonth(today),
  });

  const handleToggle = (habitId: string, day: Date, currentStatus: boolean) => {
    startTransition(async () => {
      const dateString = format(day, 'yyyy-MM-dd'); // Convert to a local date string
      // Calls the server action to update the DB
      await toggleHabit(habitId, dateString, currentStatus);
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm font-medium text-slate-400">
          {format(today, "MMMM yyyy")}
        </div>
        {/* 2. Add Habit Button */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white rounded-md text-xs transition"
        >
          <Plus size={14} /> Add Habit
        </button>
      </div>

      <div className="rounded-xl border border-white/5 bg-[#0f0f0f] overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-white/[0.02]">
                <th className="sticky left-0 bg-[#0f0f0f] p-4 text-left text-[10px] font-bold uppercase text-slate-500 border-r border-white/5 min-w-[160px]">
                  Habit
                </th>
                {days.map(day => (
                  <th key={day.toString()} className={cn(
                    "p-2 text-[10px] font-mono border-white/5 min-w-[35px]",
                    format(day, "yyyy-MM-dd") === format(today, "yyyy-MM-dd") ? "text-indigo-400 font-bold" : "text-slate-500"
                  )}>
                    {format(day, "d")}
                    <div className="text-[8px] opacity-50">{format(day, "EEE").charAt(0)}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {habits.map((habit: any) => (
                <tr key={habit.id} className="border-t border-white/5 hover:bg-white/[0.01]">
                  <td className="sticky left-0 bg-[#0f0f0f] p-4 text-xs font-bold text-white border-r border-white/5 group min-w-[160px]">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate">{habit.name}</span>

                      {/* Delete Button - Visible only on hover */}
                      <button
                        onClick={() => {
                          if (confirm(`Delete "${habit.name}" and all its logs?`)) {
                            startTransition(async () => {
                              await deleteHabit(habit.id);
                            });
                          }
                        }}
                        className={cn(
                          "opacity-0 group-hover:opacity-100 p-1.5 rounded-md hover:bg-red-500/10 hover:text-red-500 transition-all",
                          isPending && "pointer-events-none"
                        )}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                  {days.map(day => {
                    const log = habit.logs?.find((l: any) =>
                      format(new Date(l.date), "yyyy-MM-dd") === format(day, "yyyy-MM-dd")
                    );
                    const isDone = log?.completed || false;

                    // 2. CHECK PERMISSION: Is this date today?
                    const isToday = isSameDay(day, today);

                    return (
                      <td key={day.toString()} className="p-1">
                        <button
                          disabled={isPending || !isToday} // Disable button if it's not today
                          onClick={() => handleToggle(habit.id, day, isDone)}
                          className={cn(
                            "w-full aspect-square rounded flex items-center justify-center transition-all border",
                            isDone
                              ? "bg-indigo-600 border-indigo-500 text-white"
                              : "bg-white/5 border-white/5",
                            // 3. VISUAL STYLING: Change cursor and opacity for non-today dates
                            isToday
                              ? "hover:border-white/20 cursor-pointer"
                              : "opacity-40 cursor-not-allowed border-transparent"
                          )}
                        >
                          {isDone ? <Check size={12} /> : !isToday && <div className="w-1 h-1 bg-white/10 rounded-full" />}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <CreateHabitModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        workspaceId={workspaceId}
      />
    </div>
  );
}