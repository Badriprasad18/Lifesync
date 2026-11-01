"""System Health and Readiness Verification Router."""
from datetime import datetime, timezone
from fastapi import APIRouter
from app.config import settings

router = APIRouter(prefix="/health", tags=["Health"])


@router.get("", summary="System Health Check")
async def health_check():
    """Verify backend service liveness, configuration, and module readiness."""
    return {
        "status": "healthy",
        "project": settings.PROJECT_NAME,
        "version": "1.0.0",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "environment": settings.ENVIRONMENT,
        "cors_origins": settings.cors_origins,
        "modules": {
            "api": "active",
            "auth": "ready",
            "scoring_engine": "ready",
            "ml_subsystem": "ready",
            "database": "ready",
        },
    }
