"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, X, Loader2, Command, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAIOrchestrator } from "@/hooks/use-ai-orchestrator";

export default function AIChat() {
  const { messages, isLoading, sendMessage } = useAIOrchestrator({
    onSuccess: (message) => console.log("✅ AI Response:", message),
    onError: (error) => console.error("❌ Error:", error),
  });

  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logic
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Keyboard shortcut (Cmd/Ctrl + K) to open
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage(input);
    setInput("");
  };

  const suggestions = [
    { text: "Fix sidebar CSS", icon: <Zap size={14} /> },
    { text: "Today's agenda", icon: <Command size={14} /> },
    { text: "Productivity stats", icon: <Sparkles size={14} /> },
  ];

  return (
    <>
      {/* 1. Floating Trigger Button (Bottom Right) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-8 right-[50%] w-16 h-16 bg-[#1a1a1a] border border-white/10 text-indigo-400 rounded-2xl shadow-[0_0_30px_rgba(0,0,0,0.5)] hover:border-indigo-500/50 hover:scale-105 transition-all duration-300 flex items-center justify-center z-[100] group"
        >
          <Sparkles size={28} className="group-hover:rotate-12 transition-transform" />
          <div className="absolute -top-1 -right-1 px-2 py-0.5 bg-indigo-600 text-[10px] font-bold text-white rounded-full border-2 border-[#0d0d0d]">
            AI
          </div>
        </button>
      )}

      {/* 2. Centered Chat Interface */}
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 mt-48 animate-in fade-in duration-300">
          {/* Backdrop Overlay */}
          <div 
            className="absolute inset-0" 
            onClick={() => setIsOpen(false)} 
          />

          {/* Main Panel (Centered) */}
          <div className="relative w-full max-w-2xl h-[70vh] bg-[#0f0f0f] border border-white/10 rounded-[32px] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
            
            {/* Header */}
            <div className="px-6 py-4 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-indigo-600/20 rounded-lg flex items-center justify-center">
                  <Sparkles size={18} className="text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-tight">AdvTD Orchestrator</h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">System Online</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/5 rounded-xl text-slate-500 hover:text-white transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Chat Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                  <div className="w-20 h-20 bg-indigo-600/10 rounded-[2rem] flex items-center justify-center animate-pulse">
                    <Sparkles size={40} className="text-indigo-500" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">How can I assist your workflow?</h2>
                    <p className="text-sm text-slate-500 mt-2 max-w-xs mx-auto">
                      I can manage your database, analyze habits, or automate task creation.
                    </p>
                  </div>
                  
                  {/* Suggestions Grid */}
                  <div className="flex flex-wrap justify-center gap-2 max-w-md">
                    {suggestions.map((s, i) => (
                      <button
                        key={i}
                        onClick={() => {
                            setInput(s.text);
                            // Auto-submit logic can be added here
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/5 rounded-full text-xs text-slate-300 hover:bg-white/10 hover:border-indigo-500/30 transition-all"
                      >
                        {s.icon} {s.text}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((m, i) => (
                <div key={i} className={cn("flex gap-4", m.role === "user" ? "flex-row-reverse" : "flex-row")}>
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 font-bold text-[10px]",
                    m.role === "assistant" ? "bg-indigo-600 text-white" : "bg-white/10 text-slate-400"
                  )}>
                    {m.role === "assistant" ? <Sparkles size={14} /> : "U"}
                  </div>
                  <div className={cn(
                    "max-w-[80%] px-5 py-3 rounded-[20px] text-sm",
                    m.role === "user" 
                      ? "bg-white text-black font-medium" 
                      : "bg-[#1a1a1a] border border-white/5 text-slate-300"
                  )}>
                    <p className="leading-relaxed">{m.content}</p>
                    
                    {/* Tool Call Badges */}
                    {m.functionCalls?.map((fc, j) => (
                      <div key={j} className="mt-3 flex items-center gap-2 text-[10px] bg-indigo-500/10 text-indigo-400 px-3 py-1.5 rounded-lg border border-indigo-500/20">
                        <Command size={10} /> Executed: {fc.name}
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-4 animate-pulse">
                  <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center"><Loader2 size={14} className="animate-spin text-white" /></div>
                  <div className="bg-[#1a1a1a] border border-white/5 rounded-[20px] px-5 py-3"><div className="w-12 h-2 bg-slate-700 rounded-full" /></div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Footer */}
            <div className="p-6 bg-[#0f0f0f] border-t border-white/5">
              <form onSubmit={handleSubmit} className="relative group">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask a command... (Try 'Fix my sidebar')"
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 pr-16 text-white text-sm outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/5 transition-all"
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white text-black rounded-xl flex items-center justify-center hover:bg-indigo-500 hover:text-white transition-all disabled:opacity-20"
                >
                  <Send size={18} />
                </button>
              </form>
              <div className="flex items-center justify-center gap-4 mt-4 text-[10px] text-slate-600 font-bold uppercase tracking-widest">
                <span className="flex items-center gap-1"><Command size={10}/> + K to toggle</span>
                <span>•</span>
                <span>Gemini 3.0 Flash Engine</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}