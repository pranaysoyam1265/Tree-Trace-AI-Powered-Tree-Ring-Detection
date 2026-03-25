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
import numpy as np

PROJECT_ROOT = Path(r"C:\Users\prana\OneDrive\Desktop\TreeTrace")
CSTRD_ROOT = Path(r"C:\Users\prana\OneDrive\Desktop\cstrd_ipol")

# Max image dimension to send to CS-TRD.
# Larger images are downscaled first to speed up detection significantly.
# At 2300px a run takes ~95s. At 1200px it takes ~15-20s.
MAX_PROCESSING_SIZE = 1200

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


def downscale_image_for_processing(image_path: Path, output_dir: Path, max_size: int = MAX_PROCESSING_SIZE):
    """
    Downscale an image so its longest dimension is at most `max_size` pixels.
    If the image is already small enough, returns the original path with scale=1.0.
    Returns (processed_path, scale_factor)
    """
    img = cv2.imread(str(image_path))
    if img is None:
        return image_path, 1.0

    h, w = img.shape[:2]
    longest = max(h, w)
    if longest <= max_size:
        # No scaling needed
        return image_path, 1.0

    scale = max_size / longest
    new_w = int(w * scale)
    new_h = int(h * scale)
    resized = cv2.resize(img, (new_w, new_h), interpolation=cv2.INTER_AREA)

    # Save resized image to a temp file next to the original
    resized_path = output_dir / f"_resized{image_path.suffix or '.png'}"
    cv2.imwrite(str(resized_path), resized)
    print(f"  Downscaled image: {w}x{h} -> {new_w}x{new_h} (scale={scale:.3f})")
    return resized_path, scale


def compute_adaptive_thresholds(image_path: Path) -> dict:
    """Compute adaptive Canny thresholds based on Otsu's method and image Laplacian variance."""
    img = cv2.imread(str(image_path), cv2.IMREAD_GRAYSCALE)
    if img is None:
        return {"th_low": 3, "th_high": 15, "sigma": 3}
    otsu_thresh, _ = cv2.threshold(img, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    th_high = max(5, min(30, otsu_thresh * 0.15))
    th_low = max(2, th_high * 0.3)
    
    var = cv2.Laplacian(img, cv2.CV_64F).var()
    sigma = 4.0 if var > 500 else 3.0 if var > 100 else 2.0
    return {"th_low": int(round(th_low)), "th_high": int(round(th_high)), "sigma": int(round(sigma))}

def apply_clahe_preprocessing(image_path: Path, output_path: Path) -> Path:
    """Apply CLAHE contrast enhancement and bilateral denoising as a fallback."""
    img = cv2.imread(str(image_path))
    if img is None: return image_path
    lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB)
    l, a, b = cv2.split(lab)
    clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8))
    l = clahe.apply(l)
    lab = cv2.merge([l, a, b])
    img = cv2.cvtColor(lab, cv2.COLOR_LAB2BGR)
    img = cv2.bilateralFilter(img, 9, 75, 75)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    mean_b = np.mean(gray)
    if mean_b < 100:
        factor = 120 / mean_b if mean_b > 0 else 1.0
        img = cv2.convertScaleAbs(img, alpha=min(factor, 1.8), beta=0)
    cv2.imwrite(str(output_path), img, [cv2.IMWRITE_JPEG_QUALITY, 95])
    return output_path

def run_cstrd(image_path, cx, cy, output_dir, save_imgs=False, params=None, mode='adaptive'):
    """
    Run CS-TRD with configurable parameters and operating modes.
    Modes:
      'baseline'       : Fixed defaults
      'adaptive'       : Automatically calculates Otsu thresholds
      'adaptive_clahe' : Preprocesses image with CLAHE and then uses adaptive thresholds
    """
    output_dir = Path(output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    # Use override params or defaults
    p = {
        "sigma": 3,
        "th_low": 3,
        "th_high": 15,
        "alpha": 30,
        "nr": 360,
        "min_chain_length": 2,
    }
    if params:
        p.update({k: v for k, v in params.items() if v is not None})

    # Downscale large images for faster processing
    proc_path, scale = downscale_image_for_processing(image_path, output_dir)
    
    # ----------------------------------------------------
    # MODE LOGIC (Baseline, Adaptive, Adaptive + CLAHE)
    # ----------------------------------------------------
    if mode == 'adaptive_clahe':
        clahe_path = output_dir / f"_clahe{Path(proc_path).suffix}"
        proc_path = apply_clahe_preprocessing(proc_path, clahe_path)
        
    if mode in ['adaptive', 'adaptive_clahe']:
        adapt_params = compute_adaptive_thresholds(proc_path)
        p.update(adapt_params)
        print(f"  [MODE: {mode}] Adaptive params used -> th_low: {p['th_low']}, th_high: {p['th_high']}, sigma: {p['sigma']}")
    else:
        print(f"  [MODE: {mode}] Using baseline/fixed params.")

    scaled_cx = int(round(cx * scale))
    scaled_cy = int(round(cy * scale))

    # Get dimensions of the (possibly downscaled) image
    img_w, img_h = get_image_size(proc_path)
    if img_w is None:
        print(f"  ERROR: Could not read image: {proc_path}")
        return None

    # Build command with parameters
    cmd = [
        sys.executable,
        str(CSTRD_ROOT / "main.py"),
        "--input", str(proc_path),
        "--cx", str(scaled_cx),
        "--cy", str(scaled_cy),
        "--output_dir", str(output_dir),
        "--root", str(CSTRD_ROOT),
        "--hsize", str(img_h),
        "--wsize", str(img_w),
        "--th_low", str(p["th_low"]),
        "--th_high", str(p["th_high"]),
        "--sigma", str(p["sigma"]),
        "--alpha", str(p["alpha"]),
        "--nr", str(p["nr"]),
        "--min_chain_length", str(p["min_chain_length"]),
    ]

    if save_imgs:
        cmd.extend(["--save_imgs", "1"])

    print(f"  Running CS-TRD (optimized: {img_w}x{img_h}, th=3/15)...")
    result = subprocess.run(cmd, cwd=str(CSTRD_ROOT), capture_output=True, text=True)

    if result.stderr:
        print(f"  CS-TRD stderr: {result.stderr[:500]}")

    json_path = output_dir / "labelme.json"
    has_shapes = False
    if json_path.exists():
        with open(json_path) as f:
            data = json.load(f)
        has_shapes = len(data.get('shapes', [])) > 0

    if (result.returncode != 0 or not has_shapes):
        # Fallback 1: default parameters
        print(f"  Optimized params {'failed' if result.returncode != 0 else 'found 0 rings'}, trying default...")
        cmd_default = [
            sys.executable,
            str(CSTRD_ROOT / "main.py"),
            "--input", str(proc_path),
            "--cx", str(scaled_cx),
            "--cy", str(scaled_cy),
            "--output_dir", str(output_dir),
            "--root", str(CSTRD_ROOT),
        ]
        if save_imgs:
            cmd_default.extend(["--save_imgs", "1"])
        result2 = subprocess.run(cmd_default, cwd=str(CSTRD_ROOT), capture_output=True, text=True)
        if result2.stderr:
            print(f"  CS-TRD default stderr: {result2.stderr[:500]}")

        # Check again
        if json_path.exists():
            with open(json_path) as f:
                data = json.load(f)
            has_shapes = len(data.get('shapes', [])) > 0

    if not has_shapes:
        # Fallback 2: relaxed thresholds for challenging images
        print(f"  Default params also found 0 rings, trying relaxed thresholds (th=2/10)...")
        try:
            cmd_relaxed = [
                sys.executable,
                str(CSTRD_ROOT / "main.py"),
                "--input", str(proc_path),
                "--cx", str(scaled_cx),
                "--cy", str(scaled_cy),
                "--output_dir", str(output_dir),
                "--root", str(CSTRD_ROOT),
                "--hsize", str(img_h),
                "--wsize", str(img_w),
                "--th_low", "2",
                "--th_high", "10",
                "--sigma", "4",
                "--nr", "360",
            ]
            if save_imgs:
                cmd_relaxed.extend(["--save_imgs", "1"])
            result3 = subprocess.run(cmd_relaxed, cwd=str(CSTRD_ROOT), capture_output=True, text=True)
            if result3.stderr:
                print(f"  CS-TRD relaxed stderr: {result3.stderr[:500]}")

            # Re-read json after relaxed run
            if json_path.exists():
                with open(json_path) as f:
                    data = json.load(f)
                has_shapes = len(data.get('shapes', [])) > 0
                if has_shapes:
                    print(f"  Relaxed params found {len(data.get('shapes', []))} rings!")
        except Exception as e:
            print(f"  CS-TRD relaxed fallback error: {e}")

    # Clean up temp resized file
    if proc_path != Path(image_path) and proc_path.exists():
        try:
            proc_path.unlink()
        except Exception:
            pass

    if json_path.exists():
        with open(json_path) as f:
            data = json.load(f)

        # Upscale ring polygon coordinates back to original resolution
        if scale != 1.0:
            data = _upscale_labelme_coords(data, scale)
            with open(json_path, 'w') as f:
                json.dump(data, f)

        return data
    return None


def _upscale_labelme_coords(labelme_data: dict, scale: float) -> dict:
    """Scale polygon coordinates back from downscaled to original resolution."""
    inv = 1.0 / scale
    for shape in labelme_data.get('shapes', []):
        shape['points'] = [[x * inv, y * inv] for x, y in shape['points']]
    if labelme_data.get('imageWidth') and labelme_data['imageWidth'] > 0:
        labelme_data['imageWidth'] = int(labelme_data['imageWidth'] * inv)
    if labelme_data.get('imageHeight') and labelme_data['imageHeight'] > 0:
        labelme_data['imageHeight'] = int(labelme_data['imageHeight'] * inv)
    return labelme_data


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