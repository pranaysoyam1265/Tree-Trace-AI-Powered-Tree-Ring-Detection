"""
09_Scripts/visualize_probmap.py
Save probability map as heatmap image for visual inspection.
Just for F02a first.
"""

from pathlib import Path
import cv2
import numpy as np
import torch
import torch.nn as nn

PROJECT_ROOT = Path(r"C:\Users\prana\OneDrive\Desktop\TreeTrace")
MODEL_PATH   = PROJECT_ROOT / "05_Models" / "Segmentation_v2" / "segmenter_v2_best.pth"
IMAGE_PATH   = PROJECT_ROOT / "01_Raw_Data" / "URuDendro" / "images" / "F02a.png"
OUTPUT_DIR   = PROJECT_ROOT / "07_Outputs" / "probmap_check"

# =============================================================================
# Model (5-level, base_c=64)
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
        self.bottleneck = ConvBlock(base_c * 8, base_c * 16)
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
        b  = self.bottleneck(self.pool(e4))
        d4 = self.dec4(torch.cat([self.up4(b), e4], dim=1))
        d3 = self.dec3(torch.cat([self.up3(d4), e3], dim=1))
        d2 = self.dec2(torch.cat([self.up2(d3), e2], dim=1))
        d1 = self.dec1(torch.cat([self.up1(d2), e1], dim=1))
        return self.out(d1)  # raw logits


# =============================================================================
# Main
# =============================================================================

def main():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    device = 'cpu'
    print(f"Device: {device}")

    # Load model
    model = SimpleUNet(in_channels=3, out_channels=1, base_c=64)
    state_dict = torch.load(MODEL_PATH, map_location=device)
    if isinstance(state_dict, dict) and 'model_state_dict' in state_dict:
        state_dict = state_dict['model_state_dict']
    model.load_state_dict(state_dict)
    model.to(device)
    model.eval()
    print(f"Model loaded")

    # Load image
    image = cv2.imread(str(IMAGE_PATH))
    print(f"Image shape: {image.shape}")

    # Run inference — pad to multiple of 16 for UNet
    img_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    h, w = img_rgb.shape[:2]
    pad_h = (16 - h % 16) % 16
    pad_w = (16 - w % 16) % 16
    if pad_h > 0 or pad_w > 0:
        img_padded = cv2.copyMakeBorder(img_rgb, 0, pad_h, 0, pad_w, cv2.BORDER_REFLECT)
    else:
        img_padded = img_rgb
    img_float  = img_padded.astype(np.float32) / 255.0
    img_tensor = torch.from_numpy(img_float).permute(2, 0, 1).unsqueeze(0).to(device)

    with torch.no_grad():
        prob = torch.sigmoid(model(img_tensor)).squeeze().cpu().numpy()
    prob = prob[:h, :w]  # crop off padding

    print(f"Probability map stats:")
    print(f"  Min:  {prob.min():.4f}")
    print(f"  Max:  {prob.max():.4f}")
    print(f"  Mean: {prob.mean():.4f}")
    print(f"  Pixels > 0.1:  {(prob > 0.1).sum():,}")
    print(f"  Pixels > 0.3:  {(prob > 0.3).sum():,}")
    print(f"  Pixels > 0.5:  {(prob > 0.5).sum():,}")

    # --- Save 1: Raw heatmap (hot colormap) ---
    prob_uint8  = (prob * 255).astype(np.uint8)
    heatmap     = cv2.applyColorMap(prob_uint8, cv2.COLORMAP_HOT)
    cv2.imwrite(str(OUTPUT_DIR / "F02a_heatmap.png"), heatmap)
    print(f"Saved: F02a_heatmap.png")

    # --- Save 2: Overlay on original image ---
    image_small   = cv2.resize(image,   (prob.shape[1], prob.shape[0]))
    heatmap_small = cv2.resize(heatmap, (prob.shape[1], prob.shape[0]))
    overlay       = cv2.addWeighted(image_small, 0.5, heatmap_small, 0.5, 0)
    cv2.imwrite(str(OUTPUT_DIR / "F02a_overlay.png"), overlay)
    print(f"Saved: F02a_overlay.png")

    # --- Save 3: Binary threshold at 0.1 ---
    binary = ((prob > 0.1).astype(np.uint8) * 255)
    cv2.imwrite(str(OUTPUT_DIR / "F02a_binary_01.png"), binary)
    print(f"Saved: F02a_binary_01.png")

    # --- Save 4: Binary threshold at 0.3 ---
    binary2 = ((prob > 0.3).astype(np.uint8) * 255)
    cv2.imwrite(str(OUTPUT_DIR / "F02a_binary_03.png"), binary2)
    print(f"Saved: F02a_binary_03.png")

    # --- Save 5: Radial profile plot at 0 degrees ---
    import matplotlib.pyplot as plt

    pith_x, pith_y = 140, 129   # F02a pith from CSV
    radius         = 800         # approximate radius in pixels

    angles_to_plot = [0, 45, 90, 135, 180, 225, 270, 315]
    fig, axes      = plt.subplots(2, 4, figsize=(20, 8))
    fig.suptitle("F02a — Radial Profiles at 8 Angles\n"
                 "Each peak = one detected ring. "
                 "Ground truth = 23 rings.", fontsize=13)

    for ax, angle in zip(axes.flatten(), angles_to_plot):
        angle_rad = np.deg2rad(angle)
        t         = np.linspace(0, 1, 512)
        xs        = pith_x + t * radius * np.cos(angle_rad)
        ys        = pith_y + t * radius * np.sin(angle_rad)

        # Clamp
        xs = np.clip(xs, 0, prob.shape[1] - 1)
        ys = np.clip(ys, 0, prob.shape[0] - 1)

        from scipy.ndimage import map_coordinates
        from scipy.signal  import find_peaks, savgol_filter

        profile  = map_coordinates(prob, [ys, xs], order=1)
        smoothed = savgol_filter(profile, window_length=15, polyorder=3)

        peaks_strict, _ = find_peaks(smoothed, height=0.10, distance=8, prominence=0.05)
        peaks_loose,  _ = find_peaks(smoothed, height=0.05, distance=6, prominence=0.02)

        ax.plot(profile,  color='lightblue', alpha=0.6, label='Raw')
        ax.plot(smoothed, color='blue',      linewidth=1.5, label='Smoothed')

        for p in peaks_strict:
            ax.axvline(x=p, color='red',   alpha=0.8, linewidth=1.5)
        for p in peaks_loose:
            if p not in peaks_strict:
                ax.axvline(x=p, color='orange', alpha=0.5, linewidth=1)

        ax.axhline(y=0.10, color='red',    linestyle='--', alpha=0.4)
        ax.axhline(y=0.05, color='orange', linestyle='--', alpha=0.4)

        ax.set_title(f"Angle={angle}°  |  "
                     f"strict={len(peaks_strict)}  loose={len(peaks_loose)}")
        ax.set_xlabel("Distance from pith")
        ax.set_ylabel("Probability")
        ax.legend(fontsize=7)
        ax.set_ylim(0, 1)

    plt.tight_layout()
    plt.savefig(str(OUTPUT_DIR / "F02a_radial_profiles.png"),
                dpi=150, bbox_inches='tight')
    plt.close()
    print(f"Saved: F02a_radial_profiles.png")

    print(f"\nAll outputs saved to: {OUTPUT_DIR}")
    print(f"\nNow open these files and look at them:")
    print(f"  1. F02a_heatmap.png       — does it show 23 ring-like bands?")
    print(f"  2. F02a_overlay.png       — do the bright regions align with rings?")
    print(f"  3. F02a_radial_profiles.png — how many peaks per angle?")
    print(f"     Red lines   = peaks found with strict threshold (what V5 uses)")
    print(f"     Orange lines = additional peaks found with loose threshold")
    print(f"     If orange lines are real rings we are missing them!")

if __name__ == "__main__":
    main()