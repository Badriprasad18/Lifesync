"""LifeSync AI - FastAPI Application Entry Point."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routers import health

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Artificial Intelligence-Based Lifestyle Risk Assessment and Personalized Wellness Recommendation Platform",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Configure CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Routers
app.include_router(health.router, prefix=settings.API_V1_STR)


@app.get("/", tags=["Root"])
async def root():
    """Root metadata endpoint."""
    return {
        "project": settings.PROJECT_NAME,
        "title": "Artificial Intelligence-Based Lifestyle Risk Assessment and Personalized Wellness Recommendation Platform",
        "version": "1.0.0",
        "docs_url": "/docs",
        "health_check": f"{settings.API_V1_STR}/health",
    }
