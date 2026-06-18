import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { toggleHabitCompletion } from "@/lib/queries/habits";

// POST habit toggle endpoint
export async function POST(
  request: Request,
  { params }: { params: { habitId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any).id;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { date } = body;

    if (!date) {
      return NextResponse.json({ error: "Date is required" }, { status: 400 });
    }

    const log = await toggleHabitCompletion(
      params.habitId,
      new Date(date)
    );

    return NextResponse.json(log);
  } catch (error) {
    console.error("Habit toggle error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}