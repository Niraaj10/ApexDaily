import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { Folder, MoreVertical, LayoutGrid, List } from "lucide-react";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import CreateProjectModal from "@/components/projects/CreateProjectModal";

export default async function AllProjectsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  const userId = (session.user as any).id;

  // Fetch workspaces to pass to the modal for selection
  const workspaces = await prisma.workspace.findMany({
    where: { members: { some: { userId } } },
    select: { id: true, name: true }
  });

  // Fetch all projects the user has access to
  const projects = await prisma.project.findMany({
    where: { workspace: { members: { some: { userId } } }, deletedAt: null },
    include: {
      workspace: true,
      _count: { select: { tasks: true } }
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="flex flex-col h-full bg-[#0d0d0d]">
      <header className="p-8 border-b border-white/5 bg-[#0f0f0f] flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Projects</h1>
          <p className="text-xs text-slate-500 mt-1">Manage and organize your work into dedicated projects.</p>
        </div>
        <CreateProjectModal workspaces={workspaces} />
      </header>

      <main className="p-8 overflow-y-auto custom-scrollbar">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {projects.map((project) => (
            <Link 
              href={`/dashboard/project/${project.id}`} 
              key={project.id}
              className="group bg-[#111111] border border-white/5 rounded-2xl p-5 hover:border-white/20 transition-all hover:shadow-2xl relative overflow-hidden"
            >
              {/* Top Bar */}
              <div className="flex justify-between items-start mb-6">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center shadow-inner"
                  style={{ backgroundColor: `${project.color}20`, color: project.color || '#4f46e5' }}
                >
                  <Folder size={20} />
                </div>
                <button className="text-slate-600 hover:text-white transition">
                  <MoreVertical size={16} />
                </button>
              </div>

              {/* Info */}
              <div className="space-y-1 mb-6">
                <h3 className="font-bold text-white group-hover:text-indigo-400 transition">{project.name}</h3>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  {project.workspace.name}
                </p>
              </div>

              {/* Progress/Stats */}
              <div className="flex items-center justify-between pt-4 border-t border-white/5 text-[10px] font-bold text-slate-400 uppercase">
                <div className="flex items-center gap-1.5">
                  <LayoutGrid size={12} /> {project._count.tasks} Tasks
                </div>
                <div className="flex items-center gap-1.5">
                   View Project
                </div>
              </div>
              
              {/* Subtle background glow based on project color */}
              <div 
                className="absolute -bottom-4 -right-4 w-24 h-24 blur-[50px] opacity-0 group-hover:opacity-10 transition-opacity"
                style={{ backgroundColor: project.color || '#4f46e5' }}
              />
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}