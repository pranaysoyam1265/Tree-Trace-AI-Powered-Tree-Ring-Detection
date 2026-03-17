"""
TreeTrace CS-TRD Wrapper - Optimized Parameters
"""

import os
import sys
import json
import csv
import shutil
import subprocess
from pathlib import Path
from datetime import datetime
import cv2

PROJECT_ROOT = Path(r"C:\Users\prana\OneDrive\Desktop\TreeTrace")
CSTRD_ROOT = Path(r"C:\Users\prana\OneDrive\Desktop\cstrd_ipol")

INPUT_DIR = PROJECT_ROOT / "01_Raw_Data" / "URuDendro" / "images"
PITH_CSV = PROJECT_ROOT / "01_Raw_Data" / "URuDendro" / "pith_location.csv"
OUTPUT_DIR = PROJECT_ROOT / "07_Outputs" / "cstrd_results"


def load_pith_coordinates(csv_path):
    pith_coords = {}
    with open(csv_path, 'r') as f:
        reader = csv.DictReader(f)
        for row in reader:
            image_name = row['Image'].strip()
            cy = int(row['cy'])
            cx = int(row['cx'])
            pith_coords[image_name] = (cx, cy)
    return pith_coords


def get_image_size(image_path):
    """Get image dimensions."""
    img = cv2.imread(str(image_path))
    if img is not None:
        h, w = img.shape[:2]
        return w, h
    return None, None


def run_cstrd(image_path, cx, cy, output_dir, save_imgs=False):
    """
    Run CS-TRD with optimized parameters.
    Key improvements:
    - Pass actual image dimensions (hsize/wsize) to prevent internal resizing
    - Use optimized thresholds (th_low=3, th_high=15)
    """
    output_dir = Path(output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    # Get actual image dimensions
    img_w, img_h = get_image_size(image_path)
    if img_w is None:
        print(f"  ERROR: Could not read image: {image_path}")
        return None

    # Build command with optimized parameters
    cmd = [
        sys.executable,
        str(CSTRD_ROOT / "main.py"),
        "--input", str(image_path),
        "--cx", str(cx),
        "--cy", str(cy),
        "--output_dir", str(output_dir),
        "--root", str(CSTRD_ROOT),
        # Optimized parameters
        "--hsize", str(img_h),     # Full resolution height
        "--wsize", str(img_w),     # Full resolution width
        "--th_low", "3",           # Lower threshold (more sensitive)
        "--th_high", "15",         # Upper threshold (more sensitive)
        "--sigma", "3",            # Keep default sigma
        "--alpha", "30",           # Keep default alpha
        "--nr", "360",             # Keep default rays
        "--min_chain_length", "2", # Keep default chain length
    ]

    if save_imgs:
        cmd.extend(["--save_imgs", "1"])

    print(f"  Running CS-TRD (optimized: fullres={img_w}x{img_h}, th=3/15)...")
    result = subprocess.run(cmd, cwd=str(CSTRD_ROOT), capture_output=True, text=True)

    if result.returncode != 0 and result.stderr:
        # Try with default parameters as fallback
        print(f"  Optimized params failed, trying default...")
        cmd_default = [
            sys.executable,
            str(CSTRD_ROOT / "main.py"),
            "--input", str(image_path),
            "--cx", str(cx),
            "--cy", str(cy),
            "--output_dir", str(output_dir),
            "--root", str(CSTRD_ROOT),
        ]
        if save_imgs:
            cmd_default.extend(["--save_imgs", "1"])
        
        subprocess.run(cmd_default, cwd=str(CSTRD_ROOT), capture_output=True, text=True)

    json_path = output_dir / "labelme.json"
    if json_path.exists():
        with open(json_path) as f:
            data = json.load(f)
        return data
    return None


def count_rings(json_path):
    with open(json_path, 'r') as f:
        data = json.load(f)
    return len(data.get('shapes', []))


def process_single_image(image_name, pith_coords, save_imgs=False):
    if image_name not in pith_coords:
        print(f"  ERROR: No pith coordinates for {image_name}")
        return None

    cx, cy = pith_coords[image_name]

    image_path = None
    for ext in ['.png', '.jpg', '.jpeg', '.PNG', '.JPG']:
        candidate = INPUT_DIR / f"{image_name}{ext}"
        if candidate.exists():
            image_path = candidate
            break

    if image_path is None:
        print(f"  ERROR: Image not found for {image_name}")
        return None

    print(f"\nProcessing {image_name}")
    print(f"  Image: {image_path}")
    print(f"  Pith: cx={cx}, cy={cy}")

    img_output_dir = OUTPUT_DIR / image_name

    detection = run_cstrd(image_path, cx, cy, img_output_dir, save_imgs)

    if detection is None:
        print(f"  ERROR: Detection failed")
        return None

    ring_count = len(detection.get('shapes', []))
    print(f"  Detected: {ring_count} rings")

    # Copy JSON with standardized name
    output_json = OUTPUT_DIR / f"{image_name}.json"
    src_json = img_output_dir / "labelme.json"
    if src_json.exists():
        shutil.copy(src_json, output_json)

    return {
        'image': image_name,
        'cx': cx,
        'cy': cy,
        'json_path': str(output_json),
        'ring_count': ring_count
    }


def main():
    import argparse

    parser = argparse.ArgumentParser(description="TreeTrace CS-TRD Wrapper (Optimized)")
    parser.add_argument("--image", type=str, help="Single image name (e.g., F02a)")
    parser.add_argument("--all", action="store_true", help="Process all images")
    parser.add_argument("--save_imgs", action="store_true", help="Save intermediate images")

    args = parser.parse_args()

    pith_coords = load_pith_coordinates(PITH_CSV)
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    if args.image:
        result = process_single_image(args.image, pith_coords, args.save_imgs)
        if result:
            print(f"\nResult: {result['ring_count']} rings detected")
    elif args.all:
        results = []
        for name in pith_coords:
            r = process_single_image(name, pith_coords, args.save_imgs)
            if r:
                results.append(r)
        print(f"\nProcessed {len(results)} images")
    else:
        print("Usage:")
        print("  python cstrd_wrapper.py --image F02a")
        print("  python cstrd_wrapper.py --all")


if __name__ == "__main__":
    main()