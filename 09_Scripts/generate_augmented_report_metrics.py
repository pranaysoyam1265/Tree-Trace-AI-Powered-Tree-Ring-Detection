"""
Phase G -- Generate Report-Ready Metrics
Produces publication-quality statistics from augmented evaluation.

Usage:
    python 09_Scripts/generate_augmented_report_metrics.py
"""

import sys
import csv
import json
import statistics
from pathlib import Path
from collections import defaultdict

PROJECT_ROOT = Path(r"C:\Users\prana\OneDrive\Desktop\TreeTrace")
sys.path.insert(0, str(PROJECT_ROOT / "09_Scripts"))

from augmented_utils import EVAL_RESULTS_AUG, REPORT_METRICS_DIR


def load_metrics(csv_path: Path) -> list:
    rows = []
    with open(csv_path, "r") as f:
        reader = csv.DictReader(f)
        for row in reader:
            for k in ("precision", "recall", "f1_score", "rmse"):
                row[k] = float(row[k])
            for k in ("detected_rings", "gt_rings"):
                row[k] = int(row[k])
            rows.append(row)
    return rows


def main():
    print("=" * 65)
    print("  Phase G -- Report-Ready Metrics")
    print("=" * 65)
    print()

    REPORT_METRICS_DIR.mkdir(parents=True, exist_ok=True)

    csv_path = EVAL_RESULTS_AUG / "all_metrics.csv"
    if not csv_path.exists():
        print(f"  ERROR: {csv_path} not found. Run Phases A+B first.")
        return

    metrics = load_metrics(csv_path)
    evaluated = [m for m in metrics if m.get("status") == "evaluated"]
    print(f"  Loaded {len(evaluated)} evaluated images")

    f1s = [m["f1_score"] for m in evaluated]
    ps = [m["precision"] for m in evaluated]
    rs = [m["recall"] for m in evaluated]
    rmses = [m["rmse"] for m in evaluated]
    n = len(evaluated)

    # --- Overall Metrics ---
    overall = {
        "total_images": n,
        "avg_precision": round(sum(ps)/n, 4) if n else 0,
        "avg_recall": round(sum(rs)/n, 4) if n else 0,
        "avg_f1": round(sum(f1s)/n, 4) if n else 0,
        "avg_rmse": round(sum(rmses)/n, 4) if n else 0,
        "median_f1": round(statistics.median(f1s), 4) if f1s else 0,
        "std_f1": round(statistics.stdev(f1s), 4) if len(f1s) > 1 else 0,
        "min_f1": round(min(f1s), 4) if f1s else 0,
        "max_f1": round(max(f1s), 4) if f1s else 0,
    }

    print("\n  === OVERALL METRICS ===")
    for k, v in overall.items():
        print(f"    {k:<20s}: {v}")

    # --- Per-Category Metrics ---
    by_cat = defaultdict(list)
    for m in evaluated:
        by_cat[m.get("augmentation_category", "unknown")].append(m)

    per_category = {}
    print(f"\n  === PER-CATEGORY METRICS ===")
    print(f"  {'Category':<15s} {'N':>5s} {'P':>7s} {'R':>7s} "
          f"{'F1':>7s} {'RMSE':>8s} {'StdF1':>7s}")
    print(f"  {'-'*15} {'-'*5} {'-'*7} {'-'*7} {'-'*7} {'-'*8} {'-'*7}")

    for cat in sorted(by_cat.keys()):
        items = by_cat[cat]
        cn = len(items)
        cf1 = [m["f1_score"] for m in items]
        cp = [m["precision"] for m in items]
        cr = [m["recall"] for m in items]
        crmse = [m["rmse"] for m in items]

        stats = {
            "count": cn,
            "avg_precision": round(sum(cp)/cn, 4),
            "avg_recall": round(sum(cr)/cn, 4),
            "avg_f1": round(sum(cf1)/cn, 4),
            "avg_rmse": round(sum(crmse)/cn, 4),
            "std_f1": round(statistics.stdev(cf1), 4) if cn > 1 else 0,
        }
        per_category[cat] = stats
        print(f"  {cat:<15s} {cn:>5d} {stats['avg_precision']:>7.4f} "
              f"{stats['avg_recall']:>7.4f} {stats['avg_f1']:>7.4f} "
              f"{stats['avg_rmse']:>8.4f} {stats['std_f1']:>7.4f}")

    # --- Worst/Best Cases ---
    sorted_f1 = sorted(evaluated, key=lambda m: m["f1_score"])
    worst_10 = sorted_f1[:10]
    best_10 = sorted_f1[-10:]

    print(f"\n  === WORST 10 IMAGES ===")
    for m in worst_10:
        print(f"    {m['image_name']:40s} F1={m['f1_score']:.4f}")

    print(f"\n  === BEST 10 IMAGES ===")
    for m in best_10:
        print(f"    {m['image_name']:40s} F1={m['f1_score']:.4f}")

    # --- Robustness Summary ---
    cat_ranked = sorted(per_category.items(), key=lambda x: x[1]["avg_f1"])
    print(f"\n  === ROBUSTNESS SUMMARY ===")
    print(f"  Most affected (worst avg F1):")
    for cat, s in cat_ranked[:3]:
        print(f"    {cat:<15s} F1={s['avg_f1']:.4f}")
    print(f"  Least affected (best avg F1):")
    for cat, s in cat_ranked[-3:]:
        print(f"    {cat:<15s} F1={s['avg_f1']:.4f}")

    # --- Save all outputs ---
    report = {
        "overall": overall,
        "per_category": per_category,
        "worst_10": [{"image": m["image_name"], "f1": m["f1_score"],
                      "det": m["detected_rings"], "gt": m["gt_rings"]}
                     for m in worst_10],
        "best_10": [{"image": m["image_name"], "f1": m["f1_score"],
                     "det": m["detected_rings"], "gt": m["gt_rings"]}
                    for m in best_10],
        "robustness": {
            "most_affected": [{"category": c, "avg_f1": s["avg_f1"]}
                              for c, s in cat_ranked[:3]],
            "least_affected": [{"category": c, "avg_f1": s["avg_f1"]}
                               for c, s in cat_ranked[-3:]],
        }
    }

    with open(REPORT_METRICS_DIR / "report_metrics.json", "w") as f:
        json.dump(report, f, indent=2)

    # CSV: overall
    with open(REPORT_METRICS_DIR / "overall_metrics.csv", "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=overall.keys())
        writer.writeheader()
        writer.writerow(overall)

    # CSV: per-category
    with open(REPORT_METRICS_DIR / "per_category_metrics.csv", "w", newline="") as f:
        header = ["category"] + list(list(per_category.values())[0].keys())
        writer = csv.writer(f)
        writer.writerow(header)
        for cat in sorted(per_category.keys()):
            writer.writerow([cat] + list(per_category[cat].values()))

    # LaTeX table
    latex = "\\begin{tabular}{l|ccccc}\n"
    latex += "\\hline\n"
    latex += "Category & N & Precision & Recall & F1 & RMSE \\\\\n"
    latex += "\\hline\n"
    for cat in sorted(per_category.keys()):
        s = per_category[cat]
        latex += (f"{cat} & {s['count']} & {s['avg_precision']:.3f} & "
                  f"{s['avg_recall']:.3f} & {s['avg_f1']:.3f} & "
                  f"{s['avg_rmse']:.2f} \\\\\n")
    latex += "\\hline\n"
    latex += (f"Overall & {n} & {overall['avg_precision']:.3f} & "
              f"{overall['avg_recall']:.3f} & {overall['avg_f1']:.3f} & "
              f"{overall['avg_rmse']:.2f} \\\\\n")
    latex += "\\hline\n\\end{tabular}\n"

    with open(REPORT_METRICS_DIR / "metrics_table.tex", "w") as f:
        f.write(latex)

    print(f"\n  Saved to {REPORT_METRICS_DIR}")
    print("=" * 65)


if __name__ == "__main__":
    main()
