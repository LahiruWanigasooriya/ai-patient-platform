# MedIntel – AI Patient Record Intelligence Platform

<p align="center">
  <img src="public/logo.png" alt="MedIntel AI Platform Logo" width="360" />
</p>

<p align="center">
  <strong>Next-Generation Clinical Decision Support & Multimodal Agentic Workflow Orchestration</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js" alt="Next.js 15" />
  <img src="https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/FastAPI-Python_3.11+-009688?style=flat-square&logo=fastapi" alt="FastAPI" />
  <img src="https://img.shields.io/badge/PostgreSQL-Prisma_ORM-336791?style=flat-square&logo=postgresql" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Vector_DB-ChromaDB-red?style=flat-square" alt="ChromaDB" />
  <img src="https://img.shields.io/badge/Google_Gemini-Agentic_AI-4285F4?style=flat-square&logo=google" alt="Google Gemini" />
  <img src="https://img.shields.io/badge/LangChain-Enabled-1C3C3C?style=flat-square" alt="LangChain" />
  <img src="https://img.shields.io/badge/LangGraph-Workflows-orange?style=flat-square" alt="LangGraph" />
  <img src="https://img.shields.io/badge/HL7_FHIR-Release_4.0.1-firebrick?style=flat-square" alt="HL7 FHIR" />
</p>

---

## Overview

Designed and developed an AI-powered healthcare platform that transforms patient records into actionable clinical insights using Generative AI, Retrieval-Augmented Generation (RAG), intelligent tool calling, and graph-based AI workflow orchestration.

MedIntel combines a modern web application with an AI-powered backend to help healthcare professionals retrieve patient-specific medical information, analyze clinical history, identify potential medication safety concerns, and generate contextual responses grounded in uploaded medical records.

---

### Key Features & Technical Highlights

- **Agentic RAG Pipeline:** Implemented a patient-aware RAG pipeline using LangChain, ChromaDB, and Google Gemini to process uploaded medical documents, retrieve relevant passages, and generate context-grounded responses to clinical questions.
- **LangGraph Clinical AI Workflows:** Built stateful, multi-step AI workflows using LangGraph to orchestrate patient-record retrieval, relevant-history summarization, medication safety checks, and final response generation.
- **Context-Aware Clinical Assistant:** Developed an AI assistant capable of answering questions about uploaded patient records, retrieving relevant medication information, and distinguishing document-supported facts from AI-generated interpretations.
- **Medical Record Intelligence:** Integrated patient-specific document retrieval, clinical summaries, vital-sign trends, and historical medical information into a unified healthcare interface.
- **Medication Safety Analysis:** Integrated medication interaction and allergy-checking tools into clinical workflows to identify potential safety concerns using available patient and medication information.
- **AI-Assisted Medical Image Analysis:** Developed workflows for analyzing medical images and clinical data, including X-rays, ECGs, and laboratory reports.
- **Clinical Documentation Automation:** Implemented voice-to-text clinical documentation with AI-assisted SOAP note generation and support for ICD/CPT coding.
- **Healthcare Data Interoperability:** Implemented HL7 FHIR R4 export functionality for supported patient data, enabling structured exchange with compatible healthcare systems.
- **Security and Auditability:** Integrated authentication, patient-scoped data access, and audit logging to support access control and traceability.

---

### Technology Stack

- **Frontend:** Next.js 15, React, TypeScript, Tailwind CSS, Lucide React
- **Backend:** FastAPI, Python, PostgreSQL, Prisma ORM
- **AI & Machine Learning:** Google Gemini, LangChain, LangGraph, Retrieval-Augmented Generation (RAG), LLM Tool Calling, Vector Embeddings, ChromaDB
- **Authentication & Infrastructure:** Auth.js (NextAuth v5), Docker
- **Healthcare Standards:** HL7® FHIR® Release 4.0.1, LOINC, ICD-10, CPT Coding

---

### AI Architecture

LangChain powers the document retrieval pipeline and reusable AI components, including document processing, contextual retrieval, prompt construction, and tool integration. LangGraph coordinates multi-step clinical workflows through state management and conditional execution, connecting patient-record retrieval, clinical summarization, medication safety checks, and response generation into a structured workflow.

```mermaid
graph TD
    A[Clinician Query / Clinical Event] --> B[LangGraph Clinical State Graph]
    B --> C{Clinical Intent Classification}
    
    C -->|Document Retrieval| D[LangChain RAG Node: ChromaDB Vector Query]
    C -->|Prescription Check| E[Pharmacology Node: DDI & Allergy Engine]
    C -->|Hemodynamic Trends| F[Physiological Node: Vitals Trajectory]
    C -->|Diagnostic Imaging| G[Multimodal Vision Node: X-Ray / ECG / Labs]
    C -->|Encounter Recording| H[Ambient Scribe Node: SOAP Synthesizer]
    C -->|Health Interop| I[Interoperability Node: HL7 FHIR R4 Exporter]
    
    D --> J[Context Synthesis & Attribution Verification]
    E --> J
    F --> J
    G --> J
    H --> J
    I --> J
    
    J --> K[HIPAA Compliance & Audit Logging Engine]
    K --> L[Interactive Generative UI Card in Clinical Copilot]
```

**Project Focus:** Healthcare AI • Generative AI • Agentic AI • RAG • LangChain • LangGraph • Clinical NLP • Vector Search • LLM Orchestration • Healthcare Interoperability

---

## System Architecture & Modules

| Module | Technologies | Description |
|---|---|---|
| **Web Dashboard & UI** | Next.js 15, React 19, Tailwind CSS | High-performance clinical roster, responsive patient cards, and demographic cohort analytics. |
| **Agentic AI Copilot** | Google Gemini, LangChain, LangGraph | Contextual chatbot with patient partitioning, streaming Generative UI, and DevTools-style resizable panel. |
| **Vector Engine (RAG)** | ChromaDB, PyPDF2, LangChain Splitters | Multi-tenant semantic chunking and cosine-similarity vector retrieval partitioned by patient ID. |
| **Relational EHR DB** | PostgreSQL, Prisma ORM | Relational models for Users, Patients, Documents, Vitals, Images, Notes, and Audit Logs. |
| **Pharmacological Engine** | Agentic Rule Matrix, Zod Validation | Automated detection of fatal drug-drug interactions (e.g. Warfarin + NSAIDs) and allergy cross-reactivity. |
| **Radiology Vision** | Multimodal Gemini Vision | Computer-aided diagnostic imaging evaluation for Chest X-Rays, 12-lead ECG strips, and laboratory panels. |
| **Ambient AI Scribe** | Web Speech API, Clinical NLP | Voice dictation studio with automated 4-quadrant SOAP note generation (Subjective, Objective, Assessment, Plan) with ICD-10/CPT codes. |
| **Healthcare Interoperability** | HL7® FHIR® R4.0.1 Specification | Standard JSON bundle generation incorporating Patient, Observation, DiagnosticReport, and DocumentReference resources. |
| **HIPAA Security Ledger** | PostgreSQL Audit Log Engine | Immutable access logs tracking patient record views, vector searches, scribe signatures, and export events (45 CFR § 164.312). |

---

## Getting Started: Installation & Setup Guide

Follow this step-by-step guide to run the complete MedIntel platform locally.

### Prerequisites

Ensure you have the following installed on your system:
1. **Node.js:** v18.18.0 or newer (v20+ recommended)
2. **Python:** v3.10 or newer (v3.11 recommended)
3. **PostgreSQL:** Running locally or via Docker
4. **Google Gemini API Key:** Obtain from [Google AI Studio](https://aistudio.google.com/)

---

### Step 1: Clone the Repository

```bash
git clone https://github.com/your-username/ai-patient-platform.git
cd ai-patient-platform
```

---

### Step 2: Configure Environment Variables

#### 1. Root Directory Environment (`.env` & `.env.local`):

Create `.env` in the root directory:
```env
# PostgreSQL Database Connection URL
DATABASE_URL="postgresql://postgres:postgresql@localhost:5458/medintel"

# Auth.js / NextAuth Secret (Generate via `openssl rand -hex 32` or arbitrary string)
AUTH_SECRET="f0a8d7a1b2c3d4e5f6g7h8i9j0k1l2m3"

# Optional OAuth Provider Credentials (Fallback credentials available)
GOOGLE_CLIENT_ID="placeholder_client_id"
GOOGLE_CLIENT_SECRET="placeholder_client_secret"
```

Create `.env.local` in the root directory:
```env
# Google Gemini API Key for Agentic Clinical Copilot & RAG
GOOGLE_GENERATIVE_AI_API_KEY="your_google_gemini_api_key_here"
```

---

### Step 3: Database Setup (PostgreSQL & Prisma)

1. **Start PostgreSQL:** Ensure PostgreSQL is running on the port configured in `DATABASE_URL` (e.g. `5458` or default `5432`).
2. **Push Prisma Schema:**
   ```bash
   npx prisma db push
   ```
3. **Generate Prisma Client:**
   ```bash
   npx prisma generate
   ```
4. **Seed Database with Clinical Demo Records:**
   ```bash
   npx tsx prisma/seed.ts
   npx tsx prisma/seed_vitals.ts
   npx tsx prisma/seed_images.ts
   npx tsx prisma/seed_notes.ts
   ```

---

### Step 4: Setup & Run Python FastAPI Backend (Vector DB & RAG)

Open a new terminal window:

```bash
cd backend

# Create Python virtual environment
python -m venv venv

# Activate virtual environment
# Windows (PowerShell):
.\venv\Scripts\activate
# macOS / Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run FastAPI backend with Uvicorn
uvicorn main:app --port 8000 --reload
```
The FastAPI backend will start at `http://localhost:8000`. ChromaDB vector store will initialize under `backend/chroma_db/`.

---

### Step 5: Setup & Run Next.js Frontend

In the root directory terminal:

```bash
# Install frontend dependencies
npm install

# Start Next.js development server
npm run dev
```

Open your browser and navigate to:
```
http://localhost:3000
```

---

## Clinician Demo Credentials

The database is pre-seeded with authenticated clinician accounts:

| Role | Email | Password |
|---|---|---|
| **Lead Attending Physician** | `doctor@medintel.com` | `password123` |

---

## Verification & Interactive Feature Guide

### 1. Patient Roster & Acuity Triage
- Log in and view real-time patient cards with live clinical summary, acuity status (`Critical`, `Review`, `Stable`), document count, and historical vitals.
- Use the **Global Search Bar** or click **Quick Filter Chips** (`Critical Acuity`, `Hypertension`, `Under Review`, `Cardiology`) to filter records instantly.

### 2. Multi-Tenant Agentic RAG Pipeline
- Click on **John Doe** (`Critical • Age 45`) to open the resizable AI diagnostic sidebar.
- Type in chat:
  > *"What is this patient's measured ejection fraction according to his echocardiogram report?"*
- LangChain executes the patient-scoped vector retrieval tool against ChromaDB and cites the exact indexed chunk confirming **LVEF of 52%** and left ventricular hypertrophy.

### 3. Medication Safety & DDI Surveillance
- In John Doe's active chat session, enter:
  > *"Can I prescribe 400mg Ibuprofen for his headache?"*
- LangGraph triggers the pharmacological safety workflow, cross-referencing active medications (Lisinopril + Metformin) against medical guidelines.
- The assistant displays a **Critical Pharmacology Alert Card** highlighting severe GI hemorrhage and acute kidney injury risk, recommending **Acetaminophen (Paracetamol)** as a safer analgesic alternative.

### 4. Longitudinal Physiological Trajectory Modeling
- Click the **Trending Up** icon on any patient card or request:
  > *"Show me John Doe's vitals trajectory."*
- View the interactive hemodynamic telemetry modal charting Systolic, Diastolic, MAP, and Heart Rate across historical encounters with AHA clinical crisis threshold lines ($140\text{ mmHg}$).

### 5. Multimodal Radiology & Diagnostic Vision
- On John Doe's card, click **`2 Scans`** to inspect the PA Chest Radiograph and 12-lead ECG tracing.
- In chat, prompt:
  > *"Analyze John Doe's chest radiograph for signs of heart failure."*
- The AI executes `analyzeMedicalScan`, identifying cardiomegaly (CTR ~0.61) and cephalization, accompanied by an interactive diagnostic Generative UI card.

### 6. Ambient AI Scribe & Clinical Voice Dictation
- Click **`1 Notes`** or navigate to the Ambient Scribe studio.
- Record live dictation or select a pre-configured clinical scenario (`Severe Hypertension Follow-Up`).
- Click **`Synthesize Structured SOAP Note`** to generate structured Subjective, Objective, Assessment, and Plan documentation mapped to ICD-10 (`I10`) and CPT (`99214`) codes, then commit the signed note to the patient's EHR chart.

### 7. HL7® FHIR® R4 Export & HIPAA Security Audit Trail
- Click **`Get FHIR`** to view and download standardized HL7 FHIR Release 4.0.1 JSON bundles.
- Click **`HIPAA Audit Log`** in the navigation bar to inspect immutable compliance audit logs recorded under 45 CFR § 164.312(b).

---

## Directory Structure

```
ai-patient-platform/
├── backend/
│   ├── chroma_db/             # Local ChromaDB multi-tenant vector storage
│   ├── uploads/               # Partitioned clinical PDF storage
│   ├── main.py                # FastAPI endpoints (PDF ingest, vector search, chunks)
│   └── requirements.txt       # Python backend dependencies
├── prisma/
│   ├── schema.prisma          # PostgreSQL relational schema
│   ├── seed.ts                # Doctor & patient roster database seed
│   ├── seed_vitals.ts         # Longitudinal vitals telemetry seed
│   ├── seed_images.ts         # Diagnostic radiology scans seed
│   └── seed_notes.ts          # Clinical progress notes seed
├── public/
│   ├── logo.png               # Official MedIntel brand logo
│   └── medical_scans/         # High-resolution clinical diagnostic SVG assets
├── src/
│   ├── app/
│   │   ├── actions/           # Next.js Server Actions (patients, auth, user profile)
│   │   ├── api/
│   │   │   ├── auth/          # Auth.js authentication routes
│   │   │   └── chat/          # Google Gemini AI copilot route & LangGraph tool handlers
│   │   ├── login/             # Authentication & login interface
│   │   └── page.tsx           # Dashboard orchestration layer
│   └── components/
│       ├── AddPatientModal.tsx          # Dynamic patient admission workflow
│       ├── AmbientScribeModal.tsx       # Voice dictation & SOAP note studio
│       ├── AuditTrailModal.tsx          # HIPAA compliance & security ledger
│       ├── ChatSidebar.tsx              # Resizable AI clinical copilot & GenUI cards
│       ├── CohortAnalyticsView.tsx      # Clinical KPI cards & population telemetry
│       ├── DeleteConfirmationModal.tsx  # Deletion safeguard dialog
│       ├── DocumentViewerModal.tsx      # In-app PDF & semantic chunk citation viewer
│       ├── EditPatientModal.tsx         # Patient record update & document uploader
│       ├── FhirExportModal.tsx          # HL7 FHIR v4.0.1 interoperability viewer
│       ├── HeroSearch.tsx               # Clinical hero banner with responsive search
│       ├── ImageAnalysisModal.tsx       # Multimodal radiology vision inspector
│       ├── Navbar.tsx                   # Responsive top navigation with mobile hamburger
│       ├── PatientCard.tsx              # Mobile/tablet/desktop responsive clinical card
│       ├── PatientFilterBar.tsx         # Roster controls & acuity status filter pills
│       ├── ResizableSidebar.tsx         # DevTools-style splitter wrapper component
│       ├── SettingsModal.tsx            # Preferences & theme customizer
│       ├── UserProfileModal.tsx         # Clinician credentials & profile settings
│       └── VitalsTrajectoryModal.tsx    # Longitudinal hemodynamic curves modal
├── implementation.md                    # Detailed engineering documentation
├── package.json
└── tsconfig.json
```

---

## Security & Compliance Disclaimer

> **Clinical Decision Support Notice:** MedIntel is an agentic clinical decision support and workflow acceleration tool designed to assist healthcare professionals. All diagnostic interpretations, pharmacological recommendations, and generated SOAP notes must be cross-verified and confirmed by licensed medical practitioners prior to clinical action.
