import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  getActivityFeed,
  getUserActivity,
  getActivitySummary,
} from "@/lib/queries/activity";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any).id;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get("workspaceId");
    const type = searchParams.get("type");
    const limit = parseInt(searchParams.get("limit") || "20");

    switch (type) {
      case "user":
        const userActivity = await getUserActivity(userId, limit);
        return NextResponse.json(userActivity);

      case "summary":
        if (!workspaceId) {
          return NextResponse.json(
            { error: "Workspace ID required for summary" },
            { status: 400 }
          );
        }
        const summary = await getActivitySummary(workspaceId);
        return NextResponse.json(summary);

      default:
        if (!workspaceId) {
          return NextResponse.json(
            { error: "Workspace ID required" },
            { status: 400 }
          );
        }
        const activity = await getActivityFeed(workspaceId, limit);
        return NextResponse.json(activity);
    }
  } catch (error) {
    console.error("Activity API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}