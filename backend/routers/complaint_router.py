# backend/routers/complaint_router.py
import logging
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from models.database import get_db
from models.complaint_model import ComplaintDB
from schemas.complaint import ComplaintData

"""
==========================================
ROUTER LAYER: Database Operations
==========================================
"""
logger = logging.getLogger("AIVOA_Backend.complaint_router")
router = APIRouter()

@router.post("/save")
def save_complaint(complaint: ComplaintData, db: Session = Depends(get_db)):
    """
    API Endpoint to persist a verified complaint into the SQL database.
    
    Args:
        complaint (ComplaintData): The strictly typed JSON payload from the frontend.
        db (Session): The injected SQLAlchemy database session.
        
    Returns:
        dict: Success message and the newly created database ID.
    """
    logger.info("Attempting to save new complaint to the database.")
    
    try:
        # Unpack the Pydantic model directly into the SQLAlchemy model
        db_complaint = ComplaintDB(**complaint.model_dump())
        
        db.add(db_complaint)
        db.commit()
        db.refresh(db_complaint)
        
        logger.info(f"Successfully saved complaint with Database ID: {db_complaint.id}")
        return {"message": "Complaint successfully saved to database.", "id": db_complaint.id}
        
    except Exception as e:
        db.rollback()
        logger.error(f"Database insertion failed: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to persist complaint to the database.")