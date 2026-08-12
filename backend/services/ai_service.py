import os
import logging
from typing import TypedDict, Optional
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from langgraph.graph import StateGraph, END
from schemas.complaint import ComplaintData

# ==========================================
# SERVICE LAYER: AI & LangGraph Pipeline
# ==========================================
logger = logging.getLogger("AIVOA_Backend.ai_service")

class GraphState(TypedDict):
    """Represents the state of our LangGraph extraction machine."""
    raw_text: str
    extracted_json: Optional[dict]
    error: Optional[str]

def extract_complaint_node(state: GraphState) -> GraphState:
    """
    LangGraph node that calls the Groq LLM to extract structured data via JSON parsing.
    
    Args:
        state (GraphState): The current state containing the raw_text.
        
    Returns:
        GraphState: The updated state containing the extracted_json dict or an error message.
    """
    logger.info("Initiating LLM extraction process.")
    
    try:
        # Initialize Groq client with deterministic settings
        llm = ChatGroq(
            temperature=0, 
            model_name="llama-3.3-70b-versatile", 
            groq_api_key=os.getenv("GROQ_API_KEY")
        )
        
        parser = JsonOutputParser(pydantic_object=ComplaintData)
        
        # Explicit mapping rules to prevent entity confusion (e.g., Institution vs Reporter)
        system_prompt = """
        You are an AI Quality Assurance assistant for a pharmaceutical manufacturing QMS.
        Extract the relevant complaint details from the user's text. 
        
        CRITICAL DATA MAPPING RULES:
        - 'customer_name': Extract the specific name of the individual reporting the issue.
        - 'complaint_source': Extract the name of the hospital, pharmacy, or institution.
        
        If a field is not mentioned, leave it empty.
        Use your pharmaceutical knowledge to assess 'initial_severity', 'priority', and 'suggested_next_action'.
        
        CRITICAL: You must format your output as a valid JSON object.
        {format_instructions}
        """
        
        prompt_template = ChatPromptTemplate.from_messages([
            ("system", system_prompt),
            ("human", "{text}")
        ])
        
        chain = prompt_template | llm | parser
        
        result = chain.invoke({
            "text": state["raw_text"],
            "format_instructions": parser.get_format_instructions()
        })
        
        logger.info("Successfully extracted structured data from Groq.")
        return {"extracted_json": result, "error": None}
        
    except Exception as e:
        logger.error(f"LLM Extraction failed: {str(e)}", exc_info=True)
        return {"extracted_json": None, "error": f"DEBUG INFO: {str(e)}"}

# Compile the LangGraph pipeline
workflow = StateGraph(GraphState)
workflow.add_node("extractor", extract_complaint_node)
workflow.set_entry_point("extractor")
workflow.add_edge("extractor", END)
app_graph = workflow.compile()