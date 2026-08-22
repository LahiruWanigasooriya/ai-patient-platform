"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function getPatients() {
  const session = await auth();
  
  if (!session?.user?.email) {
    return [];
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      patients: {
        orderBy: { updatedAt: 'desc' }
      }
    }
  });

  return user?.patients || [];
}
