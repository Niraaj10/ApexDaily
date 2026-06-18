"use client";

import { useState, useRef, useEffect } from "react";
import { UserPlus, Search, MailPlus, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Member {
  user: { id: string; name: string; email: string; image?: string };
}

export default function AssigneeSelector({ 
  currentAssigneeId, 
  members = [], 
  onChange 
}: { 
  currentAssigneeId: string | null, 
  members: Member[], 
  onChange: (id: string | null) => void 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const selectedMember = members.find(m => m.user.id === currentAssigneeId);

  // Filter members based on search query
  const filteredMembers = members.filter(m => 
    m.user.name.toLowerCase().includes(query.toLowerCase()) || 
    m.user.email.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* The Display Trigger */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-white/5 cursor-pointer transition group"
      >
        {selectedMember ? (
          <>
            <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-[10px] font-bold text-white uppercase">
              {selectedMember.user.name[0]}
            </div>
            <span className="text-xs text-slate-300">{selectedMember.user.name}</span>
            <X 
              size={12} 
              className="ml-auto opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-500" 
              onClick={(e) => { e.stopPropagation(); onChange(null); }}
            />
          </>
        ) : (
          <>
            <div className="w-5 h-5 rounded-full border border-dashed border-slate-600 flex items-center justify-center">
              <UserPlus size={12} className="text-slate-500" />
            </div>
            <span className="text-xs text-slate-500 italic">Empty</span>
          </>
        )}
      </div>

      {/* The Dropdown Menu (Matches image_ce9183.png) */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl z-[120] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="p-2 border-b border-white/5">
            <div className="flex items-center gap-2 bg-white/5 rounded-lg px-2 py-1.5 border border-white/10 focus-within:border-purple-500/50 transition">
              <Search size={14} className="text-slate-500" />
              <input 
                autoFocus
                placeholder="Search or enter email..."
                className="bg-transparent text-xs outline-none text-white w-full"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="max-h-60 overflow-y-auto custom-scrollbar p-1">
            {filteredMembers.length > 0 ? (
              filteredMembers.map((m) => (
                <div 
                  key={m.user.id}
                  onClick={() => { onChange(m.user.id); setIsOpen(false); }}
                  className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg cursor-pointer group"
                >
                  <div className="relative">
                    <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white uppercase">
                      {m.user.name[0]}
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 border-2 border-[#1a1a1a] rounded-full" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-medium text-slate-200 truncate">{m.user.name}</span>
                    <span className="text-[10px] text-slate-500 truncate">{m.user.email}</span>
                  </div>
                  {currentAssigneeId === m.user.id && <Check size={14} className="ml-auto text-blue-500" />}
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-xs text-slate-500 italic">No members found</div>
            )}

            {/* Invite Action (from your image) */}
            <div className="mt-1 border-t border-white/5 pt-1">
              <div className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg cursor-pointer text-purple-400">
                <div className="w-7 h-7 rounded-full bg-purple-500/10 flex items-center justify-center">
                  <MailPlus size={14} />
                </div>
                <span className="text-xs font-semibold">Invite people via email</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}