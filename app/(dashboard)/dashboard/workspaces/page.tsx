
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { Briefcase, MoreVertical, Plus } from "lucide-react";
import CreateWorkspaceButton from "@/components/workspace/CreateWorkspaceButton";

export default async function WorkspacesPage() {
  const session = await getServerSession(authOptions);

  const workspaces = await prisma.workspace.findMany({
    where: { members: { some: { userId: (session?.user as any).id } } },
  });

  console.log(workspaces);

  return (
    <div className="flex flex-col h-full bg-[#0d0d0d]">
    {/* Header Section */}
    <header className="p-8 border-b border-white/5 bg-[#0f0f0f] flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-bold text-white">My Workspaces</h1>
        <p className="text-xs text-slate-500 mt-1">Manage and organize your team and tasks in dedicated workspaces.</p>
      </div>
      <CreateWorkspaceButton />
    </header>

    {/* Main Content */}
    <main className="p-8 overflow-y-auto custom-scrollbar">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {workspaces.map((ws) => (
          <Link 
            href={`/dashboard/workspaces/${ws.id}`} 
            key={ws.id}
            className="group bg-[#111111] border border-white/5 rounded-2xl p-5 hover:border-white/20 transition-all hover:shadow-2xl relative overflow-hidden"
          >
            {/* Top Bar */}
            <div className="flex justify-between items-start mb-6">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center shadow-inner bg-indigo-500/20 text-indigo-400"
              >
                <Briefcase size={20} />
              </div>
              <button className="text-slate-600 hover:text-white transition">
                <MoreVertical size={16} />
              </button>
            </div>

            {/* Info */}
            <div className="space-y-1 mb-6">
              <h3 className="font-bold text-white group-hover:text-indigo-400 transition">{ws.name}</h3>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                 {/* {ws.members.length} {ws._count.members === 1 ? 'Member' : 'Members'} */}
              </p>
            </div>

            {/* Progress/Stats */}
            <div className="flex items-center justify-between pt-4 border-t border-white/5 text-[10px] font-bold text-slate-400 uppercase">
              <div className="flex items-center gap-1.5">
                {/* <LayoutGrid size={12} /> {ws._count.tasks} Total Tasks */}
              </div>
              <div className="flex items-center gap-1.5">
                  View Workspace
              </div>
            </div>
            
            {/* Subtle background glow */}
            <div 
              className="absolute -bottom-4 -right-4 w-24 h-24 blur-[50px] opacity-0 group-hover:opacity-10 transition-opacity bg-indigo-500"
            />
          </Link>
        ))}

        {workspaces.length === 0 && (
          <div className="col-span-full py-20 text-center bg-[#111111] rounded-2xl border border-dashed border-white/10">
            <p className="text-slate-500 text-sm">No workspaces found. Create your first one to get started!</p>
          </div>
        )}
      </div>
    </main>
  </div>
  );
}