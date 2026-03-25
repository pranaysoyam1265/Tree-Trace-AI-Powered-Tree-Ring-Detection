"""
=================================================================
TreeTrace -- Augmented Dataset Generator
=================================================================
Generates ~40 augmented versions of each URuDendro image (~2,560
total) with correctly transformed LabelMe JSON annotations.

Usage:
    cd C:/Users/prana/OneDrive/Desktop/TreeTrace
    python generate_augmented_dataset.py

Dependencies: cv2, numpy (no PIL, no albumentations)
=================================================================
"""

import cv2
import numpy as np
import json
import csv
import os
import random
import time
from pathlib import Path
from copy import deepcopy

# ─── PATHS ──────────────────────────────────────────────────────
PROJECT_ROOT   = Path(r"C:\Users\prana\OneDrive\Desktop\TreeTrace")
IMAGES_DIR     = PROJECT_ROOT / "01_Raw_Data" / "URuDendro" / "images"
ANNOT_DIR      = Path(r"C:\Users\prana\OneDrive\Desktop\uruDendro-main\annotations (1)")
PITH_CSV       = PROJECT_ROOT / "01_Raw_Data" / "URuDendro" / "pith_location.csv"
OUTPUT_DIR     = PROJECT_ROOT / "01_Raw_Data" / "augmented_dataset"
JPG_QUALITY    = 90

# Seed for reproducibility
random.seed(42)
np.random.seed(42)


# ═══════════════════════════════════════════════════════════════
#  HELPERS
# ═══════════════════════════════════════════════════════════════

def load_pith_csv(path: Path) -> dict:
    """Load pith_location.csv -> {image_name: (cx, cy)}."""
    pith = {}
    with open(path, "r") as f:
        reader = csv.DictReader(f)
        for row in reader:
            name = row["Image"].strip()
            cy = int(row["cy"].strip())
            cx = int(row["cx"].strip())
            pith[name] = (cx, cy)
    return pith


def load_annotation(annot_dir: Path, image_name: str) -> dict | None:
    """Load LabelMe JSON for a given image name (without extension)."""
    json_path = annot_dir / f"{image_name}.json"
    if not json_path.exists():
        return None
    with open(json_path, "r", encoding="utf-8") as f:
        return json.load(f)


def save_pair(img: np.ndarray, annotation: dict, output_dir: Path,
              base_name: str, suffix: str):
    """Save augmented image (JPG q90) and its annotation JSON."""
    filename = f"{base_name}_{suffix}"
    img_path = output_dir / f"{filename}.jpg"
    json_path = output_dir / f"{filename}.json"

    cv2.imwrite(str(img_path), img, [cv2.IMWRITE_JPEG_QUALITY, JPG_QUALITY])

    ann = deepcopy(annotation)
    ann["imagePath"] = f"{filename}.jpg"
    h, w = img.shape[:2]
    ann["imageHeight"] = h
    ann["imageWidth"] = w
    # Remove imageData if present (saves disk)
    ann.pop("imageData", None)

    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(ann, f)


def transform_points(points: list, matrix_2x3: np.ndarray) -> list:
    """Apply a 2x3 affine transform matrix to a list of [x,y] points."""
    pts = np.array(points, dtype=np.float64)  # (N, 2)
    ones = np.ones((pts.shape[0], 1), dtype=np.float64)
    pts_h = np.hstack([pts, ones])  # (N, 3)
    transformed = pts_h @ matrix_2x3.T  # (N, 2)
    return transformed.tolist()


def clone_annotation_with_transform(annotation: dict, matrix: np.ndarray) -> dict:
    """Deep-copy annotation and transform all polygon points by a 2x3 matrix."""
    ann = deepcopy(annotation)
    for shape in ann.get("shapes", []):
        shape["points"] = transform_points(shape["points"], matrix)
    return ann


def clone_annotation_unchanged(annotation: dict) -> dict:
    """Deep-copy annotation with no coordinate changes (appearance-only aug)."""
    return deepcopy(annotation)


# ═══════════════════════════════════════════════════════════════
#  GEOMETRIC AUGMENTATIONS (transform image + annotations)
# ═══════════════════════════════════════════════════════════════

def augment_rotation(img: np.ndarray, annotation: dict, angle: float,
                     cx: int, cy: int) -> tuple:
    """Rotate image around pith (cx,cy) by `angle` degrees."""
    h, w = img.shape[:2]
    M = cv2.getRotationMatrix2D((float(cx), float(cy)), angle, 1.0)
    rotated = cv2.warpAffine(img, M, (w, h), borderMode=cv2.BORDER_REFLECT)
    ann = clone_annotation_with_transform(annotation, M)
    return rotated, ann


def augment_hflip(img: np.ndarray, annotation: dict) -> tuple:
    """Horizontal flip."""
    h, w = img.shape[:2]
    flipped = cv2.flip(img, 1)
    ann = deepcopy(annotation)
    for shape in ann.get("shapes", []):
        shape["points"] = [[w - x, y] for x, y in shape["points"]]
    return flipped, ann


def augment_vflip(img: np.ndarray, annotation: dict) -> tuple:
    """Vertical flip."""
    h, w = img.shape[:2]
    flipped = cv2.flip(img, 0)
    ann = deepcopy(annotation)
    for shape in ann.get("shapes", []):
        shape["points"] = [[x, h - y] for x, y in shape["points"]]
    return flipped, ann


def augment_hvflip(img: np.ndarray, annotation: dict) -> tuple:
    """Both horizontal and vertical flip."""
    h, w = img.shape[:2]
    flipped = cv2.flip(img, -1)
    ann = deepcopy(annotation)
    for shape in ann.get("shapes", []):
        shape["points"] = [[w - x, h - y] for x, y in shape["points"]]
    return flipped, ann


def augment_center_crop(img: np.ndarray, annotation: dict,
                        cx: int, cy: int, crop_ratio: float) -> tuple:
    """Crop centered on pith at `crop_ratio` of image size, resize back."""
    h, w = img.shape[:2]
    crop_size = int(min(h, w) * crop_ratio)
    half = crop_size // 2

    x1 = max(0, cx - half)
    y1 = max(0, cy - half)
    x2 = min(w, x1 + crop_size)
    y2 = min(h, y1 + crop_size)
    # Adjust if hitting edges
    if x2 - x1 < crop_size:
        x1 = max(0, x2 - crop_size)
    if y2 - y1 < crop_size:
        y1 = max(0, y2 - crop_size)

    cropped = img[y1:y2, x1:x2]
    ch, cw = cropped.shape[:2]
    resized = cv2.resize(cropped, (w, h), interpolation=cv2.INTER_LINEAR)

    scale_x = w / cw
    scale_y = h / ch

    ann = deepcopy(annotation)
    for shape in ann.get("shapes", []):
        shape["points"] = [
            [(x - x1) * scale_x, (y - y1) * scale_y]
            for x, y in shape["points"]
        ]
    return resized, ann


# ═══════════════════════════════════════════════════════════════
#  APPEARANCE AUGMENTATIONS (image only, annotations unchanged)
# ═══════════════════════════════════════════════════════════════

def augment_brightness(img: np.ndarray, factor: float) -> np.ndarray:
    """Adjust brightness by multiplying pixel values."""
    return cv2.convertScaleAbs(img, alpha=factor, beta=0)


def augment_contrast(img: np.ndarray, factor: float) -> np.ndarray:
    """Adjust contrast around mean intensity."""
    mean = np.mean(img).astype(np.float64)
    result = (img.astype(np.float64) - mean) * factor + mean
    return np.clip(result, 0, 255).astype(np.uint8)


def augment_gaussian_noise(img: np.ndarray, sigma: float) -> np.ndarray:
    """Add Gaussian noise."""
    noise = np.random.normal(0, sigma, img.shape).astype(np.float64)
    noisy = img.astype(np.float64) + noise
    return np.clip(noisy, 0, 255).astype(np.uint8)


def augment_gaussian_blur(img: np.ndarray, ksize: int = 7) -> np.ndarray:
    """Apply Gaussian blur."""
    return cv2.GaussianBlur(img, (ksize, ksize), 0)


def augment_color_shift(img: np.ndarray) -> np.ndarray:
    """Random offset per channel (-20 to +20)."""
    result = img.astype(np.float64)
    for c in range(3):
        shift = random.randint(-20, 20)
        result[:, :, c] += shift
    return np.clip(result, 0, 255).astype(np.uint8)


def augment_staining(img: np.ndarray) -> np.ndarray:
    """Simulate fungal staining with semi-transparent brown patches."""
    result = img.copy()
    h, w = result.shape[:2]
    n_patches = random.randint(2, 6)
    for _ in range(n_patches):
        cx = random.randint(w // 6, 5 * w // 6)
        cy = random.randint(h // 6, 5 * h // 6)
        radius = random.randint(min(h, w) // 20, min(h, w) // 8)
        # Brown stain color (BGR)
        color = (random.randint(20, 60),
                 random.randint(50, 100),
                 random.randint(80, 150))
        overlay = result.copy()
        cv2.circle(overlay, (cx, cy), radius, color, -1)
        alpha = random.uniform(0.15, 0.4)
        cv2.addWeighted(overlay, alpha, result, 1 - alpha, 0, result)
    return result


def augment_cracks(img: np.ndarray) -> np.ndarray:
    """Simulate drying cracks as dark radial lines from center."""
    result = img.copy()
    h, w = result.shape[:2]
    center_x, center_y = w // 2, h // 2
    n_cracks = random.randint(1, 4)
    for _ in range(n_cracks):
        angle = random.uniform(0, 2 * np.pi)
        length = random.randint(min(h, w) // 4, min(h, w) // 2)
        end_x = int(center_x + length * np.cos(angle))
        end_y = int(center_y + length * np.sin(angle))
        thickness = random.randint(1, 3)
        color = (random.randint(10, 40),) * 3  # Dark gray/black
        cv2.line(result, (center_x, center_y), (end_x, end_y),
                 color, thickness, cv2.LINE_AA)
    return result


def augment_uneven_lighting(img: np.ndarray) -> np.ndarray:
    """Simulate directional illumination with a smooth gradient."""
    h, w = img.shape[:2]
    # Random gradient direction
    direction = random.choice(["left", "right", "top", "bottom",
                                "topleft", "bottomright"])
    if direction == "left":
        gradient = np.linspace(0.5, 1.2, w, dtype=np.float64)
        gradient = np.tile(gradient, (h, 1))
    elif direction == "right":
        gradient = np.linspace(1.2, 0.5, w, dtype=np.float64)
        gradient = np.tile(gradient, (h, 1))
    elif direction == "top":
        gradient = np.linspace(0.5, 1.2, h, dtype=np.float64)
        gradient = np.tile(gradient.reshape(-1, 1), (1, w))
    elif direction == "bottom":
        gradient = np.linspace(1.2, 0.5, h, dtype=np.float64)
        gradient = np.tile(gradient.reshape(-1, 1), (1, w))
    elif direction == "topleft":
        gx = np.linspace(0.6, 1.1, w, dtype=np.float64)
        gy = np.linspace(0.6, 1.1, h, dtype=np.float64)
        gradient = np.outer(gy, gx)
    else:  # bottomright
        gx = np.linspace(1.1, 0.6, w, dtype=np.float64)
        gy = np.linspace(1.1, 0.6, h, dtype=np.float64)
        gradient = np.outer(gy, gx)

    gradient_3ch = np.stack([gradient] * 3, axis=-1)
    result = img.astype(np.float64) * gradient_3ch
    return np.clip(result, 0, 255).astype(np.uint8)


# ═══════════════════════════════════════════════════════════════
#  COMBINED AUGMENTATION
# ═══════════════════════════════════════════════════════════════

def augment_combined(img: np.ndarray, annotation: dict,
                     cx: int, cy: int) -> tuple:
    """Apply random rotation + brightness + noise + optional staining/cracks."""
    # 1. Random rotation
    angle = random.uniform(0, 359)
    out_img, out_ann = augment_rotation(img, annotation, angle, cx, cy)

    # 2. Random brightness
    factor = random.uniform(0.6, 1.4)
    out_img = augment_brightness(out_img, factor)

    # 3. Random noise
    sigma = random.uniform(5, 20)
    out_img = augment_gaussian_noise(out_img, sigma)

    # 4. 50% chance staining
    if random.random() < 0.5:
        out_img = augment_staining(out_img)

    # 5. 30% chance cracks
    if random.random() < 0.3:
        out_img = augment_cracks(out_img)

    return out_img, out_ann


# ═══════════════════════════════════════════════════════════════
#  MAIN PIPELINE
# ═══════════════════════════════════════════════════════════════

def process_single_image(image_name: str, pith: tuple,
                         output_dir: Path) -> int:
    """Generate all augmentations for one image. Returns count of images saved."""
    cx, cy = pith
    img_path = IMAGES_DIR / f"{image_name}.png"

    if not img_path.exists():
        print(f"  [SKIP] Image not found: {img_path}")
        return 0

    img = cv2.imread(str(img_path))
    if img is None:
        print(f"  [SKIP] Could not read: {img_path}")
        return 0

    annotation = load_annotation(ANNOT_DIR, image_name)
    if annotation is None:
        print(f"  [SKIP] Annotation not found for {image_name}")
        return 0

    count = 0

    # --- 1. Original ---
    save_pair(img, annotation, output_dir, image_name, "original")
    count += 1

    # --- 2. Rotations (11 angles) ---
    for angle in [30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330]:
        rot_img, rot_ann = augment_rotation(img, annotation, angle, cx, cy)
        save_pair(rot_img, rot_ann, output_dir, image_name, f"rot{angle}")
        count += 1

    # --- 3. Horizontal flip ---
    hf_img, hf_ann = augment_hflip(img, annotation)
    save_pair(hf_img, hf_ann, output_dir, image_name, "hflip")
    count += 1

    # --- 4. Vertical flip ---
    vf_img, vf_ann = augment_vflip(img, annotation)
    save_pair(vf_img, vf_ann, output_dir, image_name, "vflip")
    count += 1

    # --- 5. Both flips ---
    hvf_img, hvf_ann = augment_hvflip(img, annotation)
    save_pair(hvf_img, hvf_ann, output_dir, image_name, "hvflip")
    count += 1

    # --- 6. Brightness (3 levels) ---
    for factor in [0.6, 0.8, 1.3]:
        b_img = augment_brightness(img, factor)
        b_ann = clone_annotation_unchanged(annotation)
        suffix = f"bright{int(factor * 100)}"
        save_pair(b_img, b_ann, output_dir, image_name, suffix)
        count += 1

    # --- 7. Contrast (2 levels) ---
    for factor in [0.7, 1.4]:
        c_img = augment_contrast(img, factor)
        c_ann = clone_annotation_unchanged(annotation)
        suffix = f"contrast{int(factor * 100)}"
        save_pair(c_img, c_ann, output_dir, image_name, suffix)
        count += 1

    # --- 8. Gaussian noise (2 levels) ---
    for sigma in [10, 25]:
        n_img = augment_gaussian_noise(img, sigma)
        n_ann = clone_annotation_unchanged(annotation)
        save_pair(n_img, n_ann, output_dir, image_name, f"noise{sigma}")
        count += 1

    # --- 9. Gaussian blur ---
    bl_img = augment_gaussian_blur(img, 7)
    bl_ann = clone_annotation_unchanged(annotation)
    save_pair(bl_img, bl_ann, output_dir, image_name, "blur7")
    count += 1

    # --- 10. Color channel shift (2 versions) ---
    for i in range(2):
        cs_img = augment_color_shift(img)
        cs_ann = clone_annotation_unchanged(annotation)
        save_pair(cs_img, cs_ann, output_dir, image_name, f"colorshift{i}")
        count += 1

    # --- 11. Staining simulation (2 versions) ---
    for i in range(2):
        st_img = augment_staining(img)
        st_ann = clone_annotation_unchanged(annotation)
        save_pair(st_img, st_ann, output_dir, image_name, f"stained{i}")
        count += 1

    # --- 12. Crack simulation (2 versions) ---
    for i in range(2):
        cr_img = augment_cracks(img)
        cr_ann = clone_annotation_unchanged(annotation)
        save_pair(cr_img, cr_ann, output_dir, image_name, f"cracked{i}")
        count += 1

    # --- 13. Uneven lighting (2 versions) ---
    for i in range(2):
        ul_img = augment_uneven_lighting(img)
        ul_ann = clone_annotation_unchanged(annotation)
        save_pair(ul_img, ul_ann, output_dir, image_name, f"lighting{i}")
        count += 1

    # --- 14. Center crop at 85% (2 versions: different ratios) ---
    for ratio, label in [(0.85, "crop85"), (0.75, "crop75")]:
        cc_img, cc_ann = augment_center_crop(img, annotation, cx, cy, ratio)
        save_pair(cc_img, cc_ann, output_dir, image_name, label)
        count += 1

    # --- 15. Combined random augmentations (7 versions) ---
    for i in range(7):
        cb_img, cb_ann = augment_combined(img, annotation, cx, cy)
        save_pair(cb_img, cb_ann, output_dir, image_name, f"combo{i}")
        count += 1

    return count


def main():
    print("=" * 65)
    print("  TreeTrace -- Augmented Dataset Generator")
    print("=" * 65)
    print()

    # Load pith coordinates
    pith_data = load_pith_csv(PITH_CSV)
    print(f"  Loaded {len(pith_data)} pith entries from CSV")

    # Create output dir
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    print(f"  Output: {OUTPUT_DIR}")
    print()

    total_count = 0
    skipped = 0
    start_time = time.time()

    for idx, (image_name, pith) in enumerate(pith_data.items(), 1):
        cx, cy = pith
        print(f"  [{idx:3d}/{len(pith_data)}] {image_name}  "
              f"(pith: {cx},{cy}) ... ", end="", flush=True)

        t0 = time.time()
        n = process_single_image(image_name, pith, OUTPUT_DIR)
        dt = time.time() - t0

        if n > 0:
            total_count += n
            print(f"{n} images in {dt:.1f}s")
        else:
            skipped += 1
            print("SKIPPED")

    elapsed = time.time() - start_time

    # Compute final disk usage
    total_bytes = 0
    for f in OUTPUT_DIR.iterdir():
        if f.is_file():
            total_bytes += f.stat().st_size
    total_gb = total_bytes / (1024 ** 3)

    print()
    print("=" * 65)
    print(f"  DONE")
    print(f"  Total images generated:  {total_count}")
    print(f"  Skipped (missing):       {skipped}")
    print(f"  Disk usage:              {total_gb:.2f} GB")
    print(f"  Elapsed time:            {elapsed:.0f}s ({elapsed/60:.1f}m)")
    print("=" * 65)


if __name__ == "__main__":
    main()
