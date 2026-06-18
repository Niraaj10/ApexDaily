import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  getTodaysFocusTasks,
  getDailyStats,
  getWeeklyTrend,
  getAISuggestions,
  getUpcomingTasks,
} from "@/lib/queries/dashboard";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any).id;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get("workspaceId");

    if (!workspaceId) {
      return NextResponse.json(
        { error: "Workspace ID required" },
        { status: 400 }
      );
    }

    // Fetch all dashboard data in parallel
    const [focusTasks, dailyStats, weeklyTrend, suggestions, upcomingTasks] =
      await Promise.all([
        getTodaysFocusTasks(userId, workspaceId),
        getDailyStats(userId, workspaceId),
        getWeeklyTrend(userId, workspaceId),
        getAISuggestions(userId, workspaceId),
        getUpcomingTasks(userId, workspaceId),
      ]);

    return NextResponse.json({
      focusTasks,
      dailyStats,
      weeklyTrend,
      suggestions,
      upcomingTasks,
    });
  } catch (error) {
    console.error("Dashboard API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
