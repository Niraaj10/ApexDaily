"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function createTask(workspaceId: string, taskData: any) {
  const session = await getServerSession(authOptions);
  
  // Security check
  if (!session?.user) return { error: "Unauthorized" };

  try {
    const task = await prisma.task.create({
      data: {
        title: taskData.title,
        description: taskData.description,
        status: taskData.status || "TODO",
        // Validating priority against your schema enums
        priority: taskData.priority === "NORMAL" ? "MEDIUM" : taskData.priority,
        workspaceId: workspaceId,
        assigneeId: taskData.assigneeId,
        startDate: taskData.startDate ? new Date(taskData.startDate) : null,
        dueDate: taskData.dueDate ? new Date(taskData.dueDate) : null,
        tags: taskData.tags,
        metadata: taskData.metadata,
        createdBy: (session.user as any).id, 
      }
    });

    revalidatePath(`/dashboard/workspaces/${workspaceId}`);
    return { success: true, data: task };
  } catch (e) {
    console.error("Create Task Error:", e);
    return { error: "Failed to create task" };
  }
}


export async function updateTaskStatus(taskId: string, newStatus: string, workspaceId: string) {
    try {
      // Type constraint fix: convert string to TaskStatus enum value
      await prisma.task.update({
        where: { id: taskId },
        data: { status: newStatus as any },
      });
      revalidatePath(`/dashboard/workspaces/${workspaceId}`);
      return { success: true };
    } catch (error) {
      return { error: "Failed to update status" };
    }
  }


  export async function updateTask(taskId: string, data: any, workspaceId: string) {
    try {
      const updatedTask = await prisma.task.update({
        where: { id: taskId },
        data: {
          title: data.title,
          status: data.status,
          description: data.description,
          priority: data.priority,
        },
      });
  
      // Refresh the workspace to update the Board/List/Table views
      revalidatePath(`/dashboard/workspaces/${workspaceId}`);
      return { success: true, task: updatedTask };
    } catch (error) {
      return { error: "Failed to update task" };
    }
  }


  export async function patchTask(taskId: string, data: any) {
    try {
      const updated = await prisma.task.update({
        where: { id: taskId },
        // data,
        data: {
          title: data.title,
          description: data.description,
          status: data.status,
          priority: data.priority,
          startDate: data.startDate ? new Date(data.startDate) : undefined,
          dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
          assigneeId: data.assigneeId, // This can be null
          tags: data.tags, // Array of strings
        },
      });
      // Dynamically revalidate the workspace so all views update instantly
      revalidatePath(`/dashboard/workspaces/${updated.workspaceId}`);
      return { success: true, data: updated };
    } catch (error) {
      return { error: "Failed to update field" };
    }
  }