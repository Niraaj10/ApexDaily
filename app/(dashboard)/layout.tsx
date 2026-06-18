import { getServerSession } from "next-auth";
import Sidebar from "@/components/layout/Sidebar";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import Navbar from "@/components/layout/Navbar";
import TaskSidePanel from "@/components/tasks/TaskSidePanel";
import ModernSidebar from "@/components/layout/Sidebar";
import AIChat from "@/components/aiChat/AIChat";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    const { redirect } = await import('next/navigation');
    redirect("/login");
  }

  // Fetch workspaces and their nested projects for the sidebar
  // const workspaces = await prisma.workspace.findMany({
  //   where: {
  //     members: {
  //       some: { userId: (session?.user as any).id }
  //     },
  //     deletedAt: null
  //   },
  //   include: {
  //     projects: {
  //       where: { deletedAt: null },
  //       select: { id: true, name: true, color: true }
  //     }
  //   },
  //   orderBy: { createdAt: 'asc' }
  // });


  // Inside your DashboardLayout function
  const userId = (session?.user as any).id;

  const [workspaces, allTasks] = await Promise.all([
    // 1. Fetch Workspace Hierarchy (for the nested sidebar)
    prisma.workspace.findMany({
      where: {
        members: { some: { userId } },
        deletedAt: null
      },
      include: {
        projects: {
          where: { deletedAt: null },
          include: {
            tasks: { where: { deletedAt: null }, select: { id: true, title: true } }
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    }),

    // 2. Fetch ALL tasks in the database for this user
    prisma.task.findMany({
      where: {
        OR: [
          { createdBy: userId },
          { assigneeId: userId }
        ],
        deletedAt: null
      },
      include: {
        workspace: true, // Crucial for global view to show WHERE the task belongs
        project: true
      },
      orderBy: { updatedAt: 'desc' }
    })
  ]);

  return (
    <div className="flex h-screen bg-[#0d0d0d] overflow-hidden">
      {/* 1. Sidebar with dynamic database data */}
      <div className="">
        <ModernSidebar workspaces={workspaces} tasks={allTasks} />
      </div>

      {/* 2. Main Content Area */}
      <div className="ml-24 m-5 rounded-2xl flex-1 flex flex-col relative overflow-hidden">
        <main className="flex-1 overflow-y-auto custom-scrollbar">
          {children}
        </main>
      </div>

      {/* Optional: Global Task Detail Panel */}
      <TaskSidePanel />

      <AIChat />

      {/* <div className="flex flex-col flex-1">
        <Navbar
          user={{
            name: session?.user?.name ?? undefined,
            email: session?.user?.email ?? undefined,
            image: session?.user?.image ?? undefined,
          }}
        />
      
          
          <TaskSidePanel />
        
      </div> */}
    </div>
  );
}