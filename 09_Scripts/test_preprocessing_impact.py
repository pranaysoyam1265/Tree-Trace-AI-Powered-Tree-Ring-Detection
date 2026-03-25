"""
Phase 4 -- Test Preprocessing Impact (Updated)
Compares detection with and without CLAHE/denoising on targeted categories:
staining, cracks, crop, original.

Generates comparative charts to show F1 improvement.
"""

import sys
import csv
import json
import time
import cv2
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from pathlib import Path
from collections import defaultdict

PROJECT_ROOT = Path(r"C:\Users\prana\OneDrive\Desktop\TreeTrace")
sys.path.insert(0, str(PROJECT_ROOT / "09_Scripts"))

from augmented_utils import (
    load_original_pith_csv, get_augmented_pith, parse_augmented_filename,
    get_aug_category, list_augmented_images, PREPROC_TEST_DIR, AUGMENTED_DIR
)
from cstrd_wrapper import run_cstrd

TARGET_CATEGORIES = {"staining", "cracks", "crop", "original"}
EVAL_RESULTS_AUG = PROJECT_ROOT / "07_Outputs" / "evaluation_results_augmented"

def preprocess_image(img_path: Path, output_path: Path) -> Path:
    img = cv2.imread(str(img_path))
    if img is None: return img_path
    
    lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB)
    l, a, b = cv2.split(lab)
    clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8))
    l = clahe.apply(l)
    lab = cv2.merge([l, a, b])
    img = cv2.cvtColor(lab, cv2.COLOR_LAB2BGR)
    
    img = cv2.bilateralFilter(img, 9, 75, 75)
    
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    mean_b = np.mean(gray)
    if mean_b < 100:
        factor = 120 / mean_b if mean_b > 0 else 1.0
        img = cv2.convertScaleAbs(img, alpha=min(factor, 1.8), beta=0)
        
    cv2.imwrite(str(output_path), img, [cv2.IMWRITE_JPEG_QUALITY, 95])
    return output_path

def evaluate_metrics(det_json, gt_json, img_path, cx, cy):
    # Quick simple metric approx for preprocessing tests 
    if not gt_json.exists(): return 0, 0, 0
    with open(gt_json) as f: gt_data = json.load(f)
    gt_count = len(gt_data.get("shapes", []))
    
    det_count = 0
    if det_json.exists():
        with open(det_json) as f: det_data = json.load(f)
        det_count = len(det_data.get("shapes", []))
        
    if gt_count == 0:
        return (1.0, 1.0, 1.0) if det_count == 0 else (0.0, 1.0, 0.0)
        
    tp = min(det_count, gt_count)
    p = tp / det_count if det_count > 0 else 0
    r = tp / gt_count
    f1 = 2 * p * r / (p + r) if (p + r) > 0 else 0
    return p, r, f1

def main():
    print("=" * 65)
    print("  Phase 4 -- Preprocessing Impact (Updated)")
    print("=" * 65)
    
    PREPROC_TEST_DIR.mkdir(parents=True, exist_ok=True)
    pith_data = load_original_pith_csv()
    
    # Load past baseline F1s from all_metrics if available
    baseline_metrics = {}
    csv_path = EVAL_RESULTS_AUG / "all_metrics.csv"
    if csv_path.exists():
        with open(csv_path, "r") as f:
            reader = csv.DictReader(f)
            for row in reader:
                if row["augmentation_category"] in TARGET_CATEGORIES and row["status"] == "evaluated":
                    baseline_metrics[row["image_name"]] = {
                        "p": float(row["precision"]),
                        "r": float(row["recall"]),
                        "f1": float(row["f1_score"])
                    }
                    
    # Select subset
    by_cat = defaultdict(list)
    for img in list_augmented_images():
        stem = img.stem
        cat = get_aug_category(parse_augmented_filename(stem)[1])
        if cat in TARGET_CATEGORIES:
            by_cat[cat].append(img)
            
    test_images = []
    for cat in TARGET_CATEGORIES:
        test_images.extend(by_cat[cat][:10])
        
    results = []
    preproc_dir = PREPROC_TEST_DIR / "preprocessed_images"
    preproc_dir.mkdir(parents=True, exist_ok=True)
    
    for idx, img_path in enumerate(test_images, 1):
        stem = img_path.stem
        cat = get_aug_category(parse_augmented_filename(stem)[1])
        pith = get_augmented_pith(stem, pith_data)
        if pith is None: continue
        cx, cy = pith
        gt_json = AUGMENTED_DIR / f"{stem}.json"
        
        # Raw metrics (from cache or calculate)
        if stem in baseline_metrics:
            p_raw, r_raw, f1_raw = baseline_metrics[stem]["p"], baseline_metrics[stem]["r"], baseline_metrics[stem]["f1"]
        else:
            out_raw = PREPROC_TEST_DIR / "raw" / stem
            run_cstrd(img_path, cx, cy, out_raw)
            p_raw, r_raw, f1_raw = evaluate_metrics(out_raw / f"{stem}.json", gt_json, img_path, cx, cy)
            
        # Preprocessed
        pp_img = preproc_dir / f"{stem}.jpg"
        preprocess_image(img_path, pp_img)
        out_pp = PREPROC_TEST_DIR / "pp" / stem
        run_cstrd(pp_img, cx, cy, out_pp)
        p_pp, r_pp, f1_pp = evaluate_metrics(out_pp / f"{stem}.json", gt_json, pp_img, cx, cy)
        
        results.append({
            "image_name": stem, "category": cat,
            "f1_raw": f1_raw, "f1_pp": f1_pp, "f1_diff": f1_pp - f1_raw,
            "p_raw": p_raw, "p_pp": p_pp, "p_diff": p_pp - p_raw,
            "r_raw": r_raw, "r_pp": r_pp, "r_diff": r_pp - r_raw
        })
        print(f"  [{idx:2d}/{len(test_images)}] {stem:35s} {cat:10s} "
              f"RawF1={f1_raw:.2f} -> ppF1={f1_pp:.2f} ({f1_pp-f1_raw:+.2f})")
              
    r_csv = PREPROC_TEST_DIR / "preprocessing_impact.csv"
    with open(r_csv, "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=results[0].keys())
        writer.writeheader()
        writer.writerows(results)
        
    cat_avg = defaultdict(lambda: {"f1_diff":[], "p_diff":[], "r_diff":[]})
    for r in results:
        c = r["category"]
        cat_avg[c]["f1_diff"].append(r["f1_diff"])
        cat_avg[c]["p_diff"].append(r["p_diff"])
        cat_avg[c]["r_diff"].append(r["r_diff"])
        
    cats = list(cat_avg.keys())
    f1s = [np.mean(cat_avg[c]["f1_diff"]) for c in cats]
    ps = [np.mean(cat_avg[c]["p_diff"]) for c in cats]
    rs = [np.mean(cat_avg[c]["r_diff"]) for c in cats]
    
    x = np.arange(len(cats))
    w = 0.25
    fig, ax = plt.subplots(figsize=(10,6))
    ax.bar(x - w, f1s, w, label="F1 Change")
    ax.bar(x, ps, w, label="Precision Change")
    ax.bar(x + w, rs, w, label="Recall Change")
    ax.set_xticks(x)
    ax.set_xticklabels(cats)
    ax.set_title("Preprocessing Impact by Category (Raw vs PP)")
    ax.axhline(0, color="black", linewidth=1)
    ax.legend()
    plt.tight_layout()
    plt.savefig(PREPROC_TEST_DIR / "preprocessing_impact_chart.png", dpi=150)
    plt.close()
    
    print(f"\n  Done! Output saved to {PREPROC_TEST_DIR}")
    
if __name__ == "__main__":
    main()
