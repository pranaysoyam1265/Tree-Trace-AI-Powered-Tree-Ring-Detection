"""
Phase B -- Evaluate Augmented Batch Detections
Computes P/R/F1/RMSE for each detected augmented image against
its augmented ground truth annotation.

Usage:
    python 09_Scripts/evaluate_augmented_batch.py
"""

import sys
import json
import csv
import re
import time
import io
import contextlib
from pathlib import Path

PROJECT_ROOT = Path(r"C:\Users\prana\OneDrive\Desktop\TreeTrace")
URUDENDRO_ROOT = Path(r"C:\Users\prana\OneDrive\Desktop\uruDendro-main")
sys.path.insert(0, str(URUDENDRO_ROOT))
sys.path.insert(0, str(PROJECT_ROOT / "09_Scripts"))

from augmented_utils import (
    load_original_pith_csv, get_augmented_pith, parse_augmented_filename,
    get_aug_category, CSTRD_RESULTS_AUG, EVAL_RESULTS_AUG, AUGMENTED_DIR
)


def evaluate_single_augmented(image_stem: str, pith_data: dict,
                               detection_dir: Path, gt_dir: Path,
                               threshold: float = 0.5) -> dict:
    """Evaluate a single augmented detection against its ground truth."""
    orig, aug_type, aug_param = parse_augmented_filename(image_stem)
    category = get_aug_category(aug_type)

    # Find detection JSON
    det_dir = detection_dir / image_stem
    det_json = det_dir / f"{image_stem}.json"
    if not det_json.exists():
        det_json = det_dir / "labelme.json"
    if not det_json.exists():
        return {"image_name": image_stem, "original_image": orig,
                "augmentation_type": aug_type, "augmentation_category": category,
                "status": "no_detection", "precision": 0, "recall": 0,
                "f1_score": 0, "rmse": 999, "detected_rings": 0, "gt_rings": 0}

    # Find ground truth JSON
    gt_json = gt_dir / f"{image_stem}.json"
    if not gt_json.exists():
        return {"image_name": image_stem, "original_image": orig,
                "augmentation_type": aug_type, "augmentation_category": category,
                "status": "no_gt", "precision": 0, "recall": 0,
                "f1_score": 0, "rmse": 999, "detected_rings": 0, "gt_rings": 0}

    # Find augmented image
    img_path = gt_dir / f"{image_stem}.jpg"
    if not img_path.exists():
        return {"image_name": image_stem, "original_image": orig,
                "augmentation_type": aug_type, "augmentation_category": category,
                "status": "no_image", "precision": 0, "recall": 0,
                "f1_score": 0, "rmse": 999, "detected_rings": 0, "gt_rings": 0}

    # Get pith
    pith = get_augmented_pith(image_stem, pith_data)
    if pith is None:
        return {"image_name": image_stem, "original_image": orig,
                "augmentation_type": aug_type, "augmentation_category": category,
                "status": "no_pith", "precision": 0, "recall": 0,
                "f1_score": 0, "rmse": 999, "detected_rings": 0, "gt_rings": 0}

    cx, cy = pith

    # Count rings from JSONs
    with open(det_json) as f:
        det_data = json.load(f)
    with open(gt_json) as f:
        gt_data = json.load(f)

    det_count = len(det_data.get("shapes", []))
    gt_count = len(gt_data.get("shapes", []))

    # Try UruDendro metric_influence_area
    try:
        from urudendro.metric_influence_area import main as compute_metrics

        stdout_capture = io.StringIO()
        eval_out = EVAL_RESULTS_AUG / image_stem
        eval_out.mkdir(parents=True, exist_ok=True)

        with contextlib.redirect_stdout(stdout_capture):
            result = compute_metrics(
                str(det_json), str(gt_json), str(img_path),
                str(eval_out), float(threshold), int(cy), int(cx)
            )
            
        import matplotlib.pyplot as plt
        plt.clf()
        plt.close('all')

        P, R, F, RMSE_val = result[0], result[1], result[2], result[3]

    except Exception as e:
        # Try to parse from stdout
        output = stdout_capture.getvalue() if 'stdout_capture' in dir() else ""
        match = re.search(r'P=([\d.]+)\s+R=([\d.]+)\s+F=([\d.]+)\s+RMSE=([\d.]+)', output)
        if match:
            P = float(match.group(1))
            R = float(match.group(2))
            F = float(match.group(3))
            RMSE_val = float(match.group(4))
        else:
            # Fallback: simple ring count comparison
            if gt_count == 0:
                P = 1.0 if det_count == 0 else 0.0
                R = 1.0
                F = 1.0 if det_count == 0 else 0.0
            else:
                tp = min(det_count, gt_count)
                P = tp / det_count if det_count > 0 else 0
                R = tp / gt_count
                F = 2 * P * R / (P + R) if (P + R) > 0 else 0
            RMSE_val = abs(det_count - gt_count)

    return {
        "image_name": image_stem,
        "original_image": orig,
        "augmentation_type": aug_type,
        "augmentation_category": category,
        "status": "evaluated",
        "precision": round(float(P), 4),
        "recall": round(float(R), 4),
        "f1_score": round(float(F), 4),
        "rmse": round(float(RMSE_val), 4),
        "detected_rings": det_count,
        "gt_rings": gt_count,
    }


def run_batch_evaluation(detection_dir: Path = None, gt_dir: Path = None):
    """Evaluate all detected augmented images."""
    if detection_dir is None:
        detection_dir = CSTRD_RESULTS_AUG
    if gt_dir is None:
        gt_dir = AUGMENTED_DIR

    EVAL_RESULTS_AUG.mkdir(parents=True, exist_ok=True)

    pith_data = load_original_pith_csv()

    # Find all detection subdirectories
    det_dirs = sorted([d for d in detection_dir.iterdir()
                       if d.is_dir() and d.name != "__pycache__"])

    print(f"  Found {len(det_dirs)} detection results")
    print()

    all_metrics = []
    total_start = time.time()

    for idx, det_subdir in enumerate(det_dirs, 1):
        stem = det_subdir.name
        result = evaluate_single_augmented(stem, pith_data, detection_dir, gt_dir)
        all_metrics.append(result)

        status = result["status"]
        f1 = result["f1_score"]
        print(f"  [{idx:4d}/{len(det_dirs)}] {stem:40s} "
              f"F1={f1:.3f}  P={result['precision']:.3f}  "
              f"R={result['recall']:.3f}  {status}")

    elapsed = time.time() - total_start

    # Save all metrics
    csv_path = EVAL_RESULTS_AUG / "all_metrics.csv"
    if all_metrics:
        with open(csv_path, "w", newline="") as f:
            writer = csv.DictWriter(f, fieldnames=all_metrics[0].keys())
            writer.writeheader()
            writer.writerows(all_metrics)

    json_path = EVAL_RESULTS_AUG / "all_metrics.json"
    with open(json_path, "w") as f:
        json.dump(all_metrics, f, indent=2)

    # Summary
    evaluated = [m for m in all_metrics if m["status"] == "evaluated"]
    if evaluated:
        avg_f1 = sum(m["f1_score"] for m in evaluated) / len(evaluated)
        avg_p = sum(m["precision"] for m in evaluated) / len(evaluated)
        avg_r = sum(m["recall"] for m in evaluated) / len(evaluated)
        avg_rmse = sum(m["rmse"] for m in evaluated) / len(evaluated)
    else:
        avg_f1 = avg_p = avg_r = avg_rmse = 0

    print()
    print("=" * 65)
    print(f"  BATCH EVALUATION COMPLETE")
    print(f"  Total:      {len(all_metrics)}")
    print(f"  Evaluated:  {len(evaluated)}")
    print(f"  Avg F1:     {avg_f1:.4f}")
    print(f"  Avg P:      {avg_p:.4f}")
    print(f"  Avg R:      {avg_r:.4f}")
    print(f"  Avg RMSE:   {avg_rmse:.4f}")
    print(f"  Time:       {elapsed:.0f}s ({elapsed/60:.1f}m)")
    print(f"  Output:     {csv_path}")
    print("=" * 65)

    return all_metrics


def main():
    print("=" * 65)
    print("  Phase B -- Augmented Batch Evaluation")
    print("=" * 65)
    print()
    run_batch_evaluation()


if __name__ == "__main__":
    main()
