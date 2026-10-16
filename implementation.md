# Implementation History - AI Patient Record Intelligence Platform

This document logs the architectural changes and implementation steps taken to build the platform.

## How the Platform is Used (The User Journey)
This platform acts as an ultra-fast search engine and reading assistant for medical professionals, turning massive piles of complex medical PDFs into an interactive conversation that saves hours of time.

1. **Secure Login:** A medical professional logs into MedIntel securely to access their dashboard.
2. **Global Search:** They land on the search page(Home), viewing a grid of their recent patients color-coded by status (Critical, Stable, etc.). They can use the massive hero search bar to quickly find a specific patient or ask broad queries like, "Show me all my patients currently prescribed Metformin."
3. **Deep Dive:** Clicking on a patient (e.g., "John Doe") seamlessly slides open the AI Assistant sidebar.
The doctor sees "John Doe" on their schedule for the afternoon. They click on John's card.The AI Assistant sidebar smoothly slides in from the right. The AI automatically knows it is now talking specifically about John Doe.
4. **Adding New Medical Records (Data Ingestion):** If the doctor receives a massive 30-page discharge summary, they upload the PDF via the chat's paperclip icon. The FastAPI backend instantly chops it into vector embeddings and saves it to ChromaDB.
5. **The Co-Pilot Conversation:** The doctor can now chat with the AI (e.g., *"Does John have any history of severe allergic reactions to penicillin based on the records I just uploaded?"*). The AI uses RAG (`searchDocuments`) to find the answer in milliseconds, or uses the `calculator` tool to generate visual widgets for things like BMI calculations.

---
## Development Roadmap (Epics)

The development of the platform is broken down into four distinct, sequential Epics:

- **Epic 0: Project Scaffolding & Porting (Completed):** Transitioning the proof-of-concept AI chatbot into a structured, Next.js 15 App Router architecture. Setting up the Vercel AI SDK Agentic Loop and separating the chat interface into a modular `<ChatSidebar>` component.
- **Epic 1: Database & Authentication (Completed):** Implementing a robust data persistence layer using PostgreSQL and Prisma ORM. Securing the application by integrating NextAuth (Auth.js v5) with both Google and Credentials providers, and building a professional Pixabay-inspired login interface.
- **Epic 2: The Data Layer & Dashboard Integration (Upcoming):** Hooking up the frontend to the database. Replacing all hardcoded dummy data with live Prisma queries, creating the dynamic Patient Grid, and finalizing the layout functionality.
- **Epic 3: Multi-Tenant RAG & AI Upgrades (Future):** Linking the PostgreSQL database to the ChromaDB vector embeddings securely. Creating upload mechanisms for PDFs that automatically associate them with specific patients, ensuring the LLM's RAG context is perfectly filtered by patient ID.

---
## Epic 0: Project Scaffolding & Porting (Completed)

We transitioned from a basic "AI Chatbot" proof-of-concept into a structured, production-ready SaaS repository.

**Step 1: Scaffolding the New Next.js App**
- Initialized a brand new Next.js 15 repository (`ai-patient-platform`) using the App Router.
- Installed required dependencies: `ai`, `@ai-sdk/google`, `react-markdown`, and Tailwind typography plugins for Generative UI formatting.

**Step 2: Porting the AI Microservice (FastAPI)**
- Transferred the `backend` folder containing `main.py` and `requirements.txt`.
- Set up a fresh Python virtual environment.
- Updated the FastAPI CORS middleware in `main.py` to allow traffic from `localhost:3000` (and `3001` as a fallback).
- *Note: We intentionally did not port the old ChromaDB vector files, as the new platform will eventually require multi-tenant data isolation.*

**Step 3: Porting the Agentic Loop**
- Ported the highly advanced `src/app/api/chat/route.ts` Vercel AI SDK route.
- Retained the Gemini 3.5 Flash Lite configuration and the `stopWhen: isStepCount(5)` Agentic Loop that allows the model to autonomously execute the `calculator`, `getWeather`, and `searchDocuments` tools.

**Step 4: Refactoring the UI into a Sidebar Component**
- In the previous project, the chatbot consumed the entire page (`page.tsx`).
- We completely refactored this logic into a reusable React component: `src/components/ChatSidebar.tsx`.
- This allows the AI Assistant to be mounted on the right side of *any* page within the platform.

**Step 5: Dashboard Layout**
- Created a new `src/app/page.tsx` that acts as the primary layout for the SaaS application.
- Implemented a left navigation sidebar, a central data area (for Patient Summaries and Health Trends), and embedded the `<ChatSidebar />` on the right.
- Included a hardcoded Medical Disclaimer alert to ensure compliance and user safety.

---

## Epic 1: Database & Authentication (Completed)

We implemented a robust persistence layer and authentication framework to transition the platform from dummy data to a secure, multi-tenant application.

**Step 1: PostgreSQL & Prisma Initialization**
- Configured **Prisma v7** with a local PostgreSQL database (`medintel`).
- Handled Prisma v7 breaking changes by moving the database connection string from `schema.prisma` into a dedicated `prisma.config.ts` file, and integrating the `@prisma/adapter-pg` driver to replace the deprecated Rust query engine.
- Designed the relational schema featuring the core models: `User`, `Patient`, and `Document`.
- Created a robust Seed Script (`prisma/seed.ts`) to automatically populate the database with a dummy doctor profile and initial patient records.

**Step 2: Auth.js (NextAuth) Integration**
- Installed `next-auth@beta` (Auth.js v5) and `@auth/prisma-adapter`.
- Configured `src/auth.ts` to support dual authentication methods:
  - **Credentials Provider:** Standard Email/Password login (using `bcryptjs` for secure hashing).
  - **Google OAuth Provider:** For seamless SSO access.
- Wrapped the application in a NextAuth `<SessionProvider>` to manage global authentication state.

**Step 3: Pixabay-Inspired Login UI**
- Built a highly polished, custom authentication page (`src/app/login/page.tsx`) mirroring the aesthetic of the Pixabay login modal.
- Features dual-pane design with a medical/nature stock background, floating labels, and integrated Google/Credentials toggles.
- Implemented robust Client-Side Authentication using `signIn` from `next-auth/react` to bypass known React 19 Server Action redirect bugs, ensuring a perfect user experience with explicit error handling.
- Updated the main Dashboard Navbar to conditionally render a User Profile Avatar and "Sign Out" button when authenticated.

---

## Epic 2: The Data Layer & Dashboard Integration (Completed)

*Successfully replaced hardcoded frontend mockup data with live PostgreSQL queries and bridged the dashboard with the AI Assistant for patient-specific context awareness.*

**Completed Steps:**
1. **Server-Side Prisma Queries:**
   - Implemented `src/app/actions/patients.ts` with Next.js Server Actions using a cached Prisma singleton client (`src/lib/prisma.ts`).
   - Automatically scopes queried patients to the currently authenticated doctor's session email.
2. **Dashboard Dynamic Rendering & Skeleton UI:**
   - Removed the static `DUMMY_PATIENTS` array from `src/app/page.tsx`.
   - Added animated, pulsating loading skeleton cards to provide a smooth, premium loading state while Prisma fetches from PostgreSQL.
3. **Component Prop Passing & Context Isolation:**
   - Modified `<ChatSidebar>` signature in `src/components/ChatSidebar.tsx` to accept `patientId`, `patient`, and `onClose`.
   - Wired `key={selectedPatient}` on `<ChatSidebar>` so selecting a different patient immediately unmounts previous message history and re-initializes a fresh, patient-specific conversation.
   - Updated the ChatSidebar header to display the active patient's name, age, ID, and color-coded status badge (Critical / Stable / Review), plus an integrated close button.
4. **Vercel AI SDK Transport & System Prompt Injection:**
   - Configured `DefaultChatTransport` with `{ body: { patientId } }` in `useChat`.
   - Updated `src/app/api/chat/route.ts` to extract `patientId` from request payloads, query PostgreSQL for the patient's record, and dynamically inject the clinical details (Name, Age, Status, Medical Summary) into the Gemini 2.5 Flash system prompt.
   - Verified that the AI Assistant reliably differentiates between patients and provides tailored clinical responses without prompt leakage.

---

## Epic 3: Multi-Tenant RAG & AI Upgrades (Completed)

*Successfully bridged the PostgreSQL relational database with the ChromaDB vector database, implementing strict multi-tenant clinical partitioning and automated document tracking.*

**Completed Steps:**
1. **Multi-Tenant Vector Ingestion (`backend/main.py`):**
   - Updated the FastAPI `/api/upload` endpoint to accept `patient_id: Optional[int] = Form(None)`.
   - Namespaced chunk IDs with `patient_{patient_id}_` to avoid chunk collision when different patients upload documents with identical filenames.
   - Attached `{"source": file.filename, "patient_id": patient_id}` metadata to each chunk embedded with `gemini-embedding-001`.
2. **Relational Document Tracking (`src/app/actions/patients.ts`):**
   - Implemented `addPatientDocument(patientId, fileName)` and `getPatientDocuments(patientId)` Server Actions.
   - Automatically writes a record to the PostgreSQL `Document` table linked to the `Patient` via foreign key whenever a clinical PDF is uploaded.
   - Automatically touches the patient's `updatedAt` timestamp so the dashboard reflects recent record activity.
3. **Interactive UI & Real-Time Record Badging:**
   - Enriched `<ChatSidebar />` with an active "Linked Medical Records" bar showing live counts, chips of indexed files, and a quick "+ Upload PDF" button.
   - Linked document upload completion to the parent dashboard via `onDocumentUploaded` callback in `src/app/page.tsx`, updating live record counters on patient cards without page refresh.
4. **Partitioned Semantic Retrieval (`backend/main.py`):**
   - Enhanced `/api/retrieve` to accept `patient_id: Optional[int]` and enforce ChromaDB metadata filtering: `where={"patient_id": request.patient_id}`.
   - Formats matched document chunks with explicit source citations (`[Source: filename.pdf]: content`) for clinical attribution.
5. **Vercel AI SDK Tool Integration (`src/app/api/chat/route.ts`):**
   - Updated `searchDocuments` tool to pass `patient_id: patientId` directly to the FastAPI `/api/retrieve` endpoint.
   - Injected indexed document filenames directly into the Gemini 2.5 Flash system prompt context, enabling the model to know what reports exist before tool invocation.
   - Added robust query fallback to ensure search terms are never lost if the LLM omits the parameter.
6. **Multi-Tenant Boundary Verification:**
   - Validated end-to-end with real PDF uploads for John Doe (Echocardiogram) and Jane Smith (Allergy Panel).
   - Confirmed zero cross-patient data leakage: Jane Smith's queries have no access to John Doe's ejection fraction, and John Doe has no access to Jane Smith's penicillin allergy contraindications.

---

## Epic 4: Advanced Generative UI, Analytics & Clinical Reporting (Upcoming)

*This epic will focus on rich interactive clinical visualizations, patient analytics, and automated discharge summaries.*

**Planned Steps:**
- Create dynamic Generative UI widgets for lab results (e.g., blood pressure dials, allergy warning cards, ECG waveform previews).
- Add an Analytics tab visualizing patient cohort metrics (Critical vs Stable ratio, recent admissions).
- Implement an automated "Generate Clinical Summary" agentic workflow exporting signed medical summaries as downloadable PDFs.
