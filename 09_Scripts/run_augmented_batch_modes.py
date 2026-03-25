"""
Phase 5 -- Run Augmented Batch Across All Pipeline Modes
Orchestrates testing the 3 main TreeTrace modes:
- baseline
- adaptive
- adaptive_clahe

Usage:
    python 09_Scripts/run_augmented_batch_modes.py
    python 09_Scripts/run_augmented_batch_modes.py --quick
"""

import sys
import argparse
import time
import shutil
import csv
import json
from pathlib import Path

PROJECT_ROOT = Path(r"C:\Users\prana\OneDrive\Desktop\TreeTrace")
sys.path.insert(0, str(PROJECT_ROOT / "09_Scripts"))

from augmented_utils import (
    load_original_pith_csv, get_augmented_pith, parse_augmented_filename, get_aug_category,
    AUGMENTED_DIR, list_augmented_images
)
from cstrd_wrapper import run_cstrd
from evaluate_augmented_batch import run_batch_evaluation

OUTPUT_BASE = PROJECT_ROOT / "07_Outputs" / "modes_evaluation"
MODES = ["baseline", "adaptive", "adaptive_clahe"]

TARGET_CATEGORIES = {"original", "cracks", "crop", "staining", "lighting", "brightness"}

def main():
    print("=" * 65)
    print("  Phase 5 -- Augmented Batch Modes Evaluation")
    print("=" * 65)
    
    parser = argparse.ArgumentParser()
    parser.add_argument("--quick", action="store_true", help="Run a targeted subset to save time")
    args = parser.parse_args()
    
    OUTPUT_BASE.mkdir(parents=True, exist_ok=True)
    pith_data = load_original_pith_csv()
    
    # 1. Select subset
    images = list_augmented_images()
    selected_images = []
    
    if args.quick:
        from collections import defaultdict
        by_cat = defaultdict(list)
        for img in images:
            cat = get_aug_category(parse_augmented_filename(img.stem)[1])
            if cat in TARGET_CATEGORIES:
                by_cat[cat].append(img)
        # Select 5 per category
        for cat in TARGET_CATEGORIES:
            selected_images.extend(by_cat[cat][:5])
        print(f"  [QUICK MODE] Selected {len(selected_images)} target images.")
    else:
        selected_images = images
        print(f"  [FULL MODE] Processing all {len(selected_images)} images.")
        
    start_time = time.time()
    
    mode_metrics_files = {}
    
    for mode in MODES:
        print(f"\n  >>> STARTING MODE: {mode.upper()} <<<")
        mode_dir = OUTPUT_BASE / f"cstrd_results_{mode}"
        eval_dir = OUTPUT_BASE / f"metrics_{mode}"
        
        mode_dir.mkdir(parents=True, exist_ok=True)
        eval_dir.mkdir(parents=True, exist_ok=True)
        
        # Detect
        for idx, img_path in enumerate(selected_images, 1):
            stem = img_path.stem
            pith = get_augmented_pith(stem, pith_data)
            if not pith:
                continue
            
            cx, cy = pith
            img_out_dir = mode_dir / stem
            
            # Skip if already detected
            if (img_out_dir / f"{stem}.json").exists() or (img_out_dir / "labelme.json").exists():
                pass
            else:
                run_cstrd(img_path, cx, cy, img_out_dir, save_imgs=False, params=None, mode=mode)
                
        # Evaluate safely via subprocess to prevent metric_influence_area memory leaks
        print(f"  Evaluating {mode}...")
        
        # We need evaluate_augmented_batch.py to write to eval_dir.
        # Let's pass arguments! But it doesn't take args currently. We will monkeypatch via a small inline script.
        inline_eval = f"""
import sys
from pathlib import Path
sys.path.insert(0, r'{str(PROJECT_ROOT / "09_Scripts")}')
import evaluate_augmented_batch
evaluate_augmented_batch.EVAL_RESULTS_AUG = Path(r'{str(eval_dir)}')
evaluate_augmented_batch.run_batch_evaluation(detection_dir=Path(r'{str(mode_dir)}'), gt_dir=Path(r'{str(AUGMENTED_DIR)}'))
        """
        eval_script_path = OUTPUT_BASE / f"tmp_eval_{mode}.py"
        with open(eval_script_path, "w") as f:
            f.write(inline_eval)
            
        import subprocess
        subprocess.run([sys.executable, str(eval_script_path)])
        
        if eval_script_path.exists():
            eval_script_path.unlink()
            
        mode_metrics_files[mode] = eval_dir / "all_metrics.csv"
        
    print("\n" + "=" * 65)
    print(f"  Mode Evaluation Complete in {time.time()-start_time:.1f}s")
    print(f"  Metrics saved to {OUTPUT_BASE}")
    print("=" * 65)

if __name__ == "__main__":
    main()
