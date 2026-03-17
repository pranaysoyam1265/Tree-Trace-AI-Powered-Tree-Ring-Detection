"""
CS-TRD Parameter Tuning for Difficult Images
Tests different parameter combinations to find best settings.
"""

import subprocess
import sys
import json
from pathlib import Path

PROJECT_ROOT = Path(r"C:\Users\prana\OneDrive\Desktop\TreeTrace")
CSTRD_ROOT = Path(r"C:\Users\prana\OneDrive\Desktop\cstrd_ipol")
INPUT_DIR = PROJECT_ROOT / "01_Raw_Data" / "URuDendro" / "images"
OUTPUT_DIR = PROJECT_ROOT / "07_Outputs" / "tuning_results"

# Parameter combinations to try
PARAM_SETS = [
    {"name": "default", "th_low": 5, "th_high": 20, "sigma": 3},
    {"name": "sensitive", "th_low": 3, "th_high": 10, "sigma": 3},
    {"name": "very_sensitive", "th_low": 2, "th_high": 8, "sigma": 2},
    {"name": "smooth", "th_low": 5, "th_high": 20, "sigma": 5},
    {"name": "sharp", "th_low": 3, "th_high": 15, "sigma": 2},
]

def run_with_params(image_name, cx, cy, params):
    """Run CS-TRD with specific parameters."""
    output_dir = OUTPUT_DIR / image_name / params['name']
    output_dir.mkdir(parents=True, exist_ok=True)
    
    cmd = [
        sys.executable,
        str(CSTRD_ROOT / "main.py"),
        "--input", str(INPUT_DIR / f"{image_name}.png"),
        "--cx", str(cx),
        "--cy", str(cy),
        "--output_dir", str(output_dir),
        "--root", str(CSTRD_ROOT),
        "--th_low", str(params['th_low']),
        "--th_high", str(params['th_high']),
        "--sigma", str(params['sigma']),
    ]
    
    result = subprocess.run(cmd, cwd=str(CSTRD_ROOT), capture_output=True, text=True)
    
    # Count detected rings
    json_path = output_dir / "labelme.json"
    if json_path.exists():
        with open(json_path) as f:
            data = json.load(f)
        return len(data.get('shapes', []))
    return 0


def tune_image(image_name, cx, cy):
    """Test all parameter sets on an image."""
    print(f"\n{'='*50}")
    print(f"Tuning {image_name} (pith: {cx}, {cy})")
    print(f"{'='*50}")
    
    results = []
    
    for params in PARAM_SETS:
        ring_count = run_with_params(image_name, cx, cy, params)
        results.append({
            'params': params['name'],
            'rings': ring_count,
            'th_low': params['th_low'],
            'th_high': params['th_high'],
            'sigma': params['sigma']
        })
        print(f"  {params['name']:20s}: {ring_count} rings")
    
    # Find best
    best = max(results, key=lambda x: x['rings'])
    print(f"\n  Best: {best['params']} ({best['rings']} rings)")
    
    return results


def main():
    import csv
    
    # Pith coordinates for failing images
    failing_images = {
        "F02e": (1038, 1069),
        "F04a": (1276, 1206),
        "F04b": (1034, 878),
        "F04e": (382, 425),
        "F07b": (954, 971),
        "F07c": (1313, 1116),
        "F07e": (984, 977),
        "F09e": (965, 1075),
        "F10b": (967, 933),
    }
    
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    
    all_results = []
    
    for image_name, (cx, cy) in failing_images.items():
        # Check image exists
        img_path = INPUT_DIR / f"{image_name}.png"
        if not img_path.exists():
            img_path = INPUT_DIR / f"{image_name}.jpg"
        if not img_path.exists():
            print(f"Skipping {image_name} - image not found")
            continue
        
        results = tune_image(image_name, cx, cy)
        for r in results:
            r['image'] = image_name
            all_results.append(r)
    
    # Save results
    csv_path = OUTPUT_DIR / "tuning_results.csv"
    with open(csv_path, 'w', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=['image', 'params', 'rings', 'th_low', 'th_high', 'sigma'])
        writer.writeheader()
        writer.writerows(all_results)
    
    print(f"\n{'='*50}")
    print(f"Results saved to: {csv_path}")
    print(f"{'='*50}")
    
    # Summary
    print("\nBest parameters per image:")
    for image_name in failing_images.keys():
        image_results = [r for r in all_results if r['image'] == image_name]
        if image_results:
            best = max(image_results, key=lambda x: x['rings'])
            print(f"  {image_name}: {best['params']} ({best['rings']} rings)")


if __name__ == "__main__":
    main()