"use client";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from "date-fns";

export default function CalendarView({ data }: { data: any[] }) {
  const today = new Date();
  const days = eachDayOfInterval({
    start: startOfMonth(today),
    end: endOfMonth(today),
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
          <div key={day} className="py-3 text-center text-xs font-bold text-slate-500 uppercase">{day}</div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {days.map((day, i) => (
          <div key={i} className="min-h-[120px] p-2 border-r border-b border-slate-100 last:border-r-0">
            <span className={`text-xs font-bold ${isSameDay(day, today) ? 'bg-blue-600 text-white px-2 py-1 rounded-full' : 'text-slate-400'}`}>
              {format(day, "d")}
            </span>
            <div className="mt-2 space-y-1">
              {data.filter(t => t.dueDate && isSameDay(new Date(t.dueDate), day)).map(t => (
                <div key={t.id} className="truncate text-[10px] bg-blue-50 text-blue-700 p-1 rounded border border-blue-100 font-medium">
                  {t.title}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}