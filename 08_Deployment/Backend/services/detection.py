"""
Detection service — wraps existing cstrd_wrapper.py (optimized: direct import)
"""
import sys
import importlib
from pathlib import Path
from config import SCRIPTS_DIR, CSTRD_ROOT, API_RESULTS_DIR
import cv2
import base64

# Ensure CS-TRD package is importable for the direct import path in cstrd_wrapper
if str(CSTRD_ROOT) not in sys.path:
    sys.path.insert(0, str(CSTRD_ROOT))

# Import existing wrapper
import cstrd_wrapper

def run_detection_for_upload(
    image_path: Path,
    cx: int,
    cy: int,
    analysis_id: str,
    params: dict | None = None,
    mode: str = "baseline",
) -> dict | None:
    """
    Run CS-TRD detection on an uploaded image.
    
    Returns dict with:
    - shapes: list of polygon shapes from labelme.json
    - image_width: int
    - image_height: int
    - output_dir: Path
    - overlay_base64: str | None
    """
    output_dir = API_RESULTS_DIR / analysis_id / "detection"
    output_dir.mkdir(parents=True, exist_ok=True)

    # Use the existing optimized run_cstrd function
    # save_imgs=False by default for speed; overlay generated separately below
    result = cstrd_wrapper.run_cstrd(
        image_path=image_path,
        cx=cx,
        cy=cy,
        output_dir=output_dir,
        save_imgs=True,  # Need output.png for the overlay
        params=params,
        mode=mode,
    )

    if result is None:
        return None

    shapes = result.get('shapes', [])
    if not shapes:
        return None

    # Get image dimensions (labelme.json has null for these)
    img_w, img_h = cstrd_wrapper.get_image_size(image_path)

    # Read the pre-rendered overlay image that CS-TRD produced
    overlay_base64 = None
    output_png = output_dir / "output.png"
    if output_png.exists():
        with open(output_png, 'rb') as f:
            img_bytes = f.read()
        overlay_base64 = "data:image/png;base64," + base64.b64encode(img_bytes).decode('utf-8')

    return {
        'shapes': shapes,
        'image_width': img_w or 0,
        'image_height': img_h or 0,
        'output_dir': output_dir,
        'overlay_base64': overlay_base64,
        'labelme_data': result
    }
