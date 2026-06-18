
// HABIT STREAK TRACKER QUERIES

import { prisma } from "@/lib/prisma";
import {
  startOfDay,
  endOfDay,
  subDays,
  differenceInDays,
  isSameDay,
  format,
} from "date-fns";

/**
 * Get all habits for a user with current streak info
 */
export async function getUserHabitsWithStreaks(userId: string) {
  const habits = await prisma.habit.findMany({
    where: { userId },
    include: {
      logs: {
        where: {
          completed: true,
        },
        orderBy: {
          date: "desc",
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  // Calculate streaks for each habit
  return habits.map((habit) => {
    const { currentStreak, longestStreak, totalCompletions } =
      calculateStreaks(habit.logs);

    return {
      ...habit,
      currentStreak,
      longestStreak,
      totalCompletions,
      completionRate: getCompletionRate(habit.logs, 30), // Last 30 days
    };
  });
}

/**
 * Calculate current and longest streak for a habit
 */
function calculateStreaks(logs: any[]) {
  if (logs.length === 0) {
    return { currentStreak: 0, longestStreak: 0, totalCompletions: 0 };
  }

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;

  // Sort logs by date descending
  const sortedLogs = [...logs].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Calculate current streak
  let checkDate = startOfDay(new Date());
  for (const log of sortedLogs) {
    const logDate = startOfDay(new Date(log.date));

    if (isSameDay(logDate, checkDate)) {
      currentStreak++;
      checkDate = subDays(checkDate, 1);
    } else if (logDate < checkDate) {
      break; // Streak broken
    }
  }

  // Calculate longest streak
  for (let i = 0; i < sortedLogs.length; i++) {
    const currentLog = sortedLogs[i];
    const nextLog = sortedLogs[i + 1];

    tempStreak++;

    if (nextLog) {
      const daysDiff = differenceInDays(
        new Date(currentLog.date),
        new Date(nextLog.date)
      );

      if (daysDiff > 1) {
        // Streak broken
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 0;
      }
    }
  }

  longestStreak = Math.max(longestStreak, tempStreak);

  return {
    currentStreak,
    longestStreak,
    totalCompletions: logs.length,
  };
}

/**
 * Get completion rate for last N days
 */
function getCompletionRate(logs: any[], days: number): number {
  if (logs.length === 0) return 0;

  const startDate = subDays(new Date(), days);
  const recentLogs = logs.filter((log) => new Date(log.date) >= startDate);

  return Math.round((recentLogs.length / days) * 100);
}

/**
 * Get habit logs for a specific date range (for calendar view)
 */
export async function getHabitLogsForDateRange(
  habitId: string,
  startDate: Date,
  endDate: Date
) {
  return await prisma.habitLog.findMany({
    where: {
      habitId,
      date: {
        gte: startOfDay(startDate),
        lte: endOfDay(endDate),
      },
    },
    orderBy: {
      date: "asc",
    },
  });
}

/**
 * Toggle habit completion for a specific date
 */
export async function toggleHabitCompletion(habitId: string, date: Date) {
  const normalizedDate = startOfDay(date);

  // Check if log already exists
  const existingLog = await prisma.habitLog.findUnique({
    where: {
      habitId_date: {
        habitId,
        date: normalizedDate,
      },
    },
  });

  if (existingLog) {
    // Toggle completion
    return await prisma.habitLog.update({
      where: { id: existingLog.id },
      data: { completed: !existingLog.completed },
    });
  } else {
    // Create new log
    return await prisma.habitLog.create({
      data: {
        habitId,
        date: normalizedDate,
        completed: true,
      },
    });
  }
}

/**
 * Get habit statistics for dashboard
 */
export async function getHabitStats(userId: string) {
  const habits = await getUserHabitsWithStreaks(userId);

  const totalHabits = habits.length;
  const activeStreaks = habits.filter((h) => h.currentStreak > 0).length;
  const longestStreak = Math.max(...habits.map((h) => h.longestStreak), 0);

  // Get today's completion rate
  const today = startOfDay(new Date());
  const todayLogs = await prisma.habitLog.count({
    where: {
      habit: { userId },
      date: today,
      completed: true,
    },
  });

  const todayCompletionRate =
    totalHabits > 0 ? Math.round((todayLogs / totalHabits) * 100) : 0;

  return {
    totalHabits,
    activeStreaks,
    longestStreak,
    todayCompletionRate,
    completedToday: todayLogs,
  };
}

/**
 * Get habit history for last 30 days (for charts)
 */
export async function getHabitHistory(userId: string, days: number = 30) {
  const history = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = subDays(new Date(), i);
    const start = startOfDay(date);

    const completed = await prisma.habitLog.count({
      where: {
        habit: { userId },
        date: start,
        completed: true,
      },
    });

    const total = await prisma.habit.count({
      where: { userId },
    });

    history.push({
      date: format(date, "MMM dd"),
      completed,
      total,
      rate: total > 0 ? Math.round((completed / total) * 100) : 0,
    });
  }

  return history;
}

/**
 * Create a new habit
 */
export async function createHabit(userId: string, data: {
  name: string;
  icon?: string;
  color?: string;
}) {
  return await prisma.habit.create({
    data: {
      userId,
      ...data,
    },
  });
}

/**
 * Delete a habit
 */
export async function deleteHabit(habitId: string) {
  // This will cascade delete all logs
  return await prisma.habit.delete({
    where: { id: habitId },
  });
}

/**
 * Get habits that need attention (missed today)
 */
export async function getMissedHabitsToday(userId: string) {
  const today = startOfDay(new Date());

  const allHabits = await prisma.habit.findMany({
    where: { userId },
    include: {
      logs: {
        where: {
          date: today,
          completed: true,
        },
      },
    },
  });

  // Return habits without a completed log today
  return allHabits.filter((habit) => habit.logs.length === 0);
}
