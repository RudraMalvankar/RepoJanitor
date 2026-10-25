import logging
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.core.config import settings
from app.core.database import init_db
from app.api.routes import router

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("repojanitor")

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="RepoJanitor — The AI maintainer you never asked for. Submission for Hacktoberfest Open-Source AI Challenge 2026."
)

# Enable CORS for frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for local dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global error handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception on {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": f"Internal server error: {str(exc)}"}
    )

# Include API Router
app.include_router(router, prefix="/api")

# Initialize database tables on import
init_db()

@app.on_event("startup")
def on_startup():
    logger.info("Initializing RepoJanitor SQLite database...")
    init_db()
    logger.info("Database initialized successfully.")

@app.get("/")
def root():
    return {
        "message": "Welcome to RepoJanitor API",
        "version": settings.APP_VERSION,
        "docs_url": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
