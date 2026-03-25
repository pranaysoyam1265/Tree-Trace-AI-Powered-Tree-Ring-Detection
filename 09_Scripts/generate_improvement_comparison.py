"""
Phase 6 -- Generate Improvement Comparison Report
Collects metrics from the 3 mode evaluation directories and outputs
a head-to-head performance comparison metric file.

Usage:
    python 09_Scripts/generate_improvement_comparison.py
"""

import sys
import csv
import json
from pathlib import Path
from collections import defaultdict

PROJECT_ROOT = Path(r"C:\Users\prana\OneDrive\Desktop\TreeTrace")
OUTPUT_BASE = PROJECT_ROOT / "07_Outputs" / "modes_evaluation"
COMP_DIR = PROJECT_ROOT / "07_Outputs" / "improvement_comparison"
MODES = ["baseline", "adaptive", "adaptive_clahe"]

def load_metrics(mode: str):
    path = OUTPUT_BASE / f"metrics_{mode}" / "all_metrics.csv"
    if not path.exists(): return []
    with open(path) as f:
        return [row for row in csv.DictReader(f) if row["status"] == "evaluated"]

def main():
    print("=" * 65)
    print("  Phase 6 -- Generate Improvement Comparison")
    print("=" * 65)
    
    COMP_DIR.mkdir(parents=True, exist_ok=True)
    
    data = {}
    for mode in MODES:
        data[mode] = load_metrics(mode)
        
    if not data["baseline"]:
        print("  Error: Baseline data not found. Run run_augmented_batch_modes.py first.")
        return
        
    # Stats
    comp_stats = []
    cat_keys = sorted(list(set(r["augmentation_category"] for r in data["baseline"])))
    
    # 1. Overall
    for mode in MODES:
        metrics = data[mode]
        if not metrics: continue
        
        avg_p = sum(float(m["precision"]) for m in metrics) / len(metrics)
        avg_r = sum(float(m["recall"]) for m in metrics) / len(metrics)
        avg_f = sum(float(m["f1_score"]) for m in metrics) / len(metrics)
        
        base_f = sum(float(m["f1_score"]) for m in data["baseline"]) / len(data["baseline"])
        diff_f = avg_f - base_f
        
        comp_stats.append({
            "mode": mode,
            "category": "OVERALL",
            "precision": round(avg_p, 4),
            "recall": round(avg_r, 4),
            "f1_score": round(avg_f, 4),
            "f1_improvement": round(diff_f, 4)
        })
        
    # 2. Category-wise
    for mode in MODES:
        metrics = data[mode]
        if not metrics: continue
        
        cat_metrics = defaultdict(list)
        for m in metrics:
            cat_metrics[m["augmentation_category"]].append(m)
            
        base_cat_metrics = defaultdict(list)
        for m in data["baseline"]:
            base_cat_metrics[m["augmentation_category"]].append(m)
            
        for cat in cat_keys:
            cat_m = cat_metrics[cat]
            if not cat_m: continue
            
            avg_p = sum(float(m["precision"]) for m in cat_m) / len(cat_m)
            avg_r = sum(float(m["recall"]) for m in cat_m) / len(cat_m)
            avg_f = sum(float(m["f1_score"]) for m in cat_m) / len(cat_m)
            
            base_f = sum(float(m["f1_score"]) for m in base_cat_metrics[cat]) / len(base_cat_metrics[cat]) if base_cat_metrics[cat] else 0
            diff_f = avg_f - base_f
            
            comp_stats.append({
                "mode": mode,
                "category": cat.upper(),
                "precision": round(avg_p, 4),
                "recall": round(avg_r, 4),
                "f1_score": round(avg_f, 4),
                "f1_improvement": round(diff_f, 4)
            })
            
    # Save CSV
    csv_path = COMP_DIR / "comparison_metrics.csv"
    with open(csv_path, "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=comp_stats[0].keys())
        writer.writeheader()
        writer.writerows(comp_stats)
        
    # Determine best mode overall
    overalls = [s for s in comp_stats if s["category"] == "OVERALL"]
    best_overall = max(overalls, key=lambda x: x["f1_score"])
    
    # Check if 'original' is fixed
    orig_base = next((s for s in comp_stats if s["mode"] == "baseline" and s["category"] == "ORIGINAL"), None)
    orig_fixed = orig_base and orig_base["f1_score"] > 0.70
    
    # Generate Summary text
    lines = []
    lines.append("IMPROVEMENT COMPARISON REPORT")
    lines.append("=============================\n")
    
    lines.append("1. Original-Category Fix Status")
    lines.append("-------------------------------")
    if orig_fixed:
        lines.append(f"SUCCESS: The 'original' evaluation bug is FIXED. Baseline F1 is now {orig_base['f1_score']:.4f} (up from 0.160).")
    else:
        lines.append(f"WARNING: The 'original' evaluation might still be problematic. Baseline F1 is {orig_base['f1_score']:.4f}.")
    lines.append("")
    
    lines.append("2. Overall Performance by Mode")
    lines.append("------------------------------")
    for s in overalls:
        lines.append(f"Mode: {s['mode']:15s} | P: {s['precision']:.4f} | R: {s['recall']:.4f} | F1: {s['f1_score']:.4f} | vs Base: {s['f1_improvement']:+.4f}")
    lines.append("")
    
    lines.append("3. Category Performance Focus")
    lines.append("-----------------------------")
    for cat in ["CRACKS", "STAINING", "CROP", "LIGHTING"]:
        b = next((s for s in comp_stats if s["mode"] == "baseline" and s["category"] == cat), None)
        a = next((s for s in comp_stats if s["mode"] == "adaptive" and s["category"] == cat), None)
        c = next((s for s in comp_stats if s["mode"] == "adaptive_clahe" and s["category"] == cat), None)
        if b and a and c:
            lines.append(f"{cat}:")
            lines.append(f"  Baseline       : F1 = {b['f1_score']:.3f}")
            lines.append(f"  Adaptive       : F1 = {a['f1_score']:.3f} ({a['f1_improvement']:+.3f})")
            lines.append(f"  Adaptive+CLAHE : F1 = {c['f1_score']:.3f} ({c['f1_improvement']:+.3f})")
    lines.append("")
    
    lines.append("4. Final Recommendation")
    lines.append("-----------------------")
    lines.append(f"The new TreeTrace default pipeline mode should be: **{best_overall['mode'].upper()}**")
    lines.append(f"This mode achieved the highest overall F1 score of {best_overall['f1_score']:.4f}.")
    
    sum_text = "\n".join(lines)
    with open(COMP_DIR / "comparison_summary.txt", "w") as f:
        f.write(sum_text)
        
    print(sum_text)
    print(f"\n  Outputs saved to {COMP_DIR}")
    print("=" * 65)

if __name__ == "__main__":
    main()
