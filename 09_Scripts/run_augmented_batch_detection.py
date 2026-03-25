"""
Phase A -- Batch Detection on Augmented Dataset
Runs CS-TRD on every augmented image and logs results.

Usage:
    python 09_Scripts/run_augmented_batch_detection.py
    python 09_Scripts/run_augmented_batch_detection.py --limit 10
"""

import sys
import json
import csv
import time
import shutil
from pathlib import Path

# Add project paths
PROJECT_ROOT = Path(r"C:\Users\prana\OneDrive\Desktop\TreeTrace")
sys.path.insert(0, str(PROJECT_ROOT / "09_Scripts"))

from augmented_utils import (
    load_original_pith_csv, get_augmented_pith, parse_augmented_filename,
    get_aug_category, list_augmented_images, CSTRD_RESULTS_AUG, AUGMENTED_DIR
)
from cstrd_wrapper import run_cstrd


def run_batch_detection(limit: int = None, save_imgs: bool = False,
                        params: dict = None, output_dir: Path = None):
    """
    Run CS-TRD detection on all augmented images.

    Args:
        limit: Max images to process (None = all)
        save_imgs: Save overlay images
        params: Override CS-TRD params (None = defaults)
        output_dir: Override output directory
    Returns:
        list of result dicts
    """
    if output_dir is None:
        output_dir = CSTRD_RESULTS_AUG
    output_dir.mkdir(parents=True, exist_ok=True)

    pith_data = load_original_pith_csv()
    images = list_augmented_images()

    if limit:
        images = images[:limit]

    print(f"  Batch detection: {len(images)} images")
    print(f"  Output: {output_dir}")
    if params:
        print(f"  Params override: {params}")
    print()

    results = []
    total_start = time.time()

    for idx, img_path in enumerate(images, 1):
        stem = img_path.stem
        orig, aug_type, aug_param = parse_augmented_filename(stem)
        category = get_aug_category(aug_type)

        pith = get_augmented_pith(stem, pith_data)
        if pith is None:
            print(f"  [{idx:4d}/{len(images)}] {stem} -- SKIP (no pith)")
            results.append({
                "image_name": stem,
                "original_image": orig,
                "augmentation_type": aug_type,
                "augmentation_category": category,
                "status": "skipped_no_pith",
                "processing_time": 0,
                "ring_count": 0,
                "output_path": "",
            })
            continue

        cx, cy = pith
        img_out_dir = output_dir / stem
        img_out_dir.mkdir(parents=True, exist_ok=True)

        t0 = time.time()
        try:
            detection = run_cstrd(
                img_path, cx, cy, img_out_dir,
                save_imgs=save_imgs, params=params
            )
            dt = time.time() - t0

            ring_count = 0
            status = "failed"
            if detection and detection.get("shapes"):
                ring_count = len(detection["shapes"])
                status = "success"

                # Save detection as named JSON (not just labelme.json)
                det_path = img_out_dir / f"{stem}.json"
                with open(det_path, "w") as f:
                    json.dump(detection, f)

            print(f"  [{idx:4d}/{len(images)}] {stem:40s} "
                  f"{status:8s} {ring_count:3d} rings  {dt:.1f}s")

        except Exception as e:
            dt = time.time() - t0
            status = "error"
            ring_count = 0
            print(f"  [{idx:4d}/{len(images)}] {stem:40s} ERROR: {e}")

        results.append({
            "image_name": stem,
            "original_image": orig,
            "augmentation_type": aug_type,
            "augmentation_category": category,
            "status": status,
            "processing_time": round(dt, 2),
            "ring_count": ring_count,
            "output_path": str(img_out_dir),
        })

    elapsed = time.time() - total_start

    # Save detection log
    log_path = output_dir / "detection_log.csv"
    with open(log_path, "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=results[0].keys())
        writer.writeheader()
        writer.writerows(results)

    log_json = output_dir / "detection_log.json"
    with open(log_json, "w") as f:
        json.dump(results, f, indent=2)

    # Summary
    success = sum(1 for r in results if r["status"] == "success")
    failed = sum(1 for r in results if r["status"] == "failed")
    errors = sum(1 for r in results if r["status"] == "error")
    skipped = sum(1 for r in results if r["status"].startswith("skip"))

    print()
    print("=" * 65)
    print(f"  BATCH DETECTION COMPLETE")
    print(f"  Total:     {len(results)}")
    print(f"  Success:   {success}")
    print(f"  Failed:    {failed} (0 rings detected)")
    print(f"  Errors:    {errors}")
    print(f"  Skipped:   {skipped}")
    print(f"  Time:      {elapsed:.0f}s ({elapsed/60:.1f}m)")
    print(f"  Log:       {log_path}")
    print("=" * 65)

    return results


def main():
    import argparse
    parser = argparse.ArgumentParser(description="Batch detection on augmented dataset")
    parser.add_argument("--limit", type=int, default=None,
                        help="Max images to process")
    parser.add_argument("--save-imgs", action="store_true",
                        help="Save overlay images")
    args = parser.parse_args()

    print("=" * 65)
    print("  Phase A -- Augmented Batch Detection")
    print("=" * 65)
    print()

    run_batch_detection(limit=args.limit, save_imgs=args.save_imgs)


if __name__ == "__main__":
    main()
