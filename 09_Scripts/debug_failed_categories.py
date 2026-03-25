"""
Phase 2 -- Debug Failed Categories (cracks, crop, staining)
Extracts 15 worst, 5 median, and 5 best cases per weak category.
Generates side-by-side overlays and category statistics.

Usage:
    python 09_Scripts/debug_failed_categories.py
"""

import sys
import csv
import json
import cv2
import numpy as np
import statistics
from pathlib import Path
from math import floor

PROJECT_ROOT = Path(r"C:\Users\prana\OneDrive\Desktop\TreeTrace")
sys.path.insert(0, str(PROJECT_ROOT / "09_Scripts"))

from augmented_utils import (
    EVAL_RESULTS_AUG, AUGMENTED_DIR, CSTRD_RESULTS_AUG
)

OUT_DIR = PROJECT_ROOT / "07_Outputs" / "debug_failed_categories"
TARGET_CATEGORIES = ["cracks", "crop", "staining"]

def draw_polygons(img, shapes, color=(0, 255, 0), thickness=3):
    """Draw LabelMe polygons on image."""
    res = img.copy()
    for shape in shapes:
        points = shape.get("points", [])
        if len(points) > 2:
            pts = np.array(points, np.int32).reshape((-1, 1, 2))
            cv2.polylines(res, [pts], isClosed=True, color=color, thickness=thickness)
    return res

def combine_side_by_side(img1, img2, img3, img4):
    """Combine 4 images into a 2x2 grid."""
    h, w = img1.shape[:2]
    # resize others to match img1 if needed
    for img in (img2, img3, img4):
        if img.shape[:2] != (h, w):
            cv2.resize(img, (w, h))
            
    top = np.hstack((img1, img2))
    bottom = np.hstack((img3, img4))
    return np.vstack((top, bottom))

def process_case(metrics_row, category_dir):
    stem = metrics_row["image_name"]
    
    det_json_path = CSTRD_RESULTS_AUG / stem / f"{stem}.json"
    if not det_json_path.exists():
        det_json_path = CSTRD_RESULTS_AUG / stem / "labelme.json"
        
    gt_json_path = AUGMENTED_DIR / f"{stem}.json"
    img_path = AUGMENTED_DIR / f"{stem}.jpg"
    
    gt_shapes = []
    if gt_json_path.exists():
        with open(gt_json_path) as f:
            gt_shapes = json.load(f).get("shapes", [])
            
    det_shapes = []
    if det_json_path.exists():
        with open(det_json_path) as f:
            det_shapes = json.load(f).get("shapes", [])
            
    if img_path.exists():
        img = cv2.imread(str(img_path))
        if img is not None:
            # 1. Input Image
            img_input = img.copy()
            cv2.putText(img_input, "1. Input", (20, 50), cv2.FONT_HERSHEY_SIMPLEX, 1.5, (0, 0, 255), 3)
            
            # 2. GT overlay
            img_gt = draw_polygons(img, gt_shapes, color=(255, 0, 0))
            cv2.putText(img_gt, f"2. Ground Truth (n={len(gt_shapes)})", (20, 50), cv2.FONT_HERSHEY_SIMPLEX, 1.5, (255, 0, 0), 3)
            
            # 3. Det overlay
            img_det = draw_polygons(img, det_shapes, color=(0, 255, 0))
            cv2.putText(img_det, f"3. Detection (n={len(det_shapes)})", (20, 50), cv2.FONT_HERSHEY_SIMPLEX, 1.5, (0, 255, 0), 3)
            
            # 4. Combined
            img_both = draw_polygons(img_gt, det_shapes, color=(0, 255, 0))
            cv2.putText(img_both, f"4. Both (Det=Green, GT=Blue, F1={metrics_row['f1_score']:.2f})", (20, 50), cv2.FONT_HERSHEY_SIMPLEX, 1.5, (0, 255, 255), 3)
            
            grid = combine_side_by_side(img_input, img_gt, img_det, img_both)
            
            # Downscale grid for easier viewing, otherwise it's ~4000x4000
            gh, gw = grid.shape[:2]
            max_dim = 2400
            if max(gh, gw) > max_dim:
                scale = max_dim / max(gh, gw)
                grid = cv2.resize(grid, (int(gw * scale), int(gh * scale)))
                
            out_img = category_dir / f"grid_{stem}.jpg"
            cv2.imwrite(str(out_img), grid, [cv2.IMWRITE_JPEG_QUALITY, 85])

def main():
    print("=" * 65)
    print("  Phase 2 -- Debug Failed Categories")
    print("=" * 65)
    
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    csv_path = EVAL_RESULTS_AUG / "all_metrics.csv"
    if not csv_path.exists():
        print(f"  Error: {csv_path} not found.")
        return
        
    from collections import defaultdict
    metrics_by_cat = defaultdict(list)
    
    with open(csv_path, "r") as f:
        reader = csv.DictReader(f)
        for row in reader:
            cat = row["augmentation_category"]
            if cat in TARGET_CATEGORIES and row["status"] == "evaluated":
                row["f1_score"] = float(row["f1_score"])
                row["precision"] = float(row["precision"])
                row["recall"] = float(row["recall"])
                row["rmse"] = float(row["rmse"])
                row["detected_rings"] = int(row["detected_rings"])
                row["gt_rings"] = int(row["gt_rings"])
                metrics_by_cat[cat].append(row)
                
    for cat in TARGET_CATEGORIES:
        print(f"\n  --- Category: {cat} ---")
        items = metrics_by_cat[cat]
        if not items:
            print("    No items found.")
            continue
            
        list.sort(items, key=lambda x: x["f1_score"])
        
        # Calculate stats
        n = len(items)
        f1s = [x["f1_score"] for x in items]
        under_det = sum(1 for x in items if x["detected_rings"] < x["gt_rings"])
        over_det = sum(1 for x in items if x["detected_rings"] > x["gt_rings"])
        
        stats = {
            "category": cat,
            "count": n,
            "avg_precision": sum(x["precision"] for x in items) / n,
            "avg_recall": sum(x["recall"] for x in items) / n,
            "avg_f1": sum(f1s) / n,
            "avg_rmse": sum(x["rmse"] for x in items) / n,
            "mean_det_rings": sum(x["detected_rings"] for x in items) / n,
            "mean_gt_rings": sum(x["gt_rings"] for x in items) / n,
            "under_detection_pct": under_det / n * 100,
            "over_detection_pct": over_det / n * 100,
        }
        
        cat_dir = OUT_DIR / cat
        cat_dir.mkdir(parents=True, exist_ok=True)
        
        summary_json = cat_dir / f"{cat}_summary.json"
        with open(summary_json, "w") as f:
            json.dump(stats, f, indent=2)
            
        print(f"    Avg F1: {stats['avg_f1']:.3f}")
        print(f"    Under-detection: {stats['under_detection_pct']:.1f}%")
        print(f"    Over-detection:  {stats['over_detection_pct']:.1f}%")
        
        # Select 15 worst, 5 median, 5 best
        worst = items[:15]
        best = items[-5:] if n >= 5 else []
        mid_idx = n // 2
        median = items[max(0, mid_idx-2) : min(n, mid_idx+3)]
        
        selected = worst + median + best
        # deduplicate
        seen = set()
        unique_selected = []
        for x in selected:
            if x["image_name"] not in seen:
                seen.add(x["image_name"])
                unique_selected.append(x)
                
        print(f"    Generating overlays for {len(unique_selected)} selected images...")
        for row in unique_selected:
            process_case(row, cat_dir)
            
    print(f"\n  Done! Output saved to {OUT_DIR}")
    print("=" * 65)

if __name__ == "__main__":
    main()
