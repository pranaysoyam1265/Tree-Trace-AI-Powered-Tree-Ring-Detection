"""
TreeTrace Backend - Detection and Measurement Engine
"""

import subprocess
import sys
import json
import csv
import numpy as np
from pathlib import Path

PROJECT_ROOT = Path(r"C:\Users\prana\OneDrive\Desktop\TreeTrace")
CSTRD_ROOT = Path(r"C:\Users\prana\OneDrive\Desktop\cstrd_ipol")
URUDENDRO_ROOT = Path(r"C:\Users\prana\OneDrive\Desktop\uruDendro-main")

IMAGE_DIR = PROJECT_ROOT / "01_Raw_Data" / "URuDendro" / "images"
PITH_CSV = PROJECT_ROOT / "01_Raw_Data" / "URuDendro" / "pith_location.csv"
GT_DIR = URUDENDRO_ROOT / "annotations (1)"
RESULTS_DIR = PROJECT_ROOT / "07_Outputs" / "streamlit_results"


def load_pith_coordinates():
    """Load all pith coordinates from CSV."""
    coords = {}
    if PITH_CSV.exists():
        with open(PITH_CSV, 'r') as f:
            reader = csv.DictReader(f)
            for row in reader:
                name = row['Image'].strip()
                coords[name] = (int(row['cx']), int(row['cy']))
    return coords


def get_sample_images():
    """Get list of available sample images."""
    images = []
    if IMAGE_DIR.exists():
        for ext in ['*.png', '*.jpg', '*.PNG', '*.JPG']:
            images.extend(IMAGE_DIR.glob(ext))
    # Deduplicate stems since Windows glob is case-insensitive
    unique_stems = list(set(img.stem for img in images))
    return sorted(unique_stems)


def get_image_path(image_name):
    """Get full path for an image."""
    for ext in ['.png', '.jpg', '.PNG', '.JPG']:
        path = IMAGE_DIR / f"{image_name}{ext}"
        if path.exists():
            return path
    return None


def load_ground_truth(image_name):
    """Load ground truth annotations if available."""
    gt_path = GT_DIR / f"{image_name}.json"
    if gt_path.exists():
        with open(gt_path) as f:
            return json.load(f)
    return None


def run_detection(image_path, cx, cy, output_dir):
    """Run CS-TRD with optimized parameters."""
    import cv2
    
    output_dir = Path(output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    # Get image dimensions for full-resolution processing
    img = cv2.imread(str(image_path))
    if img is not None:
        img_h, img_w = img.shape[:2]
    else:
        img_h, img_w = 0, 0

    cmd = [
        sys.executable,
        str(CSTRD_ROOT / "main.py"),
        "--input", str(image_path),
        "--cx", str(cx),
        "--cy", str(cy),
        "--output_dir", str(output_dir),
        "--root", str(CSTRD_ROOT),
        "--hsize", str(img_h),
        "--wsize", str(img_w),
        "--th_low", "5",    # Original CSTRD demo default
        "--th_high", "20",   # Original CSTRD demo default
        "--sigma", "3",      # Original CSTRD demo default
    ]

    result = subprocess.run(cmd, cwd=str(CSTRD_ROOT), capture_output=True, text=True)
    
    # Fallback to default if optimized fails
    json_path = output_dir / "labelme.json"
    if not json_path.exists() or (json_path.exists() and len(json.load(open(json_path)).get('shapes', [])) == 0):
        cmd_default = [
            sys.executable,
            str(CSTRD_ROOT / "main.py"),
            "--input", str(image_path),
            "--cx", str(cx),
            "--cy", str(cy),
            "--output_dir", str(output_dir),
            "--root", str(CSTRD_ROOT),
        ]
        subprocess.run(cmd_default, cwd=str(CSTRD_ROOT), capture_output=True, text=True)

    if json_path.exists():
        with open(json_path) as f:
            return json.load(f)
    return None


def calculate_measurements(shapes, cx, cy):
    """Calculate ring widths from detected polygons."""
    if not shapes:
        return [], []

    ring_data = []
    for shape in shapes:
        points = np.array(shape.get('points', []))
        if len(points) == 0:
            continue
        distances = np.sqrt((points[:, 0] - cx) ** 2 + (points[:, 1] - cy) ** 2)
        ring_data.append({
            'label': shape.get('label', '?'),
            'mean_radius': float(np.mean(distances)),
            'min_radius': float(np.min(distances)),
            'max_radius': float(np.max(distances)),
            'std_radius': float(np.std(distances)),
            'points': points
        })

    ring_data.sort(key=lambda x: x['mean_radius'])

    widths = []
    for i, ring in enumerate(ring_data):
        inner = 0 if i == 0 else ring_data[i - 1]['mean_radius']
        outer = ring['mean_radius']
        widths.append({
            'ring': i + 1,
            'width_px': round(outer - inner, 2),
            'radius_px': round(outer, 2),
            'eccentricity': round(ring['std_radius'] / ring['mean_radius'], 4)
            if ring['mean_radius'] > 0 else 0
        })

    return widths, ring_data


def save_results(image_name, results):
    """Save results to project output folder."""
    output_dir = RESULTS_DIR / image_name
    output_dir.mkdir(parents=True, exist_ok=True)

    json_path = output_dir / "results.json"
    with open(json_path, 'w') as f:
        # Convert numpy types
        json.dump(results, f, indent=2, default=str)

    return output_dir


def load_saved_results():
    """Load list of previously saved results."""
    results = []
    if RESULTS_DIR.exists():
        for folder in sorted(RESULTS_DIR.iterdir()):
            if folder.is_dir():
                json_path = folder / "results.json"
                if json_path.exists():
                    with open(json_path) as f:
                        data = json.load(f)
                    results.append({'name': folder.name, 'data': data})
    return results