import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.core.config import settings
from app.database.database import engine, Base
from app.api.routes import router

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("uvicorn.error")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup actions
    logger.info("Initializing database tables...")
    
    # 1. Create base tables in their own clean transaction
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("Base database tables initialized successfully.")
    except Exception as e:
        logger.error(f"Error creating base tables: {str(e)}")
        
    # 2. Run column additions in a separate clean transaction block
    try:
        async with engine.begin() as conn:
            # PostgreSQL 9.6+ supports ADD COLUMN IF NOT EXISTS
            await conn.execute(text("""
                ALTER TABLE design_histories 
                ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;
            """))
        logger.info("PostgreSQL user_id column check/alteration completed successfully.")
    except Exception as pg_err:
        logger.info(f"PostgreSQL specific column alteration failed: {str(pg_err)}. Trying SQLite fallback...")
        # Fallback for SQLite which doesn't support 'ADD COLUMN IF NOT EXISTS'
        try:
            async with engine.begin() as conn:
                await conn.execute(text("ALTER TABLE design_histories ADD COLUMN user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;"))
            logger.info("SQLite fallback column alteration applied successfully.")
        except Exception as sqlite_err:
            logger.info(f"SQLite fallback skipped (column likely already exists): {str(sqlite_err)}")
        
    yield
    
    # Shutdown actions
    logger.info("Shutting down database engine connections...")
    await engine.dispose()
    logger.info("Shutdown complete.")



app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Asynchronous Backend API to generate comprehensive system designs using Groq AI.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration
origins = [
    "http://localhost:3000",       # Local Next.js dev server
    "http://127.0.0.1:3000",
    "https://system-design-generator.vercel.app", # Placeholder for deployment
    "*" # Fallback / wildcard to prevent CORS blocks during dev/deployment
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes exactly as requested
app.include_router(router)

@app.get("/")
async def health_check():
    return {
        "status": "healthy",
        "project": settings.PROJECT_NAME,
        "version": "1.0.0"
    }
