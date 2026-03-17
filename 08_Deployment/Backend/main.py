"""
TreeTrace FastAPI Backend
Run with: uvicorn main:app --host 0.0.0.0 --port 8000 --reload
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import config first — this adds Streamlit utils and scripts to sys.path
import config

from routes.analyze import router as analyze_router
from routes.results import router as results_router
from routes.samples import router as samples_router
from routes.health import router as health_router

# Create FastAPI app
app = FastAPI(
    title="TreeTrace API",
    description="Backend API for TreeTrace tree ring detection and dendrochronology analysis",
    version="1.0.0"
)

# CORS — allow the Next.js frontend to call this API
# This MUST be configured or the browser will block all requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=config.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register all routes
app.include_router(analyze_router)
app.include_router(results_router)
app.include_router(samples_router)
app.include_router(health_router)


@app.on_event("startup")
async def startup_event():
    """Create necessary output directories on startup."""
    config.API_RESULTS_DIR.mkdir(parents=True, exist_ok=True)
    print(f"TreeTrace API started")
    print(f"Results directory: {config.API_RESULTS_DIR}")
    print(f"CS-TRD available: {(config.CSTRD_ROOT / 'main.py').exists()}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        app,
        host=config.API_HOST,
        port=config.API_PORT,
        reload=False
    )
