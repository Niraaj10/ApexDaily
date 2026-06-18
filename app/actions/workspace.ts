"use server";

import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { z } from "zod"; // Professional validation

const schema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters").max(50),
});

export async function createWorkspace(prevState: any, formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { error: "Unauthenticated" };

  const validatedFields = schema.safeParse({
    name: formData.get("name"),
  });

  if (!validatedFields.success) {
    return { error: validatedFields.error.flatten().fieldErrors.name?.[0] };
  }

  try {
    const workspace = await prisma.workspace.create({
      data: {
        name: validatedFields.data.name,
        slug: validatedFields.data.name.toLowerCase().replace(/\s+/g, "-"),
        members: {
          create: { userId: (session.user as any).id, role: "ADMIN" },
        },
      },
    });

    revalidatePath("/workspaces");
    return { success: true, workspaceId: workspace.id };
  } catch (e) {
    return { error: "Database error. Please try again." };
  }
}