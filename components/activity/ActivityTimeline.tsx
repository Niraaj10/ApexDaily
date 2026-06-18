"use client";

import { useEffect, useState } from "react";
import {
  Activity,
  MessageSquare,
  CheckCircle2,
  FileEdit,
  Clock,
  User,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface ActivityItem {
  id: string;
  type: string;
  timestamp: string;
  timeAgo: string;
  user?: any;
  task?: any;
  message: string;
  preview?: string;
}

export default function ActivityTimeline({
  workspaceId,
  userId,
  view = "workspace",
}: {
  workspaceId?: string;
  userId?: string;
  view?: "workspace" | "user";
}) {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivity();
    if (workspaceId) fetchSummary();
  }, [workspaceId, userId, view]);

  const fetchActivity = async () => {
    try {
      let url = "/api/activity";

      if (view === "user") {
        url += "?type=user";
      } else if (workspaceId) {
        url += `?workspaceId=${workspaceId}`;
      }

      const res = await fetch(url);
      const json = await res.json();
      setActivities(json);
    } catch (error) {
      console.error("Failed to fetch activity:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    if (!workspaceId) return;

    try {
      const res = await fetch(
        `/api/activity?workspaceId=${workspaceId}&type=summary`
      );
      const json = await res.json();
      setSummary(json);
    } catch (error) {
      console.error("Failed to fetch summary:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Activity Timeline</h2>
          <p className="text-sm text-slate-400 mt-1">
            {view === "user"
              ? "Your recent activity"
              : "What's happening in your workspace"}
          </p>
        </div>

        {summary && (
          <div className="flex gap-3">
            <ActivityStat
              label="Last 24h"
              value={summary.last24Hours.total}
              color="text-blue-400"
            />
            <ActivityStat
              label="Last 7 days"
              value={summary.last7Days.total}
              color="text-purple-400"
            />
          </div>
        )}
      </div>

      {/* Activity Feed */}
      <div className="bg-[#1a1a1a] rounded-xl border border-white/10 overflow-hidden">
        {activities.length === 0 ? (
          <div className="px-6 py-12 text-center text-slate-500">
            <Activity size={48} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No recent activity</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {activities.map((activity) => (
              <ActivityCard key={activity.id} activity={activity} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Activity Card Component
function ActivityCard({ activity }: { activity: ActivityItem }) {
  const Icon = getActivityIcon(activity.type);
  const iconColor = getActivityColor(activity.type);

  return (
    <div className="px-6 py-4 hover:bg-white/5 transition group">
      <div className="flex gap-4">
        {/* Icon */}
        <div
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
            `bg-${iconColor}-500/20`
          )}
        >
          <Icon className={`text-${iconColor}-400`} size={18} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              {/* User */}
              {activity.user && (
                <div className="flex items-center gap-2 mb-1">
                  {activity.user.image ? (
                    <img
                      src={activity.user.image}
                      alt={activity.user.name}
                      className="w-5 h-5 rounded-full"
                    />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-purple-600 flex items-center justify-center text-white text-[10px] font-bold">
                      {activity.user.name?.[0] || "?"}
                    </div>
                  )}
                  <span className="text-xs font-medium text-white">
                    {activity.user.name}
                  </span>
                </div>
              )}

              {/* Message */}
              <p className="text-sm text-slate-300">
                {activity.message}{" "}
                {activity.task && (
                  <Link
                    href={`/dashboard/tasks/${activity.task.id}`}
                    className="font-medium text-white hover:text-purple-400 transition"
                  >
                    {activity.task.title}
                  </Link>
                )}
              </p>

              {/* Preview (for comments) */}
              {activity.preview && (
                <p className="text-xs text-slate-500 mt-2 line-clamp-2">
                  "{activity.preview}"
                </p>
              )}

              {/* Task metadata */}
              {activity.task?.project && (
                <span
                  className="inline-block mt-2 text-[10px] px-2 py-0.5 rounded"
                  style={{
                    backgroundColor: activity.task.project.color + "20",
                    color: activity.task.project.color,
                  }}
                >
                  {activity.task.project.name}
                </span>
              )}
            </div>

            {/* Timestamp */}
            <div className="flex items-center gap-1.5 text-xs text-slate-500 flex-shrink-0">
              <Clock size={12} />
              {activity.timeAgo}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Activity Stat
function ActivityStat({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className={cn("text-2xl font-bold", color)}>{value}</p>
    </div>
  );
}

// Helper Functions
function getActivityIcon(type: string) {
  switch (type) {
    case "task_created":
      return FileEdit;
    case "task_completed":
      return CheckCircle2;
    case "task_updated":
      return FileEdit;
    case "comment_added":
      return MessageSquare;
    case "status_changed":
      return Activity;
    default:
      return Activity;
  }
}

function getActivityColor(type: string) {
  switch (type) {
    case "task_created":
      return "blue";
    case "task_completed":
      return "green";
    case "task_updated":
      return "yellow";
    case "comment_added":
      return "purple";
    case "status_changed":
      return "orange";
    default:
      return "slate";
  }
}
