from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from typing import Optional
import PyPDF2
import io
import os
import chromadb
import chromadb.utils.embedding_functions as embedding_functions

# Load environment variables from .env.local if present
load_dotenv(dotenv_path="../.env.local")

app = FastAPI(title="AI Chatbot Backend - Phase 2")

# Initialize ChromaDB persistent client
chroma_client = chromadb.PersistentClient(path="./chroma_db")

from google import genai
from chromadb import Documents, EmbeddingFunction, Embeddings

class GeminiEmbeddingFunction(EmbeddingFunction):
    def __init__(self, api_key: str):
        self.client = genai.Client(api_key=api_key)
        
    def __call__(self, input: Documents) -> Embeddings:
        embeddings = []
        for text in input:
            response = self.client.models.embed_content(
                model='gemini-embedding-001',
                contents=text
            )
            embeddings.append(response.embeddings[0].values)
        return embeddings

# Configure Gemini Embedding Function using our custom class
google_ef = GeminiEmbeddingFunction(
    api_key=os.environ.get("GOOGLE_GENERATIVE_AI_API_KEY")
)

# Create or get the collection
collection = chroma_client.get_or_create_collection(
    name="documents",
    embedding_function=google_ef
)

# Allow requests from our Next.js frontend (default port 3000 and 3001)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
async def health_check():
    return {"status": "ok", "message": "FastAPI backend is running!"}

@app.post("/api/upload")
async def upload_pdf(
    file: UploadFile = File(...),
    patient_id: Optional[int] = Form(None)
):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")
    
    try:
        # Read the file content into memory
        contents = await file.read()
        pdf_reader = PyPDF2.PdfReader(io.BytesIO(contents))
        
        extracted_text = ""
        for page in pdf_reader.pages:
            text = page.extract_text()
            if text:
                extracted_text += text + "\n"
        
        # Step 4: Chunking
        from langchain_text_splitters import RecursiveCharacterTextSplitter
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000, 
            chunk_overlap=200,
            separators=["\n\n", "\n", " ", ""]
        )
        chunks = text_splitter.split_text(extracted_text)

        # Step 5: Vector Database & Embeddings
        # Prefix chunk IDs with patient_id if available to avoid cross-patient collisions
        chunk_prefix = f"patient_{patient_id}_" if patient_id is not None else ""
        ids = [f"{chunk_prefix}{file.filename}_chunk_{i}" for i in range(len(chunks))]
        
        # We attach metadata to know where the chunks came from and partition by patient_id
        metadatas = [
            {"source": file.filename, "patient_id": patient_id} if patient_id is not None else {"source": file.filename}
            for _ in range(len(chunks))
        ]

        # Add to ChromaDB. The GoogleGenerativeAiEmbeddingFunction will automatically 
        # call the Gemini API to embed these chunks behind the scenes!
        collection.add(
            documents=chunks,
            metadatas=metadatas,
            ids=ids
        )

        return {
            "status": "success", 
            "filename": file.filename, 
            "patient_id": patient_id,
            "pages_processed": len(pdf_reader.pages),
            "chunks_created": len(chunks),
            "chromadb_status": "Chunks successfully embedded and stored in Vector DB.",
            "first_chunk_preview": chunks[0][:200] + "..." if chunks else ""
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process PDF: {str(e)}")

from pydantic import BaseModel

class QueryRequest(BaseModel):
    query: str
    n_results: int = 3
    patient_id: Optional[int] = None

@app.post("/api/retrieve")
async def retrieve_context(request: QueryRequest):
    try:
        where_filter = None
        if request.patient_id is not None:
            where_filter = {"patient_id": request.patient_id}

        # Query ChromaDB using the same embedding function
        results = collection.query(
            query_texts=[request.query],
            n_results=request.n_results,
            where=where_filter
        )
        
        # Extract the matched documents and metadata
        documents = results.get("documents", [[]])[0]
        metadatas = results.get("metadatas", [[]])[0]

        formatted_results = []
        for doc, meta in zip(documents, metadatas):
            source = meta.get("source", "Medical Record") if meta else "Medical Record"
            formatted_results.append(f"[{source}]:\n{doc}")
        
        return {
            "status": "success",
            "query": request.query,
            "patient_id": request.patient_id,
            "results": formatted_results
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve context: {str(e)}")
