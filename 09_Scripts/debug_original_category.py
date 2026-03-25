"""
Phase 1 -- Debug Original Category Anomaly
Investigates why the "original" augmentation category has extremely low F1.
Filters metrics, ranks cases, runs integrity checks, and generates overlays.

Usage:
    python 09_Scripts/debug_original_category.py
"""

import sys
import csv
import json
import cv2
import numpy as np
from pathlib import Path
from math import floor

PROJECT_ROOT = Path(r"C:\Users\prana\OneDrive\Desktop\TreeTrace")
sys.path.insert(0, str(PROJECT_ROOT / "09_Scripts"))

from augmented_utils import (
    EVAL_RESULTS_AUG, AUGMENTED_DIR, CSTRD_RESULTS_AUG,
    parse_augmented_filename, get_augmented_pith, load_original_pith_csv
)

OUT_DIR = PROJECT_ROOT / "07_Outputs" / "debug_original_category"
ORIGINAL_IMAGES_DIR = PROJECT_ROOT / "01_Raw_Data" / "URuDendro" / "images"

def draw_polygons(img, shapes, color=(0, 255, 0), thickness=2):
    """Draw LabelMe polygons on image."""
    res = img.copy()
    for shape in shapes:
        points = shape.get("points", [])
        if len(points) > 2:
            pts = np.array(points, np.int32).reshape((-1, 1, 2))
            cv2.polylines(res, [pts], isClosed=True, color=color, thickness=thickness)
    return res

def check_image(metrics_row, pith_data):
    stem = metrics_row["image_name"]
    orig_name, aug_type, _ = parse_augmented_filename(stem)
    
    det_json_path = CSTRD_RESULTS_AUG / stem / f"{stem}.json"
    if not det_json_path.exists():
        det_json_path = CSTRD_RESULTS_AUG / stem / "labelme.json"
        
    gt_json_path = AUGMENTED_DIR / f"{stem}.json"
    img_path = AUGMENTED_DIR / f"{stem}.jpg"
    orig_img_path = ORIGINAL_IMAGES_DIR / f"{orig_name}.png"
    
    pith = get_augmented_pith(stem, pith_data)
    
    checks = {
        "image_name": stem,
        "f1_score": metrics_row["f1_score"],
        "detected_rings": metrics_row["detected_rings"],
        "gt_rings": metrics_row["gt_rings"],
        "orig_image_found": orig_img_path.exists(),
        "aug_image_found": img_path.exists(),
        "gt_json_found": gt_json_path.exists(),
        "det_json_found": det_json_path.exists(),
        "pith_found": pith is not None,
    }
    
    gt_shapes = []
    if gt_json_path.exists():
        with open(gt_json_path) as f:
            gt_data = json.load(f)
            gt_shapes = gt_data.get("shapes", [])
            checks["gt_labels_intact"] = len(gt_shapes) > 0 and all(s.get("label") for s in gt_shapes)
            checks["gt_image_path_match"] = gt_data.get("imagePath", "").endswith(f"{stem}.jpg")
            
    det_shapes = []
    if det_json_path.exists():
        with open(det_json_path) as f:
            det_data = json.load(f)
            det_shapes = det_data.get("shapes", [])
            
    # Generate Visualizations
    if img_path.exists():
        img = cv2.imread(str(img_path))
        if img is not None:
            case_dir = OUT_DIR / "visualizations" / stem
            case_dir.mkdir(parents=True, exist_ok=True)
            
            # 1. Original
            cv2.imwrite(str(case_dir / "01_image_only.jpg"), img)
            
            # 2. GT only (blue)
            img_gt = draw_polygons(img, gt_shapes, color=(255, 0, 0))
            cv2.imwrite(str(case_dir / "02_gt_polygons.jpg"), img_gt)
            
            # 3. Det only (green)
            img_det = draw_polygons(img, det_shapes, color=(0, 255, 0))
            cv2.imwrite(str(case_dir / "03_det_polygons.jpg"), img_det)
            
            # 4. Both (GT=blue, Det=green)
            img_both = draw_polygons(img_gt, det_shapes, color=(0, 255, 0))
            # 5. Add pith (red cross)
            if pith:
                cx, cy = pith
                cv2.drawMarker(img_both, (int(cx), int(cy)), (0, 0, 255), markerType=cv2.MARKER_CROSS, markerSize=40, thickness=3)
            cv2.imwrite(str(case_dir / "04_both_and_pith.jpg"), img_both)
            
    return checks

def main():
    print("=" * 65)
    print("  Phase 1 -- Debug Original Category")
    print("=" * 65)
    
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    csv_path = EVAL_RESULTS_AUG / "all_metrics.csv"
    if not csv_path.exists():
        print(f"  Error: {csv_path} not found.")
        return
        
    metrics = []
    with open(csv_path, "r") as f:
        reader = csv.DictReader(f)
        for row in reader:
            if row["augmentation_type"] == "original" and row["status"] == "evaluated":
                row["f1_score"] = float(row["f1_score"])
                row["detected_rings"] = int(row["detected_rings"])
                row["gt_rings"] = int(row["gt_rings"])
                metrics.append(row)
                
    list.sort(metrics, key=lambda x: x["f1_score"])
    print(f"  Found {len(metrics)} evaluated 'original' cases.")
    
    if len(metrics) == 0:
        return
        
    worst_10 = metrics[:10]
    best_10 = metrics[-10:] if len(metrics) >= 10 else []
    
    selected = worst_10 + [m for m in best_10 if m not in worst_10]
    pith_data = load_original_pith_csv()
    
    results = []
    for idx, row in enumerate(selected, 1):
        print(f"  [{idx:2d}/{len(selected)}] Processing {row['image_name']} (F1={row['f1_score']:.3f})")
        res = check_image(row, pith_data)
        results.append(res)
        
    out_csv = OUT_DIR / "debug_original_cases.csv"
    with open(out_csv, "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=results[0].keys())
        writer.writeheader()
        writer.writerows(results)
        
    out_json = OUT_DIR / "debug_original_cases.json"
    with open(out_json, "w") as f:
        json.dump(results, f, indent=2)
        
    print(f"\n  Done! Output saved to {OUT_DIR}")
    print("=" * 65)

if __name__ == "__main__":
    main()
