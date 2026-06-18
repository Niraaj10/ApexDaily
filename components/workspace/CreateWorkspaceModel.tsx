"use client";

import { useActionState, useEffect, useState } from "react";
import { Plus, X, Briefcase, Sparkles, Loader2 } from "lucide-react";
import { createWorkspace } from "@/app/actions/workspace";
import { cn } from "@/lib/utils";

interface CreateWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateWorkspaceModal({ isOpen, onClose }: CreateWorkspaceModalProps) {
  const [state, formAction, isPending] = useActionState(createWorkspace, null);
  const [workspaceName, setWorkspaceName] = useState("");

  useEffect(() => {
    if (state?.success) {
      setWorkspaceName(""); // Reset for next time
      onClose();
    }
  }, [state, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[150] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-[#0f0f0f] w-full max-w-md rounded-[28px] border border-white/10 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Creative Header with Dynamic Icon */}
        <div className="relative h-32 bg-gradient-to-br from-indigo-600/20 to-purple-600/20 flex items-center justify-center border-b border-white/5">
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 rounded-full text-slate-400 hover:text-white transition-all"
          >
            <X size={18} />
          </button>
          
          <div className="relative">
            <div className={cn(
              "w-20 h-20 rounded-2xl flex items-center justify-center shadow-2xl transition-all duration-500",
              workspaceName.length > 0 ? "bg-indigo-600 rotate-3 scale-110" : "bg-white/5 -rotate-3"
            )}>
              <Briefcase size={32} className={workspaceName.length > 0 ? "text-white" : "text-slate-600"} />
            </div>
            {workspaceName.length > 3 && (
              <Sparkles className="absolute -top-2 -right-2 text-yellow-400 animate-pulse" size={20} />
            )}
          </div>
        </div>

        <div className="p-8 space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white tracking-tight">Create Workspace</h2>
            <p className="text-sm text-slate-500 mt-1">Define a new space for your team and projects.</p>
          </div>

          <form action={formAction} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">
                Workspace Identity
              </label>
              <div className="relative group">
                <input
                  required
                  name="name"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  placeholder="e.g. Design Studio"
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-slate-700"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-700">
                  {workspaceName.length}/32
                </div>
              </div>
              
              {state?.error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  <p className="text-red-500 text-xs font-medium">{state.error}</p>
                </div>
              )}
            </div>
            
            <button
              type="submit"
              disabled={isPending}
              className={cn(
                "w-full h-14 rounded-2xl font-bold transition-all flex items-center justify-center gap-3 group relative overflow-hidden",
                isPending 
                  ? "bg-slate-800 cursor-not-allowed" 
                  : "bg-white text-black hover:bg-indigo-500 hover:text-white active:scale-[0.98]"
              )}
            >
              {isPending ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  <span className="tracking-tight">Initializing Space...</span>
                </>
              ) : (
                <>
                  <span>Create Workspace</span>
                  <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" />
                </>
              )}
              
              {/* Shine effect on hover */}
              {!isPending && (
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer" />
              )}
            </button>
          </form>
          
          <p className="text-[10px] text-center text-slate-600 font-medium">
            By creating a workspace, you become the primary owner and admin.
          </p>
        </div>
      </div>
    </div>
  );
}