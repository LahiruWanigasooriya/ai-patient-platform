# How to Run the AI Patient Record Intelligence Platform

This project requires both a Next.js frontend and a Python FastAPI backend to operate.

---

## 1. Start the Backend (FastAPI Python)

The backend handles the ChromaDB Vector Database, PDF extraction, and Embeddings. 
You must start this first.

1. Open a terminal in the root directory: `f:\My Projects\ai-patient-platform`
2. Navigate to the backend folder:
   ```bash
   cd backend
   ```
3. Activate the virtual environment (Windows):
   ```bash
   venv\Scripts\activate
   ```
4. Start the Uvicorn server:
   ```bash
   uvicorn main:app --port 8000
   ```
*(Leave this terminal running in the background).*

---

## 2. Start the Frontend (Next.js)

The frontend manages the UI Dashboard, Authentication, and the Vercel AI SDK Agentic Loop.

1. Open a **new, separate terminal** in the root directory: `f:\My Projects\ai-patient-platform`
2. Start the development server:
   ```bash
   npm run dev
   ```
3. Open your browser and navigate to:
   `http://localhost:3000`

*(If port 3000 is blocked, Next.js will automatically try port 3001. Ensure you check the terminal output for the correct Local URL).*
