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
  image?: string | null;
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

  const patient = await prisma.patient.create({
    data: {
      name: data.name,
      age: Number(data.age),
      status: data.status,
      summary: data.summary,
      image: data.image || null,
      doctorId: user.id,
    },
    include: {
      documents: true,
      vitalReadings: true,
      images: true,
      clinicalNotes: true,
    },
  });

  await logAuditAction({
    patientId: patient.id,
    action: "ADMIT_PATIENT",
    resourceType: "Patient",
    resourceId: String(patient.id),
    details: `Admitted new patient ${patient.name} (Age: ${patient.age}, Acuity: ${patient.status})`,
  });

  return patient;
}

export async function updatePatient(patientId: number, data: {
  name: string;
  age: number;
  status: string;
  summary: string;
  image?: string | null;
}) {
  const session = await auth();
  if (!session?.user?.email) {
    throw new Error("Unauthorized");
  }

  const existing = await prisma.patient.findUnique({
    where: { id: patientId },
  });

  if (!existing) {
    throw new Error("Patient not found.");
  }

  const updated = await prisma.patient.update({
    where: { id: patientId },
    data: {
      name: data.name,
      age: Number(data.age),
      status: data.status,
      summary: data.summary,
      image: data.image !== undefined ? data.image : existing.image,
    },
    include: {
      documents: { orderBy: { createdAt: 'desc' } },
      vitalReadings: { orderBy: { recordedAt: 'asc' } },
      images: { orderBy: { createdAt: 'desc' } },
      clinicalNotes: { orderBy: { createdAt: 'desc' } },
    },
  });

  await logAuditAction({
    patientId: updated.id,
    action: "UPDATE_PATIENT_RECORD",
    resourceType: "Patient",
    resourceId: String(updated.id),
    details: `Updated clinical chart for patient ${updated.name} (Age: ${updated.age}, Acuity: ${updated.status})`,
  });

  return updated;
}

export async function deletePatient(patientId: number) {
  const session = await auth();
  if (!session?.user?.email) {
    throw new Error("Unauthorized");
  }

  const existing = await prisma.patient.findUnique({
    where: { id: patientId },
  });

  if (!existing) {
    throw new Error("Patient not found.");
  }

  await logAuditAction({
    patientId: existing.id,
    action: "DELETE_PATIENT_RECORD",
    resourceType: "Patient",
    resourceId: String(existing.id),
    details: `Discharged and deleted patient record for ${existing.name} (ID: #${existing.id})`,
  });

  await prisma.patient.delete({
    where: { id: patientId },
  });

  return { success: true };
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

export async function logAuditAction(data: {
  patientId?: number | null;
  action: string;
  resourceType: string;
  resourceId?: string | null;
  details?: string | null;
}) {
  try {
    const session = await auth();
    return await prisma.auditLog.create({
      data: {
        userId: session?.user?.id || null,
        userEmail: session?.user?.email || "doctor@medintel.com",
        patientId: data.patientId || null,
        action: data.action,
        resourceType: data.resourceType,
        resourceId: data.resourceId || null,
        details: data.details || null,
        ipAddress: "127.0.0.1",
        userAgent: "MedIntel-Secure-EHR/4.0 (HIPAA Audit Engine)",
      },
    });
  } catch (err) {
    console.error("Failed to write audit log:", err);
  }
}

export async function getAuditLogs(limit = 100) {
  const session = await auth();
  if (!session?.user?.email) {
    return [];
  }

  return await prisma.auditLog.findMany({
    orderBy: { timestamp: 'desc' },
    take: limit,
  });
}

export async function exportPatientFHIRBundle(patientId: number) {
  const session = await auth();
  if (!session?.user?.email) {
    throw new Error("Unauthorized");
  }

  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
    include: {
      documents: true,
      vitalReadings: { orderBy: { recordedAt: 'asc' } },
      images: true,
      clinicalNotes: { orderBy: { createdAt: 'desc' } },
    },
  });

  if (!patient) {
    throw new Error("Patient not found");
  }

  const nameParts = patient.name.split(" ");
  const givenName = nameParts[0] || patient.name;
  const familyName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "Unknown";
  const birthYear = new Date().getFullYear() - patient.age;

  const entries: any[] = [];

  // 1. FHIR Patient Resource
  entries.push({
    fullUrl: `urn:uuid:patient-${patient.id}`,
    resource: {
      resourceType: "Patient",
      id: `patient-${patient.id}`,
      meta: {
        profile: ["http://hl7.org/fhir/us/core/StructureDefinition/us-core-patient"],
      },
      identifier: [
        {
          system: "http://hospital.medintel.org/patient-mrn",
          value: `MED-${patient.id}0084`,
        },
      ],
      active: true,
      name: [
        {
          use: "official",
          family: familyName,
          given: [givenName],
        },
      ],
      gender: patient.name.toLowerCase().includes("jane") || patient.name.toLowerCase().includes("emily") || patient.name.toLowerCase().includes("sarah") ? "female" : "male",
      birthDate: `${birthYear}-01-15`,
      managingOrganization: {
        display: "MedIntel Regional Clinical Health System",
      },
    },
  });

  // 2. FHIR Observation Resources for Vitals
  patient.vitalReadings.forEach((v) => {
    // Blood Pressure Panel
    entries.push({
      fullUrl: `urn:uuid:observation-bp-${v.id}`,
      resource: {
        resourceType: "Observation",
        id: `obs-bp-${v.id}`,
        status: "final",
        category: [
          {
            coding: [
              {
                system: "http://terminology.hl7.org/CodeSystem/observation-category",
                code: "vital-signs",
                display: "Vital Signs",
              },
            ],
          },
        ],
        code: {
          coding: [
            {
              system: "http://loinc.org",
              code: "85354-9",
              display: "Blood pressure panel with all children optional",
            },
          ],
          text: "Blood Pressure Reading",
        },
        subject: { reference: `urn:uuid:patient-${patient.id}` },
        effectiveDateTime: v.recordedAt.toISOString(),
        component: [
          {
            code: {
              coding: [{ system: "http://loinc.org", code: "8480-6", display: "Systolic blood pressure" }],
            },
            valueQuantity: { value: v.systolic, unit: "mmHg", system: "http://unitsofmeasure.org", code: "mm[Hg]" },
          },
          {
            code: {
              coding: [{ system: "http://loinc.org", code: "8462-4", display: "Diastolic blood pressure" }],
            },
            valueQuantity: { value: v.diastolic, unit: "mmHg", system: "http://unitsofmeasure.org", code: "mm[Hg]" },
          },
        ],
      },
    });

    if (v.heartRate) {
      entries.push({
        fullUrl: `urn:uuid:observation-hr-${v.id}`,
        resource: {
          resourceType: "Observation",
          id: `obs-hr-${v.id}`,
          status: "final",
          code: {
            coding: [{ system: "http://loinc.org", code: "8867-4", display: "Heart rate" }],
          },
          subject: { reference: `urn:uuid:patient-${patient.id}` },
          effectiveDateTime: v.recordedAt.toISOString(),
          valueQuantity: { value: v.heartRate, unit: "beats/minute", system: "http://unitsofmeasure.org", code: "/min" },
        },
      });
    }

    if (v.spo2) {
      entries.push({
        fullUrl: `urn:uuid:observation-spo2-${v.id}`,
        resource: {
          resourceType: "Observation",
          id: `obs-spo2-${v.id}`,
          status: "final",
          code: {
            coding: [{ system: "http://loinc.org", code: "2708-6", display: "Oxygen saturation in Arterial blood" }],
          },
          subject: { reference: `urn:uuid:patient-${patient.id}` },
          effectiveDateTime: v.recordedAt.toISOString(),
          valueQuantity: { value: v.spo2, unit: "%", system: "http://unitsofmeasure.org", code: "%" },
        },
      });
    }
  });

  // 3. FHIR DiagnosticReport Resources for Imaging / Scans
  patient.images.forEach((img) => {
    entries.push({
      fullUrl: `urn:uuid:diagnosticreport-${img.id}`,
      resource: {
        resourceType: "DiagnosticReport",
        id: `diag-${img.id}`,
        status: "final",
        category: [
          {
            coding: [
              {
                system: "http://terminology.hl7.org/CodeSystem/v2-0074",
                code: img.imageType === "X-Ray" ? "RAD" : img.imageType === "ECG" ? "EC" : "LAB",
                display: img.imageType === "X-Ray" ? "Radiology" : img.imageType === "ECG" ? "Electrocardiology" : "Laboratory",
              },
            ],
          },
        ],
        code: {
          coding: [{ system: "http://loinc.org", code: "18748-4", display: img.title }],
          text: img.title,
        },
        subject: { reference: `urn:uuid:patient-${patient.id}` },
        conclusion: img.aiImpression || img.clinicalNotes,
        presentedForm: [
          {
            contentType: "image/svg+xml",
            url: img.imageUrl,
            title: img.fileName,
          },
        ],
      },
    });
  });

  // 4. FHIR DocumentReference Resources for Clinical SOAP Notes
  patient.clinicalNotes.forEach((n) => {
    entries.push({
      fullUrl: `urn:uuid:documentreference-${n.id}`,
      resource: {
        resourceType: "DocumentReference",
        id: `docref-${n.id}`,
        status: "current",
        type: {
          coding: [{ system: "http://loinc.org", code: "11506-3", display: "Progress note" }],
          text: n.title,
        },
        subject: { reference: `urn:uuid:patient-${patient.id}` },
        date: n.signedAt.toISOString(),
        author: [{ display: n.dictatedBy || "Attending Physician" }],
        description: `SOAP Note: ${n.title}`,
        content: [
          {
            attachment: {
              contentType: "text/plain",
              title: n.title,
              data: Buffer.from(
                `SUBJECTIVE:\n${n.subjective}\n\nOBJECTIVE:\n${n.objective}\n\nASSESSMENT:\n${n.assessment}\n\nPLAN:\n${n.plan}`
              ).toString("base64"),
            },
          },
        ],
      },
    });
  });

  // Construct complete FHIR Bundle
  const bundle = {
    resourceType: "Bundle",
    id: `bundle-patient-${patient.id}-${Date.now()}`,
    meta: {
      lastUpdated: new Date().toISOString(),
      profile: ["http://hl7.org/fhir/StructureDefinition/Bundle"],
    },
    type: "collection",
    timestamp: new Date().toISOString(),
    total: entries.length,
    entry: entries,
  };

  // Log HIPAA Audit Action
  await logAuditAction({
    patientId: patient.id,
    action: "FHIR_EXPORT",
    resourceType: "FHIRBundle",
    resourceId: bundle.id,
    details: `Exported HL7 FHIR v4.0 Bundle containing ${entries.length} clinical resources for ${patient.name}`,
  });

  return bundle;
}


