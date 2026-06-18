"use client";

import { useEffect, useState } from "react";
import {
  Target,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Calendar,
  ArrowRight,
  Flame,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface DashboardData {
  focusTasks: any[];
  dailyStats: {
    completedToday: number;
    totalActive: number;
    overdueCount: number;
    dueToday: number;
    completionRate: number;
  };
  weeklyTrend: any[];
  suggestions: string[];
  upcomingTasks: any[];
}

export default function SmartDailyDashboard({
  workspaceId,
}: {
  workspaceId: string;
}) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [workspaceId]);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch(`/api/dashboard?workspaceId=${workspaceId}`);
      const json = await res.json();
      setData(json);
    } catch (error) {
      console.error("Failed to fetch dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Good {getTimeOfDay()}, {/* User name */}
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Here's what needs your attention today
          </p>
        </div>
        <div className="flex gap-2">
          <StatCard
            icon={CheckCircle2}
            label="Completed"
            value={data.dailyStats.completedToday}
            color="text-green-400"
          />
          <StatCard
            icon={AlertCircle}
            label="Overdue"
            value={data.dailyStats.overdueCount}
            color="text-red-400"
          />
          <StatCard
            icon={Target}
            label="Due Today"
            value={data.dailyStats.dueToday}
            color="text-yellow-400"
          />
        </div>
      </div>

      {/* AI Suggestions */}
      {data.suggestions.length > 0 && (
        <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-500/30 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Sparkles className="text-purple-400 mt-0.5" size={18} />
            <div className="flex-1 space-y-2">
              <h3 className="text-sm font-bold text-white">AI Insights</h3>
              {data.suggestions.map((suggestion, i) => (
                <p key={i} className="text-xs text-slate-300">
                  {suggestion}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Focus Tasks (Top 5 AI-Prioritized) */}
      <div className="bg-[#1a1a1a] rounded-xl border border-white/10 overflow-hidden">
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="text-orange-400" size={18} />
            <h2 className="text-sm font-bold text-white">
              Today's Focus ({data.focusTasks.length})
            </h2>
          </div>
          <span className="text-xs text-slate-500">AI-Prioritized</span>
        </div>

        <div className="divide-y divide-white/5">
          {data.focusTasks.length === 0 ? (
            <div className="px-6 py-8 text-center text-slate-500 text-sm">
              🎉 No urgent tasks! You're all caught up.
            </div>
          ) : (
            data.focusTasks.map((task: any) => (
              <FocusTaskCard key={task.id} task={task} />
            ))
          )}
        </div>
      </div>

      {/* Grid: Weekly Trend + Upcoming */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Trend */}
        <div className="bg-[#1a1a1a] rounded-xl border border-white/10 p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="text-blue-400" size={18} />
            <h3 className="text-sm font-bold text-white">7-Day Completion Trend</h3>
          </div>

          <div className="flex items-end gap-2 h-32">
            {data.weeklyTrend.map((day: any, i: number) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full bg-purple-600 rounded-t transition-all hover:bg-purple-500"
                  style={{
                    height: `${Math.max(day.completed * 10, 5)}%`,
                  }}
                />
                <span className="text-[9px] text-slate-500">
                  {new Date(day.date).toLocaleDateString("en", {
                    weekday: "short",
                  })}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Tasks */}
        <div className="bg-[#1a1a1a] rounded-xl border border-white/10 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="text-green-400" size={18} />
            <h3 className="text-sm font-bold text-white">
              Upcoming This Week ({data.upcomingTasks.length})
            </h3>
          </div>

          <div className="space-y-2 max-h-32 overflow-y-auto custom-scrollbar">
            {data.upcomingTasks.slice(0, 5).map((task: any) => (
              <Link
                key={task.id}
                href={`/dashboard/tasks/${task.id}`}
                className="flex items-center gap-2 p-2 rounded hover:bg-white/5 transition group"
              >
                <div
                  className="w-2 h-2 rounded-full"
                  style={{
                    backgroundColor: task.project?.color || "#6b7280",
                  }}
                />
                <span className="text-xs text-slate-300 truncate flex-1 group-hover:text-white">
                  {task.title}
                </span>
                {task.dueDate && (
                  <span className="text-[10px] text-slate-500">
                    {new Date(task.dueDate).toLocaleDateString("en", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Sub-components
function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: any;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-3 flex items-center gap-3">
      <Icon className={color} size={20} />
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-xl font-bold text-white">{value}</p>
      </div>
    </div>
  );
}

function FocusTaskCard({ task }: { task: any }) {
  const priorityColors = {
    URGENT: "bg-red-500",
    HIGH: "bg-orange-500",
    MEDIUM: "bg-yellow-500",
    LOW: "bg-green-500",
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();

  return (
    <Link
      href={`/dashboard/tasks/${task.id}`}
      className="px-6 py-4 hover:bg-white/5 transition group flex items-center gap-4"
    >
      <div
        className={cn(
          "w-1 h-1 rounded-full",
          priorityColors[task.priority as keyof typeof priorityColors]
        )}
      />

      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-white group-hover:text-purple-400 transition truncate">
          {task.title}
        </h4>
        <div className="flex items-center gap-2 mt-1">
          {task.project && (
            <span
              className="text-[10px] px-2 py-0.5 rounded"
              style={{
                backgroundColor: task.project.color + "20",
                color: task.project.color,
              }}
            >
              {task.project.name}
            </span>
          )}
          {task.assignee && (
            <span className="text-[10px] text-slate-500">
              → {task.assignee.name}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {task.dueDate && (
          <div
            className={cn(
              "text-xs font-medium",
              isOverdue ? "text-red-400" : "text-slate-400"
            )}
          >
            {isOverdue ? "Overdue" : formatDueDate(task.dueDate)}
          </div>
        )}
        <div className="text-[10px] font-bold text-purple-400 opacity-0 group-hover:opacity-100 transition">
          AI Score: {task.aiScore}
        </div>
        <ArrowRight
          size={16}
          className="text-slate-600 group-hover:text-white transition"
        />
      </div>
    </Link>
  );
}

// Helper functions
function getTimeOfDay() {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 18) return "afternoon";
  return "evening";
}

function formatDueDate(date: string) {
  const d = new Date(date);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === tomorrow.toDateString()) return "Tomorrow";

  return d.toLocaleDateString("en", { month: "short", day: "numeric" });
}
