import logging
from fastapi import APIRouter, HTTPException, UploadFile, File
from schemas.complaint import ComplaintData, APIRequest
from services.ai_service import app_graph

# ==========================================
# ROUTER LAYER: API Endpoints
# ==========================================
logger = logging.getLogger("AIVOA_Backend.extract_router")
router = APIRouter()

@router.post("/extract", response_model=ComplaintData)
async def extract_text_endpoint(request: APIRequest):
    """
    Endpoint to process natural language text into structured QMS JSON.
    Supports conversational refinement if 'current_state' is provided.
    """
    logger.info(f"Received text extraction request. Payload length: {len(request.prompt)}")
    
    # 👉 DYNAMIC PROMPT LOGIC FOR EDITS
    prompt_to_send = request.prompt
    if request.current_state:
        logger.info("Edit mode activated. Injecting current state into prompt context.")
        prompt_to_send = (
            f"THE USER IS REQUESTING AN EDIT TO AN EXISTING FORM.\n"
            f"Current Form Data: {request.current_state}\n"
            f"Task: Update this existing data based exactly on the user's new prompt.\n"
            f"Constraint: You MUST retain all other existing fields exactly as they are unless explicitly asked to change them.\n\n"
            f"User Prompt: {request.prompt}"
        )
    
    # Pass the dynamically constructed prompt to LangGraph
    final_state = app_graph.invoke({"raw_text": prompt_to_send, "extracted_json": None, "error": None})
    
    if final_state.get("error"):
        logger.warning(f"Graph execution error: {final_state['error']}")
        raise HTTPException(status_code=502, detail=final_state["error"])
        
    if not final_state.get("extracted_json"):
        raise HTTPException(status_code=500, detail="Failed to format the extracted data.")
        
    return final_state["extracted_json"]


@router.post("/extract-document", response_model=ComplaintData)
async def extract_document_endpoint(file: UploadFile = File(...)):
    """
    Endpoint to process uploaded complaint documents (PDF, TXT, EML) into structured QMS JSON.
    """
    logger.info(f"Received document upload: {file.filename} ({file.content_type})")
    
    try:
        file_extension = file.filename.split(".")[-1].lower()
        extracted_text = ""
        file_bytes = await file.read()
        
        # Handle PDF Parsing
        if file_extension == "pdf":
            import io
            from PyPDF2 import PdfReader
            pdf_file = io.BytesIO(file_bytes)
            reader = PdfReader(pdf_file)
            for page in reader.pages:
                text = page.extract_text()
                if text:
                    extracted_text += text + "\n"
        
        # Handle Plain Text Parsing
        elif file_extension in ["txt", "eml", "docx"]:
            extracted_text = file_bytes.decode("utf-8", errors="ignore")
        else:
            raise HTTPException(status_code=400, detail="Unsupported file format.")
            
        if not extracted_text.strip():
            raise HTTPException(status_code=400, detail="Document appears to be empty.")

        final_state = app_graph.invoke({"raw_text": extracted_text, "extracted_json": None, "error": None})
        
        if final_state.get("error"):
            raise HTTPException(status_code=502, detail=final_state["error"])
            
        return final_state["extracted_json"]
        
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Document processing failed: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Error processing document.")