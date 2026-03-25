"""
Phase 3 -- Verify Augmented Dataset Integrity
Checks JSON/Image structure, bounds, matching image paths, and
verifies "original" category explicitly against source data.

Usage:
    python 09_Scripts/verify_augmented_dataset_integrity.py
"""

import sys
import csv
import json
import cv2
import numpy as np
from pathlib import Path

PROJECT_ROOT = Path(r"C:\Users\prana\OneDrive\Desktop\TreeTrace")
sys.path.insert(0, str(PROJECT_ROOT / "09_Scripts"))

from augmented_utils import (
    AUGMENTED_DIR, parse_augmented_filename, get_aug_category,
    load_original_pith_csv, get_augmented_pith
)

OUT_DIR = PROJECT_ROOT / "07_Outputs" / "integrity_checks"
ORIGINAL_IMAGES_DIR = PROJECT_ROOT / "01_Raw_Data" / "URuDendro" / "images"
ORIGINAL_ANNOT_DIR = Path(r"C:\Users\prana\OneDrive\Desktop\uruDendro-main\annotations (1)")

def main():
    print("=" * 65)
    print("  Phase 3 -- Verify Augmented Dataset Integrity")
    print("=" * 65)
    
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    images = sorted(AUGMENTED_DIR.glob("*.jpg"))
    pith_data = load_original_pith_csv()
    
    print(f"  Scanning {len(images)} augmented images...")
    
    results = []
    issues_found = 0
    
    for idx, img_path in enumerate(images, 1):
        stem = img_path.stem
        orig_name, aug_type, _ = parse_augmented_filename(stem)
        json_path = img_path.with_suffix(".json")
        
        row = {
            "image_name": stem,
            "augmentation_category": get_aug_category(aug_type),
            "has_json": json_path.exists(),
            "valid_json": False,
            "imagePath_match": False,
            "bounds_ok": False,
            "labels_ok": False,
            "original_match_ok": True, # only for 'original'
            "notes": ""
        }
        
        notes = []
        
        if not row["has_json"]:
            notes.append("Missing JSON")
        else:
            try:
                with open(json_path) as f:
                    data = json.load(f)
                row["valid_json"] = True
                
                # Check imagePath
                if data.get("imagePath") == img_path.name:
                    row["imagePath_match"] = True
                else:
                    notes.append(f"imagePath mismatch: {data.get('imagePath')}")
                    
                # Dimensions
                img = cv2.imread(str(img_path))
                if img is None:
                    notes.append("Cannot read image")
                    h, w = 0, 0
                else:
                    h, w = img.shape[:2]
                    
                if data.get("imageHeight") != h or data.get("imageWidth") != w:
                    notes.append(f"Dimension mismatch! JSON:{data.get('imageWidth')}x{data.get('imageHeight')} IMG:{w}x{h}")
                    
                # Polygons inside bounds and labels valid
                shapes = data.get("shapes", [])
                out_of_bounds = 0
                empty_labels = 0
                for shape in shapes:
                    if not shape.get("label"):
                        empty_labels += 1
                    for pt in shape.get("points", []):
                        x, y = pt[0], pt[1]
                        if not (0 <= x <= w) or not (0 <= y <= h):
                            out_of_bounds += 1
                
                row["bounds_ok"] = (out_of_bounds == 0)
                row["labels_ok"] = (empty_labels == 0 and len(shapes) > 0)
                
                if out_of_bounds > 0:
                    notes.append(f"{out_of_bounds} points out of bounds")
                if empty_labels > 0:
                    notes.append(f"{empty_labels} empty labels")
                if len(shapes) == 0:
                    notes.append("0 shapes")
                    
                # Specifically verify "original" category
                if aug_type == "original":
                    # Load original source
                    src_img_path = ORIGINAL_IMAGES_DIR / f"{orig_name}.png"
                    src_json_path = ORIGINAL_ANNOT_DIR / f"{orig_name}.json"
                    
                    if src_json_path.exists():
                        with open(src_json_path) as src_f:
                            src_data = json.load(src_f)
                            if len(src_data.get("shapes", [])) != len(shapes):
                                notes.append(f"Original shape count mismatch: GT={len(src_data.get('shapes', []))} AUG={len(shapes)}")
                                row["original_match_ok"] = False
                    else:
                        notes.append("Original source files missing")
                        row["original_match_ok"] = False
                        
            except Exception as e:
                notes.append(f"JSON Parse Error: {e}")
                
        row["notes"] = "; ".join(notes)
        if notes:
            issues_found += 1
            if idx % 100 == 0 or issues_found <= 10:
                print(f"  [{idx:4d}] {stem} -> ISSUES: {row['notes']}")
                
        results.append(row)
        
    print(f"\n  Scan complete. {issues_found} images have issues.")
    
    csv_path = OUT_DIR / "augmented_integrity_report.csv"
    with open(csv_path, "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=results[0].keys())
        writer.writeheader()
        writer.writerows(results)
        
    json_path = OUT_DIR / "augmented_integrity_report.json"
    with open(json_path, "w") as f:
        json.dump(results, f, indent=2)
        
    print(f"  Saved to: {OUT_DIR}")
    print("=" * 65)

if __name__ == "__main__":
    main()
