
// ACTIVITY TIMELINE QUERIES


import { prisma } from "@/lib/prisma";
import { subDays, format } from "date-fns";

/**
 * Get recent activity feed for workspace
 */
export async function getActivityFeed(workspaceId: string, limit: number = 20) {
  const [auditLogs, recentComments, recentTasks] = await Promise.all([
    // Audit logs
    prisma.auditLog.findMany({
      where: {
        entityType: "task",
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
    }),

    // Recent comments
    prisma.comment.findMany({
      where: {
        task: {
          workspaceId,
        },
        deletedAt: null,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        task: {
          select: {
            id: true,
            title: true,
            workspaceId: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit / 2,
    }),

    // Recently created/updated tasks
    prisma.task.findMany({
      where: {
        workspaceId,
        deletedAt: null,
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
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
      },
      orderBy: {
        updatedAt: "desc",
      },
      take: limit / 2,
    }),
  ]);

  // Combine and format activities
  const activities: any[] = [];

  // Add task activities
  recentTasks.forEach((task) => {
    activities.push({
      id: `task-${task.id}`,
      type: "task_updated",
      timestamp: task.updatedAt,
      user: task.creator,
      task: {
        id: task.id,
        title: task.title,
        status: task.status,
        priority: task.priority,
        project: task.project,
      },
      message: `updated task`,
    });

    // Add completion activity if completed recently
    if (
      task.completedAt &&
      task.completedAt > subDays(new Date(), 7) &&
      task.assignee
    ) {
      activities.push({
        id: `task-completed-${task.id}`,
        type: "task_completed",
        timestamp: task.completedAt,
        user: task.assignee,
        task: {
          id: task.id,
          title: task.title,
          project: task.project,
        },
        message: `completed task`,
      });
    }
  });

  // Add comment activities
  recentComments.forEach((comment) => {
    activities.push({
      id: `comment-${comment.id}`,
      type: "comment_added",
      timestamp: comment.createdAt,
      user: comment.author,
      task: {
        id: comment.task.id,
        title: comment.task.title,
      },
      message: `commented on`,
      preview: comment.content.substring(0, 100),
    });
  });

  // Sort by timestamp (most recent first) and limit
  return activities
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, limit)
    .map((activity) => ({
      ...activity,
      timestamp: activity.timestamp.toISOString(),
      timeAgo: getTimeAgo(activity.timestamp),
    }));
}

/**
 * Get user's personal activity
 */
export async function getUserActivity(userId: string, limit: number = 20) {
  const [createdTasks, completedTasks, comments] = await Promise.all([
    // Tasks created by user
    prisma.task.findMany({
      where: {
        createdBy: userId,
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
        workspace: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit / 3,
    }),

    // Tasks completed by user
    prisma.task.findMany({
      where: {
        assigneeId: userId,
        completedAt: {
          not: null,
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
        workspace: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        completedAt: "desc",
      },
      take: limit / 3,
    }),

    // Comments by user
    prisma.comment.findMany({
      where: {
        authorId: userId,
        deletedAt: null,
      },
      include: {
        task: {
          select: {
            id: true,
            title: true,
            workspaceId: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit / 3,
    }),
  ]);

  const activities: any[] = [];

  // Add created tasks
  createdTasks.forEach((task) => {
    activities.push({
      id: `created-${task.id}`,
      type: "task_created",
      timestamp: task.createdAt,
      task: {
        id: task.id,
        title: task.title,
        status: task.status,
        priority: task.priority,
        project: task.project,
        workspace: task.workspace,
      },
      message: "You created",
    });
  });

  // Add completed tasks
  completedTasks.forEach((task) => {
    if (task.completedAt) {
      activities.push({
        id: `completed-${task.id}`,
        type: "task_completed",
        timestamp: task.completedAt,
        task: {
          id: task.id,
          title: task.title,
          project: task.project,
          workspace: task.workspace,
        },
        message: "You completed",
      });
    }
  });

  // Add comments
  comments.forEach((comment) => {
    activities.push({
      id: `comment-${comment.id}`,
      type: "comment_added",
      timestamp: comment.createdAt,
      task: {
        id: comment.task.id,
        title: comment.task.title,
      },
      message: "You commented on",
      preview: comment.content.substring(0, 100),
    });
  });

  // Sort and format
  return activities
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, limit)
    .map((activity) => ({
      ...activity,
      timestamp: activity.timestamp.toISOString(),
      timeAgo: getTimeAgo(activity.timestamp),
    }));
}

/**
 * Get activity for a specific task
 */
export async function getTaskActivity(taskId: string) {
  const [task, comments, auditLogs] = await Promise.all([
    prisma.task.findUnique({
      where: { id: taskId },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        assignee: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    }),

    prisma.comment.findMany({
      where: {
        taskId,
        deletedAt: null,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    }),

    prisma.auditLog.findMany({
      where: {
        entityType: "task",
        entityId: taskId,
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
  ]);

  if (!task) return [];

  const activities: any[] = [];

  // Task created
  activities.push({
    id: `created-${task.id}`,
    type: "task_created",
    timestamp: task.createdAt,
    user: task.creator,
    message: "created this task",
  });

  // Status changes from audit logs
  auditLogs
    .filter((log) => log.action === "UPDATED")
    .forEach((log) => {
      const changes = log.changes as any;
      if (changes?.status) {
        activities.push({
          id: `status-${log.id}`,
          type: "status_changed",
          timestamp: log.createdAt,
          message: `changed status from ${changes.status.from} to ${changes.status.to}`,
        });
      }
    });

  // Comments
  comments.forEach((comment) => {
    activities.push({
      id: `comment-${comment.id}`,
      type: "comment_added",
      timestamp: comment.createdAt,
      user: comment.author,
      message: "commented",
      content: comment.content,
    });
  });

  // Task completed
  if (task.completedAt && task.assignee) {
    activities.push({
      id: `completed-${task.id}`,
      type: "task_completed",
      timestamp: task.completedAt,
      user: task.assignee,
      message: "completed this task",
    });
  }

  // Sort by timestamp
  return activities
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .map((activity) => ({
      ...activity,
      timestamp: activity.timestamp.toISOString(),
      timeAgo: getTimeAgo(activity.timestamp),
    }));
}

/**
 * Get workspace activity summary (for dashboard widget)
 */
export async function getActivitySummary(workspaceId: string) {
  const last24Hours = subDays(new Date(), 1);
  const last7Days = subDays(new Date(), 7);

  const [today, thisWeek] = await Promise.all([
    // Activity in last 24 hours
    Promise.all([
      prisma.task.count({
        where: {
          workspaceId,
          createdAt: { gte: last24Hours },
          deletedAt: null,
        },
      }),
      prisma.task.count({
        where: {
          workspaceId,
          completedAt: { gte: last24Hours },
          deletedAt: null,
        },
      }),
      prisma.comment.count({
        where: {
          task: { workspaceId },
          createdAt: { gte: last24Hours },
          deletedAt: null,
        },
      }),
    ]),

    // Activity in last 7 days
    Promise.all([
      prisma.task.count({
        where: {
          workspaceId,
          createdAt: { gte: last7Days },
          deletedAt: null,
        },
      }),
      prisma.task.count({
        where: {
          workspaceId,
          completedAt: { gte: last7Days },
          deletedAt: null,
        },
      }),
      prisma.comment.count({
        where: {
          task: { workspaceId },
          createdAt: { gte: last7Days },
          deletedAt: null,
        },
      }),
    ]),
  ]);

  return {
    last24Hours: {
      tasksCreated: today[0],
      tasksCompleted: today[1],
      comments: today[2],
      total: today[0] + today[1] + today[2],
    },
    last7Days: {
      tasksCreated: thisWeek[0],
      tasksCompleted: thisWeek[1],
      comments: thisWeek[2],
      total: thisWeek[0] + thisWeek[1] + thisWeek[2],
    },
  };
}

/**
 * Helper function to get "time ago" string
 */
function getTimeAgo(date: Date): string {
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;

  return format(date, "MMM d");
}
