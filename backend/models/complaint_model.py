# backend/models/complaint_model.py
from sqlalchemy import Column, Integer, String, Text
from models.database import Base

"""
==========================================
SQLALCHEMY ORM MODELS
==========================================
"""

class ComplaintDB(Base):
    """
    SQLAlchemy model representing the 'complaints' table in the database.
    This stores the final, triaged AI-extracted data.
    """
    __tablename__ = "complaints"

    id = Column(Integer, primary_key=True, index=True)
    
    # 1. Origin & Customer Details
    complaint_source = Column(String(255), index=True)
    customer_name = Column(String(255))
    
    # 2. Product & Batch Identification
    product_name = Column(String(255), index=True)
    product_strength_grade = Column(String(100))
    batch_lot_number = Column(String(100), index=True)
    manufacturing_date = Column(String(100))
    expiry_date = Column(String(100))
    quantity_affected = Column(String(100))
    
    # 3. Complaint Details
    complaint_type = Column(String(100))
    complaint_date = Column(String(100))
    detailed_complaint_description = Column(Text)
    
    # 4. Initial Assessment & Priority (AI Co-Pilot)
    initial_severity = Column(String(50))
    priority = Column(String(50))
    suggested_next_action = Column(Text)