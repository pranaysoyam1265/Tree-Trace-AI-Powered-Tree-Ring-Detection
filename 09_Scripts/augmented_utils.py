"""
Augmented Dataset Utilities
Shared helpers for pith coordinate transformation, filename parsing,
and path constants used by all pipeline scripts.
"""

import csv
import re
import math
import json
import numpy as np
from pathlib import Path

# ---- PATHS ----
PROJECT_ROOT = Path(r"C:\Users\prana\OneDrive\Desktop\TreeTrace")
IMAGES_DIR = PROJECT_ROOT / "01_Raw_Data" / "URuDendro" / "images"
AUGMENTED_DIR = PROJECT_ROOT / "01_Raw_Data" / "augmented_dataset"
PITH_CSV = PROJECT_ROOT / "01_Raw_Data" / "URuDendro" / "pith_location.csv"
CSTRD_RESULTS_AUG = PROJECT_ROOT / "07_Outputs" / "cstrd_results_augmented"
EVAL_RESULTS_AUG = PROJECT_ROOT / "07_Outputs" / "evaluation_results_augmented"
ANALYSIS_CHARTS = PROJECT_ROOT / "07_Outputs" / "analysis_charts"
PARAM_SWEEP_DIR = PROJECT_ROOT / "07_Outputs" / "parameter_sweep"
PREPROC_TEST_DIR = PROJECT_ROOT / "07_Outputs" / "preprocessing_tests"
ADAPTIVE_TEST_DIR = PROJECT_ROOT / "07_Outputs" / "adaptive_threshold_tests"
REPORT_METRICS_DIR = PROJECT_ROOT / "07_Outputs" / "report_metrics"
MANIFESTS_DIR = PROJECT_ROOT / "07_Outputs" / "manifests"
GT_ANNOT_DIR = Path(r"C:\Users\prana\OneDrive\Desktop\uruDendro-main\annotations (1)")

# Original image size (URuDendro standard)
ORIG_IMG_SIZE = 2364


def load_original_pith_csv() -> dict:
    """Load pith_location.csv -> {image_name: (cx, cy)}."""
    pith = {}
    with open(PITH_CSV, "r") as f:
        reader = csv.DictReader(f)
        for row in reader:
            name = row["Image"].strip()
            cy = int(row["cy"].strip())
            cx = int(row["cx"].strip())
            pith[name] = (cx, cy)
    return pith


def parse_augmented_filename(filename: str) -> tuple:
    """
    Parse augmented filename into (original_name, aug_type, aug_param).

    Examples:
        F02a_original     -> ('F02a', 'original', None)
        F02a_rot90        -> ('F02a', 'rotation', 90)
        F02a_hflip        -> ('F02a', 'hflip', None)
        F02a_vflip        -> ('F02a', 'vflip', None)
        F02a_hvflip       -> ('F02a', 'hvflip', None)
        F02a_bright60     -> ('F02a', 'brightness', 60)
        F02a_contrast70   -> ('F02a', 'contrast', 70)
        F02a_noise10      -> ('F02a', 'noise', 10)
        F02a_blur7        -> ('F02a', 'blur', 7)
        F02a_colorshift0  -> ('F02a', 'colorshift', 0)
        F02a_stained1     -> ('F02a', 'staining', 1)
        F02a_cracked0     -> ('F02a', 'cracks', 0)
        F02a_lighting1    -> ('F02a', 'lighting', 1)
        F02a_crop85       -> ('F02a', 'crop', 85)
        F02a_combo3       -> ('F02a', 'combo', 3)
    """
    # Remove extension
    stem = Path(filename).stem

    # Known augmentation suffix patterns (order matters for matching)
    patterns = [
        (r'^(.+?)_rot(\d+)$', 'rotation'),
        (r'^(.+?)_hflip$', 'hflip'),
        (r'^(.+?)_vflip$', 'vflip'),
        (r'^(.+?)_hvflip$', 'hvflip'),
        (r'^(.+?)_bright(\d+)$', 'brightness'),
        (r'^(.+?)_contrast(\d+)$', 'contrast'),
        (r'^(.+?)_noise(\d+)$', 'noise'),
        (r'^(.+?)_blur(\d+)$', 'blur'),
        (r'^(.+?)_colorshift(\d+)$', 'colorshift'),
        (r'^(.+?)_stained(\d+)$', 'staining'),
        (r'^(.+?)_cracked(\d+)$', 'cracks'),
        (r'^(.+?)_lighting(\d+)$', 'lighting'),
        (r'^(.+?)_crop(\d+)$', 'crop'),
        (r'^(.+?)_combo(\d+)$', 'combo'),
        (r'^(.+?)_original$', 'original'),
    ]

    for pattern, aug_type in patterns:
        m = re.match(pattern, stem)
        if m:
            orig = m.group(1)
            param = int(m.group(2)) if m.lastindex >= 2 else None
            return (orig, aug_type, param)

    # Fallback: treat entire stem as original name with unknown aug
    return (stem, 'unknown', None)


def get_aug_category(aug_type: str) -> str:
    """Map detailed aug_type to a broader category for grouping."""
    category_map = {
        'original': 'original',
        'rotation': 'rotation',
        'hflip': 'flip',
        'vflip': 'flip',
        'hvflip': 'flip',
        'brightness': 'brightness',
        'contrast': 'contrast',
        'noise': 'noise',
        'blur': 'blur',
        'colorshift': 'colorshift',
        'staining': 'staining',
        'cracks': 'cracks',
        'lighting': 'lighting',
        'crop': 'crop',
        'combo': 'combo',
    }
    return category_map.get(aug_type, 'unknown')


def compute_augmented_pith(orig_cx: int, orig_cy: int,
                           aug_type: str, aug_param,
                           img_w: int = ORIG_IMG_SIZE,
                           img_h: int = ORIG_IMG_SIZE) -> tuple:
    """
    Compute the pith location for an augmented image based on the
    transformation applied to the original.

    For appearance-only augmentations, pith is unchanged.
    For geometric augmentations, pith is transformed.
    """
    cx, cy = float(orig_cx), float(orig_cy)

    if aug_type == 'original':
        return (int(cx), int(cy))

    # --- Appearance-only: pith unchanged ---
    if aug_type in ('brightness', 'contrast', 'noise', 'blur',
                    'colorshift', 'staining', 'cracks', 'lighting'):
        return (int(cx), int(cy))

    # --- Geometric: transform pith ---
    if aug_type == 'rotation':
        angle_deg = aug_param
        # Rotate around pith center -> pith stays at same location
        # because the augmentation script rotates around (cx, cy)
        return (int(cx), int(cy))

    if aug_type == 'hflip':
        return (int(img_w - cx), int(cy))

    if aug_type == 'vflip':
        return (int(cx), int(img_h - cy))

    if aug_type == 'hvflip':
        return (int(img_w - cx), int(img_h - cy))

    if aug_type == 'crop':
        # Crop centered on pith, resize back to original size
        crop_ratio = aug_param / 100.0  # e.g. 85 -> 0.85
        crop_size = int(min(img_h, img_w) * crop_ratio)
        half = crop_size // 2

        x1 = max(0, int(cx) - half)
        y1 = max(0, int(cy) - half)
        x2 = min(img_w, x1 + crop_size)
        y2 = min(img_h, y1 + crop_size)
        if x2 - x1 < crop_size:
            x1 = max(0, x2 - crop_size)
        if y2 - y1 < crop_size:
            y1 = max(0, y2 - crop_size)

        cw = x2 - x1
        ch = y2 - y1
        scale_x = img_w / cw
        scale_y = img_h / ch
        new_cx = (cx - x1) * scale_x
        new_cy = (cy - y1) * scale_y
        return (int(new_cx), int(new_cy))

    if aug_type == 'combo':
        # Combined augmentations include a random rotation around pith
        # -> pith stays in place (rotation is around pith)
        return (int(cx), int(cy))

    # Fallback: unchanged
    return (int(cx), int(cy))


def get_augmented_pith(filename: str, pith_cache: dict = None) -> tuple:
    """
    Get pith coordinates for any augmented image filename.
    Returns (cx, cy) or None if original not found.
    """
    if pith_cache is None:
        pith_cache = load_original_pith_csv()

    orig_name, aug_type, aug_param = parse_augmented_filename(filename)

    if orig_name not in pith_cache:
        return None

    orig_cx, orig_cy = pith_cache[orig_name]
    return compute_augmented_pith(orig_cx, orig_cy, aug_type, aug_param)


def list_augmented_images() -> list:
    """List all .jpg files in the augmented dataset directory."""
    return sorted(AUGMENTED_DIR.glob("*.jpg"))


def ensure_dirs():
    """Create all output directories."""
    for d in [CSTRD_RESULTS_AUG, EVAL_RESULTS_AUG, ANALYSIS_CHARTS,
              PARAM_SWEEP_DIR, PREPROC_TEST_DIR, ADAPTIVE_TEST_DIR,
              REPORT_METRICS_DIR, MANIFESTS_DIR]:
        d.mkdir(parents=True, exist_ok=True)
