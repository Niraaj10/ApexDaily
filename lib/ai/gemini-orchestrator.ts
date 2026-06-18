import {
  GoogleGenerativeAI,
  SchemaType,
  type FunctionDeclaration,
  type ModelParams,
} from "@google/generative-ai";

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);


// SYSTEM PROMPT - The Agent's Personality & Rules
export const SYSTEM_PROMPT = `You are the AdvTD Assistant, an intelligent orchestrator for a task management and habit tracking system.

## Your Core Identity
- You are helpful, concise, and proactive
- You have direct access to a PostgreSQL database via Prisma
- You always confirm when a database action is successful
- You understand context and can infer user intent
- You NEVER ask users for IDs - users only know names of workspaces, tasks, and projects

## Your Capabilities
1. **Task Management**: Create, update, delete, search, and organize tasks
2. **Habit Tracking**: Log habits, track consistency, analyze streaks
3. **Workspace Organization**: Manage workspaces, projects, and task hierarchies
4. **Smart Scheduling**: Set deadlines, priorities, and reminders
5. **Data Analysis**: Provide insights on productivity and habit consistency

## Your Rules
1. Always confirm successful actions (e.g., "✅ Task created in Work workspace")
2. Ask for clarification if the request is ambiguous
3. Suggest related actions when appropriate (e.g., "Would you like me to set a reminder?")
4. Never delete data without explicit user confirmation
5. If asked about non-task/habit topics, politely redirect: "I specialize in task and habit management. How can I help you organize your day?"
6. Use natural, conversational language
7. Provide context-aware suggestions based on user's history
8. IMPORTANT: Never ask users for workspace IDs, task IDs, or project IDs - always use names

## Response Format
- Keep responses concise (2-3 sentences max)
- Use emojis sparingly (✅ ❌ 📋 🎯 only)
- Format lists clearly when showing multiple items
- Always end with a follow-up question or suggestion when appropriate

## Current Date Context
Today is ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`;


// TOOL DEFINITIONS - The Agent's Toolbox

export const tools: FunctionDeclaration[] = [
  // TASK MANAGEMENT
  {
    name: "createTask",
    description: "Creates a new task in the database. Use this when the user wants to add a task, reminder, or todo item. If workspace is not specified, use the user's default workspace.",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        title: {
          type: SchemaType.STRING,
          description: "The task title or description (e.g., 'Fix sidebar CSS', 'Buy groceries')",
        },
        workspaceName: { 
          type: SchemaType.STRING, 
          description: "The name of the workspace (e.g., 'Work', 'Personal', 'Home'). If not provided, will use user's default workspace. NEVER ask for workspace ID." 
        },
        projectName: {
          type: SchemaType.STRING,
          description: "Optional project name to organize the task under (e.g., 'Website Redesign'). NEVER use project ID.",
        },
        priority: {
          type: SchemaType.STRING,
          format: "enum",
          enum: ["LOW", "MEDIUM", "HIGH", "URGENT"],
          description: "Task priority level. Infer from urgency keywords (e.g., 'urgent' → URGENT, 'important' → HIGH). Default: MEDIUM",
        },
        status: {
          type: SchemaType.STRING,
          format: "enum",
          enum: ["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"],
          description: "Initial status of the task. Default to TODO unless specified.",
        },
        dueDate: {
          type: SchemaType.STRING,
          description: "Due date in ISO format. Parse natural language (e.g., 'tomorrow', 'next Monday', 'by Friday')",
        },
        description: {
          type: SchemaType.STRING,
          description: "Detailed task description or notes",
        },
        tags: {
          type: SchemaType.ARRAY,
          items: { type: SchemaType.STRING },
          description: "Tags for categorization (e.g., ['urgent', 'frontend'])",
        },
      },
      required: ["title"],
    },
  },

  {
    name: "updateTask",
    description: "Updates an existing task. Use the task title to identify which task to update. NEVER ask for task ID.",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        taskTitle: {
          type: SchemaType.STRING,
          description: "The title of the task to update. Be specific if multiple tasks have similar names.",
        },
        workspaceName: {
          type: SchemaType.STRING,
          description: "Optional: workspace name to narrow down the search if multiple tasks have similar titles",
        },
        newTitle: { 
          type: SchemaType.STRING, 
          description: "New task title (only if renaming the task)" 
        },
        status: {
          type: SchemaType.STRING,
          format: "enum",
          enum: ["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"],
          description: "New status",
        },
        priority: {
          type: SchemaType.STRING,
          format: "enum",
          enum: ["LOW", "MEDIUM", "HIGH", "URGENT"],
          description: "New priority",
        },
        dueDate: {
          type: SchemaType.STRING,
          description: "New due date in ISO format",
        },
        description: { 
          type: SchemaType.STRING, 
          description: "New description" 
        },
      },
      required: ["taskTitle"],
    },
  },

  {
    name: "deleteTask",
    description: "Soft deletes a task. Use only when user explicitly requests deletion. Identify task by its title, NEVER ask for ID.",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        taskTitle: {
          type: SchemaType.STRING,
          description: "The title of the task to delete",
        },
        workspaceName: {
          type: SchemaType.STRING,
          description: "Optional: workspace name to ensure we delete the correct task",
        },
      },
      required: ["taskTitle"],
    },
  },

  {
    name: "listTasks",
    description: "Retrieves tasks with optional filtering. Use for queries like 'show my tasks', 'what's on my todo list', 'high priority items'.",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        workspaceName: {
          type: SchemaType.STRING,
          description: "Filter by workspace name (e.g., 'Work', 'Personal')",
        },
        status: {
          type: SchemaType.STRING,
          format: "enum",
          enum: ["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE", "ARCHIVED"],
          description: "Filter by status",
        },
        priority: {
          type: SchemaType.STRING,
          format: "enum",
          enum: ["LOW", "MEDIUM", "HIGH", "URGENT"],
          description: "Filter by priority",
        },
        dueDateBefore: {
          type: SchemaType.STRING,
          description: "Show tasks due before this date",
        },
        search: {
          type: SchemaType.STRING,
          description: "Search in title and description",
        },
        limit: {
          type: SchemaType.NUMBER,
          description: "Maximum number of tasks to return (default: 10)",
        },
      },
      required: [],
    },
  },

  {
    name: "searchTasks",
    description: "Searches tasks by keyword. Use for queries like 'find tasks about CSS' or 'search for frontend tasks'.",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        query: {
          type: SchemaType.STRING,
          description: "Search query",
        },
        workspaceName: {
          type: SchemaType.STRING,
          description: "Optional workspace name filter",
        },
      },
      required: ["query"],
    },
  },

  {
    name: "bulkDeleteTasks",
    description: "Deletes multiple tasks at once. Use for cleanup operations like 'delete all completed tasks'. ALWAYS ask for confirmation first.",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        workspaceName: {
          type: SchemaType.STRING,
          description: "Name of workspace to clean up (e.g., 'Work', 'Personal')",
        },
        status: {
          type: SchemaType.STRING,
          format: "enum",
          enum: ["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE", "ARCHIVED"],
          description: "Delete tasks with this status",
        },
        confirm: {
          type: SchemaType.BOOLEAN,
          description: "User must explicitly confirm before deletion. Set to true only after user confirms.",
        },
      },
      required: ["workspaceName", "status", "confirm"],
    },
  },

  // HABIT TRACKING
  {
    name: "logHabit",
    description: "Logs a habit completion for today or a specific date. Use when user says 'I did X' or 'Mark X as done'.",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        habitName: {
          type: SchemaType.STRING,
          description: "Name of the habit (e.g., 'Gym', 'Meditation', 'Reading')",
        },
        date: {
          type: SchemaType.STRING,
          description: "Date for the log entry in ISO format. Default to today.",
        },
      },
      required: ["habitName"],
    },
  },

  {
    name: "getHabitStreak",
    description: "Calculates the current streak for a habit. Use for queries like 'How long is my gym streak?'",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        habitName: {
          type: SchemaType.STRING,
          description: "Name of the habit",
        },
      },
      required: ["habitName"],
    },
  },

  {
    name: "listHabits",
    description: "Lists all habits with their consistency stats. Use for 'show my habits' or 'habit summary'.",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        period: {
          type: SchemaType.STRING,
          format: "enum",
          enum: ["week", "month", "year"],
          description: "Time period for statistics",
        },
      },
      required: [],
    },
  },

  {
    name: "getHabitInsights",
    description: "Provides analytics and insights about habit performance. Use for 'analyze my habits' or 'habit insights'.",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        habitName: {
          type: SchemaType.STRING,
          description: "Specific habit to analyze, or leave empty for all habits",
        },
        period: {
          type: SchemaType.STRING,
          format: "enum",
          enum: ["week", "month", "year"],
          description: "Time period for analysis",
        },
      },
      required: [],
    },
  },

  // WORKSPACE MANAGEMENT
  {
    name: "listWorkspaces",
    description: "Lists all user workspaces. Use when user asks 'show my workspaces' or 'what workspaces do I have'.",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {},
      required: [],
    },
  },

  {
    name: "createWorkspace",
    description: "Creates a new workspace. Use when user wants to organize tasks in a new category.",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        name: {
          type: SchemaType.STRING,
          description: "Workspace name (e.g., 'Work', 'Personal', 'Freelance')",
        },
        description: {
          type: SchemaType.STRING,
          description: "Optional workspace description",
        },
      },
      required: ["name"],
    },
  },

  // PROJECT MANAGEMENT
  {
    name: "createProject",
    description: "Creates a new project within a workspace. Use for organizing related tasks.",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        name: {
          type: SchemaType.STRING,
          description: "Project name (e.g., 'Website Redesign', 'Q4 Marketing')",
        },
        workspaceName: {
          type: SchemaType.STRING,
          description: "Name of workspace where project should be created. NEVER use workspace ID.",
        },
        description: {
          type: SchemaType.STRING,
          description: "Project description",
        },
        color: {
          type: SchemaType.STRING,
          description: "Hex color code for visual organization (e.g., '#3B82F6')",
        },
      },
      required: ["name", "workspaceName"],
    },
  },

  // SMART FEATURES
  {
    name: "suggestTasks",
    description: "AI-powered task suggestions based on project type or user history. Use for 'help me plan' or 'what tasks should I create'.",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        projectType: {
          type: SchemaType.STRING,
          description: "Type of project (e.g., 'React App', 'Marketing Campaign', 'House Renovation')",
        },
        workspaceName: {
          type: SchemaType.STRING,
          description: "Name of workspace where tasks will be created",
        },
      },
      required: ["projectType"],
    },
  },

  {
    name: "getProductivityInsights",
    description: "Provides productivity metrics and suggestions. Use for 'how productive am I' or 'show my stats'.",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        period: {
          type: SchemaType.STRING,
          format: "enum",
          enum: ["week", "month", "year"],
          description: "Time period for analysis",
        },
      },
      required: [],
    },
  },

  {
    name: "parseNaturalLanguageDeadline",
    description: "Converts natural language dates to ISO format. Use internally for processing user input.",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        naturalDate: {
          type: SchemaType.STRING,
          description: "Natural language date (e.g., 'tomorrow', 'next Monday', 'in 3 days')",
        },
      },
      required: ["naturalDate"],
    },
  },
];


// GEMINI MODEL CONFIGURATION


export const modelConfig: ModelParams = {
  model: "gemini-2.5-flash", 
  systemInstruction: SYSTEM_PROMPT,
  tools: [{ functionDeclarations: tools }],
  generationConfig: {
    temperature: 0.7,
    topP: 0.8,
    topK: 40,
    maxOutputTokens: 2048,
  },
};


// INITIALIZE MODEL


export function getGeminiModel() {
  return genAI.getGenerativeModel(modelConfig);
}


// HELPER TYPES


export type ToolName = typeof tools[number]["name"];

export interface FunctionCall {
  name: ToolName;
  args: Record<string, any>;
}

export interface OrchestratorResponse {
  text?: string;
  functionCalls?: FunctionCall[];
  requiresConfirmation?: boolean;
}