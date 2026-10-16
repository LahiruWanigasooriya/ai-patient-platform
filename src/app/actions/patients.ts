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
        include: {
          documents: {
            orderBy: { createdAt: 'desc' }
          }
        },
        orderBy: { updatedAt: 'desc' }
      }
    }
  });

  return user?.patients || [];
}

export async function addPatientDocument(patientId: number, fileName: string) {
  const session = await auth();
  if (!session?.user?.email) {
    throw new Error("Unauthorized");
  }

  const document = await prisma.document.create({
    data: {
      fileName,
      patientId,
    },
  });

  // Touch the patient's updatedAt timestamp so dashboard reflects fresh records
  await prisma.patient.update({
    where: { id: patientId },
    data: { updatedAt: new Date() },
  });

  return document;
}

export async function getPatientDocuments(patientId: number) {
  const session = await auth();
  if (!session?.user?.email) {
    return [];
  }

  return await prisma.document.findMany({
    where: { patientId },
    orderBy: { createdAt: 'desc' },
  });
}

