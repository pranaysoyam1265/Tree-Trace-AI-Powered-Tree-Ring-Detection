"""
Phase I -- Master Pipeline
Orchestrates all phases and enforces pass/fail thresholds.

Usage:
    python 09_Scripts/run_full_augmented_pipeline.py
    python 09_Scripts/run_full_augmented_pipeline.py --skip-detection
    python 09_Scripts/run_full_augmented_pipeline.py --quick
"""

import sys
import json
import time
from pathlib import Path

PROJECT_ROOT = Path(r"C:\Users\prana\OneDrive\Desktop\TreeTrace")
sys.path.insert(0, str(PROJECT_ROOT / "09_Scripts"))

from augmented_utils import (
    CSTRD_RESULTS_AUG, EVAL_RESULTS_AUG, ANALYSIS_CHARTS,
    PARAM_SWEEP_DIR, PREPROC_TEST_DIR, ADAPTIVE_TEST_DIR,
    REPORT_METRICS_DIR, MANIFESTS_DIR, ensure_dirs
)

# Pass/fail thresholds
THRESHOLDS = {
    "avg_f1_min": 0.75,
    "avg_precision_min": 0.85,
    "category_f1_min": 0.60,
    "failure_rate_max": 0.02,  # 2%
}


def run_phase(name: str, func, *args, **kwargs):
    """Run a phase with timing and error handling."""
    print()
    print("*" * 65)
    print(f"  STARTING: {name}")
    print("*" * 65)
    t0 = time.time()
    try:
        result = func(*args, **kwargs)
        dt = time.time() - t0
        print(f"\n  {name} completed in {dt:.0f}s ({dt/60:.1f}m)")
        return {"status": "success", "time_s": round(dt, 1), "result": result}
    except Exception as e:
        dt = time.time() - t0
        print(f"\n  {name} FAILED: {e}")
        return {"status": "error", "time_s": round(dt, 1), "error": str(e)}


def check_thresholds() -> dict:
    """Check if results meet pass/fail thresholds."""
    report_path = REPORT_METRICS_DIR / "report_metrics.json"
    if not report_path.exists():
        return {"passed": False, "reason": "No report metrics found"}

    with open(report_path) as f:
        report = json.load(f)

    overall = report.get("overall", {})
    per_cat = report.get("per_category", {})

    checks = []

    avg_f1 = overall.get("avg_f1", 0)
    checks.append({
        "check": "avg_f1 >= threshold",
        "value": avg_f1,
        "threshold": THRESHOLDS["avg_f1_min"],
        "passed": avg_f1 >= THRESHOLDS["avg_f1_min"],
    })

    avg_p = overall.get("avg_precision", 0)
    checks.append({
        "check": "avg_precision >= threshold",
        "value": avg_p,
        "threshold": THRESHOLDS["avg_precision_min"],
        "passed": avg_p >= THRESHOLDS["avg_precision_min"],
    })

    # Check per-category F1
    for cat, stats in per_cat.items():
        cat_f1 = stats.get("avg_f1", 0)
        checks.append({
            "check": f"category '{cat}' F1 >= threshold",
            "value": cat_f1,
            "threshold": THRESHOLDS["category_f1_min"],
            "passed": cat_f1 >= THRESHOLDS["category_f1_min"],
        })

    all_passed = all(c["passed"] for c in checks)
    failed_checks = [c for c in checks if not c["passed"]]

    return {
        "passed": all_passed,
        "checks": checks,
        "failed_checks": failed_checks,
        "total_checks": len(checks),
        "passed_checks": len(checks) - len(failed_checks),
    }


def main():
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--skip-detection", action="store_true",
                        help="Skip Phase A (use existing detections)")
    parser.add_argument("--quick", action="store_true",
                        help="Run with --limit 50 for quick testing")
    parser.add_argument("--limit", type=int, default=None,
                        help="Limit detection to N images")
    args = parser.parse_args()

    print("=" * 65)
    print("  TreeTrace -- Full Augmented Pipeline")
    print("=" * 65)

    ensure_dirs()
    pipeline_start = time.time()
    phase_results = {}

    # Phase A: Detection
    if not args.skip_detection:
        from run_augmented_batch_detection import run_batch_detection
        limit = args.limit or (50 if args.quick else None)
        phase_results["A_detection"] = run_phase(
            "Phase A: Batch Detection",
            run_batch_detection, limit=limit
        )
    else:
        print("\n  Skipping Phase A (--skip-detection)")
        phase_results["A_detection"] = {"status": "skipped"}

    # Phase B: Evaluation
    from evaluate_augmented_batch import run_batch_evaluation
    phase_results["B_evaluation"] = run_phase(
        "Phase B: Batch Evaluation",
        run_batch_evaluation
    )

    # Phase C: Failure Analysis
    from analyze_augmented_failures import main as analyze_main
    phase_results["C_failure_analysis"] = run_phase(
        "Phase C: Failure Analysis",
        analyze_main
    )

    # Phase G: Report Metrics (run before D/E/F since it reads the same data)
    from generate_augmented_report_metrics import main as report_main
    phase_results["G_report_metrics"] = run_phase(
        "Phase G: Report Metrics",
        report_main
    )

    # Phase D: Parameter Sweep (optional, runs on subset)
    if not args.quick:
        from parameter_sweep_augmented import run_sweep
        phase_results["D_param_sweep"] = run_phase(
            "Phase D: Parameter Sweep",
            run_sweep, full=False
        )

    # Phase E: Preprocessing Test (optional)
    if not args.quick:
        from test_preprocessing_impact import main as preproc_main
        phase_results["E_preprocessing"] = run_phase(
            "Phase E: Preprocessing Impact",
            preproc_main
        )

    # Phase F: Adaptive Thresholds (optional)
    if not args.quick:
        from test_adaptive_thresholds import main as adaptive_main
        phase_results["F_adaptive_thresholds"] = run_phase(
            "Phase F: Adaptive Thresholds",
            adaptive_main
        )

    # Phase H: Training Manifests
    from prepare_augmented_training_manifest import main as manifest_main
    phase_results["H_manifests"] = run_phase(
        "Phase H: Training Manifests",
        manifest_main
    )

    # Check thresholds
    threshold_results = check_thresholds()

    total_time = time.time() - pipeline_start

    # Save pipeline summary
    summary = {
        "total_time_s": round(total_time, 1),
        "total_time_m": round(total_time / 60, 1),
        "phases": {k: {"status": v.get("status"), "time_s": v.get("time_s")}
                   for k, v in phase_results.items()},
        "thresholds": threshold_results,
        "overall_status": "PASS" if threshold_results.get("passed") else "FAIL",
    }

    summary_path = PROJECT_ROOT / "07_Outputs" / "pipeline_summary.json"
    with open(summary_path, "w") as f:
        json.dump(summary, f, indent=2)

    summary_csv = PROJECT_ROOT / "07_Outputs" / "pipeline_summary.csv"
    with open(summary_csv, "w", newline="") as f:
        import csv
        writer = csv.writer(f)
        writer.writerow(["phase", "status", "time_s"])
        for k, v in phase_results.items():
            writer.writerow([k, v.get("status"), v.get("time_s")])

    # Final report
    print()
    print("=" * 65)
    print(f"  PIPELINE COMPLETE")
    print(f"  Total time: {total_time:.0f}s ({total_time/60:.1f}m)")
    print()
    for phase, info in phase_results.items():
        status = info.get("status", "?")
        t = info.get("time_s", 0)
        icon = "OK" if status == "success" else "!!" if status == "error" else "--"
        print(f"    [{icon}] {phase:<30s} {status:10s} {t:>8.1f}s")

    print()
    if threshold_results.get("passed"):
        print(f"  RESULT: PASS ({threshold_results['passed_checks']}/"
              f"{threshold_results['total_checks']} checks passed)")
    else:
        print(f"  RESULT: FAIL")
        for fc in threshold_results.get("failed_checks", []):
            print(f"    FAILED: {fc['check']} "
                  f"(value={fc['value']:.4f}, threshold={fc['threshold']})")

    print(f"\n  Summary: {summary_path}")
    print("=" * 65)


if __name__ == "__main__":
    main()
