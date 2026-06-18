import { prisma } from "@/lib/prisma";
import { CK, invalidate } from "../redis";


// HELPER FUNCTIONS - Name to ID Resolution

async function findWorkspaceByName(name: string, userId: string) {
  return await prisma.workspace.findFirst({
    where: {
      name: { equals: name, mode: "insensitive" },
      members: { some: { userId } },
    },
  });
}

async function findTaskByTitle(title: string, userId: string, workspaceName?: string) {
  const where: any = {
    title: { contains: title, mode: "insensitive" },
    deletedAt: null,
    workspace: {
      members: { some: { userId } },
    },
  };

  if (workspaceName) {
    const workspace = await findWorkspaceByName(workspaceName, userId);
    if (workspace) {
      where.workspaceId = workspace.id;
    }
  }

  return await prisma.task.findFirst({ where });
}

async function findProjectByName(name: string, workspaceId: string) {
  return await prisma.project.findFirst({
    where: {
      name: { equals: name, mode: "insensitive" },
      workspaceId,
      deletedAt: null,
    },
  });
}

// TASK MANAGEMENT EXECUTORS
export async function executeCreateTask(args: any, userId: string) {
  const {
    title,
    workspaceName, 
    projectId,
    priority = "MEDIUM",
    status = "TODO",
    dueDate,
    description,
    tags = [],
  } = args;

  // Find workspace by name
  let workspaceId: string;
  
  if (workspaceName) {
    const workspace = await prisma.workspace.findFirst({
      where: {
        name: {
          equals: workspaceName,
          mode: "insensitive", // Case-insensitive search
        },
        members: {
          some: { userId },
        },
      },
    });

    if (!workspace) {
      // If workspace doesn't exist, suggest creating it
      return {
        success: false,
        error: `Workspace "${workspaceName}" not found`,
        message: `I couldn't find a workspace named "${workspaceName}". Would you like me to create it first?`,
      };
    }

    workspaceId = workspace.id;
  } else {
    // Get user's first workspace as default
    const defaultWorkspace = await prisma.workspace.findFirst({
      where: {
        members: {
          some: { userId },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    if (!defaultWorkspace) {
      return {
        success: false,
        error: "No workspace found",
        message: "You don't have any workspaces yet. Let's create one first!",
      };
    }

    workspaceId = defaultWorkspace.id;
  }

  // Get next position
  const lastTask = await prisma.task.findFirst({
    where: { workspaceId, status, deletedAt: null },
    orderBy: { position: "desc" },
    select: { position: true },
  });

  const position = lastTask ? lastTask.position + 1 : 0;

  const task = await prisma.task.create({
    data: {
      title,
      description,
      workspaceId,
      projectId,
      priority,
      status,
      dueDate: dueDate ? new Date(dueDate) : null,
      createdBy: userId,
      position,
      tags,
    },
    include: {
      workspace: { select: { name: true } },
      project: { select: { name: true } },
    },
  });

  // Invalidate cache
  await invalidate(CK.tasks(workspaceId));

  return {
    success: true,
    task,
    message: `✅ Task "${title}" created in ${task.workspace.name}${
      task.project ? ` → ${task.project.name}` : ""
    }`,
  };
}

export async function executeUpdateTask(args: any, userId: string) {
  const { taskId, taskTitle, workspaceName, ...updates } = args;

  // Find task by ID or title
  let task;
  
  if (taskId) {
    task = await prisma.task.findFirst({
      where: {
        id: taskId,
        deletedAt: null,
        workspace: {
          members: {
            some: { userId },
          },
        },
      },
    });
  } else if (taskTitle) {
    task = await findTaskByTitle(taskTitle, userId, workspaceName);
  }

  if (!task) {
    return {
      success: false,
      error: "Task not found",
      message: taskTitle 
        ? `I couldn't find a task with title "${taskTitle}". Could you be more specific?`
        : "I couldn't find that task. Could you tell me the task title?",
    };
  }

  // Prepare updates
  const updateData: any = { ...updates };
  if (updates.dueDate) {
    updateData.dueDate = new Date(updates.dueDate);
  }

  // Auto-set completedAt when marking as DONE
  if (updates.status === "DONE" && task.status !== "DONE") {
    updateData.completedAt = new Date();
  } else if (updates.status !== "DONE" && task.status === "DONE") {
    updateData.completedAt = null;
  }

  const updatedTask = await prisma.task.update({
    where: { id: task.id },
    data: updateData,
    include: {
      workspace: { select: { name: true } },
    },
  });

  await invalidate(CK.tasks(task.workspaceId));

  return {
    success: true,
    task: updatedTask,
    message: `✅ Task "${updatedTask.title}" updated successfully`,
  };
}

export async function executeDeleteTask(args: any, userId: string) {
  const { taskId, taskTitle, workspaceName } = args;

  // Find task by ID or title
  let task;
  
  if (taskId) {
    task = await prisma.task.findFirst({
      where: {
        id: taskId,
        deletedAt: null,
        workspace: {
          members: {
            some: { userId },
          },
        },
      },
    });
  } else if (taskTitle) {
    task = await findTaskByTitle(taskTitle, userId, workspaceName);
  }

  if (!task) {
    return {
      success: false,
      error: "Task not found",
      message: taskTitle 
        ? `I couldn't find a task titled "${taskTitle}"`
        : "I couldn't find that task. What's the task title?",
    };
  }

  await prisma.task.update({
    where: { id: task.id },
    data: { deletedAt: new Date() },
  });

  await invalidate(CK.tasks(task.workspaceId));

  return {
    success: true,
    message: `✅ Task "${task.title}" deleted successfully`,
  };
}

export async function executeListTasks(args: any, userId: string) {
  const {
    workspaceId,
    status,
    priority,
    dueDateBefore,
    search,
    limit = 10,
  } = args;

  const where: any = {
    deletedAt: null,
    workspace: {
      members: {
        some: { userId },
      },
    },
  };

  if (workspaceId) where.workspaceId = workspaceId;
  if (status) where.status = status;
  if (priority) where.priority = priority;
  if (dueDateBefore) where.dueDate = { lte: new Date(dueDateBefore) };
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  const tasks = await prisma.task.findMany({
    where,
    take: limit,
    orderBy: [{ priority: "desc" }, { dueDate: "asc" }],
    include: {
      workspace: { select: { name: true } },
      project: { select: { name: true } },
    },
  });

  return {
    success: true,
    tasks,
    count: tasks.length,
    message: `Found ${tasks.length} task(s)`,
  };
}

export async function executeSearchTasks(args: any, userId: string) {
  const { query, workspaceId } = args;

  const where: any = {
    deletedAt: null,
    workspace: {
      members: {
        some: { userId },
      },
    },
    OR: [
      { title: { contains: query, mode: "insensitive" } },
      { description: { contains: query, mode: "insensitive" } },
    ],
  };

  if (workspaceId) where.workspaceId = workspaceId;

  const tasks = await prisma.task.findMany({
    where,
    take: 20,
    include: {
      workspace: { select: { name: true } },
      project: { select: { name: true } },
    },
  });

  return {
    success: true,
    tasks,
    message: `Found ${tasks.length} task(s) matching "${query}"`,
  };
}

export async function executeBulkDeleteTasks(args: any, userId: string) {
  const { workspaceId, workspaceName, status, confirm } = args;

  if (!confirm) {
    return {
      success: false,
      error: "Confirmation required",
      message: "Are you sure you want to delete these tasks? Please confirm.",
    };
  }

  // Find workspace by ID or name
  let finalWorkspaceId: string | undefined = workspaceId;
  
  if (!finalWorkspaceId && workspaceName) {
    const workspace = await findWorkspaceByName(workspaceName, userId);
    if (!workspace) {
      return {
        success: false,
        error: "Workspace not found",
        message: `I couldn't find a workspace named "${workspaceName}"`,
      };
    }
    finalWorkspaceId = workspace.id;
  }

  if (!finalWorkspaceId) {
    return {
      success: false,
      error: "Workspace required",
      message: "Please specify which workspace to clean up",
    };
  }

  const result = await prisma.task.updateMany({
    where: {
      workspaceId: finalWorkspaceId,
      status,
      deletedAt: null,
      workspace: {
        members: {
          some: { userId },
        },
      },
    },
    data: { deletedAt: new Date() },
  });

  await invalidate(CK.tasks(finalWorkspaceId));

  return {
    success: true,
    count: result.count,
    message: `✅ Deleted ${result.count} ${status} task(s)`,
  };
}

// HABIT TRACKING EXECUTORS

export async function executeLogHabit(args: any, userId: string) {
  const { habitName, date = new Date().toISOString() } = args;

  // Find or create habit
  let habit = await prisma.habit.findFirst({
    where: {
      name: habitName,
      userId,
    },
  });

  if (!habit) {
    // Create habit with icon and color based on name
    const defaultIcon = habitName.toLowerCase().includes("gym") ? "💪" : 
                       habitName.toLowerCase().includes("read") ? "📚" :
                       habitName.toLowerCase().includes("meditat") ? "🧘" :
                       habitName.toLowerCase().includes("run") ? "🏃" : "✅";
    
    const defaultColor = habitName.toLowerCase().includes("gym") ? "#ef4444" : 
                        habitName.toLowerCase().includes("read") ? "#3b82f6" :
                        habitName.toLowerCase().includes("meditat") ? "#8b5cf6" :
                        habitName.toLowerCase().includes("run") ? "#f59e0b" : "#10b981";

    habit = await prisma.habit.create({
      data: {
        name: habitName,
        userId,
        icon: defaultIcon,
        color: defaultColor,
      },
    });
  }

  const logDate = new Date(date);
  logDate.setHours(0, 0, 0, 0);

  // Check if already logged today
  const existing = await prisma.habitLog.findFirst({
    where: {
      habitId: habit.id,
      date: logDate,
    },
  });

  if (existing) {
    return {
      success: true,
      message: `ℹ️ You already logged "${habitName}" for this date`,
    };
  }

  const log = await prisma.habitLog.create({
    data: {
      habitId: habit.id,
      date: logDate,
      completed: true,
    },
  });

  return {
    success: true,
    log,
    message: `✅ Logged "${habitName}" for ${logDate.toLocaleDateString()}`,
  };
}

export async function executeGetHabitStreak(args: any, userId: string) {
  const { habitName } = args;

  const habit = await prisma.habit.findFirst({
    where: {
      name: habitName,
      userId,
    },
    include: {
      logs: {
        where: { completed: true },
        orderBy: { date: "desc" },
        take: 365, // Last year
      },
    },
  });

  if (!habit) {
    throw new Error(`Habit "${habitName}" not found`);
  }

  // Calculate streak
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const sortedLogs = habit.logs.sort(
    (a, b) => b.date.getTime() - a.date.getTime()
  );

  for (let i = 0; i < sortedLogs.length; i++) {
    const logDate = new Date(sortedLogs[i].date);
    logDate.setHours(0, 0, 0, 0);

    const expectedDate = new Date(today);
    expectedDate.setDate(expectedDate.getDate() - i);
    expectedDate.setHours(0, 0, 0, 0);

    if (logDate.getTime() === expectedDate.getTime()) {
      streak++;
    } else {
      break;
    }
  }

  return {
    success: true,
    habit: habitName,
    currentStreak: streak,
    totalLogs: habit.logs.length,
    message: `🔥 Current streak: ${streak} day(s)`,
  };
}

export async function executeListHabits(args: any, userId: string) {
  const { period = "month" } = args;

  const periodMap = {
    week: 7,
    month: 30,
    year: 365,
  };

  const daysAgo = periodMap[period as keyof typeof periodMap];
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - daysAgo);

  const habits = await prisma.habit.findMany({
    where: { userId },
    include: {
      logs: {
        where: {
          date: { gte: startDate },
          completed: true,
        },
      },
      _count: {
        select: {
          logs: {
            where: { completed: true },
          },
        },
      },
    },
  });

  const habitStats = habits.map((habit) => ({
    name: habit.name,
    icon: habit.icon,
    color: habit.color,
    logsInPeriod: habit.logs.length,
    totalLogs: habit._count.logs,
    consistency: Math.round((habit.logs.length / daysAgo) * 100),
  }));

  return {
    success: true,
    habits: habitStats,
    period,
    message: `Found ${habits.length} habit(s)`,
  };
}

export async function executeGetHabitInsights(args: any, userId: string) {
  const { habitName, period = "month" } = args;

  const periodMap = {
    week: 7,
    month: 30,
    year: 365,
  };

  const daysAgo = periodMap[period as keyof typeof periodMap];
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - daysAgo);

  const where: any = { userId };
  if (habitName) where.name = habitName;

  const habits = await prisma.habit.findMany({
    where,
    include: {
      logs: {
        where: {
          date: { gte: startDate },
          completed: true,
        },
        orderBy: { date: "asc" },
      },
    },
  });

  const insights = habits.map((habit) => {
    const logs = habit.logs;
    const consistency = Math.round((logs.length / daysAgo) * 100);

    // Calculate longest streak in period
    let longestStreak = 0;
    let currentStreak = 0;

    logs.forEach((log, index) => {
      if (index === 0) {
        currentStreak = 1;
      } else {
        const prevDate = new Date(logs[index - 1].date);
        const currDate = new Date(log.date);
        const diffDays = Math.round(
          (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (diffDays === 1) {
          currentStreak++;
        } else {
          longestStreak = Math.max(longestStreak, currentStreak);
          currentStreak = 1;
        }
      }
    });
    longestStreak = Math.max(longestStreak, currentStreak);

    return {
      habit: habit.name,
      consistency: `${consistency}%`,
      completions: logs.length,
      longestStreak,
      trend:
        consistency >= 80
          ? "🔥 Excellent"
          : consistency >= 60
          ? "👍 Good"
          : "⚠️ Needs improvement",
    };
  });

  return {
    success: true,
    insights,
    period,
    message: `Analyzed ${habits.length} habit(s) over the last ${period}`,
  };
}

// WORKSPACE & PROJECT EXECUTORS

export async function executeListWorkspaces(args: any, userId: string) {
  const workspaces = await prisma.workspace.findMany({
    where: {
      members: {
        some: { userId },
      },
      deletedAt: null,
    },
    include: {
      _count: {
        select: {
          tasks: { where: { deletedAt: null } },
          projects: { where: { deletedAt: null } },
        },
      },
    },
  });

  return {
    success: true,
    workspaces: workspaces.map((ws) => ({
      id: ws.id,
      name: ws.name,
      taskCount: ws._count.tasks,
      projectCount: ws._count.projects,
    })),
    message: `You have ${workspaces.length} workspace(s)`,
  };
}

export async function executeCreateWorkspace(args: any, userId: string) {
  const { name, description } = args;

  const workspace = await prisma.workspace.create({
    data: {
      name,
      description,
      slug: name.toLowerCase().replace(/\s+/g, "-"),
      members: {
        create: {
          userId,
          role: "ADMIN",
        },
      },
    },
  });

  return {
    success: true,
    workspace,
    message: `✅ Workspace "${name}" created`,
  };
}

export async function executeCreateProject(args: any, userId: string) {
  const { name, workspaceId, workspaceName, description, color = "#3B82F6" } = args;

  // Find workspace by ID or name
  let finalWorkspaceId: string | undefined = workspaceId;
  let workspaceNameResolved: string = "";
  
  if (!finalWorkspaceId && workspaceName) {
    const workspace = await findWorkspaceByName(workspaceName, userId);
    if (!workspace) {
      return {
        success: false,
        error: "Workspace not found",
        message: `I couldn't find a workspace named "${workspaceName}". Would you like me to create it?`,
      };
    }
    finalWorkspaceId = workspace.id;
    workspaceNameResolved = workspace.name;
  } else if (finalWorkspaceId) {
    const workspace = await prisma.workspace.findFirst({
      where: {
        id: finalWorkspaceId,
        members: {
          some: { userId },
        },
      },
    });

    if (!workspace) {
      return {
        success: false,
        error: "Workspace not found",
        message: "I couldn't access that workspace",
      };
    }
    workspaceNameResolved = workspace.name;
  }

  if (!finalWorkspaceId) {
    return {
      success: false,
      error: "Workspace required",
      message: "Please specify which workspace to create the project in",
    };
  }

  const project = await prisma.project.create({
    data: {
      name,
      description,
      color,
      workspaceId: finalWorkspaceId,
    },
  });

  return {
    success: true,
    project,
    message: `✅ Project "${name}" created in ${workspaceNameResolved}`,
  };
}

// SMART FEATURES

export async function executeSuggestTasks(args: any, userId: string) {
  const { projectType, workspaceId } = args;

  // AI-generated task suggestions based on project type
  const suggestions: Record<string, string[]> = {
    "React App": [
      "Set up project structure with create-react-app",
      "Install and configure Tailwind CSS",
      "Create reusable component library",
      "Set up React Router for navigation",
      "Implement state management (Redux/Context)",
      "Add API integration layer",
      "Write unit tests with Jest",
      "Set up CI/CD pipeline",
      "Optimize bundle size",
      "Deploy to production",
    ],
    "Marketing Campaign": [
      "Define target audience and personas",
      "Research competitor strategies",
      "Create content calendar",
      "Design social media graphics",
      "Write email copy",
      "Set up analytics tracking",
      "Launch ad campaigns",
      "A/B test landing pages",
      "Monitor campaign metrics",
      "Generate performance report",
    ],
    "House Renovation": [
      "Get quotes from contractors",
      "Create detailed budget spreadsheet",
      "Order materials",
      "Schedule inspections",
      "Coordinate with electrician/plumber",
      "Track expenses",
      "Document progress with photos",
      "Handle permits and paperwork",
      "Plan furniture layout",
      "Final walkthrough and cleanup",
    ],
  };

  const tasks =
    suggestions[projectType] ||
    suggestions["React App"]; // Default fallback

  return {
    success: true,
    suggestions: tasks,
    projectType,
    message: `Here are ${tasks.length} suggested tasks for your ${projectType} project`,
  };
}

export async function executeGetProductivityInsights(args: any, userId: string) {
  const { period = "week" } = args;

  const periodMap = {
    week: 7,
    month: 30,
    year: 365,
  };

  const daysAgo = periodMap[period as keyof typeof periodMap];
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - daysAgo);

  const [completed, created, habits] = await Promise.all([
    prisma.task.count({
      where: {
        createdBy: userId,
        status: "DONE",
        completedAt: { gte: startDate },
        deletedAt: null,
      },
    }),
    prisma.task.count({
      where: {
        createdBy: userId,
        createdAt: { gte: startDate },
        deletedAt: null,
      },
    }),
    prisma.habitLog.count({
      where: {
        habit: { userId },
        completed: true,
        date: { gte: startDate },
      },
    }),
  ]);

  const completionRate =
    created > 0 ? Math.round((completed / created) * 100) : 0;

  return {
    success: true,
    insights: {
      period,
      tasksCompleted: completed,
      tasksCreated: created,
      completionRate: `${completionRate}%`,
      habitsLogged: habits,
      performance:
        completionRate >= 80
          ? "🔥 Outstanding"
          : completionRate >= 60
          ? "👍 Good"
          : "⚠️ Room for improvement",
    },
    message: `Your productivity over the last ${period}`,
  };
}

export async function executeParseNaturalLanguageDeadline(args: any) {
  const { naturalDate } = args;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const patterns: Record<string, () => Date> = {
    today: () => today,
    tomorrow: () => {
      const date = new Date(today);
      date.setDate(date.getDate() + 1);
      return date;
    },
    yesterday: () => {
      const date = new Date(today);
      date.setDate(date.getDate() - 1);
      return date;
    },
    "next monday": () => {
      const date = new Date(today);
      const day = date.getDay();
      const diff = day === 1 ? 7 : ((1 - day + 7) % 7) || 7;
      date.setDate(date.getDate() + diff);
      return date;
    },
    "next week": () => {
      const date = new Date(today);
      date.setDate(date.getDate() + 7);
      return date;
    },
    "next month": () => {
      const date = new Date(today);
      date.setMonth(date.getMonth() + 1);
      return date;
    },
  };

  const lowerDate = naturalDate.toLowerCase();
  const parser = patterns[lowerDate];

  if (parser) {
    const date = parser();
    return {
      success: true,
      isoDate: date.toISOString(),
      message: `Parsed "${naturalDate}" as ${date.toLocaleDateString()}`,
    };
  }

  // Try to parse as regular date
  const parsed = new Date(naturalDate);
  if (!isNaN(parsed.getTime())) {
    return {
      success: true,
      isoDate: parsed.toISOString(),
      message: `Parsed as ${parsed.toLocaleDateString()}`,
    };
  }

  throw new Error(`Could not parse date: "${naturalDate}"`);
}