from pydantic import BaseModel, Field
from typing import Optional, Dict, Any

# ==========================================
# SCHEMAS: Data Validation Layer
# ==========================================

class ComplaintData(BaseModel):
    """
    Pydantic model defining the strict JSON structure expected by the frontend.
    This acts as our schema constraint for the LLM output and API response.
    """
    complaint_source: str = Field(default="", description="Name of the hospital, pharmacy, or institution")
    customer_name: str = Field(default="", description="Specific name of the individual reporting the issue")
    product_name: str = Field(default="", description="Name of the pharmaceutical product")
    product_strength_grade: str = Field(default="", description="e.g., 500 mg, IP/BP")
    batch_lot_number: str = Field(default="", description="Alphanumeric batch or lot number")
    manufacturing_date: str = Field(default="", description="Date of manufacturing")
    expiry_date: str = Field(default="", description="Date of expiry")
    quantity_affected: str = Field(default="", description="e.g., 12 capsules, 50 kg")
    complaint_type: str = Field(default="Quality", description="Category of complaint")
    complaint_date: str = Field(default="", description="Date the complaint was reported")
    detailed_complaint_description: str = Field(default="", description="Summary of the issue")
    
    # AI Co-Pilot Risk Assessment Fields
    initial_severity: str = Field(default="", description="Classify as: Minor, Major, or Critical")
    priority: str = Field(default="", description="Classify as: Low, Medium, or High")
    suggested_next_action: str = Field(default="", description="Recommended QA action")

class APIRequest(BaseModel):
    """Schema for incoming natural language client requests."""
    prompt: str = Field(..., min_length=5, description="The raw text string from the user.")
    current_state: Optional[Dict[str, Any]] = None