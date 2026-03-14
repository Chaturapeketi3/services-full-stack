from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.logging import setup_logging
from app.api.auth import router as auth_router
from app.api.catalog import router as catalog_router
from app.api.bookings import router as bookings_router
from app.api.payments import router as payments_router
from app.api.experts import router as experts_router
from app.api.ratings import router as ratings_router
from app.core.exceptions import (
    GenericException,
    generic_exception_handler,
    global_exception_handler
)

def create_app() -> FastAPI:
    # Setup global logging
    setup_logging()
    
    app = FastAPI(
        title=settings.PROJECT_NAME,
        version=settings.API_VERSION,
        description="Production quality full stack application called HouseMate.",
        docs_url="/docs",
        redoc_url="/redoc"
    )

    # CORS Middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.BACKEND_CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"], # Allow all headers including custom ones like Idempotency-Key
    )

    # Global Exception Handlers
    app.add_exception_handler(GenericException, generic_exception_handler)
    app.add_exception_handler(Exception, global_exception_handler)

    # Include Routers
    app.include_router(auth_router)
    app.include_router(catalog_router)
    app.include_router(bookings_router)
    app.include_router(payments_router)
    app.include_router(experts_router)
    app.include_router(ratings_router)

    @app.get("/health", tags=["Health"])
    async def health_check():
         return {"status": "ok"}
         
    return app

app = create_app()
