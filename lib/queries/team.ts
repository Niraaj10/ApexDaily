
// TEAM WORKLOAD BALANCER QUERIES


import { prisma } from "@/lib/prisma";
import { addDays, startOfDay, endOfDay } from "date-fns";

/**
 * Get team workload distribution
 */
export async function getTeamWorkload(workspaceId: string) {
  const members = await prisma.member.findMany({
    where: { workspaceId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
  });

  const workloadData = await Promise.all(
    members.map(async (member) => {
      const [activeTasks, highPriorityTasks, overdueTasks, dueThisWeek] =
        await Promise.all([
          // Total active tasks
          prisma.task.count({
            where: {
              workspaceId,
              assigneeId: member.userId,
              status: {
                notIn: ["DONE", "ARCHIVED"],
              },
              deletedAt: null,
            },
          }),

          // High priority tasks
          prisma.task.count({
            where: {
              workspaceId,
              assigneeId: member.userId,
              status: {
                notIn: ["DONE", "ARCHIVED"],
              },
              priority: {
                in: ["HIGH", "URGENT"],
              },
              deletedAt: null,
            },
          }),

          // Overdue tasks
          prisma.task.count({
            where: {
              workspaceId,
              assigneeId: member.userId,
              status: {
                notIn: ["DONE", "ARCHIVED"],
              },
              dueDate: {
                lt: new Date(),
              },
              deletedAt: null,
            },
          }),

          // Due this week
          prisma.task.count({
            where: {
              workspaceId,
              assigneeId: member.userId,
              status: {
                notIn: ["DONE", "ARCHIVED"],
              },
              dueDate: {
                gte: startOfDay(new Date()),
                lte: endOfDay(addDays(new Date(), 7)),
              },
              deletedAt: null,
            },
          }),
        ]);

      // Calculate workload score (for AI balancing)
      const workloadScore =
        activeTasks * 1 + highPriorityTasks * 2 + overdueTasks * 3;

      return {
        member: member.user,
        role: member.role,
        activeTasks,
        highPriorityTasks,
        overdueTasks,
        dueThisWeek,
        workloadScore,
      };
    })
  );

  // Sort by workload score (highest first)
  return workloadData.sort((a, b) => b.workloadScore - a.workloadScore);
}

/**
 * Get unassigned tasks in workspace
 */
export async function getUnassignedTasks(workspaceId: string) {
  return await prisma.task.findMany({
    where: {
      workspaceId,
      assigneeId: null,
      status: {
        notIn: ["DONE", "ARCHIVED"],
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
    orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
  });
}

/**
 * Get AI-powered assignment suggestions
 * Suggests which team member should take which unassigned task
 */
export async function getAssignmentSuggestions(workspaceId: string) {
  const [unassignedTasks, teamWorkload] = await Promise.all([
    getUnassignedTasks(workspaceId),
    getTeamWorkload(workspaceId),
  ]);

  if (unassignedTasks.length === 0 || teamWorkload.length === 0) {
    return [];
  }

  // Find the least busy person
  const leastBusyMember = teamWorkload.reduce((min, current) =>
    current.workloadScore < min.workloadScore ? current : min
  );

  // Create suggestions
  const suggestions = unassignedTasks.slice(0, 5).map((task) => ({
    task: {
      id: task.id,
      title: task.title,
      priority: task.priority,
      dueDate: task.dueDate,
    },
    suggestedAssignee: leastBusyMember.member,
    reason: `${leastBusyMember.member.name} has the lowest workload (${leastBusyMember.activeTasks} active tasks)`,
  }));

  return suggestions;
}

/**
 * Get team capacity overview
 */
export async function getTeamCapacity(workspaceId: string) {
  const teamWorkload = await getTeamWorkload(workspaceId);

  const totalMembers = teamWorkload.length;
  const totalActiveTasks = teamWorkload.reduce(
    (sum, member) => sum + member.activeTasks,
    0
  );
  const totalOverdueTasks = teamWorkload.reduce(
    (sum, member) => sum + member.overdueTasks,
    0
  );

  // Calculate average tasks per person
  const avgTasksPerPerson =
    totalMembers > 0 ? Math.round(totalActiveTasks / totalMembers) : 0;

  // Find overburdened members (>150% of average)
  const overburdenedMembers = teamWorkload.filter(
    (member) => member.activeTasks > avgTasksPerPerson * 1.5
  );

  // Find underutilized members (<50% of average)
  const underutilizedMembers = teamWorkload.filter(
    (member) => member.activeTasks < avgTasksPerPerson * 0.5
  );

  return {
    totalMembers,
    totalActiveTasks,
    totalOverdueTasks,
    avgTasksPerPerson,
    overburdenedMembers: overburdenedMembers.length,
    underutilizedMembers: underutilizedMembers.length,
    balanceScore: calculateBalanceScore(teamWorkload),
  };
}

/**
 * Calculate team balance score (0-100, higher is better)
 */
function calculateBalanceScore(workload: any[]): number {
  if (workload.length === 0) return 100;

  const taskCounts = workload.map((m) => m.activeTasks);
  const avg = taskCounts.reduce((a, b) => a + b, 0) / taskCounts.length;

  // Calculate standard deviation
  const variance =
    taskCounts.reduce((sum, count) => sum + Math.pow(count - avg, 2), 0) /
    taskCounts.length;
  const stdDev = Math.sqrt(variance);

  // Lower standard deviation = better balance
  // Score inversely proportional to std dev
  const score = Math.max(0, 100 - stdDev * 10);

  return Math.round(score);
}

/**
 * Get tasks that could be redistributed
 */
export async function getRedistributableTasks(workspaceId: string) {
  const teamWorkload = await getTeamWorkload(workspaceId);

  if (teamWorkload.length < 2) return [];

  // Find the most overburdened member
  const mostBusy = teamWorkload[0]; // Already sorted by workload

  // Find the least busy member
  const leastBusy = teamWorkload[teamWorkload.length - 1];

  // If difference is less than 5 tasks, no need to redistribute
  if (mostBusy.activeTasks - leastBusy.activeTasks < 5) {
    return [];
  }

  // Get low-priority tasks from the most busy person
  const tasksToRedistribute = await prisma.task.findMany({
    where: {
      workspaceId,
      assigneeId: mostBusy.member.id,
      status: {
        notIn: ["DONE", "ARCHIVED", "IN_PROGRESS"], // Don't redistribute in-progress tasks
      },
      priority: {
        in: ["LOW", "MEDIUM"], // Only suggest redistributing lower priority
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
      priority: "asc",
    },
    take: 3,
  });

  return tasksToRedistribute.map((task) => ({
    task: {
      id: task.id,
      title: task.title,
      priority: task.priority,
      project: task.project,
    },
    currentAssignee: mostBusy.member,
    suggestedAssignee: leastBusy.member,
    reason: `Balance workload: ${mostBusy.member.name} has ${mostBusy.activeTasks} tasks, ${leastBusy.member.name} has ${leastBusy.activeTasks} tasks`,
  }));
}

/**
 * Get member's task breakdown by status
 */
export async function getMemberTaskBreakdown(
  userId: string,
  workspaceId: string
) {
  const statuses = ["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"];

  const breakdown = await Promise.all(
    statuses.map(async (status) => {
      const count = await prisma.task.count({
        where: {
          workspaceId,
          assigneeId: userId,
          status: status as any,
          deletedAt: null,
        },
      });

      return { status, count };
    })
  );

  return breakdown;
}

/**
 * Get team performance metrics
 */
export async function getTeamPerformance(workspaceId: string) {
  const [completedThisWeek, createdThisWeek, avgCompletionTime] =
    await Promise.all([
      // Tasks completed this week
      prisma.task.count({
        where: {
          workspaceId,
          completedAt: {
            gte: subDays(new Date(), 7),
          },
          deletedAt: null,
        },
      }),

      // Tasks created this week
      prisma.task.count({
        where: {
          workspaceId,
          createdAt: {
            gte: subDays(new Date(), 7),
          },
          deletedAt: null,
        },
      }),

      // Average completion time (tasks completed in last 30 days)
      prisma.task.findMany({
        where: {
          workspaceId,
          completedAt: {
            gte: subDays(new Date(), 30),
          },
          deletedAt: null,
        },
        select: {
          createdAt: true,
          completedAt: true,
        },
      }),
    ]);

  // Calculate average days to complete
  const completionTimes = avgCompletionTime.map((task) =>
    task.completedAt
      ? Math.floor(
          (task.completedAt.getTime() - task.createdAt.getTime()) /
            (1000 * 60 * 60 * 24)
        )
      : 0
  );

  const avgDaysToComplete =
    completionTimes.length > 0
      ? Math.round(
          completionTimes.reduce((a, b) => a + b, 0) / completionTimes.length
        )
      : 0;

  return {
    completedThisWeek,
    createdThisWeek,
    avgDaysToComplete,
    velocity: completedThisWeek, // Tasks/week
  };
}

function subDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() - days);
  return result;
}
