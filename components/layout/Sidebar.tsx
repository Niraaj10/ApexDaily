"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, Search, Sparkles, Inbox, Plus, 
  Settings, Trash2, Folder, CheckSquare,
  Calendar, Target, Users2, FileText,
  ChevronDown, ChevronRight, MoreHorizontal,
  Share2, Cloud, Link2, Globe, BarChart3,
  HelpCircle, User, PanelRightClose, PanelRightOpen,
  CalendarCheck2,
  ChartNoAxesGantt,
  FolderRoot,
  SquareCheckBig,
  Notebook
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import CreateWorkspaceModal from "../workspace/CreateWorkspaceModel";
import CreateProjectModal from "../projects/CreateProjectModal";
import CreateTaskModal from "../tasks/CreateTaskModel";

const navIcons = [
  { label: "Home", icon: Home, href: "/dashboard/overview" },
  { label: "Daily Routine", icon: CalendarCheck2, href: "/dashboard/dailyroutine" },
  // { label: "overview", icon: ChartNoAxesGantt, href: "#" },
  { label: "Projects", icon: FolderRoot, href: "/dashboard/project" },
  { label: "Tasks", icon: SquareCheckBig, href: "/dashboard/tasks" },
  { label: "Workspaces", icon: Notebook, href: "/dashboard/workspaces" },
  { label: "Ask AI", icon: Sparkles, href: "/dashboard/askai" },
  // { label: "Help", icon: HelpCircle, href: "/dashboard/" },
];

export default function ExactSidebar({ workspaces, tasks }: { workspaces: any[], tasks: any[] }) {
  const pathname = usePathname();
  
  // Click-only expansion
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Collapsible sections
  const [collapsedWorkspaces, setCollapsedWorkspaces] = useState<Set<string>>(new Set());
  const [collapsedProjects, setCollapsedProjects] = useState<Set<string>>(new Set());
  const [isGlobalTasksOpen, setIsGlobalTasksOpen] = useState(true);
  const [collapsedWsTasks, setCollapsedWsTasks] = useState<Set<string>>(new Set());
  
  // Modals
  const [isWorkspaceModalOpen, setIsWorkspaceModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [taskModalState, setTaskModalState] = useState<{
    isOpen: boolean;
    workspace: any | null;
  }>({
    isOpen: false,
    workspace: null,
  });
  
  const toggleWorkspace = (id: string) => {
    setCollapsedWorkspaces(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };
  
  const toggleProject = (id: string) => {
    setCollapsedProjects(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };
  
  const toggleGlobalTasks = () => {
    setIsGlobalTasksOpen((prev) => !prev);
  };
  
  const toggleWsTasks = (id: string) => {
    setCollapsedWsTasks(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };
  
  const handleOpenTaskModal = (ws: any) => {
    setTaskModalState({
      isOpen: true,
      workspace: ws,
    });
  };

  return (
    <>
      {/* Main Icon Bar - Always Visible */}
      <aside 
        className={cn(
          "fixed left-0 top-0 h-[95%] mx-2 my-5 bg-[#1a1a1a] flex flex-col items-center text-white z-50 transition-all duration-300",
          "rounded-2xl shadow-2xl",
          "w-[72px]"
        )}
      >
        {/* Toggle Button at Top */}
        <div className="pt-8 pb-6">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={cn(
              "w-14 h-14 rounded-full flex items-center justify-center transition-all relative group",
              "bg-white/5 hover:bg-white/10"
            )}
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              {isExpanded ? (
                <PanelRightClose size={18} className="text-white" />
              ) : (
                <PanelRightOpen size={18} className="text-white" />
              )}
            </div>
            
            {/* Tooltip */}
            {!isExpanded && (
              <div className="absolute left-full ml-5 px-3 py-2 bg-[#2d2d2d] text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap shadow-xl border border-white/10 z-[100]">
                Open Sidebar
                <div className="absolute right-full top-1/2 -translate-y-1/2 border-8 border-transparent border-r-[#2d2d2d]" />
              </div>
            )}
          </button>
        </div>

        {/* Navigation Icons */}
        <nav className="flex-1 flex flex-col items-center space-y-1 w-full px-2  custom-scrollbar py-4">
          {navIcons.map((item, index) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "w-14 h-14 rounded-[18px] flex items-center justify-center transition-all relative group",
                  isActive 
                    ? "bg-white/10 text-white shadow-lg" 
                    : "hover:bg-white/5 text-slate-400 hover:text-white"
                )}
              >
                <Icon size={22} className="transition-transform group-hover:scale-110" />
                
                {/* Tooltip on hover */}
                {!isExpanded && (
                  <div className="absolute left-full ml-5 px-3 py-2 bg-[#2d2d2d] text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap shadow-xl border border-white/10 z-[100]">
                    {item.label}
                    <div className="absolute right-full top-1/2 -translate-y-1/2 border-8 border-transparent border-r-[#2d2d2d]" />
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="pb-8 flex flex-col items-center space-y-4">
          {/* "SPACE" Text Vertical */}
          {/* <div 
            className="text-[10px] font-bold text-slate-600 tracking-[0.25em] uppercase"
            style={{ 
              writingMode: 'vertical-rl', 
              textOrientation: 'mixed',
              transform: 'rotate(180deg)'
            }}
          >
            SPACE
          </div> */}

          {/* User Avatar */}
          <div className="relative group">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm font-bold cursor-pointer hover:ring-2 ring-white/30 transition-all shadow-lg">
              <User size={20} />
            </div>
            
            {/* User Tooltip */}
            {!isExpanded && (
              <div className="absolute left-full ml-5 px-3 py-2 bg-[#2d2d2d] text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap shadow-xl border border-white/10 z-[100] bottom-0">
                Niraj's Workspace
                <div className="absolute right-full top-1/2 -translate-y-1/2 border-8 border-transparent border-r-[#2d2d2d]" />
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Expanded Content Panel - Slides from Left */}
      <div
        className={cn(
          "fixed top-0 my-5 left-[70px] h-[95%] bg-[#0a0a0a] border border-[#3a3a3a43] z-40 transition-all rounded-r-2xl duration-300 ease-in-out shadow-2xl",
          isExpanded ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0",
          "w-[300px]"
        )}
      >
        {isExpanded && (
          <div className="flex flex-col h-full text-[#9b9b9b]">
            {/* Header */}
            <div className="p-5 border-b border-white/5">
              <div className="flex items-center gap-3 px-3 py-2 hover:bg-white/5 rounded-xl cursor-pointer transition-all group">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white shadow-lg">
                  N
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">Niraj's Workspace</p>
                  <p className="text-xs text-slate-500">Free Plan</p>
                </div>
                <ChevronDown size={16} className="text-slate-500 group-hover:text-white transition-colors" />
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar px-4 py-6 space-y-6">
              
              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => setIsWorkspaceModalOpen(true)}
                  className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all group"
                >
                  <Plus size={18} className="text-indigo-400 mb-1" />
                  <p className="text-xs font-medium text-white">New Workspace</p>
                </button>
                <button 
                  onClick={() => setIsProjectModalOpen(true)}
                  className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all group"
                >
                  <Folder size={18} className="text-purple-400 mb-1" />
                  <p className="text-xs font-medium text-white">New Project</p>
                </button>
              </div>

              {/* Workspaces */}
              <div className="space-y-3">
                <div className="flex items-center justify-between px-2">
                  <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Workspaces
                  </h3>
                  <button 
                    onClick={() => setIsWorkspaceModalOpen(true)}
                    className="p-1 hover:bg-white/10 rounded-md transition-colors"
                  >
                    <Plus size={14} className="text-slate-500 hover:text-white" />
                  </button>
                </div>

                <div className="space-y-1">
                  {workspaces.map((ws) => (
                    <div key={ws.id} className="space-y-1">
                      <button
                        onClick={() => toggleWorkspace(ws.id)}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm font-semibold text-white hover:bg-white/5 rounded-lg cursor-pointer transition-all group"
                      >
                        {collapsedWorkspaces.has(ws.id) ? (
                          <ChevronRight size={14} className="text-slate-600" />
                        ) : (
                          <ChevronDown size={14} className="text-slate-600" />
                        )}
                        <div className="w-2 h-2 rounded-full bg-indigo-500" />
                        <span className="flex-1 truncate text-left text-xs uppercase tracking-wide">
                          {ws.name}
                        </span>
                        <MoreHorizontal size={14} className="opacity-0 group-hover:opacity-100 text-slate-500" />
                      </button>

                      {!collapsedWorkspaces.has(ws.id) && (
                        <div className="ml-6 space-y-3 py-2">
                          {/* Projects */}
                          <div className="space-y-1">
                            <div className="flex items-center justify-between px-2 py-1">
                              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase">
                                <Folder size={11} />
                                <span>Projects</span>
                              </div>
                              <Plus 
                                size={12} 
                                className="cursor-pointer hover:text-white transition-colors" 
                                onClick={() => setIsProjectModalOpen(true)} 
                              />
                            </div>

                            <div className="space-y-0.5">
                              {ws.projects?.map((project: any) => (
                                <div key={project.id} className="space-y-0.5">
                                  <Link
                                    href={`/dashboard/project/${project.id}`}
                                    className={cn(
                                      "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-all hover:bg-white/5 group",
                                      pathname.includes(project.id) && "bg-white/5 text-white"
                                    )}
                                  >
                                    <button 
                                      onClick={(e) => { 
                                        e.preventDefault(); 
                                        toggleProject(project.id); 
                                      }}
                                      className="flex items-center"
                                    >
                                      {collapsedProjects.has(project.id) ? (
                                        <ChevronRight size={10} className="text-slate-600" />
                                      ) : (
                                        <ChevronDown size={10} className="text-slate-600" />
                                      )}
                                    </button>
                                    <ProjectIcon type={project.name} color={project.color} />
                                    <span className="truncate flex-1">{project.name}</span>
                                  </Link>
                                  
                                  {!collapsedProjects.has(project.id) && project.tasks?.length > 0 && (
                                    <div className="ml-8 space-y-0.5 py-1">
                                      {project.tasks.map((task: any) => (
                                        <Link
                                          key={task.id}
                                          href={`/dashboard/project/${project.id}`}
                                          className="block px-3 py-1 text-[10px] text-slate-500 hover:text-white rounded-md hover:bg-white/5 truncate transition-all"
                                        >
                                          {task.title}
                                        </Link>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Tasks */}
                          <div className="space-y-1">
                            <div className="flex items-center justify-between px-2 py-1 hover:bg-white/5 rounded-md group">
                              <button
                                className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase cursor-pointer"
                                onClick={() => toggleWsTasks(ws.id)}
                              >
                                {collapsedWsTasks.has(ws.id) ? (
                                  <ChevronRight size={10} />
                                ) : (
                                  <ChevronDown size={10} />
                                )}
                                <CheckSquare size={11} />
                                <span>Tasks</span>
                              </button>

                              <button onClick={() => handleOpenTaskModal(ws)}>
                                <Plus size={12} className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-white transition-all" />
                              </button>
                            </div>

                            {!collapsedWsTasks.has(ws.id) && (
                              <div className="ml-8 space-y-0.5 py-1">
                                {tasks
                                  .filter((t) => t.workspaceId === ws.id)
                                  .slice(0, 5)
                                  .map((task) => (
                                    <Link
                                      key={task.id}
                                      href={
                                        task.projectId
                                          ? `/dashboard/project/${task.projectId}`
                                          : `/dashboard/workspaces/${task.workspaceId}`
                                      }
                                      className="block px-3 py-1 text-[10px] text-slate-500 hover:text-white rounded-md hover:bg-white/5 truncate transition-all"
                                    >
                                      {task.title}
                                    </Link>
                                  ))}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* All Tasks */}
              <div className="space-y-2">
                <div className="flex items-center justify-between px-2">
                  <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    All Tasks
                  </h3>
                  <button 
                    onClick={toggleGlobalTasks} 
                    className="p-1 hover:bg-white/10 rounded-md transition-colors"
                  >
                    {isGlobalTasksOpen ? (
                      <ChevronDown size={14} className="text-slate-500" />
                    ) : (
                      <ChevronRight size={14} className="text-slate-500" />
                    )}
                  </button>
                </div>

                {isGlobalTasksOpen && tasks?.length > 0 && (
                  <div className="space-y-0.5 max-h-[300px] overflow-y-auto custom-scrollbar">
                    {tasks.map((task: any) => (
                      <Link
                        key={task.id}
                        href={
                          task.projectId
                            ? `/dashboard/project/${task.projectId}`
                            : `/dashboard/workspaces/${task.workspaceId}`
                        }
                        className={cn(
                          "flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] transition-all hover:bg-white/5 group",
                          pathname.includes(task.id) && "bg-white/5 text-white"
                        )}
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                        <span className="truncate flex-1">{task.title}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 space-y-1 border-t border-white/5">
              <Link
                href="/dashboard/settings"
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium hover:bg-white/5 text-slate-400 hover:text-white transition-all"
              >
                <Settings size={16} />
                <span>Settings</span>
              </Link>
              <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium hover:bg-white/5 text-slate-400 hover:text-white transition-all">
                <Trash2 size={16} />
                <span>Trash</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Backdrop - Click to Close */}
      {isExpanded && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 transition-opacity duration-300"
          onClick={() => setIsExpanded(false)}
        />
      )}

      {/* Modals */}
      <CreateWorkspaceModal 
        isOpen={isWorkspaceModalOpen} 
        onClose={() => setIsWorkspaceModalOpen(false)} 
      />

      <CreateProjectModal 
        workspaces={workspaces}
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
      />

      {taskModalState.workspace && (
        <CreateTaskModal 
          isOpen={taskModalState.isOpen}
          onClose={() => setTaskModalState({ isOpen: false, workspace: null })}
          workspaceId={taskModalState.workspace.id}
          workspaceName={taskModalState.workspace.name}
          members={taskModalState.workspace.members}
        />
      )}
    </>
  );
}

// Helper
function ProjectIcon({ type, color }: { type: string; color?: string }) {
  const iconStyle = { color: color || "#9b9b9b" };
  if (type.includes("Calendar")) return <Calendar size={12} style={iconStyle} />;
  if (type.includes("Creative")) return <Users2 size={12} style={iconStyle} />;
  if (type.includes("Goals")) return <Target size={12} style={iconStyle} />;
  return <FileText size={12} style={iconStyle} />;
}

