import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import ListView from "@/components/dashboard/ListView";
import BoardView from "@/components/dashboard/BoardView";
import TableView from "@/components/dashboard/TableView";
import ViewSwitcher from "@/components/dashboard/ViewSwitcher";
import { authOptions } from "@/lib/auth";
import CreateTaskModal from "@/components/tasks/CreateTaskModel";
import DashboardOverview from "@/components/dashboard/OverView";

export default async function GlobalTasksPage({ searchParams }: { searchParams: { view?: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;

  const resolvedParams = await searchParams;
  const view = resolvedParams.view || "board";
  
  // Fetch ALL tasks for the user across ALL workspaces
  const tasks = await prisma.task.findMany({
    where: {
      OR: [
        { createdBy: (session.user as any).id },
        { assigneeId: (session.user as any).id }
      ],
      deletedAt: null
    },
    include: {
      assignee: true,
      workspace: true, // Included so components can show which workspace a task belongs to
      _count: { select: { comments: true } }
    },
    orderBy: { dueDate: 'asc' }
  });

  return (
    <div className="flex flex-col h-full bg-[#0d0d0d]">
      {/* Global Header */}
      <div className="p-6 bg-[#0f0f0f] border-b border-white/5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">My Tasks</h1>
          <p className="text-xs text-slate-500 mt-1">Viewing all tasks across your workspaces</p>
        </div>
        {/* Pass a 'null' or 'all' flag to modal to allow workspace selection during creation */}
        <CreateTaskModal workspaceId="all" />
      </div>

      {/* Reusable View Switcher */}
      <ViewSwitcher />

      {/* Conditional Content Area */}
      <div className="flex-1 overflow-auto custom-scrollbar">
        {view === "board" && <BoardView data={tasks} workspaceId="all" />}
        {view === "list" && <ListView data={tasks} workspaceId="all" />}
        {view === "table" && <TableView data={tasks} workspaceId="all" />}
        {view === "overview" && <DashboardOverview tasks={tasks} />}
      </div>
    </div>
  );
}