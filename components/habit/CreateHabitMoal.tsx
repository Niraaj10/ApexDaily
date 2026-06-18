"use client";

import { useActionState, useEffect } from "react";
import { X } from "lucide-react";
import { createHabit } from "@/app/actions/habits"; 

export default function CreateHabitModal({ isOpen, onClose }: any) {
  const [state, formAction, isPending] = useActionState(createHabit, null);

  useEffect(() => {
    if (state?.success) onClose();
  }, [state, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
      <div className="bg-[#1a1a1a] w-full max-w-md rounded-2xl p-6 border border-white/10 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">New Habit</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white"><X size={20} /></button>
        </div>
        <form action={formAction} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2">Habit Name</label>
            <input name="name" required placeholder="e.g. 5am Club, DSA, Gym" className="w-full bg-white/5 px-4 py-3 border border-white/10 rounded-xl text-white outline-none focus:border-indigo-500" />
          </div>
          <button disabled={isPending} className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition">
            {isPending ? "Adding..." : "Add Habit"}
          </button>
        </form>
      </div>
    </div>
  );
}