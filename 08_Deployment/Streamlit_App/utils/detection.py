"""
Detection utilities for TreeTrace Streamlit app
"""

import subprocess
import sys
import json
import numpy as np
from pathlib import Path

PROJECT_ROOT = Path(__file__).parent.parent.parent.parent
CSTRD_ROOT = Path(r"C:\Users\prana\OneDrive\Desktop\cstrd_ipol")
URUDENDRO_ROOT = Path(r"C:\Users\prana\OneDrive\Desktop\uruDendro-main")


def run_cstrd_detection(image_path, cx, cy, output_dir):
    """
    Run CS-TRD detection on an image.
    
    Args:
        image_path: Path to input image
        cx, cy: Pith coordinates
        output_dir: Output directory
    
    Returns:
        dict: Detection results or None if failed
    """
    output_dir = Path(output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)
    
    cmd = [
        sys.executable,
        str(CSTRD_ROOT / "main.py"),
        "--input", str(image_path),
        "--cx", str(cx),
        "--cy", str(cy),
        "--output_dir", str(output_dir),
        "--root", str(CSTRD_ROOT),
    ]
    
    result = subprocess.run(cmd, cwd=str(CSTRD_ROOT), capture_output=True, text=True)
    
    json_path = output_dir / "labelme.json"
    if json_path.exists():
        with open(json_path) as f:
            return json.load(f)
    return None


def load_ground_truth(image_name):
    """Load ground truth annotations if available."""
    gt_path = URUDENDRO_ROOT / "annotations (1)" / f"{image_name}.json"
    if gt_path.exists():
        with open(gt_path) as f:
            return json.load(f)
    return None


def calculate_ring_widths(shapes, cx, cy):
    """Calculate ring widths from detected polygons."""
    if not shapes:
        return [], []
    
    ring_data = []
    for shape in shapes:
        points = np.array(shape.get('points', []))
        if len(points) == 0:
            continue
        distances = np.sqrt((points[:, 0] - cx)**2 + (points[:, 1] - cy)**2)
        ring_data.append({
            'label': shape.get('label', '?'),
            'mean_radius': float(np.mean(distances)),
            'min_radius': float(np.min(distances)),
            'max_radius': float(np.max(distances)),
            'points': points.tolist()
        })
    
    ring_data.sort(key=lambda x: x['mean_radius'])
    
    widths = []
    for i, ring in enumerate(ring_data):
        inner = 0 if i == 0 else ring_data[i-1]['mean_radius']
        outer = ring['mean_radius']
        widths.append({
            'ring': i + 1,
            'width_px': round(outer - inner, 2),
            'radius_px': round(outer, 2),
            'min_radius_px': round(ring['min_radius'], 2),
            'max_radius_px': round(ring['max_radius'], 2)
        })
    
    return widths, ring_data


def calculate_statistics(widths):
    """Calculate statistics from ring widths."""
    if not widths:
        return {}
    
    width_values = [w['width_px'] for w in widths]
    
    return {
        'ring_count': len(widths),
        'mean_width': round(np.mean(width_values), 2),
        'min_width': round(np.min(width_values), 2),
        'max_width': round(np.max(width_values), 2),
        'median_width': round(np.median(width_values), 2),
        'std_width': round(np.std(width_values), 2),
        'total_radius': round(sum(width_values), 2)
    }