"use client";

import { useState, useRef, useEffect } from "react";
import { X, Plus } from "lucide-react";

export default function TagInput({ tags = [], onChange }: { tags: string[], onChange: (t: string[]) => void }) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close search bar when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const addTag = (tagName: string) => {
    const cleanTag = tagName.trim().toLowerCase();
    if (!cleanTag) return;

    // IMPORTANT: Spread existing tags and add the new one to prevent replacing
    if (!tags.includes(cleanTag)) {
      onChange([...tags, cleanTag]);
    }
    
    setQuery("");
    setIsOpen(false);
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      <div className="flex flex-wrap gap-2 items-center">
        {tags.map((tag) => (
          <span 
            key={tag} 
            className="flex items-center gap-1 bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded text-[10px] font-bold uppercase border border-purple-500/30"
          >
            {tag}
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onChange(tags.filter((t) => t !== tag));
              }} 
              className="hover:text-white"
            >
              <X size={10} />
            </button>
          </span>
        ))}
        
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="text-[10px] text-slate-500 hover:text-white flex items-center gap-1 transition"
        >
          <Plus size={12} /> Add Tag
        </button>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl z-[110] p-2 animate-in fade-in zoom-in-95 duration-200">
          <input
            autoFocus
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs outline-none text-white"
            placeholder="Search or create tag..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addTag(query);
              }
            }}
          />
          
          {query && (
            <div 
              onClick={() => addTag(query)}
              className="mt-2 p-2 hover:bg-white/5 rounded-lg cursor-pointer flex items-center justify-between"
            >
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-500">Create</span>
                <span className="bg-purple-600 text-white px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                  {query}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}