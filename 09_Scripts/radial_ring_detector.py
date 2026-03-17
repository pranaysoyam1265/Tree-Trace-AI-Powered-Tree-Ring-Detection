"""
Radial Ring Detector - Fixed Clustering
"""

import json
import csv
import numpy as np
import cv2
from pathlib import Path
from datetime import datetime

# === CONFIGURATION ===
PROJECT_ROOT = Path(r"C:\Users\prana\OneDrive\Desktop\TreeTrace")
URUDENDRO_ROOT = Path(r"C:\Users\prana\OneDrive\Desktop\uruDendro-main")

INPUT_DIR = PROJECT_ROOT / "01_Raw_Data" / "URuDendro" / "images"
PITH_CSV = PROJECT_ROOT / "01_Raw_Data" / "URuDendro" / "pith_location.csv"
OUTPUT_DIR = PROJECT_ROOT / "07_Outputs" / "radial_predictions"

# Detection parameters
NUM_RAYS = 360
SMOOTHING_WINDOW = 15
MIN_RING_SPACING_PX = 15
EDGE_MARGIN_PX = 20
MIN_PROMINENCE = 8
HISTOGRAM_BIN_SIZE = 8  # Pixels per histogram bin


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


def moving_average(arr, window_size):
    if window_size % 2 == 0:
        window_size += 1
    if len(arr) < window_size:
        return arr.copy()
    kernel = np.ones(window_size) / window_size
    pad_size = window_size // 2
    padded = np.pad(arr, pad_size, mode='edge')
    smoothed = np.convolve(padded, kernel, mode='valid')
    return smoothed


def find_local_minima(profile, min_spacing, min_prominence):
    """Find local minima with prominence filtering."""
    n = len(profile)
    if n < 3:
        return []
    
    candidates = []
    for i in range(1, n - 1):
        if profile[i] < profile[i-1] and profile[i] < profile[i+1]:
            # Calculate prominence
            left_max = profile[i]
            for j in range(i-1, max(0, i-100), -1):
                if profile[j] > left_max:
                    left_max = profile[j]
            
            right_max = profile[i]
            for j in range(i+1, min(n, i+100)):
                if profile[j] > right_max:
                    right_max = profile[j]
            
            prominence = min(left_max, right_max) - profile[i]
            
            if prominence >= min_prominence:
                candidates.append((i, prominence))
    
    if not candidates:
        return []
    
    # Sort by prominence (strongest first)
    candidates.sort(key=lambda x: -x[1])
    
    # Greedy selection with minimum spacing
    selected = []
    for idx, prom in candidates:
        too_close = False
        for sel_idx, _ in selected:
            if abs(idx - sel_idx) < min_spacing:
                too_close = True
                break
        if not too_close:
            selected.append((idx, prom))
    
    selected.sort(key=lambda x: x[0])
    return selected


def sample_ray(image_gray, cx, cy, angle_deg, max_radius):
    """Sample intensity along a ray."""
    angle_rad = np.deg2rad(angle_deg)
    h, w = image_gray.shape
    
    profile = []
    for r in range(int(max_radius)):
        x = cx + r * np.cos(angle_rad)
        y = cy + r * np.sin(angle_rad)
        
        if not (0 <= x < w - 1 and 0 <= y < h - 1):
            break
        
        x0, y0 = int(x), int(y)
        x1, y1 = x0 + 1, y0 + 1
        dx, dy = x - x0, y - y0
        
        val = (image_gray[y0, x0] * (1-dx) * (1-dy) +
               image_gray[y0, x1] * dx * (1-dy) +
               image_gray[y1, x0] * (1-dx) * dy +
               image_gray[y1, x1] * dx * dy)
        profile.append(val)
    
    return np.array(profile)


def detect_rings_on_all_rays(gray, cx, cy, max_radius, params):
    """Cast rays and collect all detections as (angle, radius) pairs."""
    all_detections = []
    
    for ray_idx in range(params['num_rays']):
        angle_deg = ray_idx * 360.0 / params['num_rays']
        
        profile = sample_ray(gray, cx, cy, angle_deg, max_radius)
        
        if len(profile) < params['edge_margin'] * 2:
            continue
        
        smoothed = moving_average(profile, params['smoothing_window'])
        
        minima = find_local_minima(
            smoothed[params['edge_margin']:],
            params['min_ring_spacing'],
            params['min_prominence']
        )
        
        for idx, prom in minima:
            radius = idx + params['edge_margin']
            if radius < max_radius - params['edge_margin']:
                all_detections.append((angle_deg, radius))
    
    return all_detections


def histogram_cluster_radii(detections, max_radius, bin_size, num_rays, min_coverage=0.10):
    """
    Use histogram to find ring radii.
    
    Instead of sequential clustering, bin all radii into a histogram,
    then find peaks in the histogram.
    """
    if not detections:
        return []
    
    # Create histogram of radii
    radii = np.array([d[1] for d in detections])
    num_bins = int(max_radius / bin_size) + 1
    
    # Count unique angles per bin (not raw counts)
    angle_counts = np.zeros(num_bins)
    bin_radii_sum = np.zeros(num_bins)
    bin_radii_count = np.zeros(num_bins)
    angles_per_bin = [set() for _ in range(num_bins)]
    
    for angle, radius in detections:
        bin_idx = int(radius / bin_size)
        if bin_idx < num_bins:
            angles_per_bin[bin_idx].add(angle)
            bin_radii_sum[bin_idx] += radius
            bin_radii_count[bin_idx] += 1
    
    for i in range(num_bins):
        angle_counts[i] = len(angles_per_bin[i])
    
    # Find peaks in angle_counts histogram
    min_count = int(num_rays * min_coverage)
    
    rings = []
    i = 0
    while i < num_bins:
        if angle_counts[i] >= min_count:
            # Found a peak - find its extent
            start = i
            total_angles = set()
            total_radius_sum = 0
            total_radius_count = 0
            
            # Expand while counts are significant
            while i < num_bins and angle_counts[i] >= min_count * 0.5:
                total_angles.update(angles_per_bin[i])
                total_radius_sum += bin_radii_sum[i]
                total_radius_count += bin_radii_count[i]
                i += 1
            
            # Calculate mean radius for this ring
            if total_radius_count > 0:
                mean_radius = total_radius_sum / total_radius_count
                coverage = len(total_angles) / num_rays
                
                if coverage >= min_coverage:
                    rings.append((mean_radius, coverage))
        else:
            i += 1
    
    return rings


def generate_ring_polygon(cx, cy, radius, num_points=72):
    angles = np.linspace(0, 2 * np.pi, num_points, endpoint=False)
    points = []
    for angle in angles:
        x = cx + radius * np.cos(angle)
        y = cy + radius * np.sin(angle)
        points.append([float(x), float(y)])
    return points


def export_labelme_json(rings, image_path, output_path, cx, cy):
    image = cv2.imread(str(image_path))
    h, w = image.shape[:2]
    
    shapes = []
    for i, (radius, confidence) in enumerate(rings, start=1):
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
        "imagePath": image_path.name,
        "imageData": None,
        "imageHeight": h,
        "imageWidth": w
    }
    
    with open(output_path, 'w') as f:
        json.dump(labelme_data, f, indent=2)


def create_visualization(image, cx, cy, rings, output_path):
    vis = image.copy()
    
    cv2.circle(vis, (int(cx), int(cy)), 8, (0, 255, 0), -1)
    cv2.circle(vis, (int(cx), int(cy)), 10, (0, 0, 0), 2)
    
    for i, (radius, confidence) in enumerate(rings):
        if confidence > 0.5:
            color = (0, 255, 0)
        elif confidence > 0.3:
            color = (0, 255, 255)
        else:
            color = (0, 165, 255)
        
        cv2.circle(vis, (int(cx), int(cy)), int(radius), color, 2)
        
        if (i + 1) % 5 == 0 or i == 0 or i == len(rings) - 1:
            label_x = int(cx + radius * np.cos(np.pi/4))
            label_y = int(cy - radius * np.sin(np.pi/4))
            cv2.putText(vis, str(i+1), (label_x, label_y),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)
    
    cv2.putText(vis, f"Detected: {len(rings)} rings", (20, 40),
                cv2.FONT_HERSHEY_SIMPLEX, 1.0, (0, 255, 0), 2)
    
    cv2.imwrite(str(output_path), vis)


def create_histogram_debug(detections, max_radius, bin_size, output_path):
    """Create debug visualization of the radius histogram."""
    import matplotlib
    matplotlib.use('Agg')
    import matplotlib.pyplot as plt
    
    radii = [d[1] for d in detections]
    
    fig, axes = plt.subplots(2, 1, figsize=(14, 8))
    
    # Raw histogram
    axes[0].hist(radii, bins=int(max_radius/bin_size), range=(0, max_radius), 
                 color='blue', alpha=0.7)
    axes[0].set_xlabel('Radius (pixels)')
    axes[0].set_ylabel('Detection count')
    axes[0].set_title('Histogram of detected minima radii')
    axes[0].grid(True, alpha=0.3)
    
    # Unique angles per bin
    num_bins = int(max_radius / bin_size) + 1
    angles_per_bin = [set() for _ in range(num_bins)]
    for angle, radius in detections:
        bin_idx = int(radius / bin_size)
        if bin_idx < num_bins:
            angles_per_bin[bin_idx].add(angle)
    
    angle_counts = [len(s) for s in angles_per_bin]
    bin_centers = [i * bin_size + bin_size/2 for i in range(num_bins)]
    
    axes[1].bar(bin_centers, angle_counts, width=bin_size*0.9, color='green', alpha=0.7)
    axes[1].axhline(y=36, color='red', linestyle='--', label='10% threshold (36 rays)')
    axes[1].set_xlabel('Radius (pixels)')
    axes[1].set_ylabel('Unique angles')
    axes[1].set_title('Unique angles detecting minima at each radius')
    axes[1].legend()
    axes[1].grid(True, alpha=0.3)
    
    plt.tight_layout()
    plt.savefig(output_path, dpi=150)
    plt.close()


def detect_rings(image_path, cx, cy):
    """Main detection function."""
    params = {
        'num_rays': NUM_RAYS,
        'smoothing_window': SMOOTHING_WINDOW,
        'min_ring_spacing': MIN_RING_SPACING_PX,
        'edge_margin': EDGE_MARGIN_PX,
        'min_prominence': MIN_PROMINENCE,
    }
    
    image = cv2.imread(str(image_path))
    if image is None:
        raise ValueError(f"Could not load image: {image_path}")
    
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    h, w = gray.shape
    
    max_radius = min(cx, cy, w - cx, h - cy) - params['edge_margin']
    
    print(f"  Image size: {w} x {h}")
    print(f"  Pith: ({cx}, {cy})")
    print(f"  Max radius: {max_radius}")
    
    # Detect minima on all rays
    print("  Casting rays and detecting minima...")
    detections = detect_rings_on_all_rays(gray, cx, cy, max_radius, params)
    
    print(f"  Total detections: {len(detections)}")
    print(f"  Average per ray: {len(detections)/NUM_RAYS:.1f}")
    
    # Save histogram debug
    hist_path = OUTPUT_DIR / f"{image_path.stem}_histogram.png"
    create_histogram_debug(detections, max_radius, HISTOGRAM_BIN_SIZE, hist_path)
    print(f"  Saved histogram debug: {hist_path}")
    
    # Cluster using histogram approach
    print("  Clustering with histogram method...")
    rings = histogram_cluster_radii(
        detections, 
        max_radius, 
        bin_size=HISTOGRAM_BIN_SIZE,
        num_rays=NUM_RAYS, 
        min_coverage=0.10
    )
    print(f"  Rings detected: {len(rings)}")
    
    return rings, image, max_radius


def main():
    print("=" * 60)
    print("Radial Ring Detector - Histogram Clustering")
    print("=" * 60)
    
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    
    print(f"\nLoading pith coordinates...")
    pith_coords = load_pith_coordinates(PITH_CSV)
    
    test_image = "F02a"
    cx, cy = pith_coords[test_image]
    print(f"\n{test_image}: pith at ({cx}, {cy})")
    
    image_path = None
    for ext in ['.png', '.jpg', '.jpeg', '.PNG', '.JPG']:
        candidate = INPUT_DIR / f"{test_image}{ext}"
        if candidate.exists():
            image_path = candidate
            break
    
    if image_path is None:
        print(f"ERROR: Could not find image for {test_image}")
        return
    
    print(f"\nDetecting rings...")
    rings, image, max_radius = detect_rings(image_path, cx, cy)
    
    print(f"\n{'='*50}")
    print(f"RESULT: Detected {len(rings)} rings")
    print(f"Expected (GT): 23 rings")
    print(f"Difference: {len(rings) - 23:+d}")
    print(f"{'='*50}")
    
    if rings:
        print("\nDetected rings:")
        for i, (radius, conf) in enumerate(rings, 1):
            print(f"  Ring {i:2d}: r={radius:6.1f}px, coverage={conf:.1%}")
    
    json_path = OUTPUT_DIR / f"{test_image}.json"
    export_labelme_json(rings, image_path, json_path, cx, cy)
    print(f"\nSaved: {json_path}")
    
    vis_path = OUTPUT_DIR / f"{test_image}_detection.png"
    create_visualization(image, cx, cy, rings, vis_path)
    print(f"Saved: {vis_path}")
    
    summary_path = OUTPUT_DIR / f"{test_image}_summary.txt"
    with open(summary_path, 'w') as f:
        f.write(f"Radial Ring Detection - Histogram Clustering\n")
        f.write(f"{'='*40}\n")
        f.write(f"Image: {test_image}\n")
        f.write(f"Date: {datetime.now().isoformat()}\n")
        f.write(f"Pith: ({cx}, {cy})\n")
        f.write(f"Max radius: {max_radius}\n")
        f.write(f"Detected: {len(rings)} rings\n")
        f.write(f"Expected: 23 rings\n\n")
        for i, (radius, conf) in enumerate(rings, 1):
            f.write(f"Ring {i:2d}: radius={radius:.1f}px, coverage={conf:.1%}\n")
    
    print(f"Saved: {summary_path}")
    print("\nDone! Check F02a_histogram.png to see the detection pattern.")


if __name__ == "__main__":
    main()