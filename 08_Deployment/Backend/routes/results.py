"""
/api/results — GET endpoints for saved analysis results
"""
from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse

from services.storage import load_analysis_result, list_all_results, delete_analysis_result

router = APIRouter()


@router.get("/api/results")
async def get_all_results():
    """
    Get list of all saved analysis results (lightweight summaries).
    Used by the /history page.
    """
    results = list_all_results()
    return JSONResponse(content={'results': results, 'count': len(results)})


@router.get("/api/results/{analysis_id}")
async def get_result(analysis_id: str):
    """
    Get full analysis result by ID.
    Used by the /results/[id] page.
    """
    result = load_analysis_result(analysis_id)
    if result is None:
        raise HTTPException(status_code=404, detail=f"Analysis '{analysis_id}' not found.")
    return JSONResponse(content=result)


@router.delete("/api/results/{analysis_id}")
async def delete_result(analysis_id: str):
    """Delete a saved analysis result."""
    success = delete_analysis_result(analysis_id)
    if not success:
        raise HTTPException(status_code=404, detail=f"Analysis '{analysis_id}' not found.")
    return JSONResponse(content={'deleted': analysis_id})
