"""
Phase C -- Failure Analysis on Augmented Evaluation
Groups results by augmentation type, ranks failures, generates charts.

Usage:
    python 09_Scripts/analyze_augmented_failures.py
"""

import sys
import csv
import json
from pathlib import Path
from collections import defaultdict

PROJECT_ROOT = Path(r"C:\Users\prana\OneDrive\Desktop\TreeTrace")
sys.path.insert(0, str(PROJECT_ROOT / "09_Scripts"))

from augmented_utils import EVAL_RESULTS_AUG, ANALYSIS_CHARTS


def load_metrics(csv_path: Path) -> list:
    """Load all_metrics.csv into list of dicts."""
    rows = []
    with open(csv_path, "r") as f:
        reader = csv.DictReader(f)
        for row in reader:
            for key in ("precision", "recall", "f1_score", "rmse"):
                row[key] = float(row[key])
            for key in ("detected_rings", "gt_rings"):
                row[key] = int(row[key])
            rows.append(row)
    return rows


def group_by_category(metrics: list) -> dict:
    """Group metrics by augmentation_category."""
    groups = defaultdict(list)
    for m in metrics:
        cat = m.get("augmentation_category", "unknown")
        groups[cat].append(m)
    return dict(groups)


def compute_stats(group: list) -> dict:
    """Compute mean/std for a group of metric dicts."""
    n = len(group)
    if n == 0:
        return {"count": 0}

    f1s = [m["f1_score"] for m in group]
    ps = [m["precision"] for m in group]
    rs = [m["recall"] for m in group]
    rmses = [m["rmse"] for m in group]

    import statistics
    return {
        "count": n,
        "avg_f1": round(sum(f1s) / n, 4),
        "std_f1": round(statistics.stdev(f1s), 4) if n > 1 else 0,
        "avg_precision": round(sum(ps) / n, 4),
        "avg_recall": round(sum(rs) / n, 4),
        "avg_rmse": round(sum(rmses) / n, 4),
        "min_f1": round(min(f1s), 4),
        "max_f1": round(max(f1s), 4),
    }


def generate_charts(category_stats: dict, all_metrics: list, output_dir: Path):
    """Generate bar charts and histograms using matplotlib."""
    try:
        import matplotlib
        matplotlib.use("Agg")
        import matplotlib.pyplot as plt
    except ImportError:
        print("  [WARN] matplotlib not available, skipping chart generation")
        return

    output_dir.mkdir(parents=True, exist_ok=True)

    categories = sorted(category_stats.keys())
    avg_f1 = [category_stats[c]["avg_f1"] for c in categories]
    avg_p = [category_stats[c]["avg_precision"] for c in categories]
    avg_r = [category_stats[c]["avg_recall"] for c in categories]
    avg_rmse = [category_stats[c]["avg_rmse"] for c in categories]

    colors = plt.cm.Set3(range(len(categories)))

    # F1 by category
    fig, ax = plt.subplots(figsize=(12, 6))
    bars = ax.bar(categories, avg_f1, color=colors)
    ax.set_ylabel("Average F1 Score")
    ax.set_title("Average F1 Score by Augmentation Type")
    ax.set_ylim(0, 1.05)
    plt.xticks(rotation=45, ha="right")
    for bar, val in zip(bars, avg_f1):
        ax.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.01,
                f"{val:.3f}", ha="center", va="bottom", fontsize=8)
    plt.tight_layout()
    plt.savefig(output_dir / "f1_by_augmentation.png", dpi=150)
    plt.close()

    # Precision by category
    fig, ax = plt.subplots(figsize=(12, 6))
    bars = ax.bar(categories, avg_p, color=colors)
    ax.set_ylabel("Average Precision")
    ax.set_title("Average Precision by Augmentation Type")
    ax.set_ylim(0, 1.05)
    plt.xticks(rotation=45, ha="right")
    for bar, val in zip(bars, avg_p):
        ax.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.01,
                f"{val:.3f}", ha="center", va="bottom", fontsize=8)
    plt.tight_layout()
    plt.savefig(output_dir / "precision_by_augmentation.png", dpi=150)
    plt.close()

    # Recall by category
    fig, ax = plt.subplots(figsize=(12, 6))
    bars = ax.bar(categories, avg_r, color=colors)
    ax.set_ylabel("Average Recall")
    ax.set_title("Average Recall by Augmentation Type")
    ax.set_ylim(0, 1.05)
    plt.xticks(rotation=45, ha="right")
    for bar, val in zip(bars, avg_r):
        ax.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.01,
                f"{val:.3f}", ha="center", va="bottom", fontsize=8)
    plt.tight_layout()
    plt.savefig(output_dir / "recall_by_augmentation.png", dpi=150)
    plt.close()

    # RMSE by category
    fig, ax = plt.subplots(figsize=(12, 6))
    bars = ax.bar(categories, avg_rmse, color=colors)
    ax.set_ylabel("Average RMSE")
    ax.set_title("Average RMSE by Augmentation Type")
    plt.xticks(rotation=45, ha="right")
    for bar, val in zip(bars, avg_rmse):
        ax.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.01,
                f"{val:.2f}", ha="center", va="bottom", fontsize=8)
    plt.tight_layout()
    plt.savefig(output_dir / "rmse_by_augmentation.png", dpi=150)
    plt.close()

    # Histogram of F1 scores
    all_f1 = [m["f1_score"] for m in all_metrics if m.get("status") == "evaluated"]
    fig, ax = plt.subplots(figsize=(10, 6))
    ax.hist(all_f1, bins=30, color="#4CAF50", edgecolor="black", alpha=0.8)
    ax.set_xlabel("F1 Score")
    ax.set_ylabel("Count")
    ax.set_title("Distribution of F1 Scores Across All Augmented Images")
    ax.axvline(sum(all_f1)/len(all_f1) if all_f1 else 0, color="red",
               linestyle="--", label=f"Mean ({sum(all_f1)/len(all_f1):.3f})" if all_f1 else "")
    ax.legend()
    plt.tight_layout()
    plt.savefig(output_dir / "f1_histogram.png", dpi=150)
    plt.close()

    print(f"  Charts saved to {output_dir}")


def main():
    print("=" * 65)
    print("  Phase C -- Augmented Failure Analysis")
    print("=" * 65)
    print()

    csv_path = EVAL_RESULTS_AUG / "all_metrics.csv"
    if not csv_path.exists():
        print(f"  ERROR: {csv_path} not found. Run Phase B first.")
        return

    metrics = load_metrics(csv_path)
    evaluated = [m for m in metrics if m.get("status") == "evaluated"]
    print(f"  Loaded {len(metrics)} total, {len(evaluated)} evaluated")

    # Group by category
    groups = group_by_category(evaluated)
    category_stats = {}
    print()
    print(f"  {'Category':<15s} {'Count':>6s} {'Avg F1':>8s} {'Avg P':>8s} "
          f"{'Avg R':>8s} {'Avg RMSE':>10s}")
    print(f"  {'-'*15} {'-'*6} {'-'*8} {'-'*8} {'-'*8} {'-'*10}")

    for cat in sorted(groups.keys()):
        stats = compute_stats(groups[cat])
        category_stats[cat] = stats
        print(f"  {cat:<15s} {stats['count']:>6d} {stats['avg_f1']:>8.4f} "
              f"{stats['avg_precision']:>8.4f} {stats['avg_recall']:>8.4f} "
              f"{stats['avg_rmse']:>10.4f}")

    # Save failure summary
    ANALYSIS_CHARTS.mkdir(parents=True, exist_ok=True)

    summary_csv = ANALYSIS_CHARTS / "failure_summary.csv"
    with open(summary_csv, "w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(["category", "count", "avg_f1", "std_f1", "avg_precision",
                         "avg_recall", "avg_rmse", "min_f1", "max_f1"])
        for cat in sorted(category_stats.keys()):
            s = category_stats[cat]
            writer.writerow([cat, s["count"], s["avg_f1"], s["std_f1"],
                             s["avg_precision"], s["avg_recall"], s["avg_rmse"],
                             s["min_f1"], s["max_f1"]])

    summary_json = ANALYSIS_CHARTS / "failure_summary.json"
    with open(summary_json, "w") as f:
        json.dump(category_stats, f, indent=2)

    # Worst and best cases
    sorted_by_f1 = sorted(evaluated, key=lambda m: m["f1_score"])
    worst = sorted_by_f1[:20]
    best = sorted_by_f1[-20:]

    worst_csv = ANALYSIS_CHARTS / "worst_cases.csv"
    with open(worst_csv, "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=worst[0].keys())
        writer.writeheader()
        writer.writerows(worst)

    best_csv = ANALYSIS_CHARTS / "best_cases.csv"
    with open(best_csv, "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=best[0].keys())
        writer.writeheader()
        writer.writerows(best)

    print()
    print(f"  Worst 5 images by F1:")
    for m in worst[:5]:
        print(f"    {m['image_name']:40s} F1={m['f1_score']:.4f} "
              f"(det={m['detected_rings']}, gt={m['gt_rings']})")

    print(f"\n  Best 5 images by F1:")
    for m in best[-5:]:
        print(f"    {m['image_name']:40s} F1={m['f1_score']:.4f} "
              f"(det={m['detected_rings']}, gt={m['gt_rings']})")

    # Generate charts
    print()
    generate_charts(category_stats, metrics, ANALYSIS_CHARTS)

    print()
    print("=" * 65)
    print(f"  FAILURE ANALYSIS COMPLETE")
    print(f"  Summary:  {summary_csv}")
    print(f"  Worst:    {worst_csv}")
    print(f"  Best:     {best_csv}")
    print(f"  Charts:   {ANALYSIS_CHARTS}")
    print("=" * 65)


if __name__ == "__main__":
    main()
