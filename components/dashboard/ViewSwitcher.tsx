"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { 
  List, 
  LayoutDashboard, 
  Table as TableIcon, 
  Calendar, 
  GanttChartSquare, 
  Plus 
} from "lucide-react";
import { cn } from "@/lib/utils";

// Updated to match the specific icons in image_0e8689.png
const VIEW_OPTIONS = [
  { id: "board", label: "Board", icon: LayoutDashboard, color: "text-blue-500" },
  { id: "list", label: "List", icon: List, color: "text-slate-400" },
  { id: "table", label: "Table", icon: TableIcon, color: "text-emerald-500" },
  // { id: "calendar", label: "Calendar", icon: Calendar, color: "text-orange-500" },
  // { id: "gantt", label: "Gantt", icon: GanttChartSquare, color: "text-rose-500" },
];

export default function ViewSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentView = searchParams.get("view") || "list";

  const onTabClick = (view: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", view);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-0 border-b border-white/5 bg-[#0d0d0d] px-4 w-full h-10">
      {/* 1. View Options */}
      {VIEW_OPTIONS.map((view) => {
        const isActive = currentView === view.id;
        return (
          <button
            key={view.id}
            onClick={() => onTabClick(view.id)}
            className={cn(
              "flex items-center gap-2 px-3 h-full text-xs font-medium transition-all relative group",
              isActive 
                ? "text-white" 
                : "text-slate-500 hover:bg-white/[0.03] hover:text-slate-300"
            )}
          >
            {/* Colorized icons to match image_0e8689.png */}
            <view.icon size={14} className={cn("shrink-0", view.color)} />
            <span>{view.label}</span>
            
            {/* Minimalist Underline Indicator */}
            {isActive && (
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white animate-in fade-in slide-in-from-bottom-1 duration-300" />
            )}
          </button>
        );
      })}

      {/* 2. Vertical Divider */}
      <div className="w-[1px] h-4 bg-white/10 mx-2" />

      {/* 3. Add View Button */}
      <button className="flex items-center gap-1.5 px-3 h-full text-xs font-medium text-slate-500 hover:bg-white/[0.03] hover:text-slate-300 transition-colors">
        <Plus size={14} />
        View
      </button>
    </div>
  );
}