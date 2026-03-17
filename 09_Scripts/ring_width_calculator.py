"""
TreeTrace Ring Width Calculator
Extracts ring widths from CS-TRD detection polygons.
Outputs measurements in pixels and optionally converts to mm.
"""

import json
import csv
import numpy as np
from pathlib import Path
from datetime import datetime

PROJECT_ROOT = Path(r"C:\Users\prana\OneDrive\Desktop\TreeTrace")
DETECTION_DIR = PROJECT_ROOT / "07_Outputs" / "cstrd_results"
PITH_CSV = PROJECT_ROOT / "01_Raw_Data" / "URuDendro" / "pith_location.csv"
OUTPUT_DIR = PROJECT_ROOT / "07_Outputs" / "ring_widths"


def load_pith_coordinates():
    """Load pith coordinates from CSV."""
    coords = {}
    with open(PITH_CSV, 'r') as f:
        reader = csv.DictReader(f)
        for row in reader:
            name = row['Image'].strip()
            coords[name] = (int(row['cx']), int(row['cy']))
    return coords


def load_detection(json_path):
    """Load detection JSON file."""
    with open(json_path, 'r') as f:
        return json.load(f)


def calculate_ring_radii(shapes, cx, cy):
    """
    Calculate mean radius for each ring from pith center.
    
    Args:
        shapes: List of shape objects from LabelMe JSON
        cx, cy: Pith coordinates
    
    Returns:
        List of (ring_label, mean_radius, min_radius, max_radius) tuples
    """
    ring_data = []
    
    for shape in shapes:
        label = shape.get('label', '?')
        points = np.array(shape.get('points', []))
        
        if len(points) == 0:
            continue
        
        # Calculate distance from each point to pith
        distances = np.sqrt((points[:, 0] - cx)**2 + (points[:, 1] - cy)**2)
        
        ring_data.append({
            'label': label,
            'mean_radius': float(np.mean(distances)),
            'min_radius': float(np.min(distances)),
            'max_radius': float(np.max(distances)),
            'std_radius': float(np.std(distances)),
            'num_points': len(points)
        })
    
    # Sort by mean radius (innermost first)
    ring_data.sort(key=lambda x: x['mean_radius'])
    
    return ring_data


def calculate_ring_widths(ring_data):
    """
    Calculate width of each ring (distance between consecutive rings).
    
    Args:
        ring_data: List of ring dictionaries with radii
    
    Returns:
        List of ring width dictionaries
    """
    widths = []
    
    for i in range(len(ring_data)):
        ring = ring_data[i]
        
        if i == 0:
            # First ring - width from pith to first ring
            inner_radius = 0
            outer_radius = ring['mean_radius']
        else:
            # Subsequent rings - width between consecutive rings
            inner_radius = ring_data[i-1]['mean_radius']
            outer_radius = ring['mean_radius']
        
        width = outer_radius - inner_radius
        
        widths.append({
            'ring_number': i + 1,
            'original_label': ring['label'],
            'inner_radius_px': round(inner_radius, 2),
            'outer_radius_px': round(outer_radius, 2),
            'width_px': round(width, 2),
            'eccentricity': round(ring['std_radius'] / ring['mean_radius'], 4) if ring['mean_radius'] > 0 else 0
        })
    
    return widths


def calculate_statistics(widths):
    """Calculate summary statistics for ring widths."""
    if not widths:
        return {}
    
    width_values = [w['width_px'] for w in widths]
    
    return {
        'ring_count': len(widths),
        'total_radius_px': round(sum(width_values), 2),
        'mean_width_px': round(np.mean(width_values), 2),
        'std_width_px': round(np.std(width_values), 2),
        'min_width_px': round(np.min(width_values), 2),
        'max_width_px': round(np.max(width_values), 2),
        'median_width_px': round(np.median(width_values), 2)
    }


def analyze_growth_trend(widths):
    """Analyze growth trend over time."""
    if len(widths) < 3:
        return {'trend': 'insufficient_data'}
    
    width_values = [w['width_px'] for w in widths]
    
    # Simple linear regression for trend
    x = np.arange(len(width_values))
    coeffs = np.polyfit(x, width_values, 1)
    slope = coeffs[0]
    
    # Determine trend
    if slope > 0.5:
        trend = 'increasing'
    elif slope < -0.5:
        trend = 'decreasing'
    else:
        trend = 'stable'
    
    # Early vs late growth comparison
    mid = len(width_values) // 2
    early_mean = np.mean(width_values[:mid])
    late_mean = np.mean(width_values[mid:])
    
    return {
        'trend': trend,
        'slope': round(slope, 4),
        'early_growth_mean_px': round(early_mean, 2),
        'late_growth_mean_px': round(late_mean, 2),
        'growth_change_percent': round((late_mean - early_mean) / early_mean * 100, 1) if early_mean > 0 else 0
    }


def process_single_image(image_name, pith_coords, scale_factor=None):
    """
    Process a single image and extract ring widths.
    
    Args:
        image_name: Name of the image (e.g., 'F02a')
        pith_coords: Dictionary of pith coordinates
        scale_factor: Optional pixels-per-mm conversion factor
    
    Returns:
        Dictionary with all ring width data
    """
    # Get pith coordinates
    if image_name not in pith_coords:
        print(f"ERROR: No pith coordinates for {image_name}")
        return None
    
    cx, cy = pith_coords[image_name]
    
    # Load detection
    detection_path = DETECTION_DIR / f"{image_name}.json"
    if not detection_path.exists():
        print(f"ERROR: Detection not found: {detection_path}")
        return None
    
    data = load_detection(detection_path)
    shapes = data.get('shapes', [])
    
    if not shapes:
        print(f"WARNING: No rings detected for {image_name}")
        return None
    
    print(f"\nProcessing {image_name}...")
    print(f"  Pith: ({cx}, {cy})")
    print(f"  Detected rings: {len(shapes)}")
    
    # Calculate radii and widths
    ring_data = calculate_ring_radii(shapes, cx, cy)
    widths = calculate_ring_widths(ring_data)
    statistics = calculate_statistics(widths)
    growth_trend = analyze_growth_trend(widths)
    
    # Convert to mm if scale factor provided
    if scale_factor:
        for w in widths:
            w['width_mm'] = round(w['width_px'] / scale_factor, 3)
            w['inner_radius_mm'] = round(w['inner_radius_px'] / scale_factor, 3)
            w['outer_radius_mm'] = round(w['outer_radius_px'] / scale_factor, 3)
        
        statistics['mean_width_mm'] = round(statistics['mean_width_px'] / scale_factor, 3)
        statistics['total_radius_mm'] = round(statistics['total_radius_px'] / scale_factor, 3)
    
    result = {
        'image': image_name,
        'pith_cx': cx,
        'pith_cy': cy,
        'timestamp': datetime.now().isoformat(),
        'scale_factor_px_per_mm': scale_factor,
        'statistics': statistics,
        'growth_trend': growth_trend,
        'rings': widths
    }
    
    # Print summary
    print(f"  Ring count: {statistics['ring_count']}")
    print(f"  Mean width: {statistics['mean_width_px']:.2f} px")
    print(f"  Min width:  {statistics['min_width_px']:.2f} px")
    print(f"  Max width:  {statistics['max_width_px']:.2f} px")
    print(f"  Growth trend: {growth_trend['trend']}")
    
    return result


def export_csv(result, output_path):
    """Export ring widths to CSV file."""
    with open(output_path, 'w', newline='') as f:
        # Write header info as comments
        f.write(f"# TreeTrace Ring Width Analysis\n")
        f.write(f"# Image: {result['image']}\n")
        f.write(f"# Pith: ({result['pith_cx']}, {result['pith_cy']})\n")
        f.write(f"# Ring Count: {result['statistics']['ring_count']}\n")
        f.write(f"# Mean Width: {result['statistics']['mean_width_px']:.2f} px\n")
        f.write(f"# Generated: {result['timestamp']}\n")
        f.write(f"#\n")
        
        # Write ring data
        fieldnames = ['ring_number', 'inner_radius_px', 'outer_radius_px', 'width_px', 'eccentricity']
        if result.get('scale_factor_px_per_mm'):
            fieldnames.extend(['width_mm', 'inner_radius_mm', 'outer_radius_mm'])
        
        writer = csv.DictWriter(f, fieldnames=fieldnames, extrasaction='ignore')
        writer.writeheader()
        writer.writerows(result['rings'])


def create_visualization(result, output_path):
    """Create ring width visualization chart."""
    import matplotlib
    matplotlib.use('Agg')
    import matplotlib.pyplot as plt
    
    widths = [r['width_px'] for r in result['rings']]
    ring_numbers = [r['ring_number'] for r in result['rings']]
    
    fig, axes = plt.subplots(2, 2, figsize=(14, 10))
    fig.suptitle(f"TreeTrace Ring Analysis: {result['image']}", fontsize=14, fontweight='bold')
    
    # 1. Ring widths bar chart
    ax1 = axes[0, 0]
    colors = plt.cm.YlOrRd(np.linspace(0.3, 0.9, len(widths)))
    ax1.bar(ring_numbers, widths, color=colors, edgecolor='black', linewidth=0.5)
    ax1.axhline(y=result['statistics']['mean_width_px'], color='blue', linestyle='--', 
                label=f"Mean: {result['statistics']['mean_width_px']:.1f} px")
    ax1.set_xlabel('Ring Number (1 = oldest/center)')
    ax1.set_ylabel('Width (pixels)')
    ax1.set_title('Ring Widths')
    ax1.legend()
    ax1.grid(True, alpha=0.3)
    
    # 2. Cumulative radius
    ax2 = axes[0, 1]
    cumulative = np.cumsum(widths)
    ax2.plot(ring_numbers, cumulative, 'b-o', markersize=4)
    ax2.fill_between(ring_numbers, cumulative, alpha=0.3)
    ax2.set_xlabel('Ring Number')
    ax2.set_ylabel('Cumulative Radius (pixels)')
    ax2.set_title('Tree Growth Over Time')
    ax2.grid(True, alpha=0.3)
    
    # 3. Width distribution histogram
    ax3 = axes[1, 0]
    ax3.hist(widths, bins=min(15, len(widths)), color='forestgreen', edgecolor='black', alpha=0.7)
    ax3.axvline(x=result['statistics']['mean_width_px'], color='red', linestyle='--', 
                label=f"Mean: {result['statistics']['mean_width_px']:.1f}")
    ax3.axvline(x=result['statistics']['median_width_px'], color='orange', linestyle='--', 
                label=f"Median: {result['statistics']['median_width_px']:.1f}")
    ax3.set_xlabel('Ring Width (pixels)')
    ax3.set_ylabel('Frequency')
    ax3.set_title('Width Distribution')
    ax3.legend()
    ax3.grid(True, alpha=0.3)
    
    # 4. Growth trend with moving average
    ax4 = axes[1, 1]
    ax4.plot(ring_numbers, widths, 'gray', alpha=0.5, label='Raw')
    
    # Moving average
    if len(widths) >= 5:
        window = min(5, len(widths) // 2)
        ma = np.convolve(widths, np.ones(window)/window, mode='valid')
        ma_x = ring_numbers[window//2:window//2 + len(ma)]
        ax4.plot(ma_x, ma, 'b-', linewidth=2, label=f'{window}-ring moving avg')
    
    # Trend line
    z = np.polyfit(ring_numbers, widths, 1)
    p = np.poly1d(z)
    ax4.plot(ring_numbers, p(ring_numbers), 'r--', linewidth=2, 
             label=f"Trend: {result['growth_trend']['trend']}")
    
    ax4.set_xlabel('Ring Number')
    ax4.set_ylabel('Width (pixels)')
    ax4.set_title('Growth Trend Analysis')
    ax4.legend()
    ax4.grid(True, alpha=0.3)
    
    plt.tight_layout()
    plt.savefig(output_path, dpi=150, bbox_inches='tight')
    plt.close()


def main():
    import argparse
    
    parser = argparse.ArgumentParser(description="Calculate ring widths from CS-TRD detections")
    parser.add_argument("--image", type=str, help="Single image name (e.g., F02a)")
    parser.add_argument("--all", action="store_true", help="Process all detected images")
    parser.add_argument("--scale", type=float, help="Pixels per mm (for mm conversion)")
    
    args = parser.parse_args()
    
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    pith_coords = load_pith_coordinates()
    
    if args.image:
        # Process single image
        result = process_single_image(args.image, pith_coords, args.scale)
        
        if result:
            # Save JSON
            json_path = OUTPUT_DIR / f"{args.image}_widths.json"
            with open(json_path, 'w') as f:
                json.dump(result, f, indent=2)
            print(f"\nSaved: {json_path}")
            
            # Save CSV
            csv_path = OUTPUT_DIR / f"{args.image}_widths.csv"
            export_csv(result, csv_path)
            print(f"Saved: {csv_path}")
            
            # Save visualization
            viz_path = OUTPUT_DIR / f"{args.image}_analysis.png"
            create_visualization(result, viz_path)
            print(f"Saved: {viz_path}")
            
            # Print ring details
            print(f"\n{'='*50}")
            print(f"Ring Width Details for {args.image}")
            print(f"{'='*50}")
            print(f"{'Ring':<6} {'Inner(px)':<12} {'Outer(px)':<12} {'Width(px)':<12}")
            print("-" * 50)
            for r in result['rings']:
                print(f"{r['ring_number']:<6} {r['inner_radius_px']:<12.1f} {r['outer_radius_px']:<12.1f} {r['width_px']:<12.1f}")
    
    elif args.all:
        # Process all detected images
        results = []
        for json_file in DETECTION_DIR.glob("*.json"):
            if json_file.stem == "batch_results":
                continue
            
            result = process_single_image(json_file.stem, pith_coords, args.scale)
            if result:
                results.append(result)
                
                # Save individual files
                json_path = OUTPUT_DIR / f"{json_file.stem}_widths.json"
                with open(json_path, 'w') as f:
                    json.dump(result, f, indent=2)
                
                csv_path = OUTPUT_DIR / f"{json_file.stem}_widths.csv"
                export_csv(result, csv_path)
                
                viz_path = OUTPUT_DIR / f"{json_file.stem}_analysis.png"
                create_visualization(result, viz_path)
        
        print(f"\n{'='*50}")
        print(f"Processed {len(results)} images")
        print(f"Outputs saved to: {OUTPUT_DIR}")
    
    else:
        print("Usage:")
        print("  python ring_width_calculator.py --image F02a")
        print("  python ring_width_calculator.py --all")
        print("  python ring_width_calculator.py --image F02a --scale 10.5  # With px/mm conversion")


if __name__ == "__main__":
    main()