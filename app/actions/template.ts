"use server";

import { prisma } from "@/lib/prisma";
import { TEMPLATE_LIBRARY } from "@/lib/templates";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function useTemplate(workspaceId: string, templateId: string) {
  const session = await getServerSession(authOptions);
  
  // Check for valid session
  if (!session?.user) throw new Error("Unauthorized");
  
  // Extract the actual User ID from your session
  const userId = (session.user as any).id;

  const template = TEMPLATE_LIBRARY.find(t => t.id === templateId);
  if (!template) throw new Error("Template not found");

  try {
    // Create the Project
    const newProject = await prisma.project.create({
      data: {
        name: template.name,
        description: template.description,
        color: template.color,
        workspaceId: workspaceId,
      }
    });

    // Batch Create Tasks with valid User ID
    if (template.tasks && template.tasks.length > 0) {
      await prisma.task.createMany({
        data: template.tasks.map((task) => ({
          title: task.title,
          priority: task.priority as any,
          workspaceId: workspaceId,
          projectId: newProject.id,
          createdBy: userId, // CRITICAL FIX: Use the ID from the session
          status: "TODO",
        }))
      });
    }

    revalidatePath(`/dashboard/projects`);
    return { success: true, projectId: newProject.id };
  } catch (error) {
    console.error("Template Execution Error:", error);
    return { success: false, error: "Database constraint error" };
  }
}