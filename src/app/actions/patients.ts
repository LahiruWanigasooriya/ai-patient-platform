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
          },
          vitalReadings: {
            orderBy: { recordedAt: 'asc' }
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

export async function createPatient(data: {
  name: string;
  age: number;
  status: string;
  summary: string;
}) {
  const session = await auth();
  if (!session?.user?.email) {
    throw new Error("Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    throw new Error("Doctor profile not found.");
  }

  return await prisma.patient.create({
    data: {
      name: data.name,
      age: Number(data.age),
      status: data.status,
      summary: data.summary,
      doctorId: user.id,
    },
    include: {
      documents: true,
      vitalReadings: true,
    },
  });
}

export async function addVitalReading(patientId: number, data: {
  systolic: number;
  diastolic: number;
  heartRate?: number | null;
  spo2?: number | null;
}) {
  const session = await auth();
  if (!session?.user?.email) {
    throw new Error("Unauthorized");
  }

  const reading = await prisma.vitalReading.create({
    data: {
      patientId,
      systolic: Math.round(data.systolic),
      diastolic: Math.round(data.diastolic),
      heartRate: data.heartRate ? Math.round(data.heartRate) : null,
      spo2: data.spo2 ? Math.round(data.spo2) : null,
    },
  });

  // Touch patient updatedAt
  await prisma.patient.update({
    where: { id: patientId },
    data: { updatedAt: new Date() },
  });

  return reading;
}

export async function getPatientVitals(patientId: number) {
  const session = await auth();
  if (!session?.user?.email) {
    return [];
  }

  return await prisma.vitalReading.findMany({
    where: { patientId },
    orderBy: { recordedAt: 'asc' },
  });
}


