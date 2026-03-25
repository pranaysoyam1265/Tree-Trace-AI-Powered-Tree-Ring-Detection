"""
Image Preprocessing Service
Prepares arbitrary tree cross-section images for CS-TRD ring detection.

Pipeline:
  1. CLAHE contrast enhancement
  2. Background segmentation (SimpleUNet)
  3. Auto-crop to disc bounding box
  4. Pad to square
  5. Resolution normalization
  6. Auto-pith detection (centroid of segmented disc)
"""

import cv2
import numpy as np
from pathlib import Path

# Optional: segmentation model
_segmenter_model = None
_segmenter_device = None


def _load_segmenter():
    """Lazy-load the SimpleUNet segmentation model."""
    global _segmenter_model, _segmenter_device

    if _segmenter_model is not None:
        return _segmenter_model, _segmenter_device

    try:
        import torch
        import sys

        # Add model directory to path
        project_root = Path(__file__).parent.parent.parent.parent
        ml_core = project_root / "06_ML_Core"
        sys.path.insert(0, str(ml_core))

        from models.segmenter import SimpleUNet

        model_path = project_root / "05_Models" / "Segmentation_v2" / "segmenter_v2_best.pth"
        if not model_path.exists():
            print(f"  [PREPROCESS] Segmenter model not found at {model_path}")
            return None, None

        device = "cuda" if torch.cuda.is_available() else "cpu"
        checkpoint = torch.load(str(model_path), map_location=device, weights_only=False)
        state_dict = checkpoint.get("model_state_dict", checkpoint)

        model = SimpleUNet(in_channels=3, out_channels=1, base_c=32)
        try:
            model.load_state_dict(state_dict)
        except RuntimeError:
            model = SimpleUNet(in_channels=3, out_channels=1, base_c=64)
            model.load_state_dict(state_dict)

        model.to(device)
        model.eval()

        _segmenter_model = model
        _segmenter_device = device
        print(f"  [PREPROCESS] Segmenter loaded on {device}")
        return model, device

    except Exception as e:
        print(f"  [PREPROCESS] Failed to load segmenter: {e}")
        return None, None


def apply_clahe(image: np.ndarray) -> np.ndarray:
    """Apply CLAHE contrast enhancement to normalize illumination."""
    lab = cv2.cvtColor(image, cv2.COLOR_BGR2LAB)
    l_channel, a, b = cv2.split(lab)

    clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8))
    l_enhanced = clahe.apply(l_channel)

    lab_enhanced = cv2.merge([l_enhanced, a, b])
    return cv2.cvtColor(lab_enhanced, cv2.COLOR_LAB2BGR)


def segment_disc(image: np.ndarray) -> np.ndarray | None:
    """
    Use SimpleUNet to create a binary mask of the wood disc.
    Returns a binary mask (0/255) at image resolution, or None if model unavailable.
    """
    model, device = _load_segmenter()
    if model is None:
        return None

    import torch

    h, w = image.shape[:2]
    # Model expects 256x256 RGB input
    img_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    img_resized = cv2.resize(img_rgb, (256, 256))

    tensor = torch.from_numpy(img_resized).float().permute(2, 0, 1) / 255.0
    tensor = tensor.unsqueeze(0).to(device)

    with torch.no_grad():
        output = model(tensor)
        prob_map = torch.sigmoid(output).squeeze().cpu().numpy()

    # Binarize at 0.5 threshold
    mask_small = (prob_map > 0.5).astype(np.uint8) * 255

    # Resize mask back to original image size
    mask = cv2.resize(mask_small, (w, h), interpolation=cv2.INTER_NEAREST)

    # Clean up: morphological close to fill small holes
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (15, 15))
    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel)

    return mask


def create_fallback_mask(image: np.ndarray) -> np.ndarray:
    """
    Fallback disc mask using color-based segmentation when the ML model is unavailable.
    Assumes the disc is a roughly circular brown/tan object against a different-colored background.
    """
    h, w = image.shape[:2]
    hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)

    # Wood is typically in the brown/tan range
    lower_wood = np.array([5, 20, 50])
    upper_wood = np.array([30, 255, 230])
    mask1 = cv2.inRange(hsv, lower_wood, upper_wood)

    # Also include lighter wood tones
    lower_light = np.array([0, 10, 100])
    upper_light = np.array([40, 180, 255])
    mask2 = cv2.inRange(hsv, lower_light, upper_light)

    mask = cv2.bitwise_or(mask1, mask2)

    # Heavy morphological cleanup
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (25, 25))
    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel)
    mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel)

    # Keep only the largest contour (the disc)
    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    if contours:
        largest = max(contours, key=cv2.contourArea)
        mask = np.zeros_like(mask)
        cv2.drawContours(mask, [largest], -1, 255, -1)

    return mask


def auto_detect_pith(mask: np.ndarray) -> tuple[int, int] | None:
    """
    Detect pith location as the centroid of the disc mask.
    Returns (cx, cy) or None.
    """
    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    if not contours:
        return None

    largest = max(contours, key=cv2.contourArea)
    M = cv2.moments(largest)
    if M["m00"] == 0:
        return None

    cx = int(M["m10"] / M["m00"])
    cy = int(M["m01"] / M["m00"])
    return cx, cy


def crop_to_disc(image: np.ndarray, mask: np.ndarray, cx: int, cy: int):
    """
    Crop image to the disc bounding box with padding.
    Returns (cropped_image, new_cx, new_cy).
    """
    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    if not contours:
        return image, cx, cy

    largest = max(contours, key=cv2.contourArea)
    x, y, w, h = cv2.boundingRect(largest)

    # Add 5% padding
    pad = int(max(w, h) * 0.05)
    x1 = max(0, x - pad)
    y1 = max(0, y - pad)
    x2 = min(image.shape[1], x + w + pad)
    y2 = min(image.shape[0], y + h + pad)

    cropped = image[y1:y2, x1:x2]
    new_cx = cx - x1
    new_cy = cy - y1

    return cropped, new_cx, new_cy


def pad_to_square(image: np.ndarray, cx: int, cy: int):
    """Pad image to square, keeping content centered. Returns (padded, new_cx, new_cy)."""
    h, w = image.shape[:2]
    if h == w:
        return image, cx, cy

    size = max(h, w)
    pad_top = (size - h) // 2
    pad_left = (size - w) // 2

    padded = cv2.copyMakeBorder(
        image, pad_top, size - h - pad_top, pad_left, size - w - pad_left,
        cv2.BORDER_CONSTANT, value=[0, 0, 0]
    )

    return padded, cx + pad_left, cy + pad_top


def compute_adaptive_thresholds(image: np.ndarray) -> dict:
    """
    Compute adaptive Canny thresholds from image histogram using Otsu's method.
    Returns dict with th_low, th_high, sigma.
    """
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY) if len(image.shape) == 3 else image

    # Use Otsu to find optimal threshold
    otsu_thresh, _ = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)

    # Derive Canny thresholds from Otsu
    th_high = max(5, min(30, otsu_thresh * 0.15))
    th_low = max(2, th_high * 0.3)

    # Compute image sharpness (Laplacian variance) to adjust sigma
    laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
    # Blurry images (low variance) need less smoothing; sharp images can handle more
    if laplacian_var > 500:
        sigma = 4.0   # Very sharp — more smoothing to reduce noise
    elif laplacian_var > 100:
        sigma = 3.0   # Normal
    else:
        sigma = 2.0   # Blurry — less smoothing

    return {
        "th_low": round(th_low, 1),
        "th_high": round(th_high, 1),
        "sigma": sigma,
        "otsu_threshold": otsu_thresh,
        "laplacian_variance": round(laplacian_var, 1),
    }


def compute_resolution_params(width: int, height: int) -> dict:
    """
    Auto-scale detection parameters based on image resolution.
    Smaller images -> lower sigma, fewer rays. Larger -> higher sigma, more rays.
    """
    longest = max(width, height)

    if longest <= 500:
        return {"sigma": 2.0, "nr": 180, "alpha": 20, "min_chain_length": 1}
    elif longest <= 1000:
        return {"sigma": 3.0, "nr": 360, "alpha": 25, "min_chain_length": 2}
    elif longest <= 2000:
        return {"sigma": 3.0, "nr": 360, "alpha": 30, "min_chain_length": 2}
    else:
        return {"sigma": 4.0, "nr": 360, "alpha": 30, "min_chain_length": 3}


# Species presets
SPECIES_PRESETS = {
    "auto": {},  # will use adaptive thresholds
    "softwood": {
        "sigma": 3.0,
        "th_low": 3,
        "th_high": 15,
        "alpha": 30,
        "nr": 360,
        "min_chain_length": 2,
    },
    "hardwood": {
        "sigma": 4.0,
        "th_low": 2,
        "th_high": 10,
        "alpha": 20,
        "nr": 360,
        "min_chain_length": 1,
    },
}


def preprocess_image(
    image_path: Path,
    output_dir: Path,
    cx: int | None = None,
    cy: int | None = None,
    preset: str = "auto",
) -> dict:
    """
    Full preprocessing pipeline.

    Returns dict with:
      - processed_path: Path to the preprocessed image
      - cx, cy: pith coordinates (auto-detected or adjusted)
      - pith_auto_detected: bool
      - detection_params: dict of recommended CS-TRD params
      - preprocessing_log: list of log strings
    """
    log = []
    image = cv2.imread(str(image_path))
    if image is None:
        return {"error": f"Could not read image: {image_path}"}

    h_orig, w_orig = image.shape[:2]
    log.append(f"Original: {w_orig}x{h_orig}")

    # Step 1: CLAHE contrast enhancement
    image = apply_clahe(image)
    log.append("Applied CLAHE contrast enhancement")

    # Step 2: Segment disc (try ML model first, fallback to color-based)
    mask = segment_disc(image)
    if mask is not None:
        log.append("Disc segmented via SimpleUNet")
    else:
        mask = create_fallback_mask(image)
        log.append("Disc segmented via color fallback")

    # Check if mask covers a reasonable area (>5% of image)
    mask_area = np.count_nonzero(mask)
    total_area = h_orig * w_orig
    mask_ratio = mask_area / total_area if total_area > 0 else 0

    use_mask = mask_ratio > 0.05 and mask_ratio < 0.98
    if not use_mask:
        log.append(f"Mask coverage {mask_ratio:.1%} -- skipping crop (likely full-frame disc)")
        mask = np.ones((h_orig, w_orig), dtype=np.uint8) * 255

    # Step 3: Auto-detect pith if not provided
    pith_auto_detected = False
    if cx is None or cy is None:
        pith = auto_detect_pith(mask)
        if pith:
            cx, cy = pith
            pith_auto_detected = True
            log.append(f"Auto-detected pith at ({cx}, {cy})")
        else:
            # Fallback: center of image
            cx, cy = w_orig // 2, h_orig // 2
            pith_auto_detected = True
            log.append(f"Pith fallback to image center ({cx}, {cy})")

    # Step 4: Crop to disc bounding box (if mask is meaningful)
    if use_mask:
        image, cx, cy = crop_to_disc(image, mask, cx, cy)
        h_crop, w_crop = image.shape[:2]
        log.append(f"Cropped to disc: {w_crop}x{h_crop}")

    # Step 5: Pad to square
    image, cx, cy = pad_to_square(image, cx, cy)
    h_sq, w_sq = image.shape[:2]
    log.append(f"Padded to square: {w_sq}x{h_sq}")

    # Step 6: Apply background mask (set background pixels to black)
    if use_mask:
        # Re-segment on the cropped/padded image for a clean mask
        mask_final = segment_disc(image)
        if mask_final is None:
            mask_final = create_fallback_mask(image)
        if mask_final is not None and mask_final.shape[:2] == image.shape[:2]:
            image[mask_final == 0] = [0, 0, 0]
            log.append("Applied background mask")

    # Save preprocessed image
    output_dir.mkdir(parents=True, exist_ok=True)
    processed_path = output_dir / "preprocessed.png"
    cv2.imwrite(str(processed_path), image)

    # Step 7: Compute detection parameters
    h_final, w_final = image.shape[:2]

    if preset in SPECIES_PRESETS and SPECIES_PRESETS[preset]:
        detection_params = SPECIES_PRESETS[preset].copy()
        log.append(f"Using '{preset}' species preset")
    else:
        # Auto mode: combine resolution-based + adaptive thresholds
        res_params = compute_resolution_params(w_final, h_final)
        adaptive = compute_adaptive_thresholds(image)

        detection_params = {
            "sigma": adaptive["sigma"],
            "th_low": adaptive["th_low"],
            "th_high": adaptive["th_high"],
            "nr": res_params["nr"],
            "alpha": res_params["alpha"],
            "min_chain_length": res_params["min_chain_length"],
        }
        log.append(
            f"Auto params: sigma={detection_params['sigma']}, "
            f"th={detection_params['th_low']}/{detection_params['th_high']}, "
            f"nr={detection_params['nr']}"
        )

    return {
        "processed_path": processed_path,
        "cx": cx,
        "cy": cy,
        "pith_auto_detected": pith_auto_detected,
        "detection_params": detection_params,
        "preprocessing_log": log,
    }
