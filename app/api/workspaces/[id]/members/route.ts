import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET workspace members endpoint - Get workspace members
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const members = await prisma.member.findMany({
    where: { workspaceId: id },
    include: {
      user: {
        select: { id: true, name: true, image: true, email: true }
      }
    }
  });

  return NextResponse.json(members);
}