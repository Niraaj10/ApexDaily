"use client";

import { useEffect, useState } from "react";
import {
  Check,
  Plus,
  Flame,
  Trophy,
  Target,
  TrendingUp,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Habit {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  currentStreak: number;
  longestStreak: number;
  totalCompletions: number;
  completionRate: number;
  logs: any[];
}

export default function HabitStreakTracker() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // Get last 7 days for calendar view
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date;
  });

  useEffect(() => {
    fetchHabits();
    fetchStats();
  }, []);

  const fetchHabits = async () => {
    try {
      const res = await fetch("/api/habits");
      const json = await res.json();
      setHabits(json);
    } catch (error) {
      console.error("Failed to fetch habits:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/habits?type=stats");
      const json = await res.json();
      setStats(json);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  const toggleHabit = async (habitId: string, date: Date) => {
    try {
      await fetch(`/api/habits/${habitId}/toggle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: date.toISOString() }),
      });

      // Refresh data
      fetchHabits();
      fetchStats();
    } catch (error) {
      console.error("Failed to toggle habit:", error);
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
      {/* Header with Stats */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Habit Tracker</h2>
          <p className="text-sm text-slate-400 mt-1">
            Build consistency, track streaks
          </p>
        </div>

        <div className="flex gap-3">
          {stats && (
            <>
              <StatBadge
                icon={Flame}
                label="Active Streaks"
                value={stats.activeStreaks}
                color="text-orange-400"
              />
              <StatBadge
                icon={Trophy}
                label="Longest Streak"
                value={`${stats.longestStreak}d`}
                color="text-yellow-400"
              />
              <StatBadge
                icon={Target}
                label="Today"
                value={`${stats.todayCompletionRate}%`}
                color="text-green-400"
              />
            </>
          )}

          <button
            onClick={() => setShowAddModal(true)}
            className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg text-white text-sm font-bold flex items-center gap-2 transition"
          >
            <Plus size={16} /> Add Habit
          </button>
        </div>
      </div>

      {/* Habits Table */}
      <div className="bg-[#1a1a1a] rounded-xl border border-white/10 overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-[250px_repeat(7,1fr)_120px] gap-4 px-6 py-3 bg-[#141414] border-b border-white/10 text-xs font-bold text-slate-500 uppercase">
          <div>Habit</div>
          {last7Days.map((date, i) => (
            <div key={i} className="text-center">
              <div>{date.toLocaleDateString("en", { weekday: "short" })}</div>
              <div className="text-[10px] text-slate-600">
                {date.toLocaleDateString("en", { month: "short", day: "numeric" })}
              </div>
            </div>
          ))}
          <div className="text-center">Streak</div>
        </div>

        {/* Habits Rows */}
        <div className="divide-y divide-white/5">
          {habits.length === 0 ? (
            <div className="px-6 py-12 text-center text-slate-500">
              <Target size={48} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">No habits yet. Create one to get started!</p>
            </div>
          ) : (
            habits.map((habit) => (
              <HabitRow
                key={habit.id}
                habit={habit}
                dates={last7Days}
                onToggle={toggleHabit}
              />
            ))
          )}
        </div>
      </div>

      {/* Add Habit Modal */}
      {showAddModal && (
        <AddHabitModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            fetchHabits();
            fetchStats();
            setShowAddModal(false);
          }}
        />
      )}
    </div>
  );
}

// Habit Row Component
function HabitRow({
  habit,
  dates,
  onToggle,
}: {
  habit: Habit;
  dates: Date[];
  onToggle: (habitId: string, date: Date) => void;
}) {
  const isCompleted = (date: Date) => {
    return habit.logs.some(
      (log) =>
        log.completed &&
        new Date(log.date).toDateString() === date.toDateString()
    );
  };

  return (
    <div
      className="grid grid-cols-[250px_repeat(7,1fr)_120px] gap-4 px-6 py-4 hover:bg-white/5 transition group"
      style={{
        borderLeft: `3px solid ${habit.color || "#6b7280"}`,
      }}
    >
      {/* Habit Name */}
      <div className="flex items-center gap-3">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
          style={{
            backgroundColor: habit.color + "20" || "#6b728020",
            color: habit.color || "#6b7280",
          }}
        >
          {habit.icon || habit.name[0]}
        </div>
        <div>
          <h4 className="text-sm font-medium text-white">{habit.name}</h4>
          <p className="text-[10px] text-slate-500">
            {habit.completionRate}% completion rate
          </p>
        </div>
      </div>

      {/* Checkboxes for each day */}
      {dates.map((date, i) => {
        const completed = isCompleted(date);
        const isToday = date.toDateString() === new Date().toDateString();

        return (
          <div key={i} className="flex items-center justify-center">
            <button
              onClick={() => onToggle(habit.id, date)}
              className={cn(
                "w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-all hover:scale-110",
                completed
                  ? "bg-green-500 border-green-500"
                  : isToday
                  ? "border-purple-500 hover:bg-purple-500/20"
                  : "border-white/10 hover:border-white/30"
              )}
            >
              {completed && <Check size={16} className="text-white" />}
            </button>
          </div>
        );
      })}

      {/* Streak Info */}
      <div className="flex items-center justify-center gap-2">
        <Flame
          size={18}
          className={
            habit.currentStreak > 0 ? "text-orange-400" : "text-slate-600"
          }
        />
        <div className="text-center">
          <div className="text-sm font-bold text-white">
            {habit.currentStreak}
          </div>
          <div className="text-[9px] text-slate-500">
            Best: {habit.longestStreak}
          </div>
        </div>
      </div>
    </div>
  );
}

// Stat Badge Component
function StatBadge({
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

// Add Habit Modal
function AddHabitModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [name, setName] = useState("");
  const [color, setColor] = useState("#8b5cf6");
  const [icon, setIcon] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/habits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, color, icon }),
      });

      if (res.ok) {
        onSuccess();
      }
    } catch (error) {
      console.error("Failed to create habit:", error);
    } finally {
      setLoading(false);
    }
  };

  const colors = [
    "#8b5cf6", // purple
    "#3b82f6", // blue
    "#10b981", // green
    "#f59e0b", // yellow
    "#ef4444", // red
    "#ec4899", // pink
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1a1a1a] rounded-xl border border-white/10 w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h3 className="text-lg font-bold text-white">Create New Habit</h3>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-white transition"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">
              Habit Name
            </label>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Morning Workout, Read 30 min"
              className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-white text-sm outline-none focus:border-purple-500 transition"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">
              Color
            </label>
            <div className="flex gap-2">
              {colors.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={cn(
                    "w-10 h-10 rounded-lg border-2 transition-all hover:scale-110",
                    color === c ? "border-white scale-110" : "border-transparent"
                  )}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-lg text-sm font-bold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || loading}
              className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-bold transition"
            >
              {loading ? "Creating..." : "Create Habit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
