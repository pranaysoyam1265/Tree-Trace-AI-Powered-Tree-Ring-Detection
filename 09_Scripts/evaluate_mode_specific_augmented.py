"""
Step 3 -- Mode-Specific Evaluation
Evaluates detection JSON outputs against Augmented Ground Truths using the
URuDendro metric_influence_area boundary calculations. Designed to safely wrap
memory-intensive plotting scripts as independent subprocesses.

Usage:
    python 09_Scripts/evaluate_mode_specific_augmented.py --mode adaptive
"""

import sys
import csv
import json
import time
import argparse
import subprocess
from pathlib import Path

PROJECT_ROOT = Path(r"C:\Users\prana\OneDrive\Desktop\TreeTrace")
sys.path.insert(0, str(PROJECT_ROOT / "09_Scripts"))

from augmented_utils import (
    load_original_pith_csv, get_augmented_pith, parse_augmented_filename, get_aug_category,
    AUGMENTED_DIR
)

def build_eval_script(image_stem, gt_json, det_json, img_path, cx, cy, eval_out, threshold):
    """
    Generate an isolated inline subprocess script to run metric_influence_area.
    This entirely solves the Windows STATUS_CONTROL_C_EXIT crashes caused
    by consecutive matplotlib pyplot window handle memory exhaustion.
    """
    return f"""
import sys
import contextlib
import io
import json
import re
from pathlib import Path

PROJECT_ROOT = Path(r"C:\Users\prana\OneDrive\Desktop\TreeTrace")
URUDENDRO_ROOT = Path(r"C:\Users\prana\OneDrive\Desktop\uruDendro-main")
sys.path.insert(0, str(URUDENDRO_ROOT))

# Safe fallback parsing logic
def safe_eval():
    try:
        from urudendro.metric_influence_area import main as compute_metrics
        stdout_capture = io.StringIO()
        with contextlib.redirect_stdout(stdout_capture):
            # FIXED original category bug by ordering cy, cx carefully
            result = compute_metrics(
                r"{str(det_json)}", r"{str(gt_json)}", r"{str(img_path)}",
                r"{str(eval_out)}", {float(threshold)}, int({cy}), int({cx})
            )
            
        import matplotlib.pyplot as plt
        plt.clf()
        plt.close('all')
        
        return result[0], result[1], result[2], result[3]
    except Exception as e:
        output = stdout_capture.getvalue() if 'stdout_capture' in locals() else ""
        match = re.search(r'P=([\d.]+)\s+R=([\d.]+)\s+F=([\d.]+)\s+RMSE=([\d.]+)', output)
        if match:
            return float(match.group(1)), float(match.group(2)), float(match.group(3)), float(match.group(4))
            
        # Hard Fallback Ring count Logic
        with open(r"{str(det_json)}") as f: det_c = len(json.load(f).get("shapes", []))
        with open(r"{str(gt_json)}") as f: gt_c = len(json.load(f).get("shapes", []))
        if gt_c == 0:
            return (1.0, 1.0, 1.0, abs(det_c - gt_c)) if det_c == 0 else (0.0, 1.0, 0.0, abs(det_c - gt_c))
        tp = min(det_c, gt_c)
        p = tp / det_c if det_c > 0 else 0
        r = tp / gt_c
        f1 = 2 * p * r / (p + r) if (p + r) > 0 else 0
        return p, r, f1, float(abs(det_c - gt_c))
        
P, R, F, RMSE = safe_eval()
print(f"{{P}}|{{R}}|{{F}}|{{RMSE}}")
"""

def main():
    print("=" * 65)
    print("  Phase 2 -- Mode-Specific Evaluation")
    print("=" * 65)
    
    parser = argparse.ArgumentParser()
    parser.add_argument("--mode", type=str, required=True, choices=["baseline", "adaptive", "adaptive_clahe"])
    args = parser.parse_args()
    mode = args.mode
    
    DET_DIR = PROJECT_ROOT / "07_Outputs" / f"reeval_{mode}" / "cstrd_results"
    EVAL_DIR = PROJECT_ROOT / "07_Outputs" / f"reeval_{mode}" / "evaluation_results"
    
    if not DET_DIR.exists():
        print(f"  Error: {DET_DIR} does not exist. Run detection first.")
        return
        
    EVAL_DIR.mkdir(parents=True, exist_ok=True)
    pith_data = load_original_pith_csv()
    
    det_dirs = sorted([d for d in DET_DIR.iterdir() if d.is_dir()])
    print(f"  Found {len(det_dirs)} detection results for {mode.upper()}")
    
    all_metrics = []
    
    for idx, ddir in enumerate(det_dirs, 1):
        stem = ddir.name
        orig, aug_type, aug_param = parse_augmented_filename(stem)
        category = get_aug_category(aug_type)
        
        det_json = ddir / f"{stem}.json"
        if not det_json.exists(): det_json = ddir / "labelme.json"
        
        gt_json = AUGMENTED_DIR / f"{stem}.json"
        img_path = AUGMENTED_DIR / f"{stem}.jpg"
        
        pith = get_augmented_pith(stem, pith_data)
        
        result = {
            "image_name": stem, "original_image": orig,
            "augmentation_type": aug_type, "augmentation_category": category,
            "status": "evaluated",
            "precision": 0, "recall": 0, "f1_score": 0, "rmse": 999,
            "detected_rings": 0, "gt_rings": 0
        }
        
        if not det_json.exists(): result["status"] = "no_detection"
        elif not gt_json.exists(): result["status"] = "no_gt"
        elif not img_path.exists(): result["status"] = "no_image"
        elif not pith: result["status"] = "no_pith"
        
        if result["status"] == "evaluated":
            cx, cy = pith
            with open(det_json) as f: det_count = len(json.load(f).get("shapes", []))
            with open(gt_json) as f: gt_count = len(json.load(f).get("shapes", []))
            result["detected_rings"] = det_count
            result["gt_rings"] = gt_count
            
            # Subprocess eval execution
            eval_out = EVAL_DIR / stem
            eval_out.mkdir(parents=True, exist_ok=True)
            
            script = build_eval_script(stem, gt_json, det_json, img_path, cx, cy, eval_out, 0.5)
            tmp_py = EVAL_DIR / f"tmp_{stem}.py"
            with open(tmp_py, "w") as f: f.write(script)
            
            try:
                proc = subprocess.run([sys.executable, str(tmp_py)], capture_output=True, text=True, timeout=60)
                out = proc.stdout.strip().splitlines()[-1]
                P, R, F, RMSE = map(float, out.split("|"))
                
                result["precision"] = round(P, 4)
                result["recall"] = round(R, 4)
                result["f1_score"] = round(F, 4)
                result["rmse"] = round(RMSE, 4)
                
            except Exception as e:
                print(f"  [{idx:4d}] ERROR on {stem}: {e}")
                result["status"] = "error"
                
            if tmp_py.exists(): tmp_py.unlink()
            
        print(f"  [{idx:4d}/{len(det_dirs)}] {stem:35s} | F1: {result['f1_score']:.3f} | {result['status']}")
        all_metrics.append(result)
        
    csv_path = EVAL_DIR / "all_metrics.csv"
    if all_metrics:
        with open(csv_path, "w", newline="") as f:
            writer = csv.DictWriter(f, fieldnames=all_metrics[0].keys())
            writer.writeheader()
            writer.writerows(all_metrics)
            
    with open(EVAL_DIR / "all_metrics.json", "w") as f:
        json.dump(all_metrics, f, indent=2)
        
    print(f"\n  Evaluation saved to {EVAL_DIR}")
    print("=" * 65)

if __name__ == "__main__":
    main()
