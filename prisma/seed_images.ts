import { prisma } from "../src/lib/prisma";

async function main() {
  console.log("Seeding Medical Scans into PostgreSQL...");

  // Clear existing images to make seeding idempotent
  await prisma.medicalImage.deleteMany();

  // Find John Doe and Jane Smith
  const john = await prisma.patient.findFirst({ where: { name: { contains: "John Doe" } } });
  const jane = await prisma.patient.findFirst({ where: { name: { contains: "Jane Smith" } } });

  if (john) {
    console.log(`Seeding medical scans for John Doe (ID: ${john.id})...`);
    await prisma.medicalImage.create({
      data: {
        patientId: john.id,
        fileName: "john_doe_chest_xray.svg",
        title: "Chest Radiograph (PA Projection)",
        imageUrl: "/medical_scans/john_doe_chest_xray.svg",
        imageType: "X-Ray",
        modalityDetail: "PA Projection • Digital Radiography (CR)",
        clinicalNotes: "Evaluated for persistent dyspnea and uncontrolled hypertension (BP 172/105 mmHg).",
        aiImpression: "Cardiomegaly with cardiothoracic ratio (CTR) ~0.61. Left ventricular apex displacement and prominent aortic contour. Pulmonary vascular redistribution consistent with early venous hypertension. Recommend echocardiography correlation and blood pressure titration."
      }
    });

    await prisma.medicalImage.create({
      data: {
        patientId: john.id,
        fileName: "john_doe_ecg_strip.svg",
        title: "12-Lead Diagnostic Electrocardiogram",
        imageUrl: "/medical_scans/john_doe_ecg_strip.svg",
        imageType: "ECG",
        modalityDetail: "Standard 12-Lead • 25mm/s, 10mm/mV",
        clinicalNotes: "Sinus rhythm at 88 bpm. Voltage criteria evaluation.",
        aiImpression: "Sokolow-Lyon positive Left Ventricular Hypertrophy (S wave in V1 [28mm] + R wave in V5 [20mm] = 48mm > 35mm threshold). Secondary ST-T repolarization abnormality (strain pattern) in lateral precordial leads (V5-V6). Correlates with severe chronic arterial hypertension."
      }
    });
  }

  if (jane) {
    console.log(`Seeding medical scans for Jane Smith (ID: ${jane.id})...`);
    await prisma.medicalImage.create({
      data: {
        patientId: jane.id,
        fileName: "jane_smith_chest_xray.svg",
        title: "Baseline Screening Chest Radiograph",
        imageUrl: "/medical_scans/jane_smith_chest_xray.svg",
        imageType: "X-Ray",
        modalityDetail: "PA Projection Erect",
        clinicalNotes: "Routine employment pre-clearance screening.",
        aiImpression: "Normal chest radiograph. Clear bilateral lung fields. Normal cardiac silhouette (CTR 0.44). Sharp costophrenic and cardiophrenic sulci. No focal consolidations or pleural effusion."
      }
    });

    await prisma.medicalImage.create({
      data: {
        patientId: jane.id,
        fileName: "jane_smith_lab_panel.svg",
        title: "Immunology Allergen IgE & Chemistry Panel",
        imageUrl: "/medical_scans/jane_smith_lab_panel.svg",
        imageType: "Lab Report",
        modalityDetail: "CAP Accredited Allergen-Specific IgE & CMP",
        clinicalNotes: "History of childhood antibiotic rash; allergy confirmation requested.",
        aiImpression: "Markedly elevated Penicilloyl G (18.4 kU/L, Class IV) and Penicilloyl V (14.1 kU/L, Class III) specific IgE. Confirms severe Type I immediate hypersensitivity. Strict contraindication against all Beta-Lactam antibiotics (Penicillins, Ampicillin, Amoxicillin). Renal and hematologic panels within optimal reference ranges."
      }
    });
  }

  console.log("Successfully seeded diagnostic medical images!");
}

main()
  .catch((e) => {
    console.error("Error seeding images:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
