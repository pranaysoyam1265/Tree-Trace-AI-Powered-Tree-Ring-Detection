"""
Step 4 -- Mode-Specific Failure Analysis
Generates charts and categorical performance breakdowns for an isolated
operation mode (baseline, adaptive, adaptive_clahe).

Usage:
    python 09_Scripts/analyze_mode_specific_failures.py --mode adaptive
"""

import sys
import argparse
import csv
import json
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
from pathlib import Path
from collections import defaultdict

PROJECT_ROOT = Path(r"C:\Users\prana\OneDrive\Desktop\TreeTrace")
sys.path.insert(0, str(PROJECT_ROOT / "09_Scripts"))

def main():
    print("=" * 65)
    print("  Phase 3 -- Mode-Specific Failure Analysis")
    print("=" * 65)
    
    parser = argparse.ArgumentParser()
    parser.add_argument("--mode", type=str, required=True, choices=["baseline", "adaptive", "adaptive_clahe"])
    args = parser.parse_args()
    
    mode = args.mode
    EVAL_DIR = PROJECT_ROOT / "07_Outputs" / f"reeval_{mode}" / "evaluation_results"
    OUT_DIR = PROJECT_ROOT / "07_Outputs" / f"reeval_{mode}" / "analysis"
    
    csv_in = EVAL_DIR / "all_metrics.csv"
    if not csv_in.exists():
        print(f"  Error: {csv_in} not found. Run evaluation first.")
        return
        
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    
    metrics = []
    with open(csv_in) as f:
        for row in csv.DictReader(f):
            if row["status"] == "evaluated":
                metrics.append(row)
                
    if not metrics:
        return
        
    by_cat = defaultdict(list)
    for m in metrics:
        by_cat[m["augmentation_category"]].append(m)
        
    summary = []
    for cat, items in by_cat.items():
        n = len(items)
        avg_p = sum(float(x["precision"]) for x in items) / n
        avg_r = sum(float(x["recall"]) for x in items) / n
        avg_f = sum(float(x["f1_score"]) for x in items) / n
        avg_rmse = sum(float(x["rmse"]) for x in items) / n
        
        summary.append({
            "augmentation_category": cat,
            "count": n,
            "avg_precision": round(avg_p, 4),
            "avg_recall": round(avg_r, 4),
            "avg_f1": round(avg_f, 4),
            "avg_rmse": round(avg_rmse, 4)
        })
        
    # Sort alphabetical
    summary.sort(key=lambda x: x["augmentation_category"])
    
    csv_out = OUT_DIR / f"{mode}_summary.csv"
    with open(csv_out, "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=summary[0].keys())
        writer.writeheader()
        writer.writerows(summary)
        
    json_out = OUT_DIR / f"{mode}_summary.json"
    with open(json_out, "w") as f:
        json.dump(summary, f, indent=2)
        
    # CHART: F1 by Category
    cats = [s["augmentation_category"].upper() for s in summary]
    f1s = [s["avg_f1"] for s in summary]
    ps = [s["avg_precision"] for s in summary]
    rs = [s["avg_recall"] for s in summary]
    
    x = np.arange(len(cats))
    w = 0.25
    fig, ax = plt.subplots(figsize=(12, 6))
    ax.bar(x - w, ps, w, label="Precision")
    ax.bar(x,     rs, w, label="Recall")
    ax.bar(x + w, f1s, w, label="F1 Score")
    
    ax.set_xticks(x)
    ax.set_xticklabels(cats, rotation=45, ha='right')
    ax.set_ylim(0, 1.1)
    ax.axhline(0.60, color='red', linestyle='--', linewidth=1, label="Thresh (0.6)")
    ax.set_title(f"Performance by Augmentation Type [{mode.upper()}]")
    ax.legend()
    plt.tight_layout()
    plt.savefig(OUT_DIR / f"{mode}_performance_by_category.png", dpi=150)
    plt.close()
    
    print(f"  Analysis complete for {len(cats)} categories.")
    print(f"  Outputs saved to {OUT_DIR}")
    print("=" * 65)

if __name__ == "__main__":
    main()
