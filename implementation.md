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

## Epic 2: The Data Layer & Dashboard Integration (Upcoming)

*This epic will cover replacing the hardcoded frontend data with live Prisma database queries.*

**Planned Steps:**
- Establish server-side Prisma calls in `page.tsx` to fetch the authenticated doctor's patients.
- Remove the `DUMMY_PATIENTS` array and replace it with real PostgreSQL data.
- Ensure the selected patient's ID is properly passed to the `<ChatSidebar>` component.

---

## Epic 3: Multi-Tenant RAG & AI Upgrades (Future)

*This epic will cover the complex integration of the relational database with the AI vector database (ChromaDB).*

**Planned Steps:**
- Create an upload mechanism for medical PDFs via the Next.js frontend.
- Send the PDF to the FastAPI backend, process it, and generate vector embeddings.
- Store the embeddings in ChromaDB, and save the metadata (Document ID, Patient ID) in PostgreSQL.
- Update the Vercel AI SDK tools (`searchDocuments`) to accept a `patientId` parameter, ensuring the LLM can only query ChromaDB for documents belonging to the currently selected patient.
