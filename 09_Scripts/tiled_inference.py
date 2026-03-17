"""
09_Scripts/tiled_inference.py
==============================
Run tiled inference on full-resolution tree cross-section images.

Fixes:
1. Correct ImageNet normalization (was missing in all previous scripts)
2. Tiled approach handles 2364x2364 images with 256x256 trained model
3. Only central 192x192 of each tile used (avoids edge artifacts)
4. Gaussian blending at tile boundaries for smooth stitching

Author: TreeTrace Team
Date: 2025-03
"""

import sys
from pathlib import Path
import cv2
import numpy as np
import torch
import torch.nn as nn
import matplotlib.pyplot as plt

PROJECT_ROOT = Path(r"C:\Users\prana\OneDrive\Desktop\TreeTrace")
MODEL_PATH   = PROJECT_ROOT / "05_Models" / "Segmentation_v2" / "segmenter_v2_best.pth"
IMAGE_PATH   = PROJECT_ROOT / "01_Raw_Data" / "URuDendro" / "images" / "F02a.png"
OUTPUT_DIR   = PROJECT_ROOT / "07_Outputs" / "tiled_inference"

# Tiling parameters
TILE_SIZE    = 256
OVERLAP      = 64
INNER_SIZE   = TILE_SIZE - 2 * (OVERLAP // 2)  # = 192, central region per tile

# ImageNet normalization (must match training)
IMAGENET_MEAN = np.array([0.485, 0.456, 0.406], dtype=np.float32)
IMAGENET_STD  = np.array([0.229, 0.224, 0.225], dtype=np.float32)


# =============================================================================
# Model Definition (5-level UNet, base_c=64)
# =============================================================================

class ConvBlock(nn.Module):
    def __init__(self, in_ch, out_ch):
        super().__init__()
        self.conv = nn.Sequential(
            nn.Conv2d(in_ch, out_ch, 3, padding=1),
            nn.BatchNorm2d(out_ch),
            nn.ReLU(inplace=True),
            nn.Conv2d(out_ch, out_ch, 3, padding=1),
            nn.BatchNorm2d(out_ch),
            nn.ReLU(inplace=True),
        )
    def forward(self, x):
        return self.conv(x)


class SimpleUNet(nn.Module):
    def __init__(self, in_channels=3, out_channels=1, base_c=64):
        super().__init__()
        self.enc1 = ConvBlock(in_channels, base_c)
        self.enc2 = ConvBlock(base_c,      base_c * 2)
        self.enc3 = ConvBlock(base_c * 2,  base_c * 4)
        self.enc4 = ConvBlock(base_c * 4,  base_c * 8)
        self.bottleneck = ConvBlock(base_c * 8,  base_c * 16)
        self.pool = nn.MaxPool2d(2)
        self.up4  = nn.ConvTranspose2d(base_c * 16, base_c * 8,  2, stride=2)
        self.dec4 = ConvBlock(base_c * 16, base_c * 8)
        self.up3  = nn.ConvTranspose2d(base_c * 8,  base_c * 4,  2, stride=2)
        self.dec3 = ConvBlock(base_c * 8,  base_c * 4)
        self.up2  = nn.ConvTranspose2d(base_c * 4,  base_c * 2,  2, stride=2)
        self.dec2 = ConvBlock(base_c * 4,  base_c * 2)
        self.up1  = nn.ConvTranspose2d(base_c * 2,  base_c,      2, stride=2)
        self.dec1 = ConvBlock(base_c * 2,  base_c)
        self.out = nn.Conv2d(base_c, out_channels, 1)

    def forward(self, x):
        e1 = self.enc1(x)
        e2 = self.enc2(self.pool(e1))
        e3 = self.enc3(self.pool(e2))
        e4 = self.enc4(self.pool(e3))
        b = self.bottleneck(self.pool(e4))
        d4 = self.dec4(torch.cat([self.up4(b), e4], dim=1))
        d3 = self.dec3(torch.cat([self.up3(d4), e3], dim=1))
        d2 = self.dec2(torch.cat([self.up2(d3), e2], dim=1))
        d1 = self.dec1(torch.cat([self.up1(d2), e1], dim=1))
        return torch.sigmoid(self.out(d1))


# =============================================================================
# Normalization
# =============================================================================

def normalize_tile(tile_rgb: np.ndarray) -> np.ndarray:
    """
    Apply ImageNet normalization to a tile.
    Input:  RGB tile, uint8, shape (H, W, 3)
    Output: Normalized float32, shape (H, W, 3)
    """
    tile_float = tile_rgb.astype(np.float32) / 255.0
    tile_float = (tile_float - IMAGENET_MEAN) / IMAGENET_STD
    return tile_float


# =============================================================================
# Tiled Inference
# =============================================================================

def pad_image(image: np.ndarray, tile_size: int, overlap: int) -> tuple:
    """
    Pad image so it is evenly divisible into tiles.
    Returns (padded_image, pad_top, pad_left)
    """
    h, w = image.shape[:2]
    stride = tile_size - overlap

    # Calculate how much padding is needed
    pad_h = (stride - (h % stride)) % stride
    pad_w = (stride - (w % stride)) % stride

    # Add half overlap on each side so edge tiles have context
    pad_top    = overlap // 2
    pad_bottom = overlap // 2 + pad_h
    pad_left   = overlap // 2
    pad_right  = overlap // 2 + pad_w

    padded = cv2.copyMakeBorder(
        image,
        pad_top, pad_bottom,
        pad_left, pad_right,
        cv2.BORDER_REFLECT  # Reflect padding preserves edge texture
    )

    return padded, pad_top, pad_left


def run_tiled_inference(image: np.ndarray,
                        model: nn.Module,
                        device: str,
                        tile_size: int = TILE_SIZE,
                        overlap: int = OVERLAP) -> np.ndarray:
    """
    Run model inference using tiling strategy.

    Args:
        image:     BGR image, full resolution
        model:     Loaded segmentation model
        device:    'cuda' or 'cpu'
        tile_size: Size of each tile (256)
        overlap:   Overlap between tiles (64)

    Returns:
        prob_map:  Float32 probability map, same size as input image
    """
    h_orig, w_orig = image.shape[:2]
    stride         = tile_size - overlap
    inner          = tile_size - overlap  # 192px inner region per tile

    # Pad image
    padded, pad_top, pad_left = pad_image(image, tile_size, overlap)
    h_pad, w_pad = padded.shape[:2]

    # Convert padded image to RGB
    padded_rgb = cv2.cvtColor(padded, cv2.COLOR_BGR2RGB)

    # Accumulators for stitching
    prob_accum  = np.zeros((h_pad, w_pad), dtype=np.float32)
    count_accum = np.zeros((h_pad, w_pad), dtype=np.float32)

    # Generate tile positions
    y_starts = list(range(0, h_pad - tile_size + 1, stride))
    x_starts = list(range(0, w_pad - tile_size + 1, stride))

    # Ensure last tiles cover the edge
    if y_starts[-1] + tile_size < h_pad:
        y_starts.append(h_pad - tile_size)
    if x_starts[-1] + tile_size < w_pad:
        x_starts.append(w_pad - tile_size)

    total_tiles = len(y_starts) * len(x_starts)
    print(f"  Image size:    {w_orig} × {h_orig}")
    print(f"  Padded size:   {w_pad} × {h_pad}")
    print(f"  Tile size:     {tile_size} × {tile_size}")
    print(f"  Stride:        {stride}")
    print(f"  Total tiles:   {total_tiles}")

    tile_count = 0

    for y in y_starts:
        for x in x_starts:
            # Extract tile
            tile_bgr = padded[y:y + tile_size, x:x + tile_size]
            tile_rgb = padded_rgb[y:y + tile_size, x:x + tile_size]

            # Normalize with ImageNet stats
            tile_norm = normalize_tile(tile_rgb)

            # To tensor
            tile_tensor = torch.from_numpy(tile_norm).permute(2, 0, 1).unsqueeze(0)
            tile_tensor = tile_tensor.to(device)

            # Inference
            with torch.no_grad():
                pred = model(tile_tensor)
                pred = pred.squeeze().cpu().numpy()  # (256, 256)

            # Use only inner region to avoid edge artifacts
            margin = overlap // 2  # 32px margin on each side

            # Inner region in the tile
            inner_pred = pred[margin:tile_size - margin,
                              margin:tile_size - margin]

            # Corresponding position in padded image
            y_inner = y + margin
            x_inner = x + margin
            inner_h  = tile_size - 2 * margin
            inner_w  = tile_size - 2 * margin

            # Accumulate
            prob_accum[y_inner:y_inner + inner_h,
                       x_inner:x_inner + inner_w] += inner_pred

            count_accum[y_inner:y_inner + inner_h,
                        x_inner:x_inner + inner_w] += 1.0

            tile_count += 1
            if tile_count % 20 == 0 or tile_count == total_tiles:
                print(f"  Processed {tile_count}/{total_tiles} tiles...")

    # Average overlapping predictions
    count_accum = np.maximum(count_accum, 1e-8)  # Avoid division by zero
    prob_map_padded = prob_accum / count_accum

    # Crop back to original size
    prob_map = prob_map_padded[pad_top:pad_top + h_orig,
                               pad_left:pad_left + w_orig]

    return prob_map


# =============================================================================
# Visualization
# =============================================================================

def save_visualizations(image: np.ndarray,
                        prob_map: np.ndarray,
                        pith: tuple,
                        output_dir: Path,
                        name: str):
    """Save probability map visualizations for inspection."""
    output_dir.mkdir(parents=True, exist_ok=True)

    h, w = prob_map.shape

    # 1. Raw heatmap
    prob_uint8 = (prob_map * 255).astype(np.uint8)
    heatmap    = cv2.applyColorMap(prob_uint8, cv2.COLORMAP_HOT)
    cv2.imwrite(str(output_dir / f"{name}_heatmap.png"), heatmap)

    # 2. Overlay on original
    image_resized   = cv2.resize(image,   (w, h))
    heatmap_resized = cv2.resize(heatmap, (w, h))
    overlay = cv2.addWeighted(image_resized, 0.5, heatmap_resized, 0.5, 0)

    # Draw pith
    cx, cy = pith
    cv2.circle(overlay, (cx, cy), 10, (0, 255, 0),  -1)
    cv2.circle(overlay, (cx, cy), 12, (255, 255, 255), 2)
    cv2.imwrite(str(output_dir / f"{name}_overlay.png"), overlay)

    # 3. Binary at 0.3
    binary_03 = ((prob_map > 0.3).astype(np.uint8) * 255)
    cv2.imwrite(str(output_dir / f"{name}_binary_03.png"), binary_03)

    # 4. Binary at 0.5
    binary_05 = ((prob_map > 0.5).astype(np.uint8) * 255)
    cv2.imwrite(str(output_dir / f"{name}_binary_05.png"), binary_05)

    # 5. Radial profiles at 8 angles
    from scipy.signal  import find_peaks, savgol_filter
    from scipy.ndimage import map_coordinates

    cx, cy   = pith
    angles   = [0, 45, 90, 135, 180, 225, 270, 315]
    radius   = min(cx, cy, w - cx, h - cy) - 20

    fig, axes = plt.subplots(2, 4, figsize=(20, 8))
    fig.suptitle(f"{name} — Tiled Inference Radial Profiles\n"
                 f"Ground truth = 23 rings (F02a)", fontsize=13)

    for ax, angle in zip(axes.flatten(), angles):
        angle_rad = np.deg2rad(angle)
        t  = np.linspace(0, 1, 512)
        xs = cx + t * radius * np.cos(angle_rad)
        ys = cy + t * radius * np.sin(angle_rad)
        xs = np.clip(xs, 0, w - 1)
        ys = np.clip(ys, 0, h - 1)

        profile  = map_coordinates(prob_map, [ys, xs], order=1)

        if len(profile) > 15:
            smoothed = savgol_filter(profile, window_length=15, polyorder=3)
        else:
            smoothed = profile

        peaks_strict, _ = find_peaks(smoothed,
                                     height=0.30,
                                     distance=8,
                                     prominence=0.10)
        peaks_loose,  _ = find_peaks(smoothed,
                                     height=0.15,
                                     distance=6,
                                     prominence=0.05)

        ax.plot(profile,  color='lightblue', alpha=0.5, label='Raw')
        ax.plot(smoothed, color='blue', linewidth=1.5, label='Smoothed')

        for p in peaks_strict:
            ax.axvline(x=p, color='red',    alpha=0.8, linewidth=1.5)
        for p in peaks_loose:
            if p not in peaks_strict:
                ax.axvline(x=p, color='orange', alpha=0.5, linewidth=1)

        ax.axhline(y=0.30, color='red',    linestyle='--', alpha=0.4)
        ax.axhline(y=0.15, color='orange', linestyle='--', alpha=0.4)
        ax.set_title(f"Angle={angle}°  strict={len(peaks_strict)}  "
                     f"loose={len(peaks_loose)}")
        ax.set_xlabel("Distance from pith (samples)")
        ax.set_ylabel("Probability")
        ax.set_ylim(0, 1)
        ax.legend(fontsize=7)

    plt.tight_layout()
    plt.savefig(str(output_dir / f"{name}_radial_profiles.png"),
                dpi=150, bbox_inches='tight')
    plt.close()

    # Print stats
    print(f"\n  Probability map stats:")
    print(f"    Min:          {prob_map.min():.4f}")
    print(f"    Max:          {prob_map.max():.4f}")
    print(f"    Mean:         {prob_map.mean():.4f}")
    print(f"    Pixels > 0.3: {(prob_map > 0.3).sum():,}")
    print(f"    Pixels > 0.5: {(prob_map > 0.5).sum():,}")
    print(f"\n  Saved to: {output_dir}")


# =============================================================================
# Main
# =============================================================================

def main():
    print("=" * 60)
    print("TreeTrace — Tiled Inference")
    print("=" * 60)

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    # Device
    device = 'cuda' if torch.cuda.is_available() else 'cpu'
    print(f"\nDevice: {device}")

    # Load model
    print("\nLoading model...")
    model = SimpleUNet(in_channels=3, out_channels=1, base_c=64)

    if not MODEL_PATH.exists():
        raise FileNotFoundError(f"Model not found: {MODEL_PATH}")

    state_dict = torch.load(MODEL_PATH, map_location=device)
    if isinstance(state_dict, dict) and 'model_state_dict' in state_dict:
        state_dict = state_dict['model_state_dict']
    model.load_state_dict(state_dict)
    model.to(device)
    model.eval()
    print(f"  Loaded: {MODEL_PATH.name}")

    # Load image
    print(f"\nLoading image: {IMAGE_PATH.name}")
    image = cv2.imread(str(IMAGE_PATH))
    if image is None:
        raise FileNotFoundError(f"Image not found: {IMAGE_PATH}")
    print(f"  Shape: {image.shape}")

    # Pith for F02a (full resolution coordinates)
    pith = (140, 129)  # (cx, cy)
    print(f"  Pith: cx={pith[0]}, cy={pith[1]}")

    # Run tiled inference
    print(f"\nRunning tiled inference...")
    prob_map = run_tiled_inference(image, model, device)

    # Save probability map as numpy array for later use
    np.save(str(OUTPUT_DIR / "F02a_prob_map.npy"), prob_map)
    print(f"\n  Saved prob map: F02a_prob_map.npy")

    # Save visualizations
    print("\nSaving visualizations...")
    save_visualizations(image, prob_map, pith, OUTPUT_DIR, "F02a")

    print("\n" + "=" * 60)
    print("Done. Open these files to inspect:")
    print(f"  {OUTPUT_DIR / 'F02a_heatmap.png'}")
    print(f"  {OUTPUT_DIR / 'F02a_overlay.png'}")
    print(f"  {OUTPUT_DIR / 'F02a_binary_03.png'}")
    print(f"  {OUTPUT_DIR / 'F02a_radial_profiles.png'}")
    print("=" * 60)
    print("\nKey question after looking at the images:")
    print("  Do you see clear ring boundaries in the heatmap/overlay?")
    print("  Do the radial profiles show ~23 peaks?")


if __name__ == "__main__":
    main()