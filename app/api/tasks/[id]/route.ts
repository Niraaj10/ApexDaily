import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET task endpoint - Get task details
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 101 });
    }

    const { id } = await params;

    const task = await prisma.task.findUnique({
        where: { 
          id,
          deletedAt: null // Ensure we don't fetch soft-deleted tasks
        },
        include: {
          assignee: {
            select: { id: true, name: true, image: true }
          },
          workspace: {
            select: { id: true, name: true }
          },
        }
      });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error("API_TASK_GET_ERROR:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}