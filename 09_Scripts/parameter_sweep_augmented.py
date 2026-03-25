"""
Phase D -- Parameter Sweep on Augmented Dataset
Tests multiple CS-TRD parameter presets on a representative subset.

Usage:
    python 09_Scripts/parameter_sweep_augmented.py
    python 09_Scripts/parameter_sweep_augmented.py --full
"""

import sys
import csv
import json
import time
from pathlib import Path

PROJECT_ROOT = Path(r"C:\Users\prana\OneDrive\Desktop\TreeTrace")
sys.path.insert(0, str(PROJECT_ROOT / "09_Scripts"))

from augmented_utils import (
    load_original_pith_csv, get_augmented_pith, parse_augmented_filename,
    get_aug_category, list_augmented_images, PARAM_SWEEP_DIR, AUGMENTED_DIR
)
from cstrd_wrapper import run_cstrd

# Parameter presets to test
PRESETS = {
    "A_default": {"sigma": 3, "th_low": 3, "th_high": 15, "alpha": 30, "nr": 360, "min_chain_length": 2},
    "B_strong_edge": {"sigma": 3, "th_low": 5, "th_high": 20, "alpha": 30, "nr": 360, "min_chain_length": 2},
    "C_more_smooth": {"sigma": 5, "th_low": 3, "th_high": 15, "alpha": 30, "nr": 360, "min_chain_length": 2},
    "D_strict_chain": {"sigma": 3, "th_low": 3, "th_high": 15, "alpha": 30, "nr": 360, "min_chain_length": 3},
    "E_dense_rays": {"sigma": 3, "th_low": 3, "th_high": 15, "alpha": 30, "nr": 720, "min_chain_length": 2},
    "F_balanced": {"sigma": 4, "th_low": 4, "th_high": 18, "alpha": 35, "nr": 360, "min_chain_length": 2},
}


def select_representative_subset(images: list, per_type: int = 5) -> list:
    """Select a representative subset: N images per augmentation type."""
    from collections import defaultdict
    by_type = defaultdict(list)
    for img in images:
        _, aug_type, _ = parse_augmented_filename(img.stem)
        by_type[aug_type].append(img)

    subset = []
    for aug_type, imgs in sorted(by_type.items()):
        subset.extend(imgs[:per_type])
    return subset


def run_sweep(full: bool = False):
    """Run parameter sweep across presets."""
    PARAM_SWEEP_DIR.mkdir(parents=True, exist_ok=True)
    pith_data = load_original_pith_csv()

    all_images = list_augmented_images()
    if full:
        images = all_images
        print(f"  Full sweep: {len(images)} images x {len(PRESETS)} presets")
    else:
        images = select_representative_subset(all_images, per_type=5)
        print(f"  Subset sweep: {len(images)} images x {len(PRESETS)} presets")

    results = []

    for preset_name, params in PRESETS.items():
        print(f"\n  --- Preset {preset_name}: {params} ---")
        preset_dir = PARAM_SWEEP_DIR / preset_name
        preset_dir.mkdir(parents=True, exist_ok=True)

        success = 0
        total_rings = 0
        total_time = 0
        ring_counts = []

        for idx, img_path in enumerate(images, 1):
            stem = img_path.stem
            pith = get_augmented_pith(stem, pith_data)
            if pith is None:
                continue

            cx, cy = pith
            img_out = preset_dir / stem
            img_out.mkdir(parents=True, exist_ok=True)

            t0 = time.time()
            try:
                det = run_cstrd(str(img_path), cx, cy, str(img_out), params=params)
                dt = time.time() - t0
                total_time += dt

                rc = len(det.get("shapes", [])) if det else 0
                ring_counts.append(rc)
                if rc > 0:
                    success += 1
                    total_rings += rc

                if idx % 20 == 0 or idx == len(images):
                    print(f"    [{idx}/{len(images)}] success={success}/{idx}")
            except Exception:
                dt = time.time() - t0
                total_time += dt
                ring_counts.append(0)

        n = len(images)
        avg_rings = total_rings / n if n > 0 else 0
        success_rate = success / n if n > 0 else 0

        results.append({
            "preset": preset_name,
            "params": json.dumps(params),
            "images_tested": n,
            "success_count": success,
            "success_rate": round(success_rate, 4),
            "total_rings": total_rings,
            "avg_rings": round(avg_rings, 2),
            "total_time_s": round(total_time, 1),
            "avg_time_s": round(total_time / n, 2) if n > 0 else 0,
        })

    # Save results
    csv_path = PARAM_SWEEP_DIR / "parameter_sweep_results.csv"
    with open(csv_path, "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=results[0].keys())
        writer.writeheader()
        writer.writerows(results)

    json_path = PARAM_SWEEP_DIR / "parameter_sweep_results.json"
    with open(json_path, "w") as f:
        json.dump(results, f, indent=2)

    # Rank by success rate
    ranked = sorted(results, key=lambda r: r["success_rate"], reverse=True)

    print("\n" + "=" * 65)
    print("  PARAMETER SWEEP RESULTS (ranked by success rate)")
    print(f"  {'Preset':<18s} {'Success%':>10s} {'Avg Rings':>10s} {'Avg Time':>10s}")
    print(f"  {'-'*18} {'-'*10} {'-'*10} {'-'*10}")
    for r in ranked:
        print(f"  {r['preset']:<18s} {r['success_rate']*100:>9.1f}% "
              f"{r['avg_rings']:>10.2f} {r['avg_time_s']:>9.2f}s")

    print(f"\n  BEST preset: {ranked[0]['preset']}")
    print(f"  Output: {csv_path}")
    print("=" * 65)


def main():
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--full", action="store_true", help="Run on full dataset")
    args = parser.parse_args()

    print("=" * 65)
    print("  Phase D -- Parameter Sweep on Augmented Dataset")
    print("=" * 65)
    print()
    run_sweep(full=args.full)


if __name__ == "__main__":
    main()
