"""
Step 2 -- Detection Runner for Mode-Specific Re-Evaluation
Runs CS-TRD over the augmented dataset using a specific operational mode.

Usage:
    python 09_Scripts/run_mode_specific_augmented_detection.py --mode adaptive
    python 09_Scripts/run_mode_specific_augmented_detection.py --mode baseline --limit 50
"""

import sys
import argparse
import time
import json
from pathlib import Path

PROJECT_ROOT = Path(r"C:\Users\prana\OneDrive\Desktop\TreeTrace")
sys.path.insert(0, str(PROJECT_ROOT / "09_Scripts"))

from augmented_utils import (
    load_original_pith_csv, get_augmented_pith, parse_augmented_filename, get_aug_category,
    AUGMENTED_DIR, list_augmented_images
)
from cstrd_wrapper import run_cstrd

def main():
    print("=" * 65)
    print("  Phase 1 -- Mode-Specific Detection")
    print("=" * 65)
    
    parser = argparse.ArgumentParser()
    parser.add_argument("--mode", type=str, required=True, choices=["baseline", "adaptive", "adaptive_clahe"],
                        help="Operation mode for TreeTrace.")
    parser.add_argument("--limit", type=int, default=0, help="Limit number of images processed.")
    args = parser.parse_args()
    
    mode = args.mode
    OUT_DIR = PROJECT_ROOT / "07_Outputs" / f"reeval_{mode}" / "cstrd_results"
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    
    pith_data = load_original_pith_csv()
    images = list_augmented_images()
    
    if args.limit > 0:
        images = images[:args.limit]
        print(f"  [LIMIT] Processing first {args.limit} images.")
    else:
        print(f"  [FULL] Processing all {len(images)} images.")
        
    print(f"  [MODE] {mode.upper()}")
    
    log_data = []
    start_time = time.time()
    
    for idx, img_path in enumerate(images, 1):
        stem = img_path.stem
        pith = get_augmented_pith(stem, pith_data)
        if not pith:
            print(f"  [{idx:4d}/{len(images)}] ERROR: No pith found for {stem}")
            continue
            
        cx, cy = pith
        img_out_dir = OUT_DIR / stem
        
        t0 = time.time()
        
        # Skip if already detected
        if not ((img_out_dir / f"{stem}.json").exists() or (img_out_dir / "labelme.json").exists()):
            run_cstrd(img_path, cx, cy, img_out_dir, save_imgs=False, params=None, mode=mode)
            
        elapsed = time.time() - t0
        
        print(f"  [{idx:4d}/{len(images)}] {stem:35s} | Time: {elapsed:.1f}s")
        log_data.append({"image_name": stem, "time_s": elapsed})
        
    total_time = time.time() - start_time
    print(f"\n  Done! Processed {len(images)} images in {total_time:.1f}s ({total_time/60:.1f}m)")
    print(f"  Saved to: {OUT_DIR}")
    print("=" * 65)

if __name__ == "__main__":
    main()
