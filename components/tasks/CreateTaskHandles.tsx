import { cn } from "@/lib/utils";
import { Flag } from "lucide-react";

export function StatusBadge({ currentStatus, onUpdate }: any) {
    return (
        <select
            value={currentStatus}
            onChange={(e) => onUpdate(e.target.value)}
            className="bg-white/5 border border-white/10 rounded px-2 py-1 text-[10px] font-bold text-white outline-none uppercase"
        >
            <option value="TODO" className="bg-[#1e1e1e]">To Do</option>
            <option value="IN_PROGRESS" className="bg-[#1e1e1e]">In Progress</option>
            <option value="DONE" className="bg-[#1e1e1e]">Done</option>
        </select>
    );
}

export function PrioritySelector({ current, onUpdate }: any) {
    return (
        <div className="flex items-center gap-1.5 bg-white/5 px-2 py-1.5 rounded-lg border border-white/10">
            {["URGENT", "HIGH", "NORMAL", "LOW"].map((p) => (
                <Flag
                    key={p}
                    size={14}
                    onClick={() => onUpdate(p)}
                    className={cn(
                        "cursor-pointer transition",
                        current === p ? (p === "URGENT" ? "text-red-500" : p === "HIGH" ? "text-yellow-500" : "text-blue-500") : "text-slate-700"
                    )}
                />
            ))}
        </div>
    );
}