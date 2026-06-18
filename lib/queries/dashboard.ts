
// SMART DAILY DASHBOARD QUERIES


import { prisma } from "@/lib/prisma";
import { addDays, startOfDay, endOfDay, subDays } from "date-fns";

/**
 * Get today's focus tasks with AI-powered prioritization
 * Returns tasks that need immediate attention based on:
 * - Overdue tasks
 * - High/Urgent priority
 * - Tasks in progress
 * - Tasks due today/tomorrow
 */
export async function getTodaysFocusTasks(userId: string, workspaceId: string) {
  const today = new Date();
  const tomorrow = addDays(today, 1);

  const tasks = await prisma.task.findMany({
    where: {
      workspaceId,
      deletedAt: null,
      status: {
        notIn: ["DONE", "ARCHIVED"],
      },
      OR: [
        // Overdue tasks
        {
          dueDate: {
            lt: startOfDay(today),
          },
        },
        // High priority tasks
        {
          priority: {
            in: ["HIGH", "URGENT"],
          },
        },
        // Tasks assigned to user and in progress
        {
          assigneeId: userId,
          status: "IN_PROGRESS",
        },
        // Tasks due today or tomorrow
        {
          dueDate: {
            gte: startOfDay(today),
            lte: endOfDay(tomorrow),
          },
        },
      ],
    },
    include: {
      assignee: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
      project: {
        select: {
          id: true,
          name: true,
          color: true,
        },
      },
      _count: {
        select: {
          comments: true,
        },
      },
    },
    orderBy: [
      // AI-powered scoring (handled in post-processing)
      { priority: "desc" },
      { dueDate: "asc" },
      { createdAt: "desc" },
    ],
    take: 20, // Get more than needed for AI filtering
  });

  // AI-powered prioritization score
  const scoredTasks = tasks.map((task) => {
    let score = 0;

    // Priority scoring
    const priorityScores = { URGENT: 100, HIGH: 75, MEDIUM: 50, LOW: 25 };
    score += priorityScores[task.priority];

    // Overdue penalty (very high)
    if (task.dueDate && task.dueDate < today) {
      const daysOverdue = Math.floor(
        (today.getTime() - task.dueDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      score += daysOverdue * 20;
    }

    // Due soon bonus
    if (task.dueDate) {
      const daysUntilDue = Math.floor(
        (task.dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysUntilDue === 0) score += 50; // Due today
      if (daysUntilDue === 1) score += 30; // Due tomorrow
    }

    // In progress bonus (user is actively working on it)
    if (task.status === "IN_PROGRESS") score += 40;

    // Assigned to current user bonus
    if (task.assigneeId === userId) score += 30;

    // Recent activity bonus (has comments)
    if (task._count.comments > 0) score += 10;

    return { ...task, aiScore: score };
  });

  // Sort by AI score and return top 5
  return scoredTasks.sort((a, b) => b.aiScore - a.aiScore).slice(0, 5);
}

/**
 * Get productivity stats for the day
 */
export async function getDailyStats(userId: string, workspaceId: string) {
  const today = startOfDay(new Date());
  const endToday = endOfDay(new Date());

  const [completedToday, totalActive, overdueCount, dueToday] =
    await Promise.all([
      // Tasks completed today
      prisma.task.count({
        where: {
          workspaceId,
          assigneeId: userId,
          completedAt: {
            gte: today,
            lte: endToday,
          },
          deletedAt: null,
        },
      }),

      // Total active tasks
      prisma.task.count({
        where: {
          workspaceId,
          assigneeId: userId,
          status: {
            notIn: ["DONE", "ARCHIVED"],
          },
          deletedAt: null,
        },
      }),

      // Overdue tasks
      prisma.task.count({
        where: {
          workspaceId,
          assigneeId: userId,
          status: {
            notIn: ["DONE", "ARCHIVED"],
          },
          dueDate: {
            lt: today,
          },
          deletedAt: null,
        },
      }),

      // Due today
      prisma.task.count({
        where: {
          workspaceId,
          assigneeId: userId,
          status: {
            notIn: ["DONE", "ARCHIVED"],
          },
          dueDate: {
            gte: today,
            lte: endToday,
          },
          deletedAt: null,
        },
      }),
    ]);

  return {
    completedToday,
    totalActive,
    overdueCount,
    dueToday,
    completionRate:
      totalActive > 0 ? Math.round((completedToday / totalActive) * 100) : 0,
  };
}

/**
 * Get weekly productivity trend
 */
export async function getWeeklyTrend(userId: string, workspaceId: string) {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const date = subDays(new Date(), i);
    const start = startOfDay(date);
    const end = endOfDay(date);

    const completed = await prisma.task.count({
      where: {
        workspaceId,
        assigneeId: userId,
        completedAt: {
          gte: start,
          lte: end,
        },
        deletedAt: null,
      },
    });

    days.push({
      date: date.toISOString(),
      completed,
    });
  }

  return days;
}

/**
 * Get AI-powered suggestions for the day
 */
export async function getAISuggestions(userId: string, workspaceId: string) {
  const suggestions: string[] = [];

  // Check for overdue tasks
  const overdueCount = await prisma.task.count({
    where: {
      workspaceId,
      assigneeId: userId,
      status: { notIn: ["DONE", "ARCHIVED"] },
      dueDate: { lt: new Date() },
      deletedAt: null,
    },
  });

  if (overdueCount > 0) {
    suggestions.push(
      `⚠️ You have ${overdueCount} overdue task${overdueCount > 1 ? "s" : ""}. Consider tackling these first.`
    );
  }

  // Check for tasks without due dates
  const noDueDateCount = await prisma.task.count({
    where: {
      workspaceId,
      assigneeId: userId,
      status: { notIn: ["DONE", "ARCHIVED"] },
      dueDate: null,
      deletedAt: null,
    },
  });

  if (noDueDateCount > 3) {
    suggestions.push(
      `📅 ${noDueDateCount} tasks don't have due dates. Adding deadlines helps with prioritization.`
    );
  }

  // Check for workload
  const totalTasks = await prisma.task.count({
    where: {
      workspaceId,
      assigneeId: userId,
      status: { notIn: ["DONE", "ARCHIVED"] },
      deletedAt: null,
    },
  });

  if (totalTasks > 30) {
    suggestions.push(
      `🔥 You have ${totalTasks} active tasks. Consider archiving or delegating some to reduce overwhelm.`
    );
  } else if (totalTasks === 0) {
    suggestions.push(
      `✨ Your task list is clear! Great work. Time to plan your next goals.`
    );
  }

  // Check for unassigned tasks in workspace
  const unassignedCount = await prisma.task.count({
    where: {
      workspaceId,
      assigneeId: null,
      status: { notIn: ["DONE", "ARCHIVED"] },
      deletedAt: null,
    },
  });

  if (unassignedCount > 0) {
    suggestions.push(
      `👥 There are ${unassignedCount} unassigned tasks in your workspace. Consider assigning them.`
    );
  }

  return suggestions;
}

/**
 * Get upcoming tasks (next 7 days)
 */
export async function getUpcomingTasks(userId: string, workspaceId: string) {
  const today = new Date();
  const nextWeek = addDays(today, 7);

  return await prisma.task.findMany({
    where: {
      workspaceId,
      assigneeId: userId,
      status: {
        notIn: ["DONE", "ARCHIVED"],
      },
      dueDate: {
        gte: startOfDay(today),
        lte: endOfDay(nextWeek),
      },
      deletedAt: null,
    },
    include: {
      project: {
        select: {
          id: true,
          name: true,
          color: true,
        },
      },
    },
    orderBy: {
      dueDate: "asc",
    },
    take: 10,
  });
}
