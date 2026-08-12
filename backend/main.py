import os
import logging
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field, ValidationError
from typing import TypedDict, Optional
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langgraph.graph import StateGraph, END
from dotenv import load_dotenv

# ==========================================
# 0. CONFIGURATION & LOGGING
# ==========================================
load_dotenv()

# Set up professional logging to track application state and errors
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("AIVOA_Backend")

# Ensure API Key is present before the app even starts
if not os.getenv("GROQ_API_KEY"):
    logger.critical("GROQ_API_KEY is missing from environment variables. Application cannot start.")
    raise RuntimeError("Missing GROQ_API_KEY")

# ==========================================
# 1. SCHEMAS (Strict typing for AI Output)
# ==========================================
class ComplaintData(BaseModel):
    """
    Pydantic model defining the strict JSON structure expected by the React frontend.
    This acts as our schema constraint for the LLM output.
    """
    complaint_source: str = Field(default="", description="e.g., Email, Phone, Apollo Pharmacy")
    customer_name: str = Field(default="", description="Name of the customer or hospital")
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
    """Schema for incoming client requests."""
    prompt: str = Field(..., min_length=5, description="The raw text or document string from the user.")

# ==========================================
# 2. LANGGRAPH SETUP
# ==========================================
class GraphState(TypedDict):
    """Represents the state of our LangGraph state machine."""
    raw_text: str
    extracted_json: Optional[dict]
    error: Optional[str]

def extract_complaint_node(state: GraphState) -> GraphState:
    """
    LangGraph node that calls the Groq LLM to extract structured data.
    
    Args:
        state (GraphState): The current state containing the raw_text.
        
    Returns:
        GraphState: The updated state containing the extracted_json or an error message.
    """
    logger.info("Initiating LLM extraction process.")
    
    try:
        # Initialize Groq client
        llm = ChatGroq(
            temperature=0, # Temperature 0 ensures deterministic, factual extraction
            model_name="gemma2-9b-it", 
            groq_api_key=os.getenv("GROQ_API_KEY")
        )
        
        # Force the LLM to output our exact Pydantic schema
        structured_llm = llm.with_structured_output(ComplaintData)
        
        system_prompt = """
        You are an AI Quality Assurance assistant for a pharmaceutical manufacturing QMS.
        Extract the relevant complaint details from the user's text. 
        If a field is not mentioned, leave it empty.
        Use your pharmaceutical knowledge to assess the 'initial_severity', 'priority', and 'suggested_next_action'.
        """
        
        prompt_template = ChatPromptTemplate.from_messages([
            ("system", system_prompt),
            ("human", "{text}")
        ])
        
        chain = prompt_template | structured_llm
        
        # Execute the chain
        result = chain.invoke({"text": state["raw_text"]})
        logger.info("Successfully extracted structured data from Groq.")
        
        return {"extracted_json": result.model_dump(), "error": None}
        
    except Exception as e:
        logger.error(f"LLM Extraction failed: {str(e)}", exc_info=True)
        return {"extracted_json": None, "error": "The AI model failed to process the request."}

# Build the LangGraph State Machine
workflow = StateGraph(GraphState)
workflow.add_node("extractor", extract_complaint_node)
workflow.set_entry_point("extractor")
workflow.add_edge("extractor", END)
app_graph = workflow.compile()

# ==========================================
# 3. FASTAPI SERVER & ERROR HANDLING
# ==========================================
app = FastAPI(
    title="AIVOA QMS Extraction API",
    description="AI-powered backend for extracting pharmaceutical complaint data.",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Update this to specific frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Catches any unhandled exceptions to prevent the server from crashing."""
    logger.error(f"Unhandled server error: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"message": "An internal server error occurred. Please try again later."},
    )

@app.post("/api/extract", response_model=ComplaintData)
async def extract_complaint_endpoint(request: APIRequest):
    """
    API Endpoint to process natural language text into structured QMS JSON.
    
    Args:
        request (APIRequest): The incoming payload containing the raw prompt.
        
    Returns:
        ComplaintData: The strictly typed JSON response to populate the frontend form.
    """
    logger.info(f"Received extraction request. Payload length: {len(request.prompt)}")
    
    # Run the state graph
    final_state = app_graph.invoke({
        "raw_text": request.prompt, 
        "extracted_json": None, 
        "error": None
    })
    
    # Handle explicit errors from the LangGraph node
    if final_state.get("error"):
        logger.warning(f"Graph execution returned an error: {final_state['error']}")
        raise HTTPException(status_code=502, detail=final_state["error"])
        
    # Handle unexpected empty responses
    if not final_state.get("extracted_json"):
        logger.error("Graph executed successfully but returned empty JSON.")
        raise HTTPException(status_code=500, detail="Failed to format the extracted data.")
        
    logger.info("Returning successfully populated QMS data to client.")
    return final_state["extracted_json"]