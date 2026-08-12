# backend/main.py
import os
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Modular routers and database imports
from routers import extract_router, complaint_router
from models.database import engine, Base

# ==========================================
# APPLICATION ENTRY POINT & DB INIT
# ==========================================
load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("AIVOA_Backend")

if not os.getenv("GROQ_API_KEY"):
    logger.critical("GROQ_API_KEY is missing. Application cannot start.")
    raise RuntimeError("Missing GROQ_API_KEY")

# Create all SQL tables automatically on startup if they don't exist
Base.metadata.create_all(bind=engine)
logger.info("Database tables verified/created successfully.")

app = FastAPI(
    title="AIVOA QMS API",
    description="Enterprise backend for pharmaceutical complaint management.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register all modular routers
app.include_router(extract_router.router, prefix="/api", tags=["AI Extraction"])
app.include_router(complaint_router.router, prefix="/api", tags=["Database CRUD"])

@app.get("/")
async def root_health_check():
    return {"status": "online", "service": "AIVOA QMS API", "database": "connected"}