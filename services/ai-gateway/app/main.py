"""
GuruMera AI Gateway — FastAPI Application Entry Point.
"""
from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.auth import is_production, require_internal_key, validate_security_config
from app.core.config import settings
from app.routers.ai_router import router as ai_router

validate_security_config()

app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
    description="Defense-in-Depth Socratic AI Orchestration Service — GuruMera Platform",
    docs_url=None if is_production() else "/docs",
    redoc_url=None,
    openapi_url=None if is_production() else "/openapi.json",
)

# Service-to-service only: browsers never call this directly, so no CORS origins are allowed.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[],
    allow_credentials=False,
    allow_methods=["POST", "GET"],
    allow_headers=["X-Internal-Key", "Content-Type"],
)

app.include_router(ai_router, prefix=settings.API_PREFIX, dependencies=[Depends(require_internal_key)])


@app.get("/")
async def root():
    return {"status": "operational"}
