"""
Diagnostic script - inspect what's happening along radial profiles
"""

import numpy as np
import cv2
from pathlib import Path
import matplotlib
matplotlib.use('Agg')  # Non-interactive backend
import matplotlib.pyplot as plt

# Paths
PROJECT_ROOT = Path(r"C:\Users\prana\OneDrive\Desktop\TreeTrace")
INPUT_DIR = PROJECT_ROOT / "01_Raw_Data" / "URuDendro" / "images"
OUTPUT_DIR = PROJECT_ROOT / "07_Outputs" / "radial_predictions"

def moving_average(arr, window_size):
    if window_size % 2 == 0:
        window_size += 1
    kernel = np.ones(window_size) / window_size
    pad_size = window_size // 2
    padded = np.pad(arr, pad_size, mode='edge')
    smoothed = np.convolve(padded, kernel, mode='valid')
    return smoothed

def sample_ray_simple(image_gray, cx, cy, angle_deg, max_radius):
    """Sample intensity along a ray."""
    angle_rad = np.deg2rad(angle_deg)
    h, w = image_gray.shape
    
    profile = []
    for r in range(int(max_radius)):
        x = cx + r * np.cos(angle_rad)
        y = cy + r * np.sin(angle_rad)
        
        if 0 <= x < w and 0 <= y < h:
            profile.append(image_gray[int(y), int(x)])
        else:
            break
    
    return np.array(profile)

def main():
    # Load F02a
    image_path = INPUT_DIR / "F02a.png"
    if not image_path.exists():
        image_path = INPUT_DIR / "F02a.jpg"
    
    image = cv2.imread(str(image_path))
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    h, w = gray.shape
    
    cx, cy = 1197, 1293
    max_radius = min(cx, cy, w - cx, h - cy) - 20
    
    print(f"Image: {w} x {h}")
    print(f"Pith: ({cx}, {cy})")
    print(f"Max radius: {max_radius}")
    
    # Sample a few rays at different angles
    test_angles = [0, 45, 90, 135, 180, 225, 270, 315]
    
    fig, axes = plt.subplots(4, 2, figsize=(14, 16))
    axes = axes.flatten()
    
    for i, angle in enumerate(test_angles):
        profile = sample_ray_simple(gray, cx, cy, angle, max_radius)
        smoothed = moving_average(profile, 15)
        
        ax = axes[i]
        ax.plot(profile, 'b-', alpha=0.3, label='Raw', linewidth=0.5)
        ax.plot(smoothed, 'r-', label='Smoothed', linewidth=1)
        ax.set_title(f'Angle {angle}°')
        ax.set_xlabel('Radius (pixels)')
        ax.set_ylabel('Intensity')
        ax.legend()
        ax.grid(True, alpha=0.3)
        
        # Print stats
        print(f"\nAngle {angle}°:")
        print(f"  Profile length: {len(profile)}")
        print(f"  Intensity range: {profile.min():.0f} - {profile.max():.0f}")
        print(f"  Mean: {profile.mean():.1f}, Std: {profile.std():.1f}")
    
    plt.tight_layout()
    output_path = OUTPUT_DIR / "diagnostic_profiles.png"
    plt.savefig(output_path, dpi=150)
    print(f"\nSaved diagnostic plot: {output_path}")
    
    # Also plot one profile with detected minima marked
    print("\n" + "="*50)
    print("Detailed analysis of angle 0°:")
    print("="*50)
    
    profile = sample_ray_simple(gray, cx, cy, 0, max_radius)
    smoothed = moving_average(profile, 15)
    
    # Manual minima detection with debug output
    minima = []
    for i in range(1, len(smoothed) - 1):
        if smoothed[i] < smoothed[i-1] and smoothed[i] < smoothed[i+1]:
            minima.append(i)
    
    print(f"Total local minima found: {len(minima)}")
    print(f"First 20 minima positions: {minima[:20]}")
    
    # Check prominence of first few
    print("\nProminence of first 10 minima:")
    for idx in minima[:10]:
        left_max = max(smoothed[max(0, idx-50):idx])
        right_max = max(smoothed[idx+1:min(len(smoothed), idx+50)])
        prominence = min(left_max, right_max) - smoothed[idx]
        print(f"  r={idx}: intensity={smoothed[idx]:.1f}, prominence={prominence:.1f}")

if __name__ == "__main__":
    main()