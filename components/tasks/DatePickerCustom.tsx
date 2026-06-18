"use client";

import { useState, useRef, useEffect } from "react";
import { format, addDays, startOfToday } from "date-fns";
import { DayPicker, DateRange } from "react-day-picker";
import { Calendar as CalendarIcon, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DatePickerAdvancedProps {
  startDate: Date | undefined;
  dueDate: Date | undefined;
  onChange: (range: DateRange | undefined) => void;
}

export default function DatePickerAdvanced({ 
  startDate, 
  dueDate, 
  onChange 
}: DatePickerAdvancedProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Format the range for DayPicker
  const selectedRange: DateRange = { 
    from: startDate, 
    to: dueDate 
  };

  const setQuickDate = (days: number) => {
    const start = startOfToday();
    const end = addDays(start, days);
    onChange({ from: start, to: end });
  };

  return (
    <div className="relative" ref={containerRef}>
      {/* 1. Dashboard Trigger - Matches image_cf6ea2.png */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 bg-[#1a1a1a] border border-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition group min-w-[140px]"
      >
        <CalendarIcon size={14} className="text-slate-500" />
        <div className="flex items-center gap-1.5 text-[11px] font-bold">
          <span className={startDate ? "text-blue-400" : "text-slate-500"}>
            {startDate ? format(startDate, "MM/dd/yy") : "Start"}
          </span>
          <span className="text-slate-700">-</span>
          <span className={dueDate ? "text-purple-400" : "text-slate-500"}>
            {dueDate ? format(dueDate, "MM/dd/yy") : "Due"}
          </span>
        </div>
      </div>

      {/* 2. Popover - Matches image_1f7765.png */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 flex bg-[#161616] border border-white/10 rounded-xl shadow-2xl z-[300] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          
          {/* Left Sidebar Shortcuts */}
          <div className="w-44 border-r border-white/5 p-2 flex flex-col gap-0.5 text-[11px]">
            {[
              { label: "Today", days: 0, sub: "Thu" },
              { label: "Later", days: 1, sub: "1:01 am" },
              { label: "Tomorrow", days: 1, sub: "Fri" },
              { label: "This weekend", days: 3, sub: "Sat" },
              { label: "Next week", days: 7, sub: "Mon" },
              { label: "Next weekend", days: 9, sub: "14 Feb" },
              { label: "2 weeks", days: 14, sub: "19 Feb" },
              { label: "4 weeks", days: 28, sub: "5 Mar" },
            ].map((item) => (
              <button 
                key={item.label}
                onClick={() => setQuickDate(item.days)} 
                className="flex items-center justify-between px-3 py-2 text-slate-400 hover:bg-white/5 rounded-md transition"
              >
                <span>{item.label}</span>
                <span className="text-[10px] text-slate-600 font-medium">{item.sub}</span>
              </button>
            ))}
          </div>

          <div className="flex flex-col bg-[#0f0f0f] flex-1">
            {/* Header Date Inputs */}
            <div className="flex items-center gap-2 p-3 bg-[#161616] border-b border-white/5">
              <div className={cn(
                "flex-1 flex items-center justify-between px-3 py-2 rounded-lg border transition",
                startDate ? "border-blue-600/50 bg-blue-600/10" : "border-white/10 bg-white/5"
              )}>
                <div className="flex items-center gap-2">
                  <CalendarIcon size={12} className="text-slate-400" />
                  <span className="text-[11px] font-bold text-white uppercase tracking-tight">
                     {startDate ? format(startDate, "MM/dd/yy") : "Start date"}
                  </span>
                </div>
                <span className="text-[10px] font-medium text-slate-500">Add time</span>
              </div>

              <div className={cn(
                "flex-1 flex items-center justify-between px-3 py-2 rounded-lg border transition",
                dueDate ? "border-purple-600/50 bg-purple-600/10" : "border-white/10 bg-white/5"
              )}>
                <div className="flex items-center gap-2">
                  <CalendarIcon size={12} className="text-slate-400" />
                  <span className="text-[11px] font-bold text-white uppercase tracking-tight">
                     {dueDate ? format(dueDate, "MM/dd/yy") : "Due date"}
                  </span>
                </div>
                <span className="text-[10px] font-medium text-slate-500">Add time</span>
              </div>
            </div>

            {/* Range Calendar */}
            <div className="p-4">
              <DayPicker
                mode="range"
                selected={selectedRange}
                onSelect={(range) => onChange(range)}
                className="rdp-dark"
                showOutsideDays
                classNames={{
                  months: "flex flex-col sm:flex-row",
                  month: "space-y-4",
                  caption: "flex justify-center pt-1 relative items-center mb-4",
                  caption_label: "text-sm font-bold text-slate-200",
                  nav: "space-x-1 flex items-center",
                  nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 transition",
                  nav_button_previous: "absolute left-1",
                  nav_button_next: "absolute right-1",
                  table: "w-full border-collapse space-y-1",
                  head_row: "flex",
                  head_cell: "text-slate-500 rounded-md w-9 font-bold text-[10px] uppercase",
                  row: "flex w-full mt-2",
                  cell: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20",
                  day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-white/10 rounded-md transition-all text-slate-300",
                  day_selected: "bg-blue-600 text-white",
                  day_range_start: "bg-blue-600 text-white rounded-l-md rounded-r-none",
                  day_range_end: "bg-purple-600 text-white rounded-r-md rounded-l-none",
                  day_range_middle: "bg-blue-600/20 text-blue-400 rounded-none",
                  day_today: "after:content-[''] after:block after:w-1 after:h-1 after:bg-red-500 after:rounded-full after:mx-auto after:mt-0.5 font-bold text-white",
                  day_outside: "text-slate-600 opacity-50",
                  day_disabled: "text-slate-600 opacity-50",
                  day_hidden: "invisible",
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}