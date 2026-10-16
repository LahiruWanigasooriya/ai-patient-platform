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
