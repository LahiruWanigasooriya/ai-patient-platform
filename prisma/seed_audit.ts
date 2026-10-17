import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const connectionString = process.env.DATABASE_URL || "postgresql://postgres:postgresql@localhost:5458/medintel";
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding HIPAA compliance audit log ledger...");

  const existingLogs = await prisma.auditLog.count();
  if (existingLogs > 5) {
    console.log(`Found ${existingLogs} existing audit logs. Seeding additional verified compliance entries...`);
  }

  const now = Date.now();
  const hour = 3600 * 1000;
  const day = 24 * hour;

  const auditEvents = [
    {
      userId: "usr-admin-01",
      userEmail: "doctor@medintel.com",
      patientId: 1,
      action: "VIEW_RECORD",
      resourceType: "Patient",
      resourceId: "1",
      details: "Clinician opened patient chart (John Doe, MRN: MED-10084). Longitudinal vitals and allergy panel loaded.",
      ipAddress: "192.168.1.104",
      userAgent: "MedIntel-Secure-EHR/4.0 (Windows NT 10.0; Win64; x64)",
      timestamp: new Date(now - 3 * day - 4 * hour),
    },
    {
      userId: "usr-admin-01",
      userEmail: "doctor@medintel.com",
      patientId: 1,
      action: "VISION_INSPECTION",
      resourceType: "MedicalImage",
      resourceId: "img-cxr-01",
      details: "High-resolution DICOM CXR AP Portable scan inspected. Invert Film Contrast filter applied for bilateral infiltrates evaluation.",
      ipAddress: "192.168.1.104",
      userAgent: "MedIntel-Secure-EHR/4.0 (Windows NT 10.0; Win64; x64)",
      timestamp: new Date(now - 2 * day - 8 * hour),
    },
    {
      userId: "usr-admin-01",
      userEmail: "doctor@medintel.com",
      patientId: 1,
      action: "AI_COPILOT_QUERY",
      resourceType: "Document",
      resourceId: "rag-query-001",
      details: "Semantic vector retrieval on patient longitudinal history: 'Check drug-drug interactions between Metformin, Lisinopril, and NSAIDs'.",
      ipAddress: "192.168.1.104",
      userAgent: "MedIntel-Copilot/2.5 (HIPAA Strict Audit Token)",
      timestamp: new Date(now - 2 * day - 2 * hour),
    },
    {
      userId: "usr-admin-01",
      userEmail: "doctor@medintel.com",
      patientId: 1,
      action: "SCRIBE_SOAP_COMMIT",
      resourceType: "ClinicalNote",
      resourceId: "soap-note-001",
      details: "Ambient AI Scribe synthesized audio dictation into structured SOAP note. Attending physician signed off with billing codes CPT 99214 and ICD-10 E11.9, I10.",
      ipAddress: "192.168.1.104",
      userAgent: "MedIntel-Scribe-Engine/3.1",
      timestamp: new Date(now - 1 * day - 5 * hour),
    },
    {
      userId: "usr-admin-01",
      userEmail: "doctor@medintel.com",
      patientId: 1,
      action: "TRIAL_ENROLLMENT",
      resourceType: "TrialMatch",
      resourceId: "NCT04561234",
      details: "Patient matched with 96% eligibility for NCT04561234 (Metformin + SGLT2i Cardiorenal Study). Protocol consent confirmed and status transitioned to Enrolled.",
      ipAddress: "192.168.1.104",
      userAgent: "MedIntel-Trials-Matcher/1.0",
      timestamp: new Date(now - 18 * hour),
    },
    {
      userId: "usr-admin-01",
      userEmail: "doctor@medintel.com",
      patientId: 1,
      action: "FHIR_EXPORT",
      resourceType: "FHIRBundle",
      resourceId: "bundle-patient-1-init",
      details: "Generated standardized HL7 FHIR v4.0 JSON Bundle (Patient, Observations, DiagnosticReports, DocumentReferences, ResearchSubject) for regional health exchange.",
      ipAddress: "192.168.1.104",
      userAgent: "MedIntel-FHIR-Gateway/4.0",
      timestamp: new Date(now - 6 * hour),
    },
    {
      userId: "usr-admin-01",
      userEmail: "doctor@medintel.com",
      patientId: 2,
      action: "VIEW_RECORD",
      resourceType: "Patient",
      resourceId: "2",
      details: "Clinician opened patient chart (Jane Smith, MRN: MED-20084). Pregnancy and gestational vitals verified.",
      ipAddress: "192.168.1.104",
      userAgent: "MedIntel-Secure-EHR/4.0 (Windows NT 10.0; Win64; x64)",
      timestamp: new Date(now - 5 * hour),
    },
    {
      userId: "usr-admin-01",
      userEmail: "doctor@medintel.com",
      patientId: 2,
      action: "AI_COPILOT_QUERY",
      resourceType: "Document",
      resourceId: "rag-query-002",
      details: "Copilot queried for gestational diabetes safety contraindications and safe insulin protocols.",
      ipAddress: "192.168.1.104",
      userAgent: "MedIntel-Copilot/2.5",
      timestamp: new Date(now - 4 * hour),
    },
    {
      userId: "usr-admin-01",
      userEmail: "doctor@medintel.com",
      patientId: 3,
      action: "VIEW_RECORD",
      resourceType: "Patient",
      resourceId: "3",
      details: "Clinician opened patient chart (Robert Johnson, MRN: MED-30084). Cardiology ECG telemetry reviewed.",
      ipAddress: "192.168.1.104",
      userAgent: "MedIntel-Secure-EHR/4.0",
      timestamp: new Date(now - 2 * hour),
    },
    {
      userId: "usr-admin-01",
      userEmail: "doctor@medintel.com",
      patientId: 1,
      action: "VIEW_RECORD",
      resourceType: "Patient",
      resourceId: "1",
      details: "Clinician re-accessed John Doe chart for pre-op clearance review.",
      ipAddress: "192.168.1.104",
      userAgent: "MedIntel-Secure-EHR/4.0",
      timestamp: new Date(now - 45 * 60 * 1000),
    },
  ];

  for (const event of auditEvents) {
    await prisma.auditLog.create({
      data: event,
    });
  }

  const finalCount = await prisma.auditLog.count();
  console.log(`Successfully seeded HIPAA Audit Log. Total ledger records: ${finalCount}`);
}

main()
  .catch((e) => {
    console.error("Error seeding audit logs:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
