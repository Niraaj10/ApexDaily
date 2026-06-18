"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";


export async function toggleHabit(habitId: string, dateString: string, currentState: boolean) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Unauthorized");

  const targetDate = new Date(`${dateString}T00:00:00Z`);

  try {
    await prisma.habitLog.upsert({
      where: {
        habitId_date: {
          habitId: habitId,
          date: targetDate,
        },
      },
      update: { completed: !currentState },
      create: {
        habitId: habitId,
        date: targetDate,
        completed: true,
      },
    });

    revalidatePath("/dashboard/consistency");
    return { success: true };
  } catch (error) {
    return { error: "Update failed" };
  }
}

export async function createHabit(prevState: any, formData: FormData) {
  // 1. Authenticate the user session
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { error: "You must be logged in to create a habit." };
  }

  // 2. Extract and validate form data
  const name = formData.get("name") as string;

  if (!name || name.trim().length < 2) {
    return { error: "Habit name is too short." };
  }

  try {
    // 3. Create the record in the database
    await prisma.habit.create({
      data: {
        name: name.trim(),
        userId: (session.user as any).id,
      },
    });

    // 4. Clear the cache and update the UI
    revalidatePath("/dashboard/consistency");
    return { success: true };

  } catch (error) {
    console.error("Database Error:", error);
    return { error: "Failed to create habit in database." };
  }
}


export async function deleteHabit(habitId: string) {
  try {
    await prisma.habit.delete({
      where: { id: habitId },
    });
    revalidatePath("/dashboard/consistency");
    return { success: true };
  } catch (error) {
    return { error: "Failed to delete habit" };
  }
}