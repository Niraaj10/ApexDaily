import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { startOfMonth, endOfMonth } from "date-fns";
import { authOptions } from "@/lib/auth";
import ConsistencyGrid from "@/components/habit/ConsistencyGrid";

export default async function ConsistencyPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any).id;

  const habits = await prisma.habit.findMany({
    where: { userId },
    include: {
      logs: {
        where: {
          date: {
            gte: startOfMonth(new Date()),
            lte: endOfMonth(new Date()),
          },
        },
      },
    },
  });

  return (
    <div className="p-8 space-y-6 bg-[#0d0d0d] min-h-full">
      <header>
        <h1 className="text-2xl font-bold text-white">Consistency Tracker</h1>
        <p className="text-slate-500 text-sm">Track your daily habits and maintain your streak.</p>
      </header>
      
      <ConsistencyGrid habits={habits} />
    </div>
  );
}