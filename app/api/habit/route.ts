import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  getUserHabitsWithStreaks,
  getHabitStats,
  getHabitHistory,
  createHabit,
  getMissedHabitsToday,
} from "@/lib/queries/habits";

// GET habits endpoint - Get user's habits
export async function GET(request: Request) {
  try {
      const session = await getServerSession(authOptions);
      const userId = (session?.user as any).id;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    switch (type) {
      case "stats":
        const stats = await getHabitStats(userId);
        return NextResponse.json(stats);

      case "history":
        const days = parseInt(searchParams.get("days") || "30");
        const history = await getHabitHistory(userId, days);
        return NextResponse.json(history);

      case "missed":
        const missed = await getMissedHabitsToday(userId);
        return NextResponse.json(missed);

      default:
        const habits = await getUserHabitsWithStreaks(userId);
        return NextResponse.json(habits);
    }
  } catch (error) {
    console.error("Habits GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST habits endpoint - Create new habit
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any).id;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, icon, color } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Habit name is required" },
        { status: 400 }
      );
    }

    const habit = await createHabit(userId, { name, icon, color });
    return NextResponse.json(habit, { status: 201 });
  } catch (error) {
    console.error("Habits POST error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}