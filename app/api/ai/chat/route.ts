import { NextRequest, NextResponse } from "next/server";
import { getGeminiModel } from "@/lib/ai/gemini-orchestrator";
import * as executors from "@/lib/ai/tool-executors";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";


// POST ai chat endpoint - Main AI Orchestrator Endpoint
export async function POST(req: NextRequest) {
  const startTime = Date.now();

  try {
    // Get user from auth middleware
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any).id;

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized", code: "AUTH_REQUIRED" },
        { status: 401 }
      );
    }

    // Parse request
    const { message, conversationHistory = [] } = await req.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required", code: "VALIDATION_ERROR" },
        { status: 400 }
      );
    }

    // Initialize Gemini
    const model = getGeminiModel();
    const chat = model.startChat({
      history: conversationHistory,
    });

    // Send message
    const result = await chat.sendMessage(message);
    const response = result.response;

    // Check for function calls
    const functionCalls = response.functionCalls();

    if (functionCalls && functionCalls.length > 0) {
      // Execute all function calls
      const functionResponses = await Promise.all(
        functionCalls.map(async (call) => {
          try {
            const result = await executeFunction(call.name, call.args, userId);
            return {
              name: call.name,
              response: result,
            };
          } catch (error) {
            console.error(`[Function ${call.name}] Error:`, error);
            return {
              name: call.name,
              response: {
                success: false,
                error: (error as Error).message,
              },
            };
          }
        })
      );

      // Send function responses back to Gemini
      const finalResult = await chat.sendMessage(
        functionResponses.map((fr) => ({
          functionResponse: {
            name: fr.name,
            response: fr.response,
          },
        }))
      );

      const finalResponse = finalResult.response;
      const finalText = finalResponse.text();

      return NextResponse.json(
        {
          message: finalText,
          functionCalls: functionCalls.map((fc) => ({
            name: fc.name,
            args: fc.args,
          })),
          functionResults: functionResponses,
          conversationHistory: await chat.getHistory(),
          _meta: {
            duration: Date.now() - startTime,
            toolsUsed: functionCalls.length,
          },
        },
        {
          headers: {
            "X-Response-Time": `${Date.now() - startTime}ms`,
          },
        }
      );
    }

    // No function calls - just return text
    const text = response.text();

    return NextResponse.json(
      {
        message: text,
        conversationHistory: await chat.getHistory(),
        _meta: {
          duration: Date.now() - startTime,
          toolsUsed: 0,
        },
      },
      {
        headers: {
          "X-Response-Time": `${Date.now() - startTime}ms`,
        },
      }
    );
  } catch (error) {
    console.error("[AI Chat] Error:", error);

    return NextResponse.json(
      {
        error: "Failed to process AI request",
        code: "AI_ERROR",
        message:
          process.env.NODE_ENV === "development"
            ? (error as Error).message
            : undefined,
      },
      { status: 500 }
    );
  }
}


// FUNCTION EXECUTOR ROUTER
async function executeFunction(
  functionName: string,
  args: any,
  userId: string
) {
  const executorMap: Record<string, Function> = {
    // Tasks
    createTask: executors.executeCreateTask,
    updateTask: executors.executeUpdateTask,
    deleteTask: executors.executeDeleteTask,
    listTasks: executors.executeListTasks,
    searchTasks: executors.executeSearchTasks,
    bulkDeleteTasks: executors.executeBulkDeleteTasks,

    // Habits
    logHabit: executors.executeLogHabit,
    getHabitStreak: executors.executeGetHabitStreak,
    listHabits: executors.executeListHabits,
    getHabitInsights: executors.executeGetHabitInsights,

    // Workspaces
    listWorkspaces: executors.executeListWorkspaces,
    createWorkspace: executors.executeCreateWorkspace,

    // Projects
    createProject: executors.executeCreateProject,

    // Smart features
    suggestTasks: executors.executeSuggestTasks,
    getProductivityInsights: executors.executeGetProductivityInsights,
    parseNaturalLanguageDeadline:
      executors.executeParseNaturalLanguageDeadline,
  };

  const executor = executorMap[functionName];

  if (!executor) {
    throw new Error(`Unknown function: ${functionName}`);
  }

  return await executor(args, userId);
}


// GET ai chat endpoint - Get chat configuration
export async function GET(req: NextRequest) {
  return NextResponse.json({
    capabilities: [
      "Task Management",
      "Habit Tracking",
      "Workspace Organization",
      "Smart Scheduling",
      "Productivity Insights",
    ],
    availableFunctions: [
      "createTask",
      "updateTask",
      "deleteTask",
      "listTasks",
      "searchTasks",
      "logHabit",
      "getHabitStreak",
      "listHabits",
      "getHabitInsights",
      "listWorkspaces",
      "createWorkspace",
      "createProject",
      "suggestTasks",
      "getProductivityInsights",
    ],
    model: "gemini-1.5-pro",
    version: "1.0.0",
  });
}
