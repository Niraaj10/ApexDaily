import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { 
  Layout, Briefcase, Users, CheckCircle2, 
  Clock, TrendingUp, Plus, ArrowUpRight, 
  MessageSquare, UserCircle 
} from "lucide-react";
import { format } from "date-fns";
import { authOptions } from "@/lib/auth";

export default async function MainDashboard() {
  const session = await getServerSession(authOptions);
  console.log(session)
  if (!session?.user) return null;
  const userId = (session.user as any).id;

  // 1. Holistic Data Fetching based on Schema
  const [workspaces, tasks, recentComments] = await Promise.all([
    prisma.workspace.findMany({
      where: { members: { some: { userId } }, deletedAt: null },
      include: { _count: { select: { members: true, tasks: true, projects: true } } }
    }),
    prisma.task.findMany({
      where: { OR: [{ createdBy: userId }, { assigneeId: userId }], deletedAt: null },
      include: { workspace: true, project: true }
    }),
    prisma.comment.findMany({
      where: { task: { OR: [{ createdBy: userId }, { assigneeId: userId }] } },
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { author: true, task: true }
    })
  ]);

  const activeTasks = tasks.filter(t => t.status !== "DONE");

  return (
    <div className="flex flex-col h-full bg-[#0d0d0d] overflow-hidden">
      {/* 1. Profile & Global Context Header */}
      <header className="p-8 border-b border-white/5 bg-[#0f0f0f] flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-xl font-bold text-white shadow-lg">
            {session.user.name?.[0]}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Welcome back, {session.user.name}</h1>
            <p className="text-xs text-slate-500 font-medium">Managing {workspaces.length} Workspaces • {tasks.length} Total Tasks</p>
          </div>
        </div>
        <button className="bg-white text-black px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-slate-200 transition">
          <Plus size={16} /> New Workspace
        </button>
      </header>

      <main className="flex-1 p-8 overflow-y-auto custom-scrollbar">
        <div className="grid grid-cols-12 gap-8">
          
          {/* LEFT: Workspaces & Projects Overview (8 Cols) */}
          <div className="col-span-8 space-y-8">
            
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-4 gap-4">
              <MiniStat icon={Briefcase} label="Active Projects" value={workspaces.reduce((acc, w) => acc + w._count.projects, 0)} color="text-blue-500" />
              <MiniStat icon={CheckCircle2} label="Tasks Done" value={tasks.filter(t => t.status === "DONE").length} color="text-green-500" />
              <MiniStat icon={Users} label="Collaborators" value={workspaces.reduce((acc, w) => acc + w._count.members, 0)} color="text-purple-500" />
              <MiniStat icon={Clock} label="Pending Tasks" value={activeTasks.length} color="text-orange-500" />
            </div>

            {/* Workspace Directory */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Your Workspaces</h3>
              <div className="grid grid-cols-2 gap-4">
                {workspaces.map(ws => (
                  <div key={ws.id} className="group p-5 bg-[#111111] border border-white/5 rounded-2xl hover:border-indigo-500/50 transition cursor-pointer relative overflow-hidden">
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white font-bold">{ws.name[0]}</div>
                      <ArrowUpRight size={18} className="text-slate-700 group-hover:text-indigo-400 transition" />
                    </div>
                    <h4 className="font-bold text-white mb-1">{ws.name}</h4>
                    <p className="text-[10px] text-slate-500 line-clamp-1 mb-4">{ws.description || "No description provided."}</p>
                    <div className="flex gap-4">
                       <div className="text-[10px] font-bold text-slate-400"><span className="text-white">{ws._count.projects}</span> Projects</div>
                       <div className="text-[10px] font-bold text-slate-400"><span className="text-white">{ws._count.members}</span> Team</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: Activity & Personal Feed (4 Cols) */}
          <div className="col-span-4 space-y-8">
            
            {/* User Info Card */}
            <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] border border-white/10 rounded-2xl p-6 shadow-xl">
               <div className="flex items-center gap-3 mb-6">
                 <div className="w-10 h-10 rounded-full border-2 border-indigo-500 p-0.5">
                    <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold">{session.user.name?.[0]}</div>
                 </div>
                 <div className="flex flex-col">
                   <span className="text-sm font-bold text-white">{session.user.name}</span>
                   <span className="text-[10px] text-slate-500">{session.user.email}</span>
                 </div>
               </div>
               <div className="space-y-3">
                  <div className="flex justify-between text-[11px] font-medium"><span className="text-slate-500">Member Since</span> <span className="text-white">{format(new Date(), "MMM yyyy")}</span></div>
                  <div className="flex justify-between text-[11px] font-medium"><span className="text-slate-500">Security</span> <span className="text-green-500 flex items-center gap-1">Verified <CheckCircle2 size={10}/></span></div>
               </div>
            </div>

            {/* Recent Collaboration Feed */}
            <div className="bg-[#111111] border border-white/5 rounded-2xl p-6">
              <h3 className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2 mb-6">
                <MessageSquare size={14} className="text-blue-500" /> Recent Activity
              </h3>
              <div className="space-y-6">
                {recentComments.map(comment => (
                  <div key={comment.id} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-[10px] font-bold shrink-0">
                      {comment.author.name?.[0]}
                    </div>
                    <div className="flex flex-col gap-1">
                      <p className="text-xs text-slate-300 leading-snug">
                        <span className="text-white font-bold">{comment.author.name}</span> commented on 
                        <span className="text-indigo-400"> {comment.task.title}</span>
                      </p>
                      <span className="text-[10px] text-slate-600 uppercase font-bold">{format(new Date(comment.createdAt), "h:mm a")}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}

function MiniStat({ icon: Icon, label, value, color }: any) {
  return (
    <div className="bg-[#111111] border border-white/5 p-4 rounded-2xl flex flex-col gap-2 transition hover:bg-white/[0.02]">
      <Icon size={16} className={color} />
      <div className="flex flex-col">
        <span className="text-2xl font-bold text-white">{value}</span>
        <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">{label}</span>
      </div>
    </div>
  );
}