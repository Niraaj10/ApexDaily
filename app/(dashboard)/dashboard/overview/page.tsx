"use client";

import { useState } from "react";
import SmartDailyDashboard from "@/components/dashboard/SmartDailyDashboard";
import HabitStreakTracker from "@/components/habit/HabitStreakTracker";
import TeamWorkloadBalancer from "@/components/team/TeamWorkloadBalancer";
import ActivityTimeline from "@/components/activity/ActivityTimeline";
import { LayoutDashboard, Target, Users2, Activity } from "lucide-react";
import { cn } from "@/lib/utils";


export default function DashboardOverviewPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "habits" | "team" | "activity">("overview");
  
  // TODO: Replace with actual workspace ID from your session/context
  const workspaceId = "your-workspace-id-here";

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Navigation Tabs */}
      <div className="border-b border-white/10 bg-[#0f0f0f] sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-1">
            <TabButton
              icon={LayoutDashboard}
              label="Overview"
              active={activeTab === "overview"}
              onClick={() => setActiveTab("overview")}
            />
            <TabButton
              icon={Target}
              label="Habits"
              active={activeTab === "habits"}
              onClick={() => setActiveTab("habits")}
            />
            <TabButton
              icon={Users2}
              label="Team"
              active={activeTab === "team"}
              onClick={() => setActiveTab("team")}
            />
            <TabButton
              icon={Activity}
              label="Activity"
              active={activeTab === "activity"}
              onClick={() => setActiveTab("activity")}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Smart Daily Dashboard */}
            <SmartDailyDashboard workspaceId={workspaceId} />

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Mini Habit Tracker */}
              <div className="bg-[#1a1a1a] rounded-xl border border-white/10 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-white">Today's Habits</h3>
                  <button
                    onClick={() => setActiveTab("habits")}
                    className="text-xs text-purple-400 hover:text-purple-300"
                  >
                    View all →
                  </button>
                </div>
                {/* Placeholder - you can add mini habit view here */}
                <p className="text-xs text-slate-500">
                  Quick habit check-ins coming soon
                </p>
              </div>

              {/* Recent Activity */}
              <div className="bg-[#1a1a1a] rounded-xl border border-white/10 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-white">Recent Activity</h3>
                  <button
                    onClick={() => setActiveTab("activity")}
                    className="text-xs text-purple-400 hover:text-purple-300"
                  >
                    View all →
                  </button>
                </div>
                <ActivityTimeline workspaceId={workspaceId} view="workspace" />
              </div>
            </div>
          </div>
        )}

        {activeTab === "habits" && <HabitStreakTracker />}

        {activeTab === "team" && <TeamWorkloadBalancer workspaceId={workspaceId} />}

        {activeTab === "activity" && (
          <ActivityTimeline workspaceId={workspaceId} view="workspace" />
        )}
      </div>
    </div>
  );
}

// Tab Button Component
function TabButton({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: any;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-4 py-3 text-sm font-medium transition border-b-2",
        active
          ? "text-white border-purple-500 bg-white/5"
          : "text-slate-400 border-transparent hover:text-slate-200 hover:bg-white/5"
      )}
    >
      <Icon size={16} />
      {label}
    </button>
  );
}


export function AlternativeGridLayout() {
  const workspaceId = "your-workspace-id-here";

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-6">
      <div className="max-w-[2000px] mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-slate-400">Your productivity command center</p>
        </div>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            <SmartDailyDashboard workspaceId={workspaceId} />
            <TeamWorkloadBalancer workspaceId={workspaceId} />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <HabitStreakTracker />
            <ActivityTimeline workspaceId={workspaceId} view="workspace" />
          </div>
        </div>
      </div>
    </div>
  );
}


export function CompactCardsLayout() {
  const workspaceId = "your-workspace-id-here";

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        
        {/* Focus Tasks Card */}
        <div className="lg:col-span-2">
          <SmartDailyDashboard workspaceId={workspaceId} />
        </div>

        {/* Habits Card */}
        <div className="lg:row-span-2">
          <HabitStreakTracker />
        </div>

        {/* Team Workload Card */}
        <div className="lg:col-span-2">
          <TeamWorkloadBalancer workspaceId={workspaceId} />
        </div>

        {/* Activity Card */}
        <div className="lg:col-span-3">
          <ActivityTimeline workspaceId={workspaceId} view="workspace" />
        </div>
      </div>
    </div>
  );
}
