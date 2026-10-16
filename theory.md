# AI Patient Record Intelligence Platform - Theory & Concepts

This document tracks the theoretical concepts underlying the AI Patient Record Intelligence Platform.

## 1. Core Architecture
The platform is built on a decoupled, microservice-style architecture:
- **Next.js (Frontend & Orchestration):** Handles the user interface, authentication, and the core Agentic Loop. It uses the Vercel AI SDK to stream responses from the LLM and orchestrate tool execution.
- **FastAPI (AI Backend):** A Python microservice dedicated to heavy I/O and Machine Learning tasks. It handles PDF parsing, vector embedding generation, and queries the local ChromaDB database.

## 2. Generative AI & LLMs
- **LLM APIs (Gemini):** We use Google's Gemini 3.5 Flash Lite model for lightning-fast inference. 
- **Prompt Engineering:** The system prompt instructs the AI to act as a supportive medical assistant. We use techniques to ensure the AI strictly acts as an information-retrieval tool, not a diagnostic engine.
- **Tokens & Context Window:** LLMs process text in "tokens". Because medical documents are massive, we cannot fit entire patient histories into the context window. This necessitates RAG.

## 3. Retrieval-Augmented Generation (RAG)
RAG grounds the LLM's responses in factual data.
- **Vector Embeddings (Gemini Embedding 2):** Text is converted into high-dimensional numerical arrays (vectors) that capture semantic meaning.
- **Vector Database (ChromaDB):** Stores these vectors. When a doctor asks a question, the query is embedded, and ChromaDB performs a nearest-neighbor mathematical search to find the most relevant chunks of a patient's medical history.

## 4. Agentic AI & Tool Calling
This system is an **Agent**, not just a chatbot.
- **Tool Calling:** The LLM has a "toolbelt" (e.g., `searchDocuments`, `calculator`). It autonomously decides when it needs to search a PDF or perform math.
- **Agentic Loop:** Driven by Vercel AI SDK (`stopWhen: isStepCount(X)`), the system allows the LLM to call a tool, wait for the backend to return the data, and then think again to synthesize a final answer.
- **Agent State & Memory:** The Next.js frontend maintains the short-term memory (the message array). Long-term memory and patient data isolation will be handled via PostgreSQL metadata filtering.

## 5. Generative UI
Instead of relying on plain text, the frontend intercepts tool completion states (`output-available`). If the agent performs a calculation or fetches data, the frontend dynamically renders beautiful, structured React components (like a math receipt or a health trend chart) directly inside the chat interface.

## 6. Database & Persistence Layer
While the AI processes unstructured PDFs, the platform requires a robust persistence layer to manage relational state.

### PostgreSQL & Prisma ORM
- **PostgreSQL:** A highly scalable, open-source relational database management system. We chose PostgreSQL for its robust JSON support, strict ACID compliance, and excellent performance with large clinical datasets. It stores the `User` profiles (Doctors), their assigned `Patient` rosters, and the metadata for each uploaded `Document`.
- **Prisma ORM (v7):** Object-Relational Mapping (ORM) bridges the gap between our TypeScript code and the SQL database. Prisma allows us to define our database schema using a clean, readable `.prisma` file, automatically handles database migrations, and generates a fully type-safe database client (`PrismaClient`). This ensures that any queries to our database are strictly checked at compile-time, eliminating entire classes of runtime errors.

### Security Architecture
- **Multi-Tenant Security:** By creating a strict relational link between a `Document` and a `Patient` in PostgreSQL, we ensure that the RAG pipeline can dynamically filter ChromaDB searches. This guarantees that one patient's medical records cannot leak into another patient's query context.
- **Authentication (Auth.js):** Access is gated using NextAuth v5, supporting both secure credentials (hashed via bcrypt) and modern OAuth providers for seamless hospital integration. The UI heavily utilizes Client-Side Authentication (`next-auth/react`) to bypass React 19 Server Action redirect quirks, ensuring a seamless user experience.

## 7. Dynamic Context Injection & Clinical Context Isolation
A critical vulnerability in multi-patient clinical interfaces is **context contamination**—where insights, diagnoses, or notes from Patient A bleed into the LLM conversation for Patient B. MedIntel addresses this through a dual-layer isolation model:

1. **Client-Side Component Isolation (`key={selectedPatient}`):**
   - In React, changing the `key` prop on a component forces React to completely unmount the old instance and mount a fresh one.
   - When a physician switches from John Doe to Jane Smith, the entire `<ChatSidebar>` component unmounts. In-memory message states, uploaded file tokens, and conversation history are immediately wiped from client memory.
2. **Server-Side Dynamic Prompt Enrichment:**
   - Every outbound chat request transports the active `patientId` through the Vercel AI SDK HTTP transport layer.
   - The `/api/chat` server route queries PostgreSQL in real-time, fetching the verified demographic and medical summary directly from the primary relational source of truth.
   - The server dynamically constructs the LLM's `system` instructions with this verified patient record before any user tokens reach the model. This guarantees that hallucination risk is minimized and that the AI assistant operates strictly within the boundaries of the active patient file.

## 8. Multi-Tenant Retrieval-Augmented Generation (RAG) & Vector Database Partitioning
In traditional single-user RAG, all embeddings reside in a single shared vector space. In clinical systems, this presents an unacceptable compliance and safety hazard: if Doctor A searches for "diabetes treatment", an unpartitioned vector database might return high-similarity chunks belonging to a completely different patient.

MedIntel implements a multi-tenant vector architecture combining relational metadata with vector index filtering:

1. **Deterministic Metadata Partitioning:**
   - Every document chunk ingested into ChromaDB is tagged with immutable metadata: `{"source": file.filename, "patient_id": patient_id}`.
   - When the LLM calls the retrieval tool, the current `patientId` is enforced at the query boundary using ChromaDB's boolean filter: `where={"patient_id": request.patient_id}`.
   - The vector similarity search is mathematically restricted *only* to vectors associated with that specific patient ID, making cross-patient data retrieval mathematically impossible.

2. **Chunk ID Namespacing:**
   - Document chunks are assigned namespaced identifiers: `patient_{patient_id}_{filename}_chunk_{index}`.
   - This ensures that if two patients upload files with identical standard clinical names (e.g., `blood_test.pdf`), their chunk representations never overwrite or collide within the vector store.

3. **Dual-Database Synchronization:**
   - **PostgreSQL (ACID Relational Source of Truth):** Tracks the existence, ownership, timestamps, and foreign key relationships of uploaded medical documents (`Document` model).
   - **ChromaDB (Vector Engine):** Stores high-dimensional numerical embeddings (`gemini-embedding-001`, 3072 dimensions) and handles semantic text retrieval.
   - Synchronizing both guarantees that the platform maintains clinical auditability in SQL while leveraging sub-second semantic retrieval in AI vector storage.

4. **Source Attribution & Grounding:**
   - Retrieved context strings are prefixed with explicit document headers (`[Source: filename.pdf]`).
   - This grounds the LLM to cite specific diagnostic reports (e.g., echocardiogram vs allergy panel) when answering clinical inquiries, eliminating ungrounded assertions.

