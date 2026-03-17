"""
Ring Detector using Polar Transform - Fixed Version
"""

import numpy as np
import cv2
from pathlib import Path
import csv
import json
from datetime import datetime

PROJECT_ROOT = Path(r"C:\Users\prana\OneDrive\Desktop\TreeTrace")
INPUT_DIR = PROJECT_ROOT / "01_Raw_Data" / "URuDendro" / "images"
PITH_CSV = PROJECT_ROOT / "01_Raw_Data" / "URuDendro" / "pith_location.csv"
OUTPUT_DIR = PROJECT_ROOT / "07_Outputs" / "radial_predictions"


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


def create_polar_image(gray, cx, cy, max_radius, num_angles=360):
    """
    Manually create polar transform with controlled output size.
    Output: (num_angles, max_radius) - rows=angle, cols=radius
    """
    polar = np.zeros((num_angles, max_radius), dtype=np.uint8)
    h, w = gray.shape
    
    for angle_idx in range(num_angles):
        angle_rad = 2 * np.pi * angle_idx / num_angles
        
        for r in range(max_radius):
            x = cx + r * np.cos(angle_rad)
            y = cy + r * np.sin(angle_rad)
            
            if 0 <= x < w and 0 <= y < h:
                # Bilinear interpolation
                x0, y0 = int(x), int(y)
                x1, y1 = min(x0 + 1, w - 1), min(y0 + 1, h - 1)
                dx, dy = x - x0, y - y0
                
                val = (gray[y0, x0] * (1-dx) * (1-dy) +
                       gray[y0, x1] * dx * (1-dy) +
                       gray[y1, x0] * (1-dx) * dy +
                       gray[y1, x1] * dx * dy)
                polar[angle_idx, r] = int(val)
    
    return polar


def detect_rings_in_polar(polar, min_distance=20):
    """
    Detect rings as vertical lines in polar image.
    Returns list of radii where rings are detected.
    """
    # Smooth along angle direction (rows) to reduce noise
    smoothed = cv2.GaussianBlur(polar.astype(np.float32), (15, 1), 0)
    
    # Compute gradient in radius direction (columns)
    # We want to find where intensity changes (light->dark or dark->light)
    gradient = np.abs(np.gradient(smoothed, axis=1))
    
    # Average gradient across all angles
    mean_gradient = np.mean(gradient, axis=0)
    
    # Smooth the profile
    kernel_size = 5
    kernel = np.ones(kernel_size) / kernel_size
    mean_gradient = np.convolve(mean_gradient, kernel, mode='same')
    
    # Find peaks (ring boundaries)
    # Adaptive threshold based on signal
    threshold = np.percentile(mean_gradient, 70)
    
    peaks = []
    # Skip first and last few pixels (edge artifacts)
    margin = 30
    
    for i in range(margin, len(mean_gradient) - margin):
        # Local maximum check
        if mean_gradient[i] > threshold:
            # Check if it's the maximum in its neighborhood
            start = max(0, i - min_distance // 2)
            end = min(len(mean_gradient), i + min_distance // 2 + 1)
            
            if mean_gradient[i] == np.max(mean_gradient[start:end]):
                # Check minimum distance from last peak
                if not peaks or (i - peaks[-1]) >= min_distance:
                    peaks.append(i)
    
    return peaks, mean_gradient


def generate_ring_polygon(cx, cy, radius, num_points=72):
    """Generate circular polygon points."""
    angles = np.linspace(0, 2 * np.pi, num_points, endpoint=False)
    points = []
    for angle in angles:
        x = cx + radius * np.cos(angle)
        y = cy + radius * np.sin(angle)
        points.append([float(x), float(y)])
    return points


def export_labelme_json(rings, image_path, output_path, cx, cy, img_h, img_w):
    """Export rings as LabelMe JSON."""
    shapes = []
    for i, radius in enumerate(rings, start=1):
        polygon_points = generate_ring_polygon(cx, cy, radius, num_points=72)
        shape = {
            "label": str(i),
            "points": polygon_points,
            "group_id": None,
            "shape_type": "polygon",
            "flags": {}
        }
        shapes.append(shape)
    
    labelme_data = {
        "version": "5.0.1",
        "flags": {},
        "shapes": shapes,
        "imagePath": Path(image_path).name,
        "imageData": None,
        "imageHeight": img_h,
        "imageWidth": img_w
    }
    
    with open(output_path, 'w') as f:
        json.dump(labelme_data, f, indent=2)


def main():
    print("=" * 60)
    print("Polar Transform Ring Detector - Fixed")
    print("=" * 60)
    
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    
    # Load pith
    pith_coords = load_pith_coordinates(PITH_CSV)
    
    # Test on F02a
    test_image = "F02a"
    cx, cy = pith_coords[test_image]
    print(f"\n{test_image}: pith at ({cx}, {cy})")
    
    # Load image
    image_path = None
    for ext in ['.png', '.jpg', '.PNG', '.JPG']:
        candidate = INPUT_DIR / f"{test_image}{ext}"
        if candidate.exists():
            image_path = candidate
            break
    
    image = cv2.imread(str(image_path))
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    h, w = gray.shape
    
    # Max radius to edge of image from pith
    max_radius = min(cx, cy, w - cx, h - cy) - 20
    print(f"Image: {w}x{h}")
    print(f"Max radius: {max_radius}")
    
    # Create polar transform with correct size
    print("Creating polar transform...")
    num_angles = 720  # Higher resolution
    polar = create_polar_image(gray, cx, cy, max_radius, num_angles)
    print(f"Polar image shape: {polar.shape} (angles x radius)")
    
    # Save polar image
    polar_path = OUTPUT_DIR / f"{test_image}_polar.png"
    cv2.imwrite(str(polar_path), polar)
    print(f"Saved: {polar_path}")
    
    # Detect rings
    print("Detecting rings...")
    min_ring_distance = int(max_radius / 50)  # Expect ~25 rings max, so min spacing
    print(f"Minimum ring spacing: {min_ring_distance} px")
    
    ring_radii, gradient_profile = detect_rings_in_polar(polar, min_distance=min_ring_distance)
    
    print(f"\n{'='*50}")
    print(f"DETECTED: {len(ring_radii)} rings")
    print(f"EXPECTED: 23 rings")
    print(f"{'='*50}")
    
    # Create visualization
    import matplotlib
    matplotlib.use('Agg')
    import matplotlib.pyplot as plt
    
    fig, axes = plt.subplots(3, 1, figsize=(14, 10))
    
    # Polar image
    axes[0].imshow(polar, cmap='gray', aspect='auto')
    axes[0].set_title(f'Polar Transform ({num_angles} angles x {max_radius} radius)')
    axes[0].set_xlabel('Radius (pixels)')
    axes[0].set_ylabel('Angle index')
    for r in ring_radii:
        axes[0].axvline(x=r, color='lime', linewidth=0.5, alpha=0.7)
    
    # Gradient profile
    axes[1].plot(gradient_profile, 'b-', linewidth=0.8)
    axes[1].axhline(y=np.percentile(gradient_profile, 70), color='orange', 
                     linestyle='--', label='Threshold (70th percentile)')
    for r in ring_radii:
        axes[1].axvline(x=r, color='r', linestyle='--', alpha=0.5)
    axes[1].set_title(f'Gradient Profile with {len(ring_radii)} detected peaks')
    axes[1].set_xlabel('Radius (pixels)')
    axes[1].set_ylabel('Mean gradient')
    axes[1].legend()
    axes[1].set_xlim(0, max_radius)
    axes[1].grid(True, alpha=0.3)
    
    # Ring radii distribution
    if ring_radii:
        spacings = np.diff(ring_radii)
        axes[2].bar(range(len(ring_radii)), ring_radii, color='green', alpha=0.7)
        axes[2].set_title(f'Ring radii (mean spacing: {np.mean(spacings):.1f} px)')
        axes[2].set_xlabel('Ring number')
        axes[2].set_ylabel('Radius (pixels)')
        axes[2].grid(True, alpha=0.3)
    
    plt.tight_layout()
    analysis_path = OUTPUT_DIR / f"{test_image}_polar_analysis.png"
    plt.savefig(analysis_path, dpi=150)
    plt.close()
    print(f"Saved: {analysis_path}")
    
    # Draw on original image
    vis = image.copy()
    cv2.circle(vis, (cx, cy), 8, (0, 255, 0), -1)
    
    for i, radius in enumerate(ring_radii):
        # Color gradient from green (inner) to blue (outer)
        color = (255 - i*8, 255, 0) if i < 15 else (255, 255 - (i-15)*10, 0)
        color = tuple(max(0, min(255, c)) for c in color)
        cv2.circle(vis, (cx, cy), int(radius), color, 2)
    
    cv2.putText(vis, f"Detected: {len(ring_radii)} rings (expected 23)", (20, 40),
                cv2.FONT_HERSHEY_SIMPLEX, 1.0, (0, 255, 0), 2)
    
    vis_path = OUTPUT_DIR / f"{test_image}_polar_detection.png"
    cv2.imwrite(str(vis_path), vis)
    print(f"Saved: {vis_path}")
    
    # Export LabelMe JSON
    json_path = OUTPUT_DIR / f"{test_image}.json"
    export_labelme_json(ring_radii, image_path, json_path, cx, cy, h, w)
    print(f"Saved: {json_path}")
    
    # Print ring details
    print(f"\nDetected ring radii:")
    for i, r in enumerate(ring_radii, 1):
        print(f"  Ring {i:2d}: {r:4d} px")
    
    if len(ring_radii) > 1:
        spacings = np.diff(ring_radii)
        print(f"\nRing spacing stats:")
        print(f"  Min: {np.min(spacings):.0f} px")
        print(f"  Max: {np.max(spacings):.0f} px")
        print(f"  Mean: {np.mean(spacings):.1f} px")


if __name__ == "__main__":
    main()