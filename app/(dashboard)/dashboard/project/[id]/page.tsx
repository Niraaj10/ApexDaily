import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import ListView from "@/components/dashboard/ListView";
import BoardView from "@/components/dashboard/BoardView";
import TableView from "@/components/dashboard/TableView";
import ViewSwitcher from "@/components/dashboard/ViewSwitcher";
import { 
  Folder, 
  Settings2, 
  MoreHorizontal, 
  Calendar, 
  CheckCircle2, 
  Clock,
  Users
} from "lucide-react";
import { format } from "date-fns";
import { authOptions } from "@/lib/auth";
import { cn } from "@/lib/utils";

export default async function ProjectDetailPage({ 
  params, 
  searchParams 
}: { 
  params: Promise<{ id: string }>,
  searchParams: Promise<{ view?: string }> 
}) {
  const session = await getServerSession(authOptions);
  const { id } = await params;
  const { view = "board" } = await searchParams;

  // 1. Fetch Project with full relations
  const project = await prisma.project.findUnique({
    where: { id, deletedAt: null },
    include: {
      workspace: true,
      tasks: {
        where: { deletedAt: null },
        include: { assignee: true, _count: { select: { comments: true } } },
        orderBy: { createdAt: "desc" }
      },
      _count: { select: { tasks: true } }
    }
  });

  if (!project) return notFound();

  // Calculate Metrics
  const completedCount = project.tasks.filter(t => t.status === "DONE").length;
  const progress = project.tasks.length > 0 ? (completedCount / project.tasks.length) * 100 : 0;

  return (
    <div className="flex flex-col h-full bg-[#0d0d0d] overflow-hidden">
      {/* Header Section (Matches image_747925.png) */}
      <header className="p-8 border-b border-white/5 bg-[#0f0f0f] space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div 
              className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl"
              style={{ backgroundColor: `${project.color}20`, border: `1px solid ${project.color}40` }}
            >
              <Folder size={28} style={{ color: project.color || "#4f46e5" }} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">
                  {project.workspace.name}
                </span>
                <span className="text-slate-800 text-xs">/</span>
                <h1 className="text-3xl font-bold text-white">{project.name}</h1>
              </div>
              <p className="text-sm text-slate-500 font-medium">{project.description || "Project-wide goals and task management."}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
             <button className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 text-slate-400 transition">
               <Settings2 size={18} />
             </button>
             <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition shadow-lg">
               New Task
             </button>
          </div>
        </div>

        {/* Project KPI Cards */}
        <div className="grid grid-cols-4 gap-4">
          <StatCard icon={CheckCircle2} label="Completion" value={`${Math.round(progress)}%`} color="text-green-500" />
          <StatCard icon={Clock} label="Active Tasks" value={project.tasks.length - completedCount} color="text-blue-500" />
          <StatCard icon={Users} label="Collaborators" value="4" color="text-purple-500" />
          <StatCard icon={Calendar} label="Timeline" value={format(new Date(project.createdAt), "MMM d, yyyy")} color="text-orange-500" />
        </div>
      </header>

      {/* Navigation Switcher */}
      <ViewSwitcher />

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto p-8 custom-scrollbar">
        {view === "board" && <BoardView data={project.tasks} workspaceId={project.workspaceId} />}
        {view === "list" && <ListView data={project.tasks} workspaceId={project.workspaceId} />}
        {view === "table" && <TableView data={project.tasks} workspaceId={project.workspaceId} />}
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: any) {
  return (
    <div className="bg-[#161616] border border-white/5 p-4 rounded-2xl flex items-center gap-4 transition hover:bg-white/[0.03]">
      <div className={cn("p-2 rounded-lg bg-white/5", color)}>
        <Icon size={18} />
      </div>
      <div className="flex flex-col">
        <span className="text-lg font-bold text-white leading-none mb-1">{value}</span>
        <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{label}</span>
      </div>
    </div>
  );
}