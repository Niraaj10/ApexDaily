"use client";

import { useEffect, useState } from "react";
import {
  Users2,
  AlertTriangle,
  TrendingUp,
  CheckCircle2,
  Clock,
  ArrowRight,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface TeamWorkloadData {
  workload: any[];
  capacity: any;
  suggestions: any[];
  redistribute: any[];
  performance: any;
}

export default function TeamWorkloadBalancer({
  workspaceId,
}: {
  workspaceId: string;
}) {
  const [data, setData] = useState<TeamWorkloadData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"workload" | "suggestions">(
    "workload"
  );

  useEffect(() => {
    fetchWorkloadData();
  }, [workspaceId]);

  const fetchWorkloadData = async () => {
    try {
      const [workload, capacity, suggestions, redistribute, performance] =
        await Promise.all([
          fetch(`/api/team/workload?workspaceId=${workspaceId}`).then((r) =>
            r.json()
          ),
          fetch(
            `/api/team/workload?workspaceId=${workspaceId}&type=capacity`
          ).then((r) => r.json()),
          fetch(
            `/api/team/workload?workspaceId=${workspaceId}&type=suggestions`
          ).then((r) => r.json()),
          fetch(
            `/api/team/workload?workspaceId=${workspaceId}&type=redistribute`
          ).then((r) => r.json()),
          fetch(
            `/api/team/workload?workspaceId=${workspaceId}&type=performance`
          ).then((r) => r.json()),
        ]);

      setData({ workload, capacity, suggestions, redistribute, performance });
    } catch (error) {
      console.error("Failed to fetch workload data:", error);
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
          <h2 className="text-2xl font-bold text-white">Team Workload</h2>
          <p className="text-sm text-slate-400 mt-1">
            Balance tasks across your team
          </p>
        </div>

        <div className="flex gap-3">
          <StatCard
            icon={Users2}
            label="Team Members"
            value={data.capacity.totalMembers}
            color="text-blue-400"
          />
          <StatCard
            icon={CheckCircle2}
            label="Completed/Week"
            value={data.performance.completedThisWeek}
            color="text-green-400"
          />
          <StatCard
            icon={TrendingUp}
            label="Balance Score"
            value={`${data.capacity.balanceScore}/100`}
            color={
              data.capacity.balanceScore > 70
                ? "text-green-400"
                : data.capacity.balanceScore > 40
                ? "text-yellow-400"
                : "text-red-400"
            }
          />
        </div>
      </div>

      {/* Capacity Overview */}
      <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-500/30 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Zap className="text-blue-400" size={24} />
            <div>
              <h3 className="text-sm font-bold text-white">Team Capacity</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {data.capacity.totalActiveTasks} active tasks ·{" "}
                {data.capacity.avgTasksPerPerson} avg per person
              </p>
            </div>
          </div>

          <div className="flex gap-6 text-center">
            {data.capacity.overburdenedMembers > 0 && (
              <div>
                <div className="text-2xl font-bold text-red-400">
                  {data.capacity.overburdenedMembers}
                </div>
                <div className="text-[10px] text-slate-500 uppercase">
                  Overloaded
                </div>
              </div>
            )}
            {data.capacity.underutilizedMembers > 0 && (
              <div>
                <div className="text-2xl font-bold text-green-400">
                  {data.capacity.underutilizedMembers}
                </div>
                <div className="text-[10px] text-slate-500 uppercase">
                  Available
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10">
        <button
          onClick={() => setActiveTab("workload")}
          className={cn(
            "px-4 py-2 text-sm font-bold transition border-b-2",
            activeTab === "workload"
              ? "text-white border-purple-500"
              : "text-slate-500 border-transparent hover:text-slate-300"
          )}
        >
          Team Workload
        </button>
        <button
          onClick={() => setActiveTab("suggestions")}
          className={cn(
            "px-4 py-2 text-sm font-bold transition border-b-2 flex items-center gap-2",
            activeTab === "suggestions"
              ? "text-white border-purple-500"
              : "text-slate-500 border-transparent hover:text-slate-300"
          )}
        >
          AI Suggestions
          {(data.suggestions.length > 0 || data.redistribute.length > 0) && (
            <span className="bg-purple-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {data.suggestions.length + data.redistribute.length}
            </span>
          )}
        </button>
      </div>

      {/* Content */}
      {activeTab === "workload" ? (
        <WorkloadView data={data.workload} />
      ) : (
        <SuggestionsView
          suggestions={data.suggestions}
          redistribute={data.redistribute}
        />
      )}
    </div>
  );
}

// Workload View
function WorkloadView({ data }: { data: any[] }) {
  return (
    <div className="bg-[#1a1a1a] rounded-xl border border-white/10 overflow-hidden">
      {data.map((member: any, i: number) => (
        <div
          key={i}
          className="px-6 py-4 border-b border-white/5 last:border-b-0 hover:bg-white/5 transition"
        >
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="relative">
              {member.member.image ? (
                <img
                  src={member.member.image}
                  alt={member.member.name}
                  className="w-12 h-12 rounded-full"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold">
                  {member.member.name?.[0] || "?"}
                </div>
              )}

              {/* Workload indicator */}
              {member.activeTasks > 20 && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-[#1a1a1a]" />
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-white">
                  {member.member.name}
                </h4>
                <span className="text-[10px] px-2 py-0.5 bg-white/5 rounded uppercase text-slate-400">
                  {member.role}
                </span>
              </div>

              {/* Progress bar */}
              <div className="mt-2 flex items-center gap-3">
                <div className="flex-1 h-2 bg-black/30 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full transition-all",
                      member.workloadScore > 150
                        ? "bg-red-500"
                        : member.workloadScore > 100
                        ? "bg-yellow-500"
                        : "bg-green-500"
                    )}
                    style={{
                      width: `${Math.min((member.workloadScore / 200) * 100, 100)}%`,
                    }}
                  />
                </div>
                <span className="text-xs text-slate-500 min-w-[60px]">
                  Score: {member.workloadScore}
                </span>
              </div>
            </div>

            {/* Task counts */}
            <div className="flex gap-6">
              <TaskStat
                label="Active"
                value={member.activeTasks}
                color="text-blue-400"
              />
              <TaskStat
                label="High Priority"
                value={member.highPriorityTasks}
                color="text-orange-400"
              />
              <TaskStat
                label="Overdue"
                value={member.overdueTasks}
                color="text-red-400"
              />
              <TaskStat
                label="This Week"
                value={member.dueThisWeek}
                color="text-green-400"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Suggestions View
function SuggestionsView({
  suggestions,
  redistribute,
}: {
  suggestions: any[];
  redistribute: any[];
}) {
  return (
    <div className="space-y-4">
      {/* Assignment Suggestions */}
      {suggestions.length > 0 && (
        <div className="bg-[#1a1a1a] rounded-xl border border-white/10 overflow-hidden">
          <div className="px-6 py-3 bg-[#141414] border-b border-white/10">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Zap className="text-yellow-400" size={16} />
              Suggested Assignments
            </h3>
          </div>

          <div className="divide-y divide-white/5">
            {suggestions.map((suggestion: any, i: number) => (
              <SuggestionCard key={i} suggestion={suggestion} type="assign" />
            ))}
          </div>
        </div>
      )}

      {/* Redistribution Suggestions */}
      {redistribute.length > 0 && (
        <div className="bg-[#1a1a1a] rounded-xl border border-white/10 overflow-hidden">
          <div className="px-6 py-3 bg-[#141414] border-b border-white/10">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <AlertTriangle className="text-orange-400" size={16} />
              Rebalancing Suggestions
            </h3>
          </div>

          <div className="divide-y divide-white/5">
            {redistribute.map((suggestion: any, i: number) => (
              <SuggestionCard
                key={i}
                suggestion={suggestion}
                type="redistribute"
              />
            ))}
          </div>
        </div>
      )}

      {suggestions.length === 0 && redistribute.length === 0 && (
        <div className="bg-[#1a1a1a] rounded-xl border border-white/10 p-12 text-center">
          <CheckCircle2 size={48} className="mx-auto mb-3 text-green-400" />
          <h3 className="text-lg font-bold text-white mb-2">
            Workload is Balanced!
          </h3>
          <p className="text-sm text-slate-400">
            No immediate actions needed. Keep up the great work!
          </p>
        </div>
      )}
    </div>
  );
}

// Suggestion Card
function SuggestionCard({
  suggestion,
  type,
}: {
  suggestion: any;
  type: "assign" | "redistribute";
}) {
  return (
    <div className="px-6 py-4 hover:bg-white/5 transition">
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <Link
            href={`/dashboard/tasks/${suggestion.task.id}`}
            className="text-sm font-medium text-white hover:text-purple-400 transition"
          >
            {suggestion.task.title}
          </Link>

          {suggestion.task.project && (
            <span
              className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded"
              style={{
                backgroundColor: suggestion.task.project.color + "20",
                color: suggestion.task.project.color,
              }}
            >
              {suggestion.task.project.name}
            </span>
          )}

          <p className="text-xs text-slate-400 mt-2">{suggestion.reason}</p>
        </div>

        <div className="flex items-center gap-3">
          {type === "redistribute" && suggestion.currentAssignee && (
            <>
              <UserBadge user={suggestion.currentAssignee} />
              <ArrowRight size={16} className="text-slate-600" />
            </>
          )}
          <UserBadge user={suggestion.suggestedAssignee} />
          <button className="bg-purple-600 hover:bg-purple-700 px-4 py-1.5 rounded text-xs font-bold text-white transition">
            Assign
          </button>
        </div>
      </div>
    </div>
  );
}

// Helper Components
function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: any;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <div className="bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-3 flex items-center gap-3">
      <Icon className={color} size={20} />
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-lg font-bold text-white">{value}</p>
      </div>
    </div>
  );
}

function TaskStat({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="text-center">
      <div className={cn("text-lg font-bold", color)}>{value}</div>
      <div className="text-[9px] text-slate-500 uppercase">{label}</div>
    </div>
  );
}

function UserBadge({ user }: { user: any }) {
  return (
    <div className="flex items-center gap-2">
      {user.image ? (
        <img
          src={user.image}
          alt={user.name}
          className="w-6 h-6 rounded-full"
        />
      ) : (
        <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center text-white text-[10px] font-bold">
          {user.name?.[0] || "?"}
        </div>
      )}
      <span className="text-xs text-slate-300">{user.name}</span>
    </div>
  );
}
