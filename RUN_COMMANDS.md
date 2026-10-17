# How to Run & Test the AI Patient Record Intelligence Platform

All three core services are currently **already running and active** in your environment:
- **PostgreSQL Database:** Running on port `5458`
- **FastAPI Python Backend (ChromaDB Vector DB):** Running on port `8000`
- **Next.js Frontend (Auth.js & AI Agent):** Running on port `3000`

---

## 1. Login Credentials

To access your patients and test the AI features:
- **URL:** [http://localhost:3000/login](http://localhost:3000/login) (or click "Sign In" in the top navbar)
- **Email:** `doctor@medintel.com`
- **Password:** `password123`

---

## 2. Test Scenarios (Step-by-Step Checklist)

### Test A: Live PostgreSQL Roster & UI Loading (Epic 1 & 2)
1. Navigate to [http://localhost:3000](http://localhost:3000).
2. Log in with `doctor@medintel.com` / `password123`.
3. Notice the pulsating **loading skeleton cards** while Prisma queries PostgreSQL.
4. You will see 6 real seeded patients:
   - **John Doe** (Critical • 45 yrs)
   - **Jane Smith** (Stable • 32 yrs)
   - **Robert Johnson** (Review • 58 yrs)
   - **Emily Davis**, **Michael Brown**, **Sarah Wilson**
5. Notice the footer on each card displays:
   - Live **document counts** (e.g. `1 Records • 10/16/2026`)
   - Last updated timestamp.
6. Try the **live search bar** at the top (e.g. type *"hypertension"* or *"Jane"* or *"Asthma"*).

---

### Test B: Patient Context-Aware AI Chat (Epic 2)
1. Click on **John Doe's card**.
   - The AI Assistant drawer slides open on the right.
   - The top header displays: `John Doe` with a red `Critical` badge and `Age: 45 • ID: #10084`.
   - The assistant greets you specifically for John Doe.
2. Ask the AI:
   > *"Who am I looking at right now and what is his status?"*
   - The AI will accurately state it is assisting with John Doe, age 45, who is in critical condition with severe hypertension and diabetes.
3. Close the sidebar (click `×` in the top right of the sidebar).
4. Click on **Jane Smith's card**.
   - Notice the sidebar header immediately changes to `Jane Smith` with a green `Stable` badge.
   - The previous chat for John Doe is completely cleared (no cross-patient history contamination).
5. Ask the AI:
   > *"Who am I looking at right now?"*
   - The AI switches context immediately to Jane Smith (Age 32, stable, routine checkup).

---

### Test C: Multi-Tenant RAG & Clinical Document Search (Epic 3)
1. While looking at **John Doe**, look at the green bar under the AI header:
   - It displays: `1 Medical Record Linked` with a chip for `john_doe_echocardiogram.pdf`.
2. Ask the AI:
   > *"What is my measured ejection fraction according to my echocardiogram report?"*
   - The AI invokes the `searchDocuments` tool for patient 1, retrieves John's report, and confirms an **LVEF of 52%** and left ventricular hypertrophy.
3. Switch back to **Jane Smith**:
   - Notice her bar displays `1 Medical Record Linked` with a chip for `jane_smith_allergy_panel.pdf`.
4. Ask the AI:
   > *"What antibiotics should I strictly avoid based on my allergy testing?"*
   - The AI searches Jane's documents and warns against **Penicillin, Amoxicillin, and beta-lactam antibiotics**.
5. **Strict Multi-Tenant Isolation Check:**
   - While still on Jane Smith, ask:
     > *"What was my ejection fraction from my echocardiogram?"*
   - The AI searches Jane's records, discovers no echocardiogram exists for Jane, and reports that no echocardiogram is on file. It **cannot** leak John Doe's 52% data!

---

### Test D: Live Clinical PDF Upload (Epic 3)
1. Select any patient (e.g. **Robert Johnson** or **Emily Davis**).
2. Click the **"+ Upload PDF"** button in the sidebar or the **Paperclip** icon in the input box.
3. Select any clinical or test PDF from your computer.
4. Watch the upload process:
   - The PDF is sent to the FastAPI backend, chunked, and vector-embedded in ChromaDB partitioned by that patient's ID.
   - The document is automatically recorded in PostgreSQL (`Document` table).
   - The card on the dashboard immediately updates its record count!
   - You can immediately ask questions about that uploaded document!

---

### Test E: Cohort Analytics Dashboard (Epic 4)
1. On the top navigation bar, click **"Cohort Analytics"**.
2. Observe the population health metrics:
   - **4 Core KPI Cards:** Total Cohort Size, Critical Acuity Rate (%), Indexed Diagnostic Records, and Mean Cohort Age.
   - **Segmented Acuity Progress Bar:** Visual 100% normalized distribution across Critical, Review, and Stable cohorts.
   - **Interactive Acuity Cards:** Click on **"View Critical Patients &rarr;"** to automatically jump back to the patient roster filtered by Critical status.
   - **Age Distribution & Diagnostic Coverage:** Stratified view across young adults, adults, and seniors, with live ChromaDB vector indexing counters.

---

### Test F: Dynamic Patient Admission (Epic 4)
1. Click the **"+ Admit Patient"** button (available in the navbar or above the patient roster).
2. The modal dialog opens:
   - Enter Full Name: e.g. `Arthur Pendelton`
   - Enter Age: `67`
   - Select Triage Acuity: `Critical`
   - Enter Clinical History: `Acute onset chest tightness; ST segment elevation noted on emergency triage ECG.`
3. Click **"Register Patient"**.
4. The patient is instantly saved to PostgreSQL, the roster refreshes, and the Cohort Analytics telemetry updates in real-time.

---

### Test G: Interactive Generative UI Clinical Tools (Epic 4)
1. Select any patient card (e.g. **John Doe** or **Eleanor Vance**).
2. **Evaluate Vitals Tool:**
   - In the chat input, type:
     > *"The patient's current blood pressure is 168/102 mmHg with heart rate 82 bpm. Please evaluate vitals."*
   - Watch the AI autonomously call `evaluateVitals` and render the **Vitals Assessment Generative UI Card**:
     - Visual Stage 2 Hypertension / High severity badge.
     - Calculated **Mean Arterial Pressure (MAP: 124 mmHg)** and **Pulse Pressure (66 mmHg)**.
     - Clinical pharmacotherapy guidance.
3. **Generate Clinical Summary Tool:**
   - Type in the chat:
     > *"Compile and generate an official clinical consultation summary report for this patient."*
   - Watch the AI call `generateClinicalSummary` and render the **Clinical Consultation Note Card**:
     - Patient legal name, consultation date, and title.
     - Formatted diagnostic bullet points.
     - Prescribed medication badges (💊 Rx).
     - Follow-up monitoring plan.
     - Click the **"Print"** button to trigger the browser's native print / save as PDF dialog.

---

### Test H: In-App Medical Document Viewer & Semantic Chunk Inspector (Epic 5)
1. On **John Doe's** card or inside his AI chat drawer:
   - Notice the document chip `john_doe_echocardiogram.pdf`.
   - Click directly on the document chip.
2. The **In-App Medical Document Viewer** drawer opens:
   - **Semantic Chunks Tab:** Displays all vectorized ChromaDB chunks with chunk IDs and word counts.
   - **Search in Document:** Type *"hypertrophy"* or *"ejection"* to highlight matches in real-time.
   - **Synthesized Clinical View Tab:** Displays the full clinical diagnostic report with print/PDF export.
   - Click **"Analyze this chunk with AI"** to immediately query the LLM copilot about that specific finding.

---

### Test I: Pharmacological Drug-Drug Interaction (DDI) & Allergy Safety Check (Epic 5)
1. Open the AI Assistant for **John Doe** or **Jane Smith**.
2. In the chat input, type:
   > *"Can I prescribe Warfarin and Ibuprofen together for this patient?"*
3. The AI invokes the `checkDrugInteractions` tool and renders the **Drug Safety & DDI Review Generative UI Card**:
   - Severity badge: **CRITICAL RISK** (Crimson red).
   - Drug pair: `Anticoagulant (Warfarin/DOAC) ⇄ NSAID / Antiplatelet`.
   - Biological mechanism: Synergistic platelet COX-1 inhibition and coagulation cascade suppression.
   - Actionable substitution: Recommends Acetaminophen for pain relief.
4. Now test **Allergy Cross-Reactivity**:
   - For **Jane Smith** (who has a documented penicillin allergy), type:
     > *"Can I prescribe Amoxicillin for Jane Smith?"*
   - The safety engine flags an **Allergic Cross-Reactivity Alert** warning of Type I IgE-mediated anaphylactic shock and strictly contraindicates the prescription.

---

### Test J: Longitudinal Vitals Trajectory & Hemodynamic Curve (Epic 5)
1. On **John Doe's** card (or inside his AI chat drawer header), click **"Curve"** or **"Vitals Trajectory"**.
2. The **Longitudinal Vitals Trajectory Modal** opens:
   - **Interactive SVG Hemodynamic Chart:** Displays John's 6-day blood pressure curve showing systolic escalation from 152 to 172 mmHg.
   - **AHA Guideline Thresholds:** Dashed red line at 140 mmHg (Crisis) and green line at 120 mmHg (Target).
   - **Mean Arterial Pressure (MAP) & Pulse Pressure curves:** Shaded dynamic pressure areas.
   - **Automated Clinical Trajectory Analysis:** Live clinical assessment warning of vascular afterload strain.
3. Next, check **Jane Smith's Curve**:
   - Notice her normotensive, flat stability curve around 118/76 mmHg.
4. **Dynamic Trajectory Updates:**
   - In chat, evaluate vitals: *"The patient's BP is 175/108 mmHg with HR 92 bpm. Please evaluate vitals."*
   - The reading is automatically persisted to PostgreSQL `VitalReading` table and immediately updates the patient's historical trajectory curve!

---

### Test K: Multi-Modal Medical Image Vision & Radiology Viewer (Epic 6)
1. On **John Doe's** card on the dashboard roster (or inside his AI chat drawer):
   - Notice the cyan badge: **`2 Scans`** (or `2 Diagnostic Scans` in chat).
   - Click directly on the **`2 Scans`** button.
2. The **High-Resolution Medical Vision Analysis Modal** opens:
   - **Diagnostic Viewport:** Displays the Chest Radiograph (PA View) with anatomical rib cage, clavicles, lung fields, and the enlarged cardiac shadow.
   - **Invert Film Filter:** Click the **`Invert Film`** button to invert radiographic density tones (white bone vs dark radiolucency) for micro-calcification and soft-tissue contrast reading.
   - **Granular Adjustments:** Adjust the **Zoom** (-/+), **Contrast**, and **Brightness** sliders.
   - **Scan Switching (Gallery Tab):** On the right panel, click **`Scans (2)`**, then click **`12-Lead Diagnostic Electrocardiogram`**.
     - Notice the viewport transitions smoothly to John's high-resolution ECG pink grid tracing with Sokolow-Lyon LVH indicators ($48\text{ mm}$).
   - **DICOM Metadata Tab:** View technical exposure parameters, acquisition timestamps, and patient isolation verification.
   - Close the viewer (click `Close Viewer` or `×`).
3. Now test **Autonomous Multi-Modal AI Copilot Vision**:
   - Open John Doe's AI Assistant chat drawer.
   - Type in chat:
     > *"Please inspect and analyze the chest X-ray for John Doe."*
   - The AI Copilot autonomously executes the `analyzeMedicalScan` tool and renders the **Medical Diagnostic Vision Review Generative UI Card**:
     - Visual badge: `AI Vision Analyzed`
     - Clickable thumbnail preview of the radiograph.
     - Differential diagnosis tags: `Hypertensive Cardiomyopathy`, `Left Ventricular Dilatation`, `Compensated Heart Failure`.
     - Categorized findings with severity badges: **Severe** (Cardiomegaly, CTR 0.61), **Moderate** (Pulmonary venous congestion), **Normal** (No focal pneumonia).
     - Radiological AI impression: Confirms marked cardiomegaly and vascular cephalization secondary to severe hypertension.
     - Actionable clinical next steps (Echo correlation, BP titration).
     - Click **`Open in High-Resolution Vision Inspector`** on the card to immediately launch the full PACS-style modal!
4. Test with **Jane Smith**:
   - Open Jane Smith's card and ask:
     > *"Can you analyze Jane Smith's lab panel or chest X-ray?"*
   - The vision engine inspects Jane's normal chest X-ray ($CTR = 0.44$) and confirms clear lung fields with normal cardiac silhouette, or evaluates her allergy panel with Class IV penicillin hypersensitivity!


### Test L: Ambient AI Scribe & Clinical Voice Dictation (Epic 7)
1. On **John Doe's** patient card on the dashboard roster:
   - Notice the rose button: **`1 Notes`** (or in the AI chat drawer header: **`AI Scribe`**).
   - Click directly on the **`1 Notes`** button.
2. The **Ambient AI Scribe & Clinical Voice Dictation Studio Modal** opens:
   - **Signed EHR Notes Tab:** Displays the formal signed SOAP consultation note seeded for John Doe: *"Cardiology & Hypertension Comprehensive Follow-Up"* with all 4 quadrants (Subjective, Objective, Assessment, Plan) and signature by Dr. Gregory House, MD.
   - **Live Scribe Studio Tab:** Click the top toggle to switch to the Live Scribe Studio.
   - **Audio Recording & Waveform:** Click **`Start Ambient Recording`** to see the 28-bar animated audio waveform visualizer and live timer `REC 00:03...`.
   - **Scenario Quick-Pick:** Click on **`Cardiology Follow-Up: Severe Hypertension`** from the clinical scenarios list.
     - The dialogue instantly streams into the raw transcript canvas.
   - **AI SOAP Synthesis:** Click the purple **`Synthesize Structured SOAP Note`** button:
     - The AI parses the dialogue into the 4 structured quadrants:
       - **S (Subjective):** Occipital morning headaches, exertional chest tightness, Lisinopril compliance.
       - **O (Objective):** Correlates live vitals (BP 174/104, HR 88), ECG LVH findings, and cardiomegaly on chest X-ray.
       - **A (Assessment):** Uncontrolled Stage 2 Arterial Hypertension with LVH target-organ damage.
       - **P (Plan):** Lisinopril continuation, Amlodipine 5mg addition, urgent echocardiogram, low-sodium diet.
     - **Suggested Billing Codes:** Displays CPT `99214` (Moderate Complexity) and ICD-10 `I10` (Hypertension), `I51.7` (Cardiomegaly).
   - **EHR Sign-Off:** Click **`Sign & Commit to Patient Chart`**:
     - The note is cryptographically signed and committed to PostgreSQL.
     - The modal shows a green confirmation badge and transitions to the Historical Notes tab displaying the newly committed note (now 2 signed notes!).
   - Close the modal (`×`).
3. Now test **Autonomous AI Copilot SOAP Synthesis in Chat**:
   - Open John Doe's AI Assistant chat drawer.
   - Type in chat:
     > *"Please synthesize a formal SOAP consultation note for John Doe based on his severe hypertension and morning headaches."*
   - The AI Copilot autonomously executes the `synthesizeSoapNote` tool and streams the **Ambient Scribe AI SOAP Note Generative UI Card**:
     - Displays the structured 4-quadrant layout with encounter tags and suggested CPT/ICD-10 codes.
     - Click **`Sign & Commit Note to Chart`** directly on the chat card!
     - The button immediately updates to a verified green badge: **`✓ Signed & Committed to EHR Chart`**!


### Test M: Clinical Trial & Protocol Matching Engine (Epic 8)
1. On **John Doe's** patient card on the dashboard roster:
   - Notice the amber badge: **`1 Trials`** (or in the AI chat drawer header: **`Trials`**).
   - Click directly on the **`1 Trials`** button.
2. The **Clinical Trial & Protocol Matching Engine Modal** opens:
   - **Protocol Match Acuity:** Displays *"1 High-Probability Protocol Identified"*.
   - **ARREST-HTN (NCT-05189241):** Notice the prominent **`96% MATCH`** badge, Phase III classification, condition *"Cardiovascular & Resistant Hypertension"*, and sponsor *"NHLBI"*.
   - **Satisfied Inclusions Checklist:** Verified green checks (✓) for Age 45, SBP 174 mmHg, LVH (Sokolow-Lyon 48mm, CTR 0.61), and Lisinopril therapy.
   - **Exclusion Status:** Verified *"No disqualifying exclusion criteria identified"*.
   - **AI Protocol Matching Rationale:** Narrative detailing patient's severe refractory hypertension with objective target-organ hypertrophy.
   - **Protocol Enrollment:** Click **`Refer Patient & Enroll in Trial`**.
     - The status immediately updates to a verified green badge: **`✓ Patient Enrolled in Protocol`**!
   - Close the modal (`×`).
3. Now test **Autonomous AI Copilot Protocol Matching in Chat**:
   - Open John Doe's AI Assistant chat drawer.
   - Type in chat:
     > *"Are there any clinical trials or experimental protocols that John Doe qualifies for?"*
   - The AI Copilot autonomously executes the `matchClinicalTrials` tool and streams the **Clinical Trial & Protocol Eligibility Screener Generative UI Card**:
     - Displays candidate protocols (ARREST-HTN, PEN-DESENS) with match percentages, satisfied inclusion criteria, and trial referral guidance.
     - Displays the verified **`Enrolled`** status on ARREST-HTN.
     - Click **`Inspect All Protocol Criteria in Clinical Trials Studio`** to launch the full modal!
4. Test Exclusion Rules with **Robert Johnson**:
   - Open Robert Johnson's card (Day 7 post-op appendectomy).
   - Notice the trial matching engine flags **ONCO-PREVENT** as excluded with a red alert: *"CRITICAL EXCLUSION: Recent abdominal surgery within 30 days"*, validating hard safety rules!

---

### Test K: HIPAA Audit Trails & HL7 FHIR Interoperability Export (Epic 9)
1. **In-App HIPAA Security Ledger & Compliance Inspector:**
   - In the top navigation bar, click the **`🛡️ HIPAA Audit Log`** button.
   - The **HIPAA Security Ledger & Compliance Audit Trail** modal opens:
     - **Audit Metrics:** Observe live counters for *Total Audited Events*, *AI Copilot Retrieval Logs*, *Clinical Scribe Sign-offs*, and *HL7 FHIR v4.0 Exports*.
     - **Live Filter Toolbar:** Filter the table by Action (e.g. `VIEW_RECORD`, `AI_COPILOT_QUERY`, `SCRIBE_SOAP_COMMIT`, `TRIAL_ENROLLMENT`, `VISION_INSPECTION`, `FHIR_EXPORT`) or search by clinician/MRN.
     - **Compliance Ledger Table:** Review exact UTC timestamps, action badges, actor attribution (`doctor@medintel.com`), target patient MRN (`MED-10084`), and client IP.
     - **Compliance Export:** Click **`Export CSV`** or **`Export Audit JSON`** to test downloading official compliance records for hospital security inspections and OCR audits.
   - Click **`Close Audit Inspector`**.

2. **Standard HL7 FHIR Release 4.0.1 Export Modal:**
   - On **John Doe's** patient card, click the **`FHIR`** button.
   - The **HL7® FHIR® R4 Interoperability Bundle** modal opens:
     - **Bundle Overview:** Review compiled health resources:
       - 🧑 **Patient:** Demographics and official MRN `MED-10084`.
       - 🩺 **Observations:** LOINC-coded vitals (Blood pressure panel `85354-9`, Heart rate `8867-4`, SpO2 `2708-6`).
       - 🩻 **Diagnostic Reports:** Radiology scans (Chest X-Ray, 12-lead ECG) mapped to DICOM modality `RAD`/`EC` and LOINC `18748-4`.
       - 📝 **Document References:** Clinical progress notes (LOINC `11506-3`) with base64-encoded SOAP narrative attachments.
       - 🔬 **Research Subjects:** Precision protocol matches (ARREST-HTN) and consent status.
     - **Resource Inventory Tab:** Inspect individual FHIR resource JSON definitions.
     - **Raw FHIR JSON Tab:** View syntax-highlighted bundle JSON.
     - Click **`Copy JSON`** (copies full bundle to clipboard) or **`Download Bundle`** (downloads `FHIR_Bundle_Patient_1_John_Doe.json`).
   - Click **`Close Exporter`**.

3. **Autonomous AI Copilot FHIR Export in Chat:**
   - Click on **John Doe's** card to open the AI Assistant chat drawer.
   - Type in chat:
     > *"Export this patient's records as an HL7 FHIR bundle for electronic health exchange."*
   - The AI Copilot autonomously executes the `exportFhirBundle` tool and returns the **HL7® FHIR® R4 Interoperability Bundle Generative UI Card**:
     - Displays the verified US Core STU4 Release 4.0.1 badge.
     - Displays compiled resource pill breakdown (Patient: 1, Observations, Diagnostic Scans, Clinical Notes, Research Subjects).
     - Displays validated LOINC standards.
     - Click **`Inspect FHIR Bundle & Download`** to launch the interactive viewer directly from the chat conversation!
   - This export action is automatically logged in the PostgreSQL `AuditLog` table under 45 CFR § 164.312(b).

---

## 3. How to Start Services Manually (If Ever Stopped)

If you reboot your machine or close the terminals, run these 3 commands:

### Terminal 1: PostgreSQL Database
```powershell
& "F:\PostgreSQL\bin\pg_ctl.exe" start -D "F:\PostgreSQL\data"
```
*(Runs on port 5458)*

### Terminal 2: FastAPI Backend
```powershell
cd "f:\My Projects\ai-patient-platform\backend"
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\venv\Scripts\activate
uvicorn main:app --port 8000 --reload
```

### Terminal 3: Next.js Frontend
```powershell
cd "f:\My Projects\ai-patient-platform"
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.
