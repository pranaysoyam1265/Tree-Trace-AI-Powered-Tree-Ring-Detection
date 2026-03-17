"""
Diagnose why rings only cover half the radius
"""

import json
import numpy as np
import cv2
from pathlib import Path

PROJECT_ROOT = Path(r"C:\Users\prana\OneDrive\Desktop\TreeTrace")
CSTRD_ROOT = Path(r"C:\Users\prana\OneDrive\Desktop\cstrd_ipol")

# Load F02a
image_path = PROJECT_ROOT / "01_Raw_Data" / "URuDendro" / "images" / "F02a.png"
image = cv2.imread(str(image_path))
h, w = image.shape[:2]
cx, cy = 1197, 1293

print(f"Image size: {w} x {h}")
print(f"Pith: ({cx}, {cy})")
print(f"Max possible radius: {min(cx, cy, w-cx, h-cy)}")

# Load detection
det_path = PROJECT_ROOT / "07_Outputs" / "cstrd_results" / "F02a" / "labelme.json"
with open(det_path) as f:
    det = json.load(f)

shapes = det.get('shapes', [])
print(f"\nDetected rings: {len(shapes)}")

if shapes:
    # Check each ring's radius
    max_det_radius = 0
    for shape in shapes:
        pts = np.array(shape['points'])
        dists = np.sqrt((pts[:,0]-cx)**2 + (pts[:,1]-cy)**2)
        max_det_radius = max(max_det_radius, dists.max())
        print(f"Ring {shape['label']:>2}: mean_r={dists.mean():7.1f}, max_r={dists.max():7.1f}")
    
    print(f"\nMax detected radius: {max_det_radius:.0f}")
    print(f"Max possible radius: {min(cx, cy, w-cx, h-cy)}")
    print(f"Coverage: {max_det_radius / min(cx, cy, w-cx, h-cy) * 100:.1f}%")

# Check if CS-TRD resized the image
config_path = PROJECT_ROOT / "07_Outputs" / "cstrd_results" / "F02a" / "config.json"
if config_path.exists():
    with open(config_path) as f:
        config = json.load(f)
    print(f"\nCS-TRD Config:")
    for k, v in config.items():
        print(f"  {k}: {v}")

# Also check GT ring radii for comparison
gt_path = Path(r"C:\Users\prana\OneDrive\Desktop\uruDendro-main\annotations (1)\F02a.json")
if gt_path.exists():
    with open(gt_path) as f:
        gt = json.load(f)
    
    gt_shapes = gt.get('shapes', [])
    print(f"\nGround Truth rings: {len(gt_shapes)}")
    
    gt_max_radius = 0
    for shape in gt_shapes:
        pts = np.array(shape['points'])
        dists = np.sqrt((pts[:,0]-cx)**2 + (pts[:,1]-cy)**2)
        gt_max_radius = max(gt_max_radius, dists.max())
        print(f"GT Ring {shape['label']:>2}: mean_r={dists.mean():7.1f}, max_r={dists.max():7.1f}")
    
    print(f"\nGT max radius: {gt_max_radius:.0f}")
    print(f"Detection covers {max_det_radius/gt_max_radius*100:.1f}% of GT range")