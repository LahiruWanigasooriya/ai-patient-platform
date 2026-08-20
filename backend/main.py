from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
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
                model='gemini-embedding-002',
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
async def upload_pdf(file: UploadFile = File(...)):
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
        # We generate unique IDs for each chunk
        ids = [f"{file.filename}_chunk_{i}" for i in range(len(chunks))]
        
        # We attach metadata to know where the chunks came from
        metadatas = [{"source": file.filename} for _ in range(len(chunks))]

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

@app.post("/api/retrieve")
async def retrieve_context(request: QueryRequest):
    try:
        # Query ChromaDB using the same embedding function
        results = collection.query(
            query_texts=[request.query],
            n_results=request.n_results
        )
        
        # Extract the matched documents
        documents = results.get("documents", [[]])[0]
        
        return {
            "status": "success",
            "query": request.query,
            "results": documents
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve context: {str(e)}")
