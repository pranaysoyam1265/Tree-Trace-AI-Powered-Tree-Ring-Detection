"""
TreeTrace Detection Evaluation using UruDendro metrics
"""

import sys
import json
import csv
import re
from pathlib import Path
from io import StringIO

# Add UruDendro to path
URUDENDRO_ROOT = Path(r"C:\Users\prana\OneDrive\Desktop\uruDendro-main")
sys.path.insert(0, str(URUDENDRO_ROOT))

PROJECT_ROOT = Path(r"C:\Users\prana\OneDrive\Desktop\TreeTrace")
DETECTION_DIR = PROJECT_ROOT / "07_Outputs" / "cstrd_results"
GT_DIR = URUDENDRO_ROOT / "annotations (1)"
IMAGE_DIR = PROJECT_ROOT / "01_Raw_Data" / "URuDendro" / "images"
EVAL_OUTPUT_DIR = PROJECT_ROOT / "07_Outputs" / "evaluation_results"


def load_pith_from_csv():
    """Load all pith coordinates from CSV."""
    pith_csv = PROJECT_ROOT / "01_Raw_Data" / "URuDendro" / "pith_location.csv"
    
    coords = {}
    with open(pith_csv, 'r') as f:
        reader = csv.DictReader(f)
        for row in reader:
            name = row['Image'].strip()
            cx = int(row['cx'])
            cy = int(row['cy'])
            coords[name] = (cx, cy)
    
    return coords


def evaluate_single(image_name, pith_coords, threshold=0.5):
    """Evaluate detection for a single image."""
    try:
        from urudendro.metric_influence_area import main as compute_metrics
    except ImportError as e:
        print(f"ERROR: Could not import UruDendro: {e}")
        return None
    
    # Paths
    detection_path = DETECTION_DIR / f"{image_name}.json"
    gt_path = GT_DIR / f"{image_name}.json"
    
    # Find image
    image_path = None
    for ext in ['.png', '.jpg', '.PNG', '.JPG']:
        candidate = IMAGE_DIR / f"{image_name}{ext}"
        if candidate.exists():
            image_path = candidate
            break
    
    # Validate files exist
    if not detection_path.exists():
        print(f"ERROR: Detection not found: {detection_path}")
        return None
    
    if not gt_path.exists():
        print(f"ERROR: Ground truth not found: {gt_path}")
        return None
    
    if image_path is None:
        print(f"ERROR: Image not found for {image_name}")
        return None
    
    # Get pith coordinates
    if image_name not in pith_coords:
        print(f"ERROR: No pith coordinates for {image_name}")
        return None
    
    cx, cy = pith_coords[image_name]
    
    # Create output directory
    output_dir = EVAL_OUTPUT_DIR / image_name
    output_dir.mkdir(parents=True, exist_ok=True)
    
    print(f"\nEvaluating {image_name}...")
    print(f"  Detection: {detection_path}")
    print(f"  Ground Truth: {gt_path}")
    print(f"  Pith: cx={cx}, cy={cy}")
    
    # Capture stdout to get metrics even if visualization fails
    import io
    import contextlib
    
    stdout_capture = io.StringIO()
    
    try:
        with contextlib.redirect_stdout(stdout_capture):
            result = compute_metrics(
                str(detection_path),
                str(gt_path),
                str(image_path),
                str(output_dir),
                float(threshold),
                int(cx),
                int(cy)
            )
        
        P, R, F, RMSE, TP, FP, TN, FN = result
        
    except Exception as e:
        # Try to parse metrics from stdout even if there was an error
        output = stdout_capture.getvalue()
        print(output)  # Show captured output
        
        # Parse metrics from output like "F02a.png P=0.88 R=0.65 F=0.75 RMSE=8.30"
        match = re.search(r'P=([\d.]+)\s+R=([\d.]+)\s+F=([\d.]+)\s+RMSE=([\d.]+)', output)
        
        if match:
            P = float(match.group(1))
            R = float(match.group(2))
            F = float(match.group(3))
            RMSE = float(match.group(4))
            
            # Estimate TP/FP/FN from detection counts
            with open(detection_path) as f:
                det_data = json.load(f)
            with open(gt_path) as f:
                gt_data = json.load(f)
            
            det_count = len(det_data.get('shapes', []))
            gt_count = len(gt_data.get('shapes', []))
            
            # Approximate: TP = R * gt_count, FP = det_count - TP, FN = gt_count - TP
            TP = int(round(R * gt_count))
            FP = det_count - TP
            FN = gt_count - TP
            TN = 0
            
            print(f"  (Recovered metrics from output despite visualization error)")
        else:
            print(f"ERROR: Could not parse metrics: {e}")
            return None
    
    results = {
        'image': image_name,
        'precision': float(P),
        'recall': float(R),
        'f1_score': float(F),
        'rmse': float(RMSE),
        'true_positives': int(TP),
        'false_positives': int(FP),
        'true_negatives': int(TN),
        'false_negatives': int(FN),
        'detected_rings': int(TP + FP),
        'gt_rings': int(TP + FN)
    }
    
    print(f"\n  ========== RESULTS ==========")
    print(f"    Precision: {P:.2f} ({P*100:.0f}%)")
    print(f"    Recall:    {R:.2f} ({R*100:.0f}%)")
    print(f"    F1 Score:  {F:.2f}")
    print(f"    RMSE:      {RMSE:.2f} pixels")
    print(f"    TP={TP}, FP={FP}, FN={FN}")
    print(f"    Detected: {TP + FP} rings")
    print(f"    Ground Truth: {TP + FN} rings")
    print(f"  ==============================")
    
    return results


def main():
    import argparse
    
    parser = argparse.ArgumentParser(description="Evaluate tree ring detection")
    parser.add_argument("--image", type=str, help="Single image name (e.g., F02a)")
    parser.add_argument("--threshold", type=float, default=0.5, help="Evaluation threshold")
    
    args = parser.parse_args()
    
    pith_coords = load_pith_from_csv()
    print(f"Loaded {len(pith_coords)} pith coordinates")
    
    EVAL_OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    
    if args.image:
        result = evaluate_single(args.image, pith_coords, args.threshold)
        if result:
            output_file = EVAL_OUTPUT_DIR / f"{args.image}_metrics.json"
            with open(output_file, 'w') as f:
                json.dump(result, f, indent=2)
            print(f"\nSaved: {output_file}")
    else:
        print("Usage: python evaluate_detection.py --image F02a")


if __name__ == "__main__":
    main()