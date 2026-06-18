import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ViewSwitcher from "@/components/dashboard/ViewSwitcher";
import TableView from "@/components/dashboard/TableView";
import KanbanBoard from "@/components/dashboard/BoardView";
import ListView from "@/components/dashboard/ListView";
import CalendarView from "@/components/dashboard/CalendarView";
import GanttView from "@/components/dashboard/GanttView";
import OverviewView from "@/components/dashboard/OverView";
import CreateTaskModal from "../../../../../components/tasks/CreateTaskModel";
import BoardView from "@/components/dashboard/BoardView";
import { Briefcase, Calendar, CheckCircle2, Clock, Settings2, Users } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export default async function WorkspacePage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>,
  searchParams: Promise<{ view?: string }>
}) {
  const { id } = await params;
  const { view = "board" } = await searchParams;

  const workspace = await prisma.workspace.findUnique({
    where: { id },
    include: { 
      tasks: {
        where: { deletedAt: null },
        include: { assignee: true, _count: { select: { comments: true } } },
        orderBy: { createdAt: "desc" }
      },
      members: {
        include: { user: true }
      },
      _count: { select: { tasks: true, members: true } }
    },
  });

  if (!workspace) return notFound();

  const completedCount = workspace.tasks.filter(t => t.status === "DONE").length;
  const progress = workspace.tasks.length > 0 ? (completedCount / workspace.tasks.length) * 100 : 0;

  return (
    <div className="flex flex-col h-full bg-[#0d0d0d] overflow-hidden">
      {/* Header Section */}
      <header className="p-8 border-b border-white/5 bg-[#0f0f0f] space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div 
              className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl bg-indigo-500/10 border border-indigo-500/20"
            >
              <Briefcase size={28} className="text-indigo-500" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">
                  Workspace
                </span>
                <span className="text-slate-800 text-xs">/</span>
                <h1 className="text-3xl font-bold text-white">{workspace.name}</h1>
              </div>
              <p className="text-sm text-slate-500 font-medium">
                Manage your team, projects, and cross-functional tasks.
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
             <button className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 text-slate-400 transition">
               <Settings2 size={18} />
             </button>
             {/* Integrating your existing Modal component */}
             <CreateTaskModal workspaceId={id} />
          </div>
        </div>

        {/* Workspace KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={CheckCircle2} label="Global Completion" value={`${Math.round(progress)}%`} color="text-green-500" />
          <StatCard icon={Clock} label="Pending Tasks" value={workspace.tasks.length - completedCount} color="text-blue-500" />
          <StatCard icon={Users} label="Total Members" value={workspace._count.members.toString()} color="text-purple-500" />
          <StatCard icon={Calendar} label="Created On" value={format(new Date(workspace.createdAt), "MMM d, yyyy")} color="text-orange-500" />
        </div>
      </header>

      {/* Navigation Switcher */}
      <ViewSwitcher />

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto p-8 custom-scrollbar">
        {view === "board" && <BoardView data={workspace.tasks} workspaceId={id} />}
        {view === "list" && <ListView data={workspace.tasks} workspaceId={id} />}
        {view === "table" && <TableView data={workspace.tasks} workspaceId={id} />}
        {view === "overview" && <OverviewView tasks={workspace.tasks} />}
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