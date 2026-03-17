"""
/api/analyze — POST endpoint for running ring detection + analysis
"""
import time
import tempfile
import shutil
from pathlib import Path
from datetime import datetime, timezone

from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse

from config import API_RESULTS_DIR
from services.detection import run_detection_for_upload
from services.measurement import calculate_ring_measurements
from services.analysis import run_full_analysis, compute_moving_averages
from services.storage import save_analysis_result, generate_analysis_id

router = APIRouter()


@router.post("/api/analyze")
async def analyze_image(
    image: UploadFile = File(...),
    cx: int = Form(...),
    cy: int = Form(...),
    sampling_year: int = Form(default=None),
    image_name: str = Form(default=None)
):
    """
    Run complete ring detection and analysis on an uploaded tree cross-section image.
    
    Form data:
    - image: The tree cross-section image file (PNG, JPG, TIFF)
    - cx: Pith X coordinate (at original image resolution)
    - cy: Pith Y coordinate (at original image resolution)  
    - sampling_year: Year the sample was taken (optional, defaults to current year)
    - image_name: Custom name for the image (optional, defaults to uploaded filename)
    """
    start_time = time.time()

    # Determine image name
    actual_image_name = image_name or image.filename or "unknown.png"
    sampling_year = sampling_year or datetime.now().year

    # Generate unique analysis ID
    analysis_id = generate_analysis_id(actual_image_name)

    # Save uploaded image to a temp location for CS-TRD to process
    upload_dir = API_RESULTS_DIR / analysis_id
    upload_dir.mkdir(parents=True, exist_ok=True)

    image_suffix = Path(actual_image_name).suffix or ".png"
    saved_image_path = upload_dir / f"uploaded_image{image_suffix}"

    with open(saved_image_path, 'wb') as f:
        content = await image.read()
        f.write(content)

    try:
        # STEP 1: Run CS-TRD detection
        detection_result = run_detection_for_upload(
            image_path=saved_image_path,
            cx=cx,
            cy=cy,
            analysis_id=analysis_id
        )

        if detection_result is None or not detection_result.get('shapes'):
            raise HTTPException(
                status_code=422,
                detail="Ring detection failed. The image may have insufficient contrast or the pith coordinates may be incorrect."
            )

        shapes = detection_result['shapes']
        img_width = detection_result['image_width']
        img_height = detection_result['image_height']
        overlay_base64 = detection_result['overlay_base64']

        # STEP 2: Calculate ring widths from detected polygons
        birth_year = sampling_year - len(shapes)
        rings, widths = calculate_ring_measurements(shapes, cx, cy, birth_year)

        if not rings:
            raise HTTPException(
                status_code=422,
                detail="Ring measurement calculation failed."
            )

        # STEP 3: Run full analysis (health, anomalies, biography, carbon, etc.)
        analysis = run_full_analysis(widths, sampling_year)

        if analysis is None:
            raise HTTPException(
                status_code=422,
                detail="Analysis generation failed. Insufficient ring data."
            )

        # STEP 4: Compute moving averages for chart overlay
        width_values = [w['width_px'] for w in widths]
        moving_averages = compute_moving_averages(width_values, window=5)

        # STEP 5: Build complete response
        processing_time = round(time.time() - start_time, 2)

        result = {
            # Identity
            'id': analysis_id,
            'image_name': actual_image_name,
            'analyzed_at': datetime.now(timezone.utc).isoformat(),
            'processing_time_seconds': processing_time,

            # Image info
            'pith': {'cx': cx, 'cy': cy},
            'image_dimensions': {'width': img_width, 'height': img_height},

            # Core results
            'ring_count': len(rings),
            'estimated_age': len(rings),
            'birth_year': birth_year,

            # Ring-by-ring data (includes polygon points for canvas rendering)
            'rings': rings,

            # Statistics with moving averages added
            'statistics': {
                **analysis['statistics'],
                'moving_averages': moving_averages
            },

            # Analysis outputs
            'trend': analysis['trend'],
            'health': analysis['health'],
            'anomalies': analysis['anomalies'],
            'phases': analysis['phases'],
            'biography': analysis['biography'],
            'carbon': analysis['carbon'],

            # Accuracy metrics (null — no ground truth for uploaded images)
            'metrics': {
                'precision': None,
                'recall': None,
                'f1_score': None,
                'rmse': None
            },

            # Pre-rendered overlay from CS-TRD output.png
            'overlay_image_base64': overlay_base64,
        }

        # STEP 6: Save to disk for history page
        save_analysis_result(analysis_id, result)

        return JSONResponse(content=result)

    except HTTPException:
        raise
    except Exception as e:
        # Clean up on failure
        raise HTTPException(
            status_code=500,
            detail=f"Internal analysis error: {str(e)}"
        )
