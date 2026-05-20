import logging
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from typing import List, Optional

from app.database.database import get_db
from app.models.history import DesignHistory
from app.models.user import User
from app.schemas.design import DesignRequest, DesignHistoryResponse, SystemDesignSchema
from app.schemas.user import UserCreate, UserLogin, UserResponse, Token
from app.services.ai_service import AIService
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user,
    get_current_user_optional
)

router = APIRouter()
logger = logging.getLogger("uvicorn.error")

# --- AUTH ENDPOINTS ---

@router.post("/auth/signup", response_model=Token, status_code=status.HTTP_201_CREATED)
async def signup(user_data: UserCreate, db: AsyncSession = Depends(get_db)):
    """
    Registers a new user, hashes their password, and returns a JWT access token.
    """
    # Check if username already exists
    query = select(User).where(User.username == user_data.username)
    result = await db.execute(query)
    existing_user = result.scalar_one_or_none()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username is already taken"
        )
    
    # Hash password and create user
    hashed = hash_password(user_data.password)
    db_user = User(username=user_data.username, hashed_password=hashed)
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    
    # Generate token
    token = create_access_token({"sub": db_user.username})
    return {"access_token": token, "token_type": "bearer"}

@router.post("/auth/login", response_model=Token)
async def login(credentials: UserLogin, db: AsyncSession = Depends(get_db)):
    """
    Authenticates a user and returns a JWT access token.
    """
    query = select(User).where(User.username == credentials.username)
    result = await db.execute(query)
    db_user = result.scalar_one_or_none()
    
    if not db_user or not verify_password(credentials.password, db_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )
        
    token = create_access_token({"sub": db_user.username})
    return {"access_token": token, "token_type": "bearer"}

@router.get("/auth/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    """
    Returns the authenticated user's profile details.
    """
    return current_user


# --- GENERATOR & HISTORY ENDPOINTS ---

@router.post("/generate", response_model=DesignHistoryResponse, status_code=status.HTTP_201_CREATED)
async def generate_architecture(
    request: DesignRequest,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """
    Triggers Groq AI to generate a structured system design, saves the prompt 
    and structured response to PostgreSQL, and returns the result.
    If authenticated, saves under user's private history.
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
            # Find the most recent generation globally
            query = select(DesignHistory).where(
                func.lower(func.trim(DesignHistory.prompt)) == func.lower(cleaned_prompt)
            ).order_by(DesignHistory.created_at.desc()).limit(1)
            
            result = await db.execute(query)
            cached_design = result.scalar_one_or_none()
            
            if cached_design:
                logger.info(f"⚡ Cache HIT for prompt: '{request.prompt}'")
                
                # If user is logged in, ensure they have this design in their private history
                if current_user:
                    user_history_query = select(DesignHistory).where(
                        (func.lower(func.trim(DesignHistory.prompt)) == func.lower(cleaned_prompt)) &
                        (DesignHistory.user_id == current_user.id)
                    ).limit(1)
                    
                    user_result = await db.execute(user_history_query)
                    user_cached_design = user_result.scalar_one_or_none()
                    
                    if user_cached_design:
                        return user_cached_design
                    
                    # Create a copy for the user to add it to their history
                    user_design = DesignHistory(
                        prompt=request.prompt,
                        response=cached_design.response,
                        user_id=current_user.id
                    )
                    db.add(user_design)
                    await db.commit()
                    await db.refresh(user_design)
                    return user_design
                
                return cached_design
        except Exception as cache_err:
            logger.warning(f"Failed to query database cache: {str(cache_err)}")
    
    try:
        # Generate the structured response from the AI
        generated_design: SystemDesignSchema = await AIService.generate_design(request.prompt)
        
        # Save to database
        db_history = DesignHistory(
            prompt=request.prompt,
            response=generated_design.model_dump(),
            user_id=current_user.id if current_user else None
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
async def get_all_history(
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """
    Retrieves all past generations for the logged in user.
    If not logged in, returns an empty list.
    """
    if not current_user:
        return []
        
    try:
        query = select(DesignHistory).where(DesignHistory.user_id == current_user.id).order_by(DesignHistory.created_at.desc())
        result = await db.execute(query)
        history_list = result.scalars().all()
        return history_list
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve history: {str(e)}"
        )

@router.get("/history/{history_id}", response_model=DesignHistoryResponse)
async def get_history_by_id(
    history_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """
    Retrieves a single system design generation by its unique ID.
    If the design belongs to a user, verifies ownership.
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
            
        # Verify ownership if it's a private user design
        if history_item.user_id is not None:
            if not current_user or history_item.user_id != current_user.id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="You do not have permission to access this architecture design"
                )
            
        return history_item
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve design detail: {str(e)}"
        )

