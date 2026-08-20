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
