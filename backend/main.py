import os
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Import our modular routers
from routers import extract_router

# ==========================================
# APPLICATION ENTRY POINT
# ==========================================
load_dotenv()

# Global Logging Configuration
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("AIVOA_Backend")

if not os.getenv("GROQ_API_KEY"):
    logger.critical("GROQ_API_KEY is missing. Application cannot start.")
    raise RuntimeError("Missing GROQ_API_KEY")

# Initialize FastAPI Application
app = FastAPI(
    title="AIVOA QMS API",
    description="Enterprise backend for pharmaceutical complaint management.",
    version="1.0.0"
)

# Configure Cross-Origin Resource Sharing (CORS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register modular routers
app.include_router(extract_router.router, prefix="/api", tags=["Extraction"])

@app.get("/")
async def root_health_check():
    """Simple health check endpoint to verify server status."""
    return {"status": "online", "service": "AIVOA QMS API", "version": "1.0.0"}