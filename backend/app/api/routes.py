import logging
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from typing import List

from app.database.database import get_db
from app.models.history import DesignHistory
from app.schemas.design import DesignRequest, DesignHistoryResponse, SystemDesignSchema
from app.services.ai_service import AIService

router = APIRouter()
logger = logging.getLogger("uvicorn.error")

@router.post("/generate", response_model=DesignHistoryResponse, status_code=status.HTTP_201_CREATED)
async def generate_architecture(request: DesignRequest, db: AsyncSession = Depends(get_db)):
    """
    Triggers Groq AI to generate a structured system design, saves the prompt 
    and structured response to PostgreSQL, and returns the result.
    """
    if not request.prompt.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Prompt cannot be empty"
        )
    
    # ⚡ Pillar 1: Case-Insensitive Prompt Cache Lookup
    if not request.force:
        try:
            cleaned_prompt = request.prompt.strip()
            query = select(DesignHistory).where(
                func.lower(func.trim(DesignHistory.prompt)) == func.lower(cleaned_prompt)
            ).order_by(DesignHistory.created_at.desc()).limit(1)
            
            result = await db.execute(query)
            cached_design = result.scalar_one_or_none()
            
            if cached_design:
                logger.info(f"⚡ Cache HIT for prompt: '{request.prompt}'. Returning stored record ID {cached_design.id} instantly.")
                return cached_design
        except Exception as cache_err:
            logger.warning(f"Failed to query database cache: {str(cache_err)}")
    
    try:
        # Generate the structured response from the AI
        generated_design: SystemDesignSchema = await AIService.generate_design(request.prompt)
        
        # Save to database
        db_history = DesignHistory(
            prompt=request.prompt,
            response=generated_design.model_dump() # Save as Python dict which parses to JSON in DB
        )
        db.add(db_history)
        await db.commit()
        await db.refresh(db_history)
        
        return db_history
        
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"System Design Generation failed: {str(e)}"
        )

@router.get("/history", response_model=List[DesignHistoryResponse])
async def get_all_history(db: AsyncSession = Depends(get_db)):
    """
    Retrieves all past generations from the database, ordered by creation date (newest first).
    """
    try:
        query = select(DesignHistory).order_by(DesignHistory.created_at.desc())
        result = await db.execute(query)
        history_list = result.scalars().all()
        return history_list
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve history: {str(e)}"
        )

@router.get("/history/{history_id}", response_model=DesignHistoryResponse)
async def get_history_by_id(history_id: int, db: AsyncSession = Depends(get_db)):
    """
    Retrieves a single system design generation by its unique ID.
    """
    try:
        query = select(DesignHistory).where(DesignHistory.id == history_id)
        result = await db.execute(query)
        history_item = result.scalar_one_or_none()
        
        if not history_item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Architecture design with ID {history_id} not found"
            )
            
        return history_item
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve design detail: {str(e)}"
        )
