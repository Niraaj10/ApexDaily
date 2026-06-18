"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import CreateWorkspaceModal from "@/components/workspace/CreateWorkspaceModel";

export default function CreateWorkspaceButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)} 
        className="bg-indigo-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-bold text-sm hover:bg-indigo-700 transition shadow-lg shadow-indigo-500/20"
      >
        <Plus size={18} /> Create Workspace
      </button>

      <CreateWorkspaceModal 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
      />
    </>
  );
}