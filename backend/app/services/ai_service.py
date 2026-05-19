import json
import logging
from langchain_groq import ChatGroq
from app.schemas.design import SystemDesignSchema
from app.prompts.templates import SYSTEM_DESIGN_PROMPT
from app.core.config import settings

logger = logging.getLogger("uvicorn.error")

class AIService:
    @staticmethod
    async def generate_design(prompt: str) -> SystemDesignSchema:
        """
        Generates a structured system design using ChatGroq in native JSON mode.
        Tries to use the larger Llama 70B model first, and falls back to Llama 8B on failure.
        """
        # Primary model: llama-3.3-70b-versatile (replaces decommissioned llama-3.3-70b-specdec)
        # Fallback models: llama-3.1-8b-instant, llama3-8b-8192
        models_to_try = ["llama-3.3-70b-versatile", "llama-3.1-8b-instant", "llama3-8b-8192"]
        last_exception = None

        # Build schema instructions to inject in system prompt
        schema_instruction = (
            "\n\nCRITICAL: You must return a valid JSON object matching the requested schema. "
            "Do not include any chat prefix or suffix. Return ONLY the JSON object. "
            "Ensure the keys are exactly: 'title', 'overview', 'services', 'database', 'api_design', "
            "'scalability', 'security', 'caching', 'monitoring', 'deployment', 'mermaid_diagram'.\n"
            "Format the 'services' field as a JSON list of objects, each with 'name' and 'responsibility' keys. "
            "Format every other text field (like 'database', 'api_design', 'caching') as a single string (using markdown bullet points/newlines as needed), NOT as an array or multiple duplicate keys."
        )

        for model in models_to_try:
            try:
                logger.info(f"Attempting system design generation using Groq model (JSON Mode): {model}")
                
                # Enforce JSON mode via response_format
                llm = ChatGroq(
                    groq_api_key=settings.GROQ_API_KEY,
                    model_name=model,
                    temperature=0.2,
                    max_retries=2,
                    model_kwargs={"response_format": {"type": "json_object"}}
                )
                
                messages = [
                    ("system", SYSTEM_DESIGN_PROMPT + schema_instruction),
                    ("human", f"Design the following system in exhaustive detail: {prompt}")
                ]
                
                # Execute asynchronously
                response = await llm.ainvoke(messages)
                
                # Extract and clean response content
                raw_content = response.content.strip()
                
                # Strip markdown JSON fences if present
                if raw_content.startswith("```json"):
                    raw_content = raw_content[7:]
                elif raw_content.startswith("```"):
                    raw_content = raw_content[3:]
                
                if raw_content.endswith("```"):
                    raw_content = raw_content[:-3]
                
                raw_content = raw_content.strip()
                
                # Parse as standard Python dict
                parsed_json = json.loads(raw_content)
                
                # Validate against the Pydantic schema
                result = SystemDesignSchema.model_validate(parsed_json)
                
                logger.info(f"Successfully generated and validated system design with model: {model}")
                return result
                
            except Exception as e:
                logger.warning(f"Failed to generate system design using model {model}: {str(e)}")
                last_exception = e
                continue

        # If all attempts fail, raise the last exception
        logger.error("All Groq models failed to generate system design.")
        raise last_exception if last_exception else Exception("AI Generation failed unexpectedly")
