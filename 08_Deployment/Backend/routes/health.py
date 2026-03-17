"""
/api/health — Server health check endpoint
"""
from fastapi import APIRouter
from fastapi.responses import JSONResponse
from config import CSTRD_ROOT, API_RESULTS_DIR

router = APIRouter()


@router.get("/api/health")
async def health_check():
    """
    Basic server health check.
    The frontend calls this on load to verify the backend is running.
    """
    cstrd_available = (CSTRD_ROOT / "main.py").exists()
    API_RESULTS_DIR.mkdir(parents=True, exist_ok=True)

    return JSONResponse(content={
        'status': 'ok',
        'version': '1.0.0',
        'cstrd_available': cstrd_available,
        'results_dir': str(API_RESULTS_DIR)
    })
