"""
TreeTrace Batch Processing and Evaluation - Robust Version
"""

import sys
import json
import csv
import subprocess
import re
import shutil
from pathlib import Path
from datetime import datetime

# Paths
PROJECT_ROOT = Path(r"C:\Users\prana\OneDrive\Desktop\TreeTrace")
CSTRD_ROOT = Path(r"C:\Users\prana\OneDrive\Desktop\cstrd_ipol")
URUDENDRO_ROOT = Path(r"C:\Users\prana\OneDrive\Desktop\uruDendro-main")

sys.path.insert(0, str(URUDENDRO_ROOT))

INPUT_DIR = PROJECT_ROOT / "01_Raw_Data" / "URuDendro" / "images"
PITH_CSV = PROJECT_ROOT / "01_Raw_Data" / "URuDendro" / "pith_location.csv"
GT_DIR = URUDENDRO_ROOT / "annotations (1)"
OUTPUT_DIR = PROJECT_ROOT / "07_Outputs" / "cstrd_results"
EVAL_DIR = PROJECT_ROOT / "07_Outputs" / "evaluation_results"

# Suppress warnings
import warnings
warnings.filterwarnings('ignore')


def load_pith_coordinates():
    coords = {}
    with open(PITH_CSV, 'r') as f:
        reader = csv.DictReader(f)
        for row in reader:
            name = row['Image'].strip()
            coords[name] = (int(row['cx']), int(row['cy']))
    return coords


def find_image(image_name):
    for ext in ['.png', '.jpg', '.PNG', '.JPG', '.jpeg']:
        candidate = INPUT_DIR / f"{image_name}{ext}"
        if candidate.exists():
            return candidate
    return None


def run_cstrd(image_path, cx, cy, output_dir):
    """Run CS-TRD on single image."""
    cmd = [
        sys.executable,
        str(CSTRD_ROOT / "main.py"),
        "--input", str(image_path),
        "--cx", str(cx),
        "--cy", str(cy),
        "--output_dir", str(output_dir),
        "--root", str(CSTRD_ROOT),
    ]
    
    result = subprocess.run(cmd, cwd=str(CSTRD_ROOT), capture_output=True, text=True)
    
    json_path = output_dir / "labelme.json"
    return json_path if json_path.exists() else None


def count_rings_in_json(json_path):
    """Count rings in a LabelMe JSON file."""
    try:
        with open(json_path) as f:
            data = json.load(f)
        return len(data.get('shapes', []))
    except:
        return 0


def evaluate_detection(image_name, detection_path, gt_path, image_path, cx, cy):
    """Evaluate using UruDendro metrics."""
    import io
    import contextlib
    
    try:
        from urudendro.metric_influence_area import main as compute_metrics
    except ImportError:
        return None
    
    output_dir = EVAL_DIR / image_name
    output_dir.mkdir(parents=True, exist_ok=True)
    
    stdout_capture = io.StringIO()
    stderr_capture = io.StringIO()
    
    try:
        with contextlib.redirect_stdout(stdout_capture), contextlib.redirect_stderr(stderr_capture):
            result = compute_metrics(
                str(detection_path),
                str(gt_path),
                str(image_path),
                str(output_dir),
                0.5,
                int(cx),
                int(cy)
            )
        P, R, F, RMSE, TP, FP, TN, FN = result
        return {
            'precision': P, 'recall': R, 'f1': F, 'rmse': RMSE,
            'tp': int(TP), 'fp': int(FP), 'fn': int(FN),
            'detected': int(TP + FP), 'gt_rings': int(TP + FN)
        }
        
    except Exception as e:
        output = stdout_capture.getvalue()
        match = re.search(r'P=([\d.]+)\s+R=([\d.]+)\s+F=([\d.]+)\s+RMSE=([\d.]+)', output)
        
        if match:
            P, R, F, RMSE = map(float, match.groups())
            
            det_count = count_rings_in_json(detection_path)
            gt_count = count_rings_in_json(gt_path)
            
            TP = int(round(R * gt_count))
            FP = max(0, det_count - TP)
            FN = max(0, gt_count - TP)
            
            return {
                'precision': P, 'recall': R, 'f1': F, 'rmse': RMSE,
                'tp': TP, 'fp': FP, 'fn': FN,
                'detected': det_count, 'gt_rings': gt_count
            }
        
        return None


def main():
    print("=" * 70)
    print("TreeTrace Batch Processing & Evaluation")
    print("=" * 70)
    
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    EVAL_DIR.mkdir(parents=True, exist_ok=True)
    
    pith_coords = load_pith_coordinates()
    print(f"Found {len(pith_coords)} images with pith coordinates\n")
    
    results = []
    failed = []
    
    for i, (image_name, (cx, cy)) in enumerate(pith_coords.items(), 1):
        print(f"[{i:2d}/{len(pith_coords)}] {image_name}...", end=" ", flush=True)
        
        # Find image
        image_path = find_image(image_name)
        if not image_path:
            print("IMAGE NOT FOUND")
            failed.append((image_name, "image not found"))
            continue
        
        # Check ground truth exists
        gt_path = GT_DIR / f"{image_name}.json"
        if not gt_path.exists():
            print("NO GT")
            failed.append((image_name, "no ground truth"))
            continue
        
        # Run CS-TRD
        img_output_dir = OUTPUT_DIR / image_name
        img_output_dir.mkdir(parents=True, exist_ok=True)
        
        detection_path = run_cstrd(image_path, cx, cy, img_output_dir)
        
        if not detection_path:
            print("DETECTION FAILED")
            failed.append((image_name, "detection failed"))
            continue
        
        # Copy with standard name
        std_json = OUTPUT_DIR / f"{image_name}.json"
        shutil.copy(detection_path, std_json)
        
        det_count = count_rings_in_json(std_json)
        gt_count = count_rings_in_json(gt_path)
        
        # Evaluate
        metrics = evaluate_detection(image_name, std_json, gt_path, image_path, cx, cy)
        
        if metrics:
            results.append({
                'image': image_name,
                **metrics
            })
            print(f"P={metrics['precision']:.2f} R={metrics['recall']:.2f} F1={metrics['f1']:.2f} (det={det_count}, gt={gt_count})")
        else:
            # Still record detection count even if eval failed
            print(f"EVAL FAILED (det={det_count}, gt={gt_count})")
            failed.append((image_name, f"eval failed, det={det_count}, gt={gt_count}"))
    
    # Summary
    print("\n" + "=" * 70)
    print("SUMMARY")
    print("=" * 70)
    
    print(f"Successfully evaluated: {len(results)} images")
    print(f"Failed: {len(failed)} images")
    
    if results:
        avg_p = sum(r['precision'] for r in results) / len(results)
        avg_r = sum(r['recall'] for r in results) / len(results)
        avg_f1 = sum(r['f1'] for r in results) / len(results)
        avg_rmse = sum(r['rmse'] for r in results) / len(results)
        
        print(f"\n--- Metrics (n={len(results)}) ---")
        print(f"Average Precision: {avg_p:.3f} ({avg_p*100:.1f}%)")
        print(f"Average Recall:    {avg_r:.3f} ({avg_r*100:.1f}%)")
        print(f"Average F1 Score:  {avg_f1:.3f}")
        print(f"Average RMSE:      {avg_rmse:.2f} pixels")
        
        # Best and worst
        best = max(results, key=lambda x: x['f1'])
        worst = min(results, key=lambda x: x['f1'])
        
        print(f"\nBest:  {best['image']} (F1={best['f1']:.2f}, P={best['precision']:.2f}, R={best['recall']:.2f})")
        print(f"Worst: {worst['image']} (F1={worst['f1']:.2f}, P={worst['precision']:.2f}, R={worst['recall']:.2f})")
        
        # Distribution
        f1_high = sum(1 for r in results if r['f1'] >= 0.7)
        f1_mid = sum(1 for r in results if 0.5 <= r['f1'] < 0.7)
        f1_low = sum(1 for r in results if r['f1'] < 0.5)
        
        print(f"\nF1 Distribution:")
        print(f"  High (≥0.7):  {f1_high} images")
        print(f"  Medium (0.5-0.7): {f1_mid} images")
        print(f"  Low (<0.5):   {f1_low} images")
        
        # Save results
        summary = {
            'timestamp': datetime.now().isoformat(),
            'total_processed': len(results),
            'total_failed': len(failed),
            'avg_precision': avg_p,
            'avg_recall': avg_r,
            'avg_f1': avg_f1,
            'avg_rmse': avg_rmse,
            'best_image': best['image'],
            'worst_image': worst['image'],
            'per_image': results,
            'failed': failed
        }
        
        summary_path = EVAL_DIR / "batch_summary.json"
        with open(summary_path, 'w') as f:
            json.dump(summary, f, indent=2)
        print(f"\nSaved: {summary_path}")
        
        # CSV for easy viewing
        csv_path = EVAL_DIR / "batch_results.csv"
        with open(csv_path, 'w', newline='') as f:
            fieldnames = ['image', 'precision', 'recall', 'f1', 'rmse', 'tp', 'fp', 'fn', 'detected', 'gt_rings']
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(results)
        print(f"Saved: {csv_path}")
    
    if failed:
        print(f"\nFailed images:")
        for name, reason in failed[:10]:  # Show first 10
            print(f"  {name}: {reason}")
        if len(failed) > 10:
            print(f"  ... and {len(failed) - 10} more")


if __name__ == "__main__":
    main()