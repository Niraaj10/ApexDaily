import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  getTeamWorkload,
  getUnassignedTasks,
  getAssignmentSuggestions,
  getTeamCapacity,
  getRedistributableTasks,
  getTeamPerformance,
} from "@/lib/queries/team";

// GET team workload endpoint - Get team workload data
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

    if (!workspaceId) {
      return NextResponse.json(
        { error: "Workspace ID required" },
        { status: 400 }
      );
    }

    switch (type) {
      case "capacity":
        const capacity = await getTeamCapacity(workspaceId);
        return NextResponse.json(capacity);

      case "unassigned":
        const unassigned = await getUnassignedTasks(workspaceId);
        return NextResponse.json(unassigned);

      case "suggestions":
        const suggestions = await getAssignmentSuggestions(workspaceId);
        return NextResponse.json(suggestions);

      case "redistribute":
        const redistribute = await getRedistributableTasks(workspaceId);
        return NextResponse.json(redistribute);

      case "performance":
        const performance = await getTeamPerformance(workspaceId);
        return NextResponse.json(performance);

      default:
        const workload = await getTeamWorkload(workspaceId);
        return NextResponse.json(workload);
    }
  } catch (error) {
    console.error("Team workload API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}