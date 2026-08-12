import os
import logging
from langchain_core.output_parsers import JsonOutputParser
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field, ValidationError
from typing import TypedDict, Optional
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langgraph.graph import StateGraph, END
from dotenv import load_dotenv
from fastapi import UploadFile, File

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
    """LangGraph node that calls Groq to extract structured data using a bulletproof JSON parser."""
    logger.info("Initiating LLM extraction process.")
    
    try:
        llm = ChatGroq(
            temperature=0, 
            model_name="llama-3.3-70b-versatile", 
            groq_api_key=os.getenv("GROQ_API_KEY")
        )
        
        # 1. Setup the rock-solid JSON parser tied to our schema
        parser = JsonOutputParser(pydantic_object=ComplaintData)
        
        # 2. Inject the format instructions directly into the prompt
        system_prompt = """
        You are an AI Quality Assurance assistant for a pharmaceutical manufacturing QMS.
        Extract the relevant complaint details from the user's text. 
        
        CRITICAL DATA MAPPING RULES:
        - 'customer_name': Extract the specific name of the individual reporting the issue (e.g., the doctor, pharmacist, or patient).
        - 'complaint_source': Extract the name of the hospital, pharmacy, or institution where the issue occurred.
        
        If a field is not mentioned, leave it empty.
        Use your pharmaceutical knowledge to assess the 'initial_severity', 'priority', and 'suggested_next_action'.
        
        CRITICAL: You must format your output as a valid JSON object.
        {format_instructions}
        """
        
        prompt_template = ChatPromptTemplate.from_messages([
            ("system", system_prompt),
            ("human", "{text}")
        ])
        
        # 3. Chain the prompt, model, and parser together
        chain = prompt_template | llm | parser
        
        # Execute the chain
        result = chain.invoke({
            "text": state["raw_text"],
            "format_instructions": parser.get_format_instructions()
        })
        
        logger.info("Successfully extracted structured data from Groq.")
        return {"extracted_json": result, "error": None}
        
    except Exception as e:
        logger.error(f"LLM Extraction failed: {str(e)}", exc_info=True)
        # We are exposing the raw error here so if it fails again, Swagger will tell us exactly why!
        return {"extracted_json": None, "error": f"DEBUG INFO: {str(e)}"}


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


@app.post("/api/extract-document", response_model=ComplaintData)
async def extract_document_endpoint(file: UploadFile = File(...)):
    """
    API Endpoint to process uploaded complaint documents (PDF or text files) 
    into structured QMS JSON.
    
    Args:
        file (UploadFile): The uploaded document file (PDF, TXT, etc.).
        
    Returns:
        ComplaintData: The strictly typed JSON response to populate the frontend form.
    """
    logger.info(f"Received document upload: {file.filename} ({file.content_type})")
    
    try:
        file_extension = file.filename.split(".")[-1].lower()
        extracted_text = ""
        
        # Read file contents into memory
        file_bytes = await file.read()
        
        if file_extension == "pdf":
            import io
            from PyPDF2 import PdfReader
            
            pdf_file = io.BytesIO(file_bytes)
            reader = PdfReader(pdf_file)
            
            for page_idx, page in enumerate(reader.pages):
                text = page.extract_text()
                if text:
                    extracted_text += text + "\n"
            
            logger.info(f"Successfully extracted {len(reader.pages)} pages from PDF via PyPDF2.")
            
        elif file_extension in ["txt", "eml", "docx"]:
            # Fallback text decoding for plain text / email formats
            extracted_text = file_bytes.decode("utf-8", errors="ignore")
            logger.info("Successfully decoded text/email document.")
        else:
            raise HTTPException(
                status_code=400, 
                detail="Unsupported file format. Please upload a PDF, TXT, or EML file."
            )
            
        if not extracted_text.strip():
            raise HTTPException(
                status_code=400, 
                detail="The uploaded document appears to be empty or unreadable."
            )

        # Pass the extracted document text into our LangGraph state machine
        final_state = app_graph.invoke({
            "raw_text": extracted_text, 
            "extracted_json": None, 
            "error": None
        })
        
        if final_state.get("error"):
            logger.warning(f"Graph execution returned an error: {final_state['error']}")
            raise HTTPException(status_code=502, detail=final_state["error"])
            
        if not final_state.get("extracted_json"):
            logger.error("Graph executed successfully but returned empty JSON from document.")
            raise HTTPException(status_code=500, detail="Failed to parse document data.")
            
        logger.info(f"Successfully processed document {file.filename} and returning QMS JSON.")
        return final_state["extracted_json"]
        
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Document processing failed: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error processing document: {str(e)}")