"""
Phase 5 -- Adaptive Thresholds Impact (Updated)
Compares detection with fixed vs Otsu-adaptive thresholds on targeted categories:
staining, lighting, brightness, cracks.

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
    get_aug_category, list_augmented_images, ADAPTIVE_TEST_DIR, AUGMENTED_DIR
)
from cstrd_wrapper import run_cstrd

TARGET_CATEGORIES = {"staining", "lighting", "brightness", "cracks"}
EVAL_RESULTS_AUG = PROJECT_ROOT / "07_Outputs" / "evaluation_results_augmented"

def compute_adaptive_thresholds(img_path: Path) -> dict:
    img = cv2.imread(str(img_path), cv2.IMREAD_GRAYSCALE)
    if img is None: return {"th_low": 3, "th_high": 15, "sigma": 3}
    otsu_thresh, _ = cv2.threshold(img, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    th_high = max(5, min(30, otsu_thresh * 0.15))
    th_low = max(2, th_high * 0.3)
    var = cv2.Laplacian(img, cv2.CV_64F).var()
    sigma = 4.0 if var > 500 else 3.0 if var > 100 else 2.0
    return {"th_low": round(th_low, 1), "th_high": round(th_high, 1), "sigma": sigma}

def evaluate_metrics(det_json, gt_json):
    if not gt_json.exists(): return 0, 0, 0
    with open(gt_json) as f: gt_count = len(json.load(f).get("shapes", []))
    det_count = 0
    if det_json.exists():
        with open(det_json) as f: det_count = len(json.load(f).get("shapes", []))
    if gt_count == 0: return (1.0, 1.0, 1.0) if det_count == 0 else (0.0, 1.0, 0.0)
    tp = min(det_count, gt_count)
    p = tp / det_count if det_count > 0 else 0
    r = tp / gt_count
    f1 = 2 * p * r / (p + r) if (p + r) > 0 else 0
    return p, r, f1

def main():
    print("=" * 65)
    print("  Phase 5 -- Adaptive Thresholds Impact (Updated)")
    print("=" * 65)
    
    ADAPTIVE_TEST_DIR.mkdir(parents=True, exist_ok=True)
    pith_data = load_original_pith_csv()
    
    baseline_metrics = {}
    csv_path = EVAL_RESULTS_AUG / "all_metrics.csv"
    if csv_path.exists():
        with open(csv_path, "r") as f:
            for row in csv.DictReader(f):
                if row["augmentation_category"] in TARGET_CATEGORIES and row["status"] == "evaluated":
                    baseline_metrics[row["image_name"]] = {
                        "p": float(row["precision"]), "r": float(row["recall"]), "f1": float(row["f1_score"])
                    }
                    
    by_cat = defaultdict(list)
    for img in list_augmented_images():
        cat = get_aug_category(parse_augmented_filename(img.stem)[1])
        if cat in TARGET_CATEGORIES: by_cat[cat].append(img)
            
    test_images = []
    for cat in TARGET_CATEGORIES: test_images.extend(by_cat[cat][:10])
        
    results = []
    FIXED = {"sigma": 3, "th_low": 3, "th_high": 15}
    
    for idx, img_path in enumerate(test_images, 1):
        stem = img_path.stem
        cat = get_aug_category(parse_augmented_filename(stem)[1])
        pith = get_augmented_pith(stem, pith_data)
        if not pith: continue
        cx, cy = pith
        gt_json = AUGMENTED_DIR / f"{stem}.json"
        
        # Fixed
        if stem in baseline_metrics:
            p_f, r_f, f1_f = baseline_metrics[stem]["p"], baseline_metrics[stem]["r"], baseline_metrics[stem]["f1"]
        else:
            out_f = ADAPTIVE_TEST_DIR / "fixed" / stem
            run_cstrd(img_path, cx, cy, out_f, params=FIXED)
            p_f, r_f, f1_f = evaluate_metrics(out_f / f"{stem}.json", gt_json)
            
        # Adaptive
        adapt = compute_adaptive_thresholds(img_path)
        out_a = ADAPTIVE_TEST_DIR / "adaptive" / stem
        run_cstrd(img_path, cx, cy, out_a, params=adapt)
        p_a, r_a, f1_a = evaluate_metrics(out_a / f"{stem}.json", gt_json)
        
        results.append({
            "image_name": stem, "category": cat,
            "th_adapt": f"{adapt['th_low']}/{adapt['th_high']}",
            "f1_fixed": f1_f, "f1_adapt": f1_a, "f1_diff": f1_a - f1_f,
            "p_fixed": p_f, "p_adapt": p_a, "p_diff": p_a - p_f,
            "r_fixed": r_f, "r_adapt": r_a, "r_diff": r_a - r_f
        })
        print(f"  [{idx:2d}/{len(test_images)}] {stem:35s} {cat:10s} "
              f"FixF1={f1_f:.2f} -> AdaptF1={f1_a:.2f} ({f1_a-f1_f:+.2f})")
              
    with open(ADAPTIVE_TEST_DIR / "adaptive_impact.csv", "w", newline="") as f:
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
    fig, ax = plt.subplots(figsize=(10,6))
    w = 0.25
    x = np.arange(len(cats))
    ax.bar(x - w, [np.mean(cat_avg[c]["f1_diff"]) for c in cats], w, label="F1 Change")
    ax.bar(x,     [np.mean(cat_avg[c]["p_diff"]) for c in cats], w, label="Precision Change")
    ax.bar(x + w, [np.mean(cat_avg[c]["r_diff"]) for c in cats], w, label="Recall Change")
    ax.set_xticks(x); ax.set_xticklabels(cats)
    ax.set_title("Adaptive Thresholds Impact by Category")
    ax.axhline(0, color="black", linewidth=1); ax.legend()
    plt.tight_layout()
    plt.savefig(ADAPTIVE_TEST_DIR / "adaptive_impact_chart.png", dpi=150)
    plt.close()
    
    print(f"\n  Done! Output saved to {ADAPTIVE_TEST_DIR}")
    
if __name__ == "__main__":
    main()
