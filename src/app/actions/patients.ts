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
          },
          images: {
            orderBy: { createdAt: 'desc' }
          },
          clinicalNotes: {
            orderBy: { createdAt: 'desc' }
          },
          trialMatches: {
            include: { trial: true },
            orderBy: { matchScore: 'desc' }
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

export async function addPatientMedicalImage(patientId: number, data: {
  fileName: string;
  title: string;
  imageUrl: string;
  imageType: string;
  clinicalNotes?: string;
  modalityDetail?: string;
  aiImpression?: string;
}) {
  const session = await auth();
  if (!session?.user?.email) {
    throw new Error("Unauthorized");
  }

  const image = await prisma.medicalImage.create({
    data: {
      patientId,
      fileName: data.fileName,
      title: data.title,
      imageUrl: data.imageUrl,
      imageType: data.imageType,
      clinicalNotes: data.clinicalNotes,
      modalityDetail: data.modalityDetail,
      aiImpression: data.aiImpression,
    },
  });

  // Touch patient updatedAt
  await prisma.patient.update({
    where: { id: patientId },
    data: { updatedAt: new Date() },
  });

  return image;
}

export async function getPatientMedicalImages(patientId: number) {
  const session = await auth();
  if (!session?.user?.email) {
    return [];
  }

  return await prisma.medicalImage.findMany({
    where: { patientId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function updateImageAiImpression(imageId: string, aiImpression: string) {
  const session = await auth();
  if (!session?.user?.email) {
    throw new Error("Unauthorized");
  }

  return await prisma.medicalImage.update({
    where: { id: imageId },
    data: { aiImpression },
  });
}

export async function createClinicalNote(patientId: number, data: {
  title: string;
  noteType?: string;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  rawTranscript?: string;
  dictatedBy?: string;
}) {
  const session = await auth();
  if (!session?.user?.email) {
    throw new Error("Unauthorized");
  }

  const note = await prisma.clinicalNote.create({
    data: {
      patientId,
      title: data.title,
      noteType: data.noteType || "SOAP",
      subjective: data.subjective,
      objective: data.objective,
      assessment: data.assessment,
      plan: data.plan,
      rawTranscript: data.rawTranscript,
      dictatedBy: data.dictatedBy || (session.user.name || "Attending Physician"),
    },
  });

  // Touch patient updatedAt
  await prisma.patient.update({
    where: { id: patientId },
    data: { updatedAt: new Date() },
  });

  return note;
}

export async function getPatientClinicalNotes(patientId: number) {
  const session = await auth();
  if (!session?.user?.email) {
    return [];
  }

  return await prisma.clinicalNote.findMany({
    where: { patientId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function deleteClinicalNote(noteId: string) {
  const session = await auth();
  if (!session?.user?.email) {
    throw new Error("Unauthorized");
  }

  return await prisma.clinicalNote.delete({
    where: { id: noteId },
  });
}

export async function getClinicalTrials() {
  const session = await auth();
  if (!session?.user?.email) {
    return [];
  }

  return await prisma.clinicalTrial.findMany({
    orderBy: { createdAt: 'desc' },
  });
}

export async function getPatientTrialMatches(patientId: number) {
  const session = await auth();
  if (!session?.user?.email) {
    return [];
  }

  return await prisma.trialMatch.findMany({
    where: { patientId },
    include: { trial: true },
    orderBy: { matchScore: 'desc' },
  });
}

export async function enrollPatientInTrial(patientId: number, trialId: string) {
  const session = await auth();
  if (!session?.user?.email) {
    throw new Error("Unauthorized");
  }

  const updatedMatch = await prisma.trialMatch.update({
    where: {
      patientId_trialId: {
        patientId,
        trialId,
      },
    },
    data: {
      status: "Enrolled",
    },
    include: { trial: true },
  });

  // Touch patient updatedAt
  await prisma.patient.update({
    where: { id: patientId },
    data: { updatedAt: new Date() },
  });

  return updatedMatch;
}


