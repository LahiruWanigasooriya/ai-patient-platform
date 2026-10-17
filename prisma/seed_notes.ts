import { prisma } from "../src/lib/prisma";

async function main() {
  console.log("Seeding Clinical SOAP Notes into PostgreSQL...");

  // Clear existing clinical notes to make seeding idempotent
  await prisma.clinicalNote.deleteMany();

  // Find John Doe and Jane Smith
  const john = await prisma.patient.findFirst({ where: { name: { contains: "John Doe" } } });
  const jane = await prisma.patient.findFirst({ where: { name: { contains: "Jane Smith" } } });

  if (john) {
    console.log(`Seeding clinical SOAP note for John Doe (ID: ${john.id})...`);
    await prisma.clinicalNote.create({
      data: {
        patientId: john.id,
        title: "Cardiology & Hypertension Comprehensive Follow-Up",
        noteType: "SOAP",
        dictatedBy: "Dr. Gregory House, MD",
        rawTranscript: "Doctor: Good morning John. How have you been feeling since we adjusted the lisinopril? Patient: Doctor, I've had these recurrent morning headaches at the back of my head, and a bit of chest tightness when climbing stairs. I've been taking the Lisinopril 20mg every morning. Doctor: Any ankle swelling or shortness of breath lying flat? Patient: No ankle swelling, but I wake up coughing occasionally. Doctor: Let's check your vitals. Blood pressure is 174 over 104, pulse 88 regular. Lungs clear to auscultation, no crackles or wheezes. Heart S1 and S2 present, no murmurs, no S3 or S4 gallop. Extremities warm with no peripheral edema. Your ECG shows left ventricular strain and chest X-ray showed cardiomegaly. We need to escalate therapy immediately. I am adding Amlodipine 5mg daily to your regimen and scheduling an urgent echocardiogram. We must also obtain a comprehensive metabolic panel to monitor renal function.",
        subjective: "Patient is a 45-year-old male with long-standing Stage 2 Hypertension and Type 2 Diabetes presenting for scheduled cardiovascular follow-up. Reports persistent occipital throbbing morning headaches for the past 10 days and exertional chest pressure (NYHA Class II) when climbing more than one flight of stairs. Denies orthopnea, paroxysmal nocturnal dyspnea, or bilateral pedal edema. Complies with Lisinopril 20mg PO daily and Metformin 1000mg BID.",
        objective: "Vitals: BP 174/104 mmHg (Right arm, seated), HR 88 bpm regular, SpO2 97% on room air, BMI 29.4 kg/m².\nCardiovascular: Regular rate and rhythm. Prominent apical impulse displaced laterally. S1/S2 present, no friction rubs, murmurs, or gallops.\nPulmonary: Clear to auscultation bilaterally. No rales, rhonchi, or expiratory wheezes.\nDiagnostic Correlates:\n- 12-Lead ECG: Sokolow-Lyon criteria positive for LVH (48mm), lateral ST-T strain in V5-V6.\n- Chest Radiograph (PA): Cardiothoracic ratio 0.61 with left ventricular contour prominence.",
        assessment: "1. Severe Uncontrolled Primary Arterial Hypertension (Stage 2) with evidence of target organ damage (Left Ventricular Hypertrophy and cardiomegaly).\n2. Type 2 Diabetes Mellitus without current microvascular decompensation.\n3. Atypical exertional chest discomfort, NYHA Class II, secondary to hypertensive heart disease vs. early coronary artery disease.",
        plan: "1. Antihypertensive Escalation:\n   - Continue Lisinopril 20mg PO once daily.\n   - Add Amlodipine besylate 5mg PO once daily in evening.\n2. Diagnostic Workup:\n   - Order urgent Transthoracic Echocardiogram (TTE) to quantify ejection fraction.\n   - Repeat Comprehensive Metabolic Panel (Serum Creatinine, eGFR, K+) and HbA1c in 2 weeks.\n3. Patient Counseling:\n   - Restrict sodium intake to <2,000 mg/day; maintain daily home BP log.\n   - Red-flag warning: Emergency evaluation for severe chest pressure or acute dyspnea.\n4. Follow-Up: Re-evaluation in clinic in 14 days.",
      }
    });
  }

  if (jane) {
    console.log(`Seeding clinical SOAP note for Jane Smith (ID: ${jane.id})...`);
    await prisma.clinicalNote.create({
      data: {
        patientId: jane.id,
        title: "Allergy Immunology Consultation & Wellness Review",
        noteType: "SOAP",
        dictatedBy: "Dr. Gregory House, MD",
        rawTranscript: "Doctor: Hi Jane, glad to see you. You mentioned you had a reaction to antibiotics as a child and wanted to clear up your records before an upcoming dental procedure. Patient: Yes doctor, when I was 8 my parents told me I broke out in severe hives and had facial swelling after taking penicillin for strep. I want to make sure everyone knows never to give me that. Doctor: Understood. Any asthma or seasonal allergies? Patient: Mild seasonal hay fever in spring, controlled with over the counter cetirizine. No food allergies. Doctor: Physical exam is completely unremarkable today. Vital signs: BP 118/76, pulse 70, O2 99%. HEENT clear, lungs clear, heart sounds normal, no skin rash or urticaria. Reviewing your laboratory immunology panel, your Penicilloyl G IgE was 18.4 kU/L and Penicilloyl V was 14.1 kU/L, which unequivocally confirms a severe Class IV immediate hypersensitivity. I am updating your electronic medical chart with a permanent hard stop red-flag allergy alert for all Beta-Lactam antibiotics.",
        subjective: "Patient is a 32-year-old female presenting for formal immunology allergy evaluation and general wellness check prior to planned dental implant surgery. Reports historical childhood episode of generalized urticaria and angioedema following oral penicillin administration. Currently asymptomatic; denies current pruritus, wheezing, rhinorrhea, or gastrointestinal upset. Takes Cetirizine 10mg PRN for seasonal allergic rhinitis.",
        objective: "Vitals: BP 118/76 mmHg, HR 70 bpm, RR 14/min, SpO2 99% ambient air, Temp 98.4°F.\nHEENT: Normocephalic, atraumatic. Conjunctivae clear, oropharynx non-erythematous, no uvular edema.\nRespiratory: Lungs resonant and clear to auscultation bilaterally; no wheezing or stridor.\nSkin: Warm, dry, intact without rashes, urticaria, or dermatographia.\nDiagnostic Laboratory Review:\n- Specific IgE Allergen Panel: Penicilloyl G IgE 18.4 kU/L (Class IV - High), Penicilloyl V IgE 14.1 kU/L (Class III/IV - High).\n- CMP & CBC: Normal renal panel (Creatinine 0.82 mg/dL) and baseline eosinophils.",
        assessment: "1. Confirmed Severe Immediate Type I Hypersensitivity to Penicillins and Beta-Lactam class antibiotics (Class IV IgE elevation).\n2. Mild Intermittent Allergic Rhinitis, well controlled.\n3. Routine Adult Health Maintenance, optimal cardiovascular status.",
        plan: "1. Allergy Hard-Stop Alert:\n   - Document permanent high-severity allergy alert in EHR: Absolute contraindication to Penicillins, Ampicillin, Amoxicillin, and Augmentin.\n   - Advise patient to alert dental surgeon and pharmacies; recommend medical alert bracelet.\n   - Recommended alternative for dental peri-procedural prophylaxis if indicated: Clindamycin 600mg or Azithromycin 500mg.\n2. Prescribed EpiPen Auto-Injector 0.3mg to keep on hand for emergency anaphylaxis protocol.\n3. Follow-Up: Routine annual preventive wellness exam in 12 months.",
      }
    });
  }

  console.log("Successfully seeded clinical SOAP notes!");
}

main()
  .catch((e) => {
    console.error("Error seeding clinical notes:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
