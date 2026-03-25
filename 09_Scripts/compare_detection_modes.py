"""
Step 5 & 6 -- Compare Detection Modes
Compares metrics from baseline, adaptive, and adaptive_clahe.
Enforces evaluation threshold checks (`f1 >= 0.75`, `precision >= 0.85`,
`each category >= 0.60`) to define the outright optimal TreeTrace mode.

Usage:
    python 09_Scripts/compare_detection_modes.py
"""

import sys
import csv
import json
import statistics
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from pathlib import Path

PROJECT_ROOT = Path(r"C:\Users\prana\OneDrive\Desktop\TreeTrace")
sys.path.insert(0, str(PROJECT_ROOT / "09_Scripts"))

OUTPUTS = PROJECT_ROOT / "07_Outputs"
COMP_DIR = OUTPUTS / "improvement_comparison"
MODES = ["baseline", "adaptive", "adaptive_clahe"]

def load_mode_data(mode):
    p = OUTPUTS / f"reeval_{mode}" / "analysis" / f"{mode}_summary.json"
    if p.exists():
        with open(p) as f: return json.load(f)
    return []

def load_raw_metrics(mode):
    p = OUTPUTS / f"reeval_{mode}" / "evaluation_results" / "all_metrics.json"
    if p.exists():
        with open(p) as f: return json.load(f)
    return []

def main():
    print("=" * 65)
    print("  Phase 4 -- Compare Detection Modes & Thresholds")
    print("=" * 65)
    
    COMP_DIR.mkdir(parents=True, exist_ok=True)
    
    data = {}
    raw_data = {}
    for m in MODES:
        data[m] = load_mode_data(m)
        raw_data[m] = [r for r in load_raw_metrics(m) if r["status"] == "evaluated"]
        if not data[m]:
            print(f"  Warning: No data for {m}. Run evaluation & analysis first.")
            return

    # Metrics
    comp = []
    categories = sorted(list(set(c["augmentation_category"] for c in data["baseline"])))
    
    # OVERALL
    for m in MODES:
        raw = raw_data[m]
        p = sum(r["precision"] for r in raw) / len(raw) if raw else 0
        r = sum(r["recall"] for r in raw) / len(raw) if raw else 0
        f = sum(r["f1_score"] for r in raw) / len(raw) if raw else 0
        rmse = sum(r["rmse"] for r in raw) / len(raw) if raw else 0
        f_list = [r["f1_score"] for r in raw]
        median_f = statistics.median(f_list) if raw else 0
        std_f = statistics.stdev(f_list) if len(f_list)>1 else 0
        
        comp.append({
            "mode": m, "category": "OVERALL",
            "avg_precision": round(p, 4), "avg_recall": round(r, 4),
            "avg_f1": round(f, 4), "avg_rmse": round(rmse, 4),
            "median_f1": round(median_f, 4), "std_f1": round(std_f, 4)
        })

    # CATEGORICAL
    for m in MODES:
        for cat in data[m]:
            cname = cat["augmentation_category"]
            c_raw = [r for r in raw_data[m] if r["augmentation_category"] == cname]
            f_list = [r["f1_score"] for r in c_raw]
            comp.append({
                "mode": m, "category": cname,
                "avg_precision": cat["avg_precision"],
                "avg_recall": cat["avg_recall"],
                "avg_f1": cat["avg_f1"],
                "avg_rmse": cat["avg_rmse"],
                "median_f1": round(statistics.median(f_list) if f_list else 0, 4),
                "std_f1": round(statistics.stdev(f_list) if len(f_list)>1 else 0, 4)
            })
            
    # Save CSV
    with open(COMP_DIR / "comparison_metrics.csv", "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=comp[0].keys())
        writer.writeheader()
        writer.writerows(comp)
        
    with open(COMP_DIR / "comparison_metrics.json", "w") as f:
        json.dump(comp, f, indent=2)

    # ----------------------------------------------------
    # THRESHOLD CHECKS
    # ----------------------------------------------------
    thresh_summary = []
    
    for m in MODES:
        m_comp = [c for c in comp if c["mode"] == m]
        ov = next(c for c in m_comp if c["category"] == "OVERALL")
        
        checks = []
        checks.append({"check": "avg_f1 >= 0.75", "value": ov["avg_f1"], "passed": bool(ov["avg_f1"] >= 0.75)})
        checks.append({"check": "avg_precision >= 0.85", "value": ov["avg_precision"], "passed": bool(ov["avg_precision"] >= 0.85)})
        
        cat_metrics = [c for c in m_comp if c["category"] != "OVERALL"]
        for c in cat_metrics:
            cn = c["category"]
            val = c["avg_f1"]
            checks.append({"check": f"category '{cn}' F1 >= 0.60", "value": val, "passed": bool(val >= 0.60)})
            
        passed = sum(1 for c in checks if c["passed"])
        total = len(checks)
        
        thresh_summary.append({
            "mode": m,
            "overall_passed": (passed == total),
            "passed_count": passed,
            "failed_count": total - passed,
            "checks": checks
        })
        
    with open(COMP_DIR / "threshold_check_summary.json", "w") as f:
        json.dump(thresh_summary, f, indent=2)

    # ----------------------------------------------------
    # CHARTS
    # ----------------------------------------------------
    # Overall Bar
    ovs = [next(c for c in comp if c["mode"] == m and c["category"] == "OVERALL") for m in MODES]
    x = np.arange(3)
    w = 0.25
    fig, ax = plt.subplots(figsize=(8, 6))
    ax.bar(x - w, [c["avg_precision"] for c in ovs], w, label="Precision")
    ax.bar(x, [c["avg_recall"] for c in ovs], w, label="Recall")
    ax.bar(x + w, [c["avg_f1"] for c in ovs], w, label="F1 Score")
    ax.set_xticks(x); ax.set_xticklabels([m.upper() for m in MODES])
    ax.axhline(0.75, color='red', linestyle='--', label="Target F1 (0.75)")
    ax.legend(); ax.set_title("Overall Performance by Mode")
    plt.tight_layout(); plt.savefig(COMP_DIR / "overall_metrics_comparison.png", dpi=150); plt.close()

    # Grouped F1 Bar Chart (Special focus: original, cracks, crop, staining)
    cat_focus = ["original", "cracks", "crop", "staining"]
    b_focus = [next(c["avg_f1"] for c in comp if c["mode"]=="baseline" and c["category"]==cat) for cat in cat_focus]
    a_focus = [next(c["avg_f1"] for c in comp if c["mode"]=="adaptive" and c["category"]==cat) for cat in cat_focus]
    c_focus = [next(c["avg_f1"] for c in comp if c["mode"]=="adaptive_clahe" and c["category"]==cat) for cat in cat_focus]
    
    x = np.arange(len(cat_focus))
    fig, ax = plt.subplots(figsize=(10, 6))
    ax.bar(x - w, b_focus, w, label="Baseline")
    ax.bar(x, a_focus, w, label="Adaptive")
    ax.bar(x + w, c_focus, w, label="Adaptive+CLAHE")
    ax.set_xticks(x); ax.set_xticklabels([c.upper() for c in cat_focus])
    ax.legend(); ax.set_title("Core Weakness Fix Comparison (F1)")
    ax.axhline(0.60, color='red', linestyle='--', label="Cat Target (0.60)")
    plt.tight_layout(); plt.savefig(COMP_DIR / "core_weakness_comparison.png", dpi=150); plt.close()

    # ----------------------------------------------------
    # FINAL DECISION REPORT
    # ----------------------------------------------------
    orig_base_f1 = b_focus[0]
    orig_fixed = orig_base_f1 > 0.70
    
    adapt_ov = next(o for o in ovs if o["mode"] == "adaptive")
    base_ov = next(o for o in ovs if o["mode"] == "baseline")
    
    score_diff = adapt_ov["avg_f1"] - base_ov["avg_f1"]
    
    best_mode = max(ovs, key=lambda x: x["avg_f1"])["mode"]
    
    adapt_thresh = next(t for t in thresh_summary if t["mode"] == best_mode)
    failed_cats = [c["check"] for c in adapt_thresh["checks"] if not c["passed"] and "category" in c["check"]]

    lines = [
        "FINAL PIPELINE DECISION MATRIX",
        "==============================",
        f"1. Was the original-category anomaly fixed? {'YES' if orig_fixed else 'NO'} (Baseline: {orig_base_f1:.3f})",
        f"2. Did adaptive mode improve overall F1 over baseline? {'YES' if score_diff > 0 else 'NO'} (+{score_diff:.3f})",
        f"3. Did adaptive_clahe further improve weak categories? (Cracks {b_focus[1]:.3f} vs {a_focus[1]:.3f} vs {c_focus[1]:.3f})",
        f"4. Which mode should be the new default? {best_mode.upper()}",
        f"5. Which weak categories remain below threshold in {best_mode.upper()}?",
        "   " + (", ".join(failed_cats) if failed_cats else "None! All passed!"),
        f"6. Has the system crossed the global F1 threshold of 0.75? {'YES' if adapt_ov['avg_f1'] >= 0.75 else 'NO'} ({adapt_ov['avg_f1']:.3f})",
        "",
        "THRESHOLD SUMMARY FOR BEST MODE:",
        "------------------------------------"
    ]
    for check in adapt_thresh["checks"]:
        lines.append(f"[{'PASS' if check['passed'] else 'FAIL'}] {check['check']} (Val: {check['value']:.3f})")
        
    out_txt = "\n".join(lines)
    with open(COMP_DIR / "final_mode_decision.txt", "w") as f:
        f.write(out_txt)
        
    print(out_txt)
    print("=" * 65)

if __name__ == "__main__":
    main()
