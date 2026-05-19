import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

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
    try:
        async with engine.begin() as conn:
            # Auto-create SQLAlchemy tables on startup for hassle-free dev
            await conn.run_sync(Base.metadata.create_all)
        logger.info("Database tables initialized successfully.")
    except Exception as e:
        logger.error(f"Error initializing database: {str(e)}")
        
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
