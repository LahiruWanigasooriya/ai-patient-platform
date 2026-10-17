import { prisma } from "../src/lib/prisma";

async function main() {
  console.log("Seeding Clinical Trials & Protocol Matches into PostgreSQL...");

  // 1. Clean existing trial matches and trials to make idempotent
  await prisma.trialMatch.deleteMany();
  await prisma.clinicalTrial.deleteMany();

  // 2. Define Benchmark Multi-Center Clinical Trials
  const trialsData = [
    {
      id: "NCT-05189241",
      title: "Targeted Multi-Pathway Mineralocorticoid & Calcium Inhibition in Resistant Hypertension (ARREST-HTN)",
      phase: "Phase III",
      condition: "Cardiovascular & Resistant Hypertension",
      sponsor: "National Heart, Lung, and Blood Institute (NHLBI)",
      status: "Recruiting",
      summary: "A multicenter, randomized, double-blind trial evaluating dual-mechanism endothelin and mineralocorticoid receptor antagonism in patients with uncontrolled Stage 2 hypertension and target-organ cardiac hypertrophy.",
      targetBiomarkers: [
        "Systolic BP >= 160 mmHg",
        "Left Ventricular Hypertrophy (LVH)",
        "Age 18-70",
        "Estimated GFR >= 45 mL/min/1.73m²"
      ],
      inclusionCriteria: [
        "Age between 18 and 70 years old",
        "Documented essential arterial hypertension with seated SBP >= 160 mmHg or DBP >= 100 mmHg despite >= 1 antihypertensive medication",
        "Radiographic or electrocardiographic evidence of Left Ventricular Hypertrophy (Sokolow-Lyon > 35mm or CTR > 0.50)",
        "Serum Potassium between 3.5 and 5.0 mEq/L"
      ],
      exclusionCriteria: [
        "History of acute myocardial infarction or stroke within previous 6 months",
        "End-stage renal disease (eGFR < 30 mL/min/1.73m²)",
        "Pregnancy or active lactation"
      ]
    },
    {
      id: "NCT-04982133",
      title: "Novel Sublingual Peptide Desensitization Protocol for High-Titer Beta-Lactam IgE Hypersensitivity (PEN-DESENS)",
      phase: "Phase II",
      condition: "Immunology & Drug Hypersensitivity",
      sponsor: "National Institute of Allergy and Infectious Diseases (NIAID)",
      status: "Recruiting",
      summary: "Evaluating the efficacy and safety profile of recombinant synthetic penicilloyl-polylysine sublingual immunotherapy in eliminating immediate Type I anaphylactic risk in penicillin-allergic patients.",
      targetBiomarkers: [
        "Penicilloyl G/V IgE >= 10.0 kU/L (Class III/IV)",
        "Documented Beta-Lactam Allergy",
        "Age 18-65"
      ],
      inclusionCriteria: [
        "Age 18 to 65 years old",
        "Documented clinical history of immediate Type I penicillin allergy (urticaria, angioedema, anaphylaxis)",
        "Serum specific IgE against Penicilloyl G or Penicilloyl V >= 10.0 kU/L (Class III or higher)",
        "Normal baseline renal function (serum creatinine <= 1.2 mg/dL)"
      ],
      exclusionCriteria: [
        "Severe uncontrolled asthma (FEV1 < 60% of predicted)",
        "Active autoimmune disease requiring systemic immunosuppression",
        "Concurrent therapy with non-selective beta-blockers"
      ]
    },
    {
      id: "NCT-05341209",
      title: "Targeted Anti-IL-5R Alpha Monoclonal Antibody in Severe Refractory Eosinophilic Asthma (BIO-AIR)",
      phase: "Phase III",
      condition: "Pulmonology & Severe Asthma",
      sponsor: "Global Respiratory Clinical Consortium",
      status: "Recruiting",
      summary: "Evaluating reduction in annualized asthma exacerbation rates with targeted monoclonal blockade of interleukin-5 receptors in patients with severe uncontrolled asthma.",
      targetBiomarkers: [
        "History of Asthma Flare-ups",
        "Frequent Rescue Inhaler Use",
        "Age 18-75"
      ],
      inclusionCriteria: [
        "Age 18 to 75 years old",
        "Physician-diagnosed asthma requiring high-dose inhaled corticosteroids plus LABA",
        "At least 2 documented asthma exacerbations requiring systemic corticosteroids in past 12 months",
        "Pre-bronchodilator FEV1 < 80% predicted"
      ],
      exclusionCriteria: [
        "Current heavy tobacco smoker (> 10 pack-years)",
        "Other confounding chronic lung conditions (cystic fibrosis, active pulmonary tuberculosis)"
      ]
    },
    {
      id: "NCT-04721908",
      title: "Circulating Tumor DNA & Epigenetic Biomarker Surveillance in Gastrointestinal Neoplasia (ONCO-PREVENT)",
      phase: "Phase II",
      condition: "Oncology & Early Detection",
      sponsor: "Memorial Sloan Kettering & National Cancer Institute",
      status: "Recruiting",
      summary: "Multi-analyte plasma cfDNA methylation profiling for early detection of recurrent gastrointestinal and intra-abdominal neoplasms.",
      targetBiomarkers: [
        "Age 45-80",
        "Stable Post-Surgical Baseline",
        "No Acute Complications"
      ],
      inclusionCriteria: [
        "Age 45 to 80 years old",
        "Able to provide serial peripheral blood draws"
      ],
      exclusionCriteria: [
        "Recent major abdominal or gastrointestinal surgery within the preceding 30 days (acute wound healing phase)",
        "Active systemic infection or sepsis (WBC > 15,000 /mcL)"
      ]
    }
  ];

  for (const t of trialsData) {
    const trial = await prisma.clinicalTrial.create({
      data: t
    });
    console.log(`Created Clinical Trial: ${trial.id} - ${trial.title.slice(0, 45)}...`);
  }

  // 3. Find Patients to Seed Realistic Match Scoring
  const john = await prisma.patient.findFirst({ where: { name: { contains: "John Doe" } } });
  const jane = await prisma.patient.findFirst({ where: { name: { contains: "Jane Smith" } } });
  const robert = await prisma.patient.findFirst({ where: { name: { contains: "Robert Johnson" } } });
  const emily = await prisma.patient.findFirst({ where: { name: { contains: "Emily Davis" } } });

  if (john) {
    console.log(`Matching trials for John Doe (ID: ${john.id})...`);
    await prisma.trialMatch.create({
      data: {
        patientId: john.id,
        trialId: "NCT-05189241", // ARREST-HTN
        matchScore: 96,
        status: "Eligible",
        matchedInclusions: [
          "Age 45 (Criteria: 18-70 years)",
          "Systolic BP 174 mmHg (Criteria: SBP >= 160 mmHg)",
          "Confirmed LVH: Sokolow-Lyon 48mm & CTR 0.61 on chest X-ray",
          "Adherent to first-line ACE inhibitor (Lisinopril 20mg)"
        ],
        unmatchedInclusions: [],
        exclusionFlags: [],
        aiRationale: "Exceptional clinical trial candidate. Patient exhibits severe refractory Stage 2 hypertension with objective target-organ hypertrophy (ECG LVH 48mm, CTR 0.61) on dual therapy without renal contraindications. Meets 100% of primary inclusion criteria."
      }
    });

    await prisma.trialMatch.create({
      data: {
        patientId: john.id,
        trialId: "NCT-04982133", // PEN-DESENS
        matchScore: 18,
        status: "Ineligible",
        matchedInclusions: [
          "Age 45 (Criteria: 18-65 years)"
        ],
        unmatchedInclusions: [
          "No history of immediate Type I beta-lactam hypersensitivity",
          "Specific IgE to Penicilloyl determinants is negative / unverified"
        ],
        exclusionFlags: [],
        aiRationale: "Ineligible due to absence of documented beta-lactam drug allergy or elevated Penicilloyl IgE."
      }
    });
  }

  if (jane) {
    console.log(`Matching trials for Jane Smith (ID: ${jane.id})...`);
    await prisma.trialMatch.create({
      data: {
        patientId: jane.id,
        trialId: "NCT-04982133", // PEN-DESENS
        matchScore: 98,
        status: "Eligible",
        matchedInclusions: [
          "Age 32 (Criteria: 18-65 years)",
          "Documented childhood penicillin urticaria and facial angioedema",
          "Laboratory IgE: Penicilloyl G 18.4 kU/L (Class IV) & Penicilloyl V 14.1 kU/L",
          "Normal renal function (Serum creatinine 0.82 mg/dL)"
        ],
        unmatchedInclusions: [],
        exclusionFlags: [],
        aiRationale: "Prime candidate for novel sublingual peptide desensitization protocol. Verified Class IV IgE titer to penicillin with preserved renal and respiratory status. No contraindicating beta-blocker therapy."
      }
    });

    await prisma.trialMatch.create({
      data: {
        patientId: jane.id,
        trialId: "NCT-05189241", // ARREST-HTN
        matchScore: 12,
        status: "Ineligible",
        matchedInclusions: [
          "Age 32 (Criteria: 18-70 years)"
        ],
        unmatchedInclusions: [
          "Normotensive BP (118/76 mmHg) vs required SBP >= 160 mmHg",
          "No Left Ventricular Hypertrophy (Normal CTR 0.44 on chest X-ray)"
        ],
        exclusionFlags: [],
        aiRationale: "Ineligible. Patient has optimal cardiovascular health and does not meet the hypertension threshold."
      }
    });
  }

  if (robert) {
    console.log(`Matching trials for Robert Johnson (ID: ${robert.id})...`);
    await prisma.trialMatch.create({
      data: {
        patientId: robert.id,
        trialId: "NCT-04721908", // ONCO-PREVENT
        matchScore: 35,
        status: "Ineligible",
        matchedInclusions: [
          "Age 58 (Criteria: 45-80 years)",
          "Willing to undergo peripheral blood surveillance"
        ],
        unmatchedInclusions: [],
        exclusionFlags: [
          "CRITICAL EXCLUSION: Recent abdominal surgery within 30 days (Laparoscopic appendectomy performed 7 days ago)"
        ],
        aiRationale: "Disqualified under Protocol Exclusion Rule #1: Patient underwent acute intra-abdominal surgery within the 30-day exclusionary window. May re-evaluate after Day 30 post-op."
      }
    });
  }

  if (emily) {
    console.log(`Matching trials for Emily Davis (ID: ${emily.id})...`);
    await prisma.trialMatch.create({
      data: {
        patientId: emily.id,
        trialId: "NCT-05341209", // BIO-AIR
        matchScore: 92,
        status: "Eligible",
        matchedInclusions: [
          "Age 24 (Criteria: 18-75 years)",
          "Active asthma with frequent exacerbations requiring rescue bronchodilators",
          "Reduced peak flow (320 L/min, 75% predicted)"
        ],
        unmatchedInclusions: [],
        exclusionFlags: [],
        aiRationale: "Strong candidate for biologic monoclonal trial. Exhibits frequent exacerbations and cold-induced bronchospasm on standard therapy without confounding smoking history."
      }
    });
  }

  console.log("Successfully seeded benchmark Clinical Trials & Protocol Matches!");
}

main()
  .catch((e) => {
    console.error("Error seeding clinical trials:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
