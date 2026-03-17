"""
/api/samples — GET endpoints for sample images
"""
import base64
from pathlib import Path
from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse, Response

from config import IMAGE_DIR, PITH_CSV
from backend import load_pith_coordinates, get_sample_images

router = APIRouter()


@router.get("/api/samples")
async def list_samples():
    """
    List all available sample images with their pith coordinates.
    Used by the sample image selector on the /analyze page.
    """
    pith_coords = load_pith_coordinates()
    sample_names = get_sample_images()

    samples = []
    for name in sample_names:
        if name in pith_coords:
            cx, cy = pith_coords[name]
            samples.append({
                'name': name,
                'filename': f"{name}.png",
                'cx': cx,
                'cy': cy,
                'thumbnail_url': f"/api/samples/{name}/thumbnail"
            })

    return JSONResponse(content={'samples': samples})


@router.get("/api/samples/{image_name}/thumbnail")
async def get_sample_thumbnail(image_name: str):
    """
    Return a small thumbnail of a sample image.
    The frontend displays these in the sample image selector strip.
    """
    import cv2
    import numpy as np

    # Find the image
    image_path = None
    for ext in ['.png', '.jpg', '.PNG', '.JPG']:
        candidate = IMAGE_DIR / f"{image_name}{ext}"
        if candidate.exists():
            image_path = candidate
            break

    if image_path is None:
        raise HTTPException(status_code=404, detail=f"Sample image '{image_name}' not found.")

    # Read and resize to thumbnail
    img = cv2.imread(str(image_path))
    if img is None:
        raise HTTPException(status_code=500, detail="Could not read image.")

    # Resize to 200x200 for thumbnail
    thumbnail = cv2.resize(img, (200, 200), interpolation=cv2.INTER_AREA)

    # Encode as JPEG for smaller size
    _, encoded = cv2.imencode('.jpg', thumbnail, [cv2.IMWRITE_JPEG_QUALITY, 80])

    return Response(content=encoded.tobytes(), media_type="image/jpeg")


@router.get("/api/samples/{image_name}/full")
async def get_sample_full_image(image_name: str):
    """
    Return the full resolution sample image for display on the analyze page
    when the user selects a sample.
    """
    image_path = None
    for ext in ['.png', '.jpg', '.PNG', '.JPG']:
        candidate = IMAGE_DIR / f"{image_name}{ext}"
        if candidate.exists():
            image_path = candidate
            break

    if image_path is None:
        raise HTTPException(status_code=404, detail=f"Sample '{image_name}' not found.")

    with open(image_path, 'rb') as f:
        content = f.read()

    suffix = image_path.suffix.lower()
    media_type = "image/png" if suffix == ".png" else "image/jpeg"

    return Response(content=content, media_type=media_type)
