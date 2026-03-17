"""
09_Scripts/canny_ring_detector.py
===================================
Detect tree rings using Canny edge detection on full-resolution images.
Evaluates against UruDendro ground truth using metric_influence_area.py.

Fixed:
1. Removed incorrect pith coordinate scaling (CSV is already full resolution)
2. Fixed UruDendro subprocess import error via PYTHONPATH

Author: TreeTrace Team
Date: 2025-03
"""

import sys
import os
import json
import math
import time
import subprocess
import warnings
from pathlib import Path

import cv2
import numpy as np
import pandas as pd

warnings.filterwarnings('ignore')

# =============================================================================
# PATH CONFIGURATION
# =============================================================================

PROJECT_ROOT    = Path(r"C:\Users\prana\OneDrive\Desktop\TreeTrace")
IMAGE_DIR       = PROJECT_ROOT / "01_Raw_Data" / "URuDendro" / "images"
PITH_CSV        = PROJECT_ROOT / "01_Raw_Data" / "URuDendro" / "pith_location.csv"
PRED_OUTPUT_DIR = PROJECT_ROOT / "07_Outputs" / "canny_predictions"
EVAL_OUTPUT_DIR = PROJECT_ROOT / "07_Outputs" / "canny_evaluation"

URUDENDRO_ROOT   = Path(r"C:\Users\prana\OneDrive\Desktop\uruDendro-main")
URUDENDRO_SCRIPT = URUDENDRO_ROOT / "urudendro" / "metric_influence_area.py"
ANNOTATIONS_DIR  = URUDENDRO_ROOT / "annotations (1)"


# =============================================================================
# PITH LOADING — NO SCALING, CSV IS ALREADY FULL RESOLUTION
# =============================================================================

def load_pith_locations(csv_path: Path) -> dict:
    """
    Load pith locations from CSV.
    Coordinates are already at full image resolution — no scaling needed.

    CSV columns: Image, cy, cx  (cy before cx)
    Returns dict: image_stem -> {'cx': int, 'cy': int}
    """
    df = pd.read_csv(csv_path)
    print(f"  CSV columns: {list(df.columns)}")

    pith_dict = {}
    for _, row in df.iterrows():
        name = Path(str(row.iloc[0])).stem
        cy   = int(round(float(row.iloc[1])))
        cx   = int(round(float(row.iloc[2])))
        pith_dict[name] = {'cx': cx, 'cy': cy}

    print(f"  Loaded {len(pith_dict)} pith locations")

    # Show example — verify coordinates look reasonable
    if 'F02a' in pith_dict:
        p = pith_dict['F02a']
        print(f"\n  F02a pith: cx={p['cx']}, cy={p['cy']}")
        print(f"  (Should be near center of 2364x2364 image)")

    return pith_dict


# =============================================================================
# IMAGE PREPROCESSING
# =============================================================================

def preprocess_image(image: np.ndarray) -> np.ndarray:
    """
    Preprocess image for Canny edge detection.
    Steps:
        1. Convert to grayscale
        2. CLAHE for local contrast enhancement
        3. Gaussian blur to reduce noise
    """
    gray     = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    clahe    = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    enhanced = clahe.apply(gray)
    blurred  = cv2.GaussianBlur(enhanced, (3, 3), 0)
    return blurred


# =============================================================================
# TRUNK MASK
# =============================================================================

def get_trunk_mask(image: np.ndarray, pith: tuple) -> np.ndarray:
    """
    Create a binary mask of the trunk region.
    Returns binary mask: 255 inside trunk, 0 outside.
    """
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    h, w = gray.shape
    cx, cy = pith

    # Otsu threshold
    _, thresh = cv2.threshold(
        gray, 0, 255,
        cv2.THRESH_BINARY + cv2.THRESH_OTSU
    )

    # Find component closest to pith
    num_labels, labels, stats, centroids = cv2.connectedComponentsWithStats(
        thresh, connectivity=8
    )

    best_label = 1
    best_dist  = float('inf')

    for label in range(1, num_labels):
        centroid_x, centroid_y = centroids[label]
        dist = math.sqrt((centroid_x - cx)**2 + (centroid_y - cy)**2)
        area = stats[label, cv2.CC_STAT_AREA]

        if area > (h * w * 0.05) and dist < best_dist:
            best_dist  = dist
            best_label = label

    mask = (labels == best_label).astype(np.uint8) * 255

    # Fill holes
    contours, _ = cv2.findContours(
        mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE
    )
    if contours:
        largest = max(contours, key=cv2.contourArea)
        filled  = np.zeros((h, w), dtype=np.uint8)
        cv2.drawContours(filled, [largest], -1, 255, cv2.FILLED)
        mask = filled

    return mask


# =============================================================================
# CANNY EDGE DETECTION
# =============================================================================

def detect_edges(preprocessed: np.ndarray,
                 low_threshold:  int = 20,
                 high_threshold: int = 60) -> np.ndarray:
    """Apply Canny edge detection."""
    return cv2.Canny(preprocessed, low_threshold, high_threshold)


# =============================================================================
# CONTOUR FILTERING
# =============================================================================

def is_ring_like(contour: np.ndarray,
                 pith:    tuple,
                 img_h:   int,
                 img_w:   int,
                 min_arc_fraction: float = 0.3) -> bool:
    """
    Determine if a contour is likely a tree ring.
    A valid ring must:
    1. Have sufficient arc length
    2. Be centered near the pith
    3. Not be too small or too large
    4. Not be a straight line
    """
    cx, cy = pith

    # Check 1: Minimum area
    area = cv2.contourArea(contour)
    if area < 1000:
        return False

    # Check 2: Not image border
    if area > img_h * img_w * 0.90:
        return False

    # Check 3: Centroid near pith
    M = cv2.moments(contour)
    if M['m00'] == 0:
        return False

    centroid_x = M['m10'] / M['m00']
    centroid_y = M['m01'] / M['m00']

    max_dist = min(img_h, img_w) * 0.35
    dist     = math.sqrt((centroid_x - cx)**2 + (centroid_y - cy)**2)
    if dist > max_dist:
        return False

    # Check 4: Arc length relative to expected circumference
    perimeter  = cv2.arcLength(contour, False)
    radius_est = max(
        math.sqrt((centroid_x - cx)**2 + (centroid_y - cy)**2),
        10
    )
    expected_circ = 2 * math.pi * radius_est
    arc_fraction  = perimeter / (expected_circ + 1e-8)

    if arc_fraction < min_arc_fraction:
        return False

    # Check 5: Not a straight line (eccentricity check)
    if len(contour) >= 5:
        try:
            ellipse      = cv2.fitEllipse(contour)
            axes         = ellipse[1]
            if axes[0] > 0 and axes[1] > 0:
                eccentricity = min(axes) / max(axes)
                if eccentricity < 0.05:
                    return False
        except cv2.error:
            pass

    return True


def filter_ring_contours(edges:  np.ndarray,
                         mask:   np.ndarray,
                         pith:   tuple,
                         img_h:  int,
                         img_w:  int) -> list:
    """
    Extract and filter contours to keep only ring-like curves.
    Returns list sorted by distance from pith (innermost first).
    """
    # Apply mask
    masked_edges = cv2.bitwise_and(edges, edges, mask=mask)

    # Dilate to connect broken segments
    kernel  = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))
    dilated = cv2.dilate(masked_edges, kernel, iterations=1)

    # Find contours
    contours, _ = cv2.findContours(
        dilated, cv2.RETR_LIST, cv2.CHAIN_APPROX_NONE
    )

    # Filter
    ring_contours = [
        c for c in contours
        if is_ring_like(c, pith, img_h, img_w)
    ]

    # Sort by centroid distance from pith
    def centroid_dist(contour):
        M = cv2.moments(contour)
        if M['m00'] == 0:
            return float('inf')
        cx_c = M['m10'] / M['m00']
        cy_c = M['m01'] / M['m00']
        return math.sqrt((cx_c - pith[0])**2 + (cy_c - pith[1])**2)

    ring_contours.sort(key=centroid_dist)

    return ring_contours


# =============================================================================
# LABELME JSON EXPORT
# =============================================================================

def contours_to_labelme_json(contours:   list,
                              image_path: Path,
                              img_h:      int,
                              img_w:      int) -> dict:
    """Convert OpenCV contours to LabelMe JSON format."""
    shapes = []

    for ring_idx, contour in enumerate(contours, start=1):
        epsilon = 0.5
        approx  = cv2.approxPolyDP(contour, epsilon, False)

        points = []
        for point in approx:
            x = float(np.clip(point[0][0], 0, img_w - 1))
            y = float(np.clip(point[0][1], 0, img_h - 1))
            points.append([x, y])

        if len(points) < 3:
            continue

        shapes.append({
            "label":       str(ring_idx),
            "points":      points,
            "group_id":    None,
            "description": "",
            "shape_type":  "polygon",
            "flags":       {}
        })

    return {
        "version":     "5.0.1",
        "flags":       {},
        "shapes":      shapes,
        "imagePath":   image_path.name,
        "imageData":   None,
        "imageHeight": img_h,
        "imageWidth":  img_w
    }


def save_prediction_json(labelme_json: dict, output_path: Path):
    """Save LabelMe JSON to disk."""
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, 'w') as f:
        json.dump(labelme_json, f, indent=2)


# =============================================================================
# VISUALIZATION
# =============================================================================

def save_detection_visualization(image:      np.ndarray,
                                 contours:   list,
                                 pith:       tuple,
                                 name:       str,
                                 output_dir: Path):
    """Save visualization of detected rings on original image."""
    vis    = image.copy()
    colors = [
        (0, 255, 0), (0, 0, 255), (255, 0, 0),
        (0, 255, 255), (255, 0, 255), (255, 255, 0),
    ]

    for i, contour in enumerate(contours):
        cv2.drawContours(vis, [contour], -1, colors[i % len(colors)], 3)

    cx, cy = pith
    cv2.circle(vis, (cx, cy), 12, (0, 255, 0),    -1)
    cv2.circle(vis, (cx, cy), 15, (255, 255, 255),  2)

    cv2.putText(
        vis,
        f"Rings detected: {len(contours)}",
        (80, 100),
        cv2.FONT_HERSHEY_SIMPLEX,
        2.5, (255, 255, 255), 5
    )

    output_dir.mkdir(parents=True, exist_ok=True)
    cv2.imwrite(str(output_dir / f"{name}_detection.png"), vis)


# =============================================================================
# URUDENDRO EVALUATION — FIXED IMPORT ERROR
# =============================================================================

def parse_metrics(stdout: str) -> dict:
    """Parse UruDendro evaluation stdout for metric values."""
    import re

    metrics = {
        'precision': None, 'recall': None,
        'f1': None,        'rmse':   None,
        'tp': None,        'fp':     None, 'fn': None,
    }

    for line in stdout.splitlines():
        ll = line.lower().strip()

        if 'f1' in ll or 'f-score' in ll:
            m = re.search(r'\d+\.\d+', line)
            if m:
                metrics['f1'] = float(m.group())

        if 'precision' in ll:
            m = re.search(r'\d+\.\d+', line)
            if m:
                metrics['precision'] = float(m.group())

        if 'recall' in ll:
            m = re.search(r'\d+\.\d+', line)
            if m:
                metrics['recall'] = float(m.group())

        if 'rmse' in ll:
            m = re.search(r'\d+\.\d+', line)
            if m:
                metrics['rmse'] = float(m.group())

        if 'tp=' in ll or 'tp =' in ll:
            tp = re.search(r'tp[=\s]+(\d+)', line, re.IGNORECASE)
            fp = re.search(r'fp[=\s]+(\d+)', line, re.IGNORECASE)
            fn = re.search(r'fn[=\s]+(\d+)', line, re.IGNORECASE)
            if tp: metrics['tp'] = int(tp.group(1))
            if fp: metrics['fp'] = int(fp.group(1))
            if fn: metrics['fn'] = int(fn.group(1))

    return metrics


def run_evaluation(pred_json:  Path,
                   gt_json:    Path,
                   img_path:   Path,
                   cx:         int,
                   cy:         int,
                   output_dir: Path) -> dict:
    """
    Run UruDendro metric_influence_area.py as subprocess.

    FIX: Set PYTHONPATH so UruDendro can import its own package.
    """
    output_dir.mkdir(parents=True, exist_ok=True)

    # Fix: Add UruDendro root to PYTHONPATH so
    # 'from urudendro.io import ...' works correctly
    env = os.environ.copy()
    existing_path = env.get('PYTHONPATH', '')
    if existing_path:
        env['PYTHONPATH'] = f"{URUDENDRO_ROOT}{os.pathsep}{existing_path}"
    else:
        env['PYTHONPATH'] = str(URUDENDRO_ROOT)

    cmd = [
        sys.executable,
        str(URUDENDRO_SCRIPT),
        "--dt_filename",  str(pred_json),
        "--gt_filename",  str(gt_json),
        "--img_filename", str(img_path),
        "--cx",           str(cx),
        "--cy",           str(cy),
        "--output_dir",   str(output_dir),
        "--th",           "0.5"
    ]

    try:
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            cwd=str(URUDENDRO_ROOT),
            env=env,
            timeout=180
        )

        metrics           = parse_metrics(result.stdout)
        metrics['stdout'] = result.stdout
        metrics['stderr'] = result.stderr[:300] if result.stderr else ''

        if result.returncode != 0:
            print(f"    WARNING: Return code {result.returncode}")
            if result.stderr:
                print(f"    STDERR: {result.stderr[:200]}")

        return metrics

    except subprocess.TimeoutExpired:
        print(f"    TIMEOUT after 180s")
        return {k: None for k in
                ['precision','recall','f1','rmse',
                 'tp','fp','fn','stdout','stderr']}

    except Exception as e:
        print(f"    ERROR: {e}")
        return {k: None for k in
                ['precision','recall','f1','rmse',
                 'tp','fp','fn','stdout','stderr']}


# =============================================================================
# PROCESS ONE IMAGE
# =============================================================================

def process_image(name:      str,
                  img_path:  Path,
                  pith_info: dict,
                  run_eval:  bool = True) -> dict:
    """Full pipeline for one image."""
    cx = pith_info['cx']
    cy = pith_info['cy']

    # Load image
    image = cv2.imread(str(img_path))
    if image is None:
        raise ValueError(f"Could not load: {img_path}")

    img_h, img_w = image.shape[:2]

    # Pipeline
    preprocessed  = preprocess_image(image)
    mask          = get_trunk_mask(image, (cx, cy))
    edges         = detect_edges(preprocessed)
    ring_contours = filter_ring_contours(
        edges, mask, (cx, cy), img_h, img_w
    )

    pred_rings = len(ring_contours)

    # Visualize
    save_detection_visualization(
        image, ring_contours, (cx, cy),
        name, PRED_OUTPUT_DIR
    )

    # Export JSON
    lm_json   = contours_to_labelme_json(
        ring_contours, img_path, img_h, img_w
    )
    pred_json = PRED_OUTPUT_DIR / f"{name}_pred.json"
    save_prediction_json(lm_json, pred_json)

    result = {
        'image':      name,
        'pred_rings': pred_rings,
        'cx':         cx,
        'cy':         cy,
    }

    # Ground truth ring count
    gt_json = ANNOTATIONS_DIR / f"{name}.json"
    if not gt_json.exists():
        print(f"    No ground truth: {gt_json.name}")
        result['gt_rings'] = None
        return result

    with open(gt_json, 'r') as f:
        gt_data = json.load(f)
    gt_rings          = sum(
        1 for s in gt_data.get('shapes', [])
        if s.get('shape_type') == 'polygon'
    )
    result['gt_rings'] = gt_rings

    # Evaluate
    if run_eval:
        metrics = run_evaluation(
            pred_json, gt_json, img_path,
            cx, cy,
            EVAL_OUTPUT_DIR / name
        )
        result.update({
            'precision': metrics['precision'],
            'recall':    metrics['recall'],
            'f1':        metrics['f1'],
            'rmse':      metrics['rmse'],
            'tp':        metrics['tp'],
            'fp':        metrics['fp'],
            'fn':        metrics['fn'],
        })

    return result


# =============================================================================
# MAIN
# =============================================================================

def main():
    print("=" * 60)
    print("TreeTrace — Canny Ring Detector (Fixed)")
    print("=" * 60)

    # Pre-flight checks
    print("\nChecking paths...")
    checks = [
        ("Image dir",        IMAGE_DIR),
        ("Pith CSV",         PITH_CSV),
        ("UruDendro script", URUDENDRO_SCRIPT),
        ("Annotations dir",  ANNOTATIONS_DIR),
    ]
    all_ok = True
    for label, path in checks:
        ok = path.exists()
        print(f"  {'✓' if ok else '✗'} {label}: {path}")
        if not ok:
            all_ok = False

    if not all_ok:
        print("\nERROR: Paths missing.")
        sys.exit(1)

    PRED_OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    EVAL_OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    # Load pith (no scaling)
    print("\nLoading pith locations...")
    pith_dict = load_pith_locations(PITH_CSV)

    # Find images
    image_paths = sorted(
        list(IMAGE_DIR.glob("*.png")) +
        list(IMAGE_DIR.glob("*.jpg"))
    )
    print(f"\nImages found: {len(image_paths)}")

    # -----------------------------------------------------------------------
    # Test on F02a first
    # -----------------------------------------------------------------------
    print("\n" + "=" * 60)
    print("STEP 1: Testing on F02a")
    print("=" * 60)

    f02a_path = IMAGE_DIR / "F02a.png"
    if not f02a_path.exists():
        f02a_path = IMAGE_DIR / "F02a.jpg"

    if f02a_path.exists() and "F02a" in pith_dict:
        t_start = time.time()
        result  = process_image(
            "F02a", f02a_path,
            pith_dict["F02a"],
            run_eval=True
        )
        elapsed = time.time() - t_start

        print(f"\n  F02a Results:")
        print(f"    Ground truth rings: {result.get('gt_rings', 'N/A')}")
        print(f"    Detected rings:     {result['pred_rings']}")
        print(f"    Pith used:          cx={result['cx']}, cy={result['cy']}")
        print(f"    Precision:          {result.get('precision', 'N/A')}")
        print(f"    Recall:             {result.get('recall', 'N/A')}")
        print(f"    F1 Score:           {result.get('f1', 'N/A')}")
        print(f"    RMSE:               {result.get('rmse', 'N/A')}")
        print(f"    Time:               {elapsed:.1f}s")
        print(f"\n  Check: {PRED_OUTPUT_DIR / 'F02a_detection.png'}")

        print("\n" + "=" * 60)
        answer = input(
            "Proceed with all 64 images? (yes/no): "
        ).strip().lower()

        if answer != 'yes':
            print("Stopped. Review F02a results first.")
            sys.exit(0)

    # -----------------------------------------------------------------------
    # Full run
    # -----------------------------------------------------------------------
    print("\n" + "=" * 60)
    print("STEP 2: Processing all 64 images")
    print("=" * 60)

    all_results = []

    for idx, img_path in enumerate(image_paths):
        name = img_path.stem

        if name not in pith_dict:
            print(f"  [{idx+1:2d}/{len(image_paths)}] "
                  f"{name:10s}  SKIP — no pith")
            continue

        t_start = time.time()

        try:
            result  = process_image(
                name, img_path,
                pith_dict[name],
                run_eval=True
            )
            elapsed = time.time() - t_start

            f1_str = (f"{result['f1']:.3f}"
                      if result.get('f1') is not None else "N/A")
            print(
                f"  [{idx+1:2d}/{len(image_paths)}] {name:10s}  "
                f"GT={result.get('gt_rings','?'):>3}  "
                f"Pred={result['pred_rings']:>3}  "
                f"F1={f1_str}  {elapsed:.1f}s"
            )
            all_results.append(result)

        except Exception as e:
            print(f"  [{idx+1:2d}/{len(image_paths)}] "
                  f"{name:10s}  ERROR: {e}")

    # -----------------------------------------------------------------------
    # Save report
    # -----------------------------------------------------------------------
    print("\n" + "=" * 60)
    print("Saving report...")

    df          = pd.DataFrame(all_results)
    report_path = EVAL_OUTPUT_DIR / "full_report.csv"
    df.to_csv(report_path, index=False)

    valid = df.dropna(subset=['f1'])
    if len(valid) > 0:
        print(f"\n  Images evaluated:  {len(valid)}")
        print(f"  Mean Precision:    {valid['precision'].mean():.3f}")
        print(f"  Mean Recall:       {valid['recall'].mean():.3f}")
        print(f"  Mean F1:           {valid['f1'].mean():.3f}")
        print(f"  Mean RMSE:         {valid['rmse'].mean():.3f}")

        if 'gt_rings' in df.columns and 'pred_rings' in df.columns:
            v2   = df.dropna(subset=['gt_rings','pred_rings'])
            diff = v2['pred_rings'] - v2['gt_rings']
            n    = len(v2)
            print(f"\n  Ring Count Accuracy:")
            print(f"    Mean error:     {diff.mean():+.1f}")
            print(f"    Mean abs error: {diff.abs().mean():.1f}")
            print(f"    Exact match:    "
                  f"{(diff==0).sum()}/{n} "
                  f"({100*(diff==0).sum()/n:.0f}%)")
            print(f"    Within ±1:      "
                  f"{(diff.abs()<=1).sum()}/{n} "
                  f"({100*(diff.abs()<=1).sum()/n:.0f}%)")
            print(f"    Within ±3:      "
                  f"{(diff.abs()<=3).sum()}/{n} "
                  f"({100*(diff.abs()<=3).sum()/n:.0f}%)")

    print(f"\n  Report: {report_path}")
    print("=" * 60)


if __name__ == "__main__":
    main()