"""
Phase H -- Prepare Training Manifests for Future ML
Splits augmented dataset into train/val/test with no image leakage.

Usage:
    python 09_Scripts/prepare_augmented_training_manifest.py
"""

import sys
import csv
import json
import random
from pathlib import Path
from collections import defaultdict

PROJECT_ROOT = Path(r"C:\Users\prana\OneDrive\Desktop\TreeTrace")
sys.path.insert(0, str(PROJECT_ROOT / "09_Scripts"))

from augmented_utils import (
    load_original_pith_csv, get_augmented_pith, parse_augmented_filename,
    get_aug_category, list_augmented_images, MANIFESTS_DIR, AUGMENTED_DIR
)


def main():
    print("=" * 65)
    print("  Phase H -- Training Manifest Preparation")
    print("=" * 65)
    print()

    MANIFESTS_DIR.mkdir(parents=True, exist_ok=True)
    pith_data = load_original_pith_csv()
    images = list_augmented_images()

    # Group by ORIGINAL image to prevent leakage
    by_original = defaultdict(list)
    for img in images:
        orig, aug_type, aug_param = parse_augmented_filename(img.stem)
        by_original[orig].append(img)

    originals = sorted(by_original.keys())
    print(f"  {len(originals)} original images, {len(images)} total augmented")

    # Split originals: 70% train, 15% val, 15% test
    random.seed(42)
    random.shuffle(originals)

    n = len(originals)
    n_train = int(n * 0.70)
    n_val = int(n * 0.15)

    train_originals = originals[:n_train]
    val_originals = originals[n_train:n_train + n_val]
    test_originals = originals[n_train + n_val:]

    print(f"  Train originals: {len(train_originals)}")
    print(f"  Val originals:   {len(val_originals)}")
    print(f"  Test originals:  {len(test_originals)}")

    splits = {
        "train": train_originals,
        "val": val_originals,
        "test": test_originals,
    }

    for split_name, split_originals in splits.items():
        rows = []
        for orig in split_originals:
            for img_path in by_original[orig]:
                stem = img_path.stem
                _, aug_type, aug_param = parse_augmented_filename(stem)
                category = get_aug_category(aug_type)
                pith = get_augmented_pith(stem, pith_data)
                cx, cy = pith if pith else (0, 0)

                annot_path = AUGMENTED_DIR / f"{stem}.json"

                rows.append({
                    "image_path": str(img_path),
                    "annotation_path": str(annot_path),
                    "original_image": orig,
                    "augmentation_type": aug_type,
                    "augmentation_category": category,
                    "pith_cx": cx,
                    "pith_cy": cy,
                })

        csv_path = MANIFESTS_DIR / f"{split_name}_manifest.csv"
        with open(csv_path, "w", newline="") as f:
            writer = csv.DictWriter(f, fieldnames=rows[0].keys())
            writer.writeheader()
            writer.writerows(rows)

        print(f"  {split_name}: {len(rows)} images -> {csv_path.name}")

    # Also save split info
    split_info = {
        "train_originals": train_originals,
        "val_originals": val_originals,
        "test_originals": test_originals,
        "train_count": sum(len(by_original[o]) for o in train_originals),
        "val_count": sum(len(by_original[o]) for o in val_originals),
        "test_count": sum(len(by_original[o]) for o in test_originals),
    }
    with open(MANIFESTS_DIR / "split_info.json", "w") as f:
        json.dump(split_info, f, indent=2)

    print(f"\n  Total train: {split_info['train_count']}")
    print(f"  Total val:   {split_info['val_count']}")
    print(f"  Total test:  {split_info['test_count']}")
    print(f"\n  Output: {MANIFESTS_DIR}")
    print("=" * 65)


if __name__ == "__main__":
    main()
