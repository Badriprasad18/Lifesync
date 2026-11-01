"""LifeSync AI - FastAPI Application Entry Point."""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import init_db
from app.routers import health, auth, assessment, dashboard


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan context manager: handles startup and shutdown tasks."""
    # Initialize SQLite database and tables
    init_db()
    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Artificial Intelligence-Based Lifestyle Risk Assessment and Personalized Wellness Recommendation Platform",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# Configure CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(health.router, prefix=settings.API_V1_STR)
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(assessment.router, prefix=settings.API_V1_STR)
app.include_router(dashboard.router, prefix=settings.API_V1_STR)


@app.get("/", tags=["Root"])
async def root():
    """Root metadata endpoint."""
    return {
        "project": settings.PROJECT_NAME,
        "title": "Artificial Intelligence-Based Lifestyle Risk Assessment and Personalized Wellness Recommendation Platform",
        "version": "1.0.0",
        "docs_url": "/docs",
        "health_check": f"{settings.API_V1_STR}/health",
        "endpoints": {
            "auth": f"{settings.API_V1_STR}/auth",
            "assessment": f"{settings.API_V1_STR}/assessment",
            "dashboard": f"{settings.API_V1_STR}/dashboard",
        },
    }
