"""
TreeTrace - Tree Ring Detection CLI (Enhanced Version)
With GT comparison, improved visualization, and manual review support.
"""

import argparse
import json
import csv
import sys
import subprocess
import numpy as np
import cv2
from pathlib import Path
from datetime import datetime

PROJECT_ROOT = Path(r"C:\Users\prana\OneDrive\Desktop\TreeTrace")
CSTRD_ROOT = Path(r"C:\Users\prana\OneDrive\Desktop\cstrd_ipol")
URUDENDRO_ROOT = Path(r"C:\Users\prana\OneDrive\Desktop\uruDendro-main")
OUTPUT_DIR = PROJECT_ROOT / "07_Outputs"
GT_DIR = URUDENDRO_ROOT / "annotations (1)"


def load_pith_csv():
    """Load pith coordinates from CSV."""
    pith_csv = PROJECT_ROOT / "01_Raw_Data" / "URuDendro" / "pith_location.csv"
    coords = {}
    if pith_csv.exists():
        with open(pith_csv, 'r') as f:
            reader = csv.DictReader(f)
            for row in reader:
                name = row['Image'].strip()
                coords[name] = (int(row['cx']), int(row['cy']))
    return coords


def load_ground_truth(image_name):
    """Load ground truth annotations."""
    gt_path = GT_DIR / f"{image_name}.json"
    if gt_path.exists():
        with open(gt_path, 'r') as f:
            return json.load(f)
    return None


def detect_rings(image_path, cx, cy, output_dir):
    """Run CS-TRD detection."""
    cmd = [
        sys.executable,
        str(CSTRD_ROOT / "main.py"),
        "--input", str(image_path),
        "--cx", str(cx),
        "--cy", str(cy),
        "--output_dir", str(output_dir),
        "--root", str(CSTRD_ROOT),
    ]
    
    subprocess.run(cmd, cwd=str(CSTRD_ROOT), capture_output=True)
    
    json_path = output_dir / "labelme.json"
    if json_path.exists():
        with open(json_path) as f:
            data = json.load(f)
        return data
    return None


def calculate_widths(shapes, cx, cy):
    """Calculate ring widths from detected polygons."""
    if not shapes:
        return [], []
    
    ring_data = []
    for shape in shapes:
        points = np.array(shape.get('points', []))
        if len(points) == 0:
            continue
        distances = np.sqrt((points[:, 0] - cx)**2 + (points[:, 1] - cy)**2)
        ring_data.append({
            'label': shape.get('label', '?'),
            'mean_radius': float(np.mean(distances)),
            'min_radius': float(np.min(distances)),
            'max_radius': float(np.max(distances)),
            'points': points
        })
    
    ring_data.sort(key=lambda x: x['mean_radius'])
    
    widths = []
    for i, ring in enumerate(ring_data):
        inner = 0 if i == 0 else ring_data[i-1]['mean_radius']
        outer = ring['mean_radius']
        widths.append({
            'ring': i + 1,
            'width_px': round(outer - inner, 2),
            'radius_px': round(outer, 2),
            'min_radius_px': round(ring['min_radius'], 2),
            'max_radius_px': round(ring['max_radius'], 2)
        })
    
    return widths, ring_data


def create_comparison_visualization(image_path, det_shapes, gt_shapes, cx, cy, 
                                     widths, output_dir, image_name):
    """Create comprehensive visualization with GT comparison."""
    import matplotlib
    matplotlib.use('Agg')
    import matplotlib.pyplot as plt
    from matplotlib.lines import Line2D
    
    # Load image
    image = cv2.imread(str(image_path))
    image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    h, w = image_rgb.shape[:2]
    
    # Calculate GT ring count
    gt_count = len(gt_shapes) if gt_shapes else 0
    det_count = len(det_shapes) if det_shapes else 0
    
    # Create figure
    fig = plt.figure(figsize=(24, 16))
    
    # === Row 1: Image Comparisons ===
    
    # 1. Original Image
    ax1 = fig.add_subplot(2, 4, 1)
    ax1.imshow(image_rgb)
    ax1.plot(cx, cy, 'g+', markersize=20, markeredgewidth=3)
    ax1.set_title('Original Image', fontsize=12, fontweight='bold')
    ax1.axis('off')
    
    # 2. Ground Truth Only
    ax2 = fig.add_subplot(2, 4, 2)
    ax2.imshow(image_rgb)
    ax2.plot(cx, cy, 'go', markersize=8)
    
    if gt_shapes:
        for shape in gt_shapes:
            points = np.array(shape.get('points', []))
            if len(points) > 0:
                points_closed = np.vstack([points, points[0]])
                ax2.plot(points_closed[:, 0], points_closed[:, 1], 
                        'b-', linewidth=1.5, alpha=0.8)
    
    ax2.set_title(f'Ground Truth: {gt_count} rings', fontsize=12, fontweight='bold', color='blue')
    ax2.axis('off')
    
    # 3. Detection Only
    ax3 = fig.add_subplot(2, 4, 3)
    ax3.imshow(image_rgb)
    ax3.plot(cx, cy, 'go', markersize=8)
    
    if det_shapes:
        colors = plt.cm.YlOrRd(np.linspace(0.3, 0.9, len(det_shapes)))
        for i, shape in enumerate(det_shapes):
            points = np.array(shape.get('points', []))
            if len(points) > 0:
                points_closed = np.vstack([points, points[0]])
                ax3.plot(points_closed[:, 0], points_closed[:, 1], 
                        color=colors[i], linewidth=1.5, alpha=0.8)
    
    ax3.set_title(f'Detected: {det_count} rings', fontsize=12, fontweight='bold', color='red')
    ax3.axis('off')
    
    # 4. Overlay Comparison (GT=blue, Det=red)
    ax4 = fig.add_subplot(2, 4, 4)
    ax4.imshow(image_rgb)
    ax4.plot(cx, cy, 'go', markersize=8)
    
    # Draw GT in blue
    if gt_shapes:
        for shape in gt_shapes:
            points = np.array(shape.get('points', []))
            if len(points) > 0:
                points_closed = np.vstack([points, points[0]])
                ax4.plot(points_closed[:, 0], points_closed[:, 1], 
                        'b-', linewidth=2, alpha=0.6)
    
    # Draw Detection in red
    if det_shapes:
        for shape in det_shapes:
            points = np.array(shape.get('points', []))
            if len(points) > 0:
                points_closed = np.vstack([points, points[0]])
                ax4.plot(points_closed[:, 0], points_closed[:, 1], 
                        'r-', linewidth=2, alpha=0.6)
    
    # Legend
    legend_elements = [
        Line2D([0], [0], color='blue', linewidth=2, label=f'Ground Truth ({gt_count})'),
        Line2D([0], [0], color='red', linewidth=2, label=f'Detected ({det_count})')
    ]
    ax4.legend(handles=legend_elements, loc='upper right', fontsize=10)
    ax4.set_title('Comparison (Blue=GT, Red=Detected)', fontsize=12, fontweight='bold')
    ax4.axis('off')
    
    # === Row 2: Analysis Charts ===
    
    if widths:
        width_values = [w['width_px'] for w in widths]
        ring_numbers = [w['ring'] for w in widths]
        
        # 5. Ring Width Bar Chart
        ax5 = fig.add_subplot(2, 4, 5)
        bar_colors = plt.cm.YlOrRd(np.linspace(0.3, 0.9, len(widths)))
        bars = ax5.bar(ring_numbers, width_values, color=bar_colors, edgecolor='black', linewidth=0.5)
        ax5.axhline(y=np.mean(width_values), color='blue', linestyle='--', 
                    linewidth=2, label=f'Mean: {np.mean(width_values):.1f} px')
        ax5.set_xlabel('Ring Number (1 = center)', fontsize=10)
        ax5.set_ylabel('Width (pixels)', fontsize=10)
        ax5.set_title('Ring Widths', fontsize=12, fontweight='bold')
        ax5.legend(loc='upper right')
        ax5.grid(True, alpha=0.3)
        
        # 6. Cumulative Growth
        ax6 = fig.add_subplot(2, 4, 6)
        cumulative = np.cumsum(width_values)
        ax6.fill_between(ring_numbers, cumulative, alpha=0.3, color='forestgreen')
        ax6.plot(ring_numbers, cumulative, 'o-', color='forestgreen', linewidth=2, markersize=5)
        ax6.set_xlabel('Ring Number (Age)', fontsize=10)
        ax6.set_ylabel('Total Radius (pixels)', fontsize=10)
        ax6.set_title('Cumulative Growth', fontsize=12, fontweight='bold')
        ax6.grid(True, alpha=0.3)
        
        # Growth trend
        if len(width_values) > 2:
            z = np.polyfit(ring_numbers, width_values, 1)
            trend = "Decreasing ↓" if z[0] < 0 else "Increasing ↑" if z[0] > 0 else "Stable →"
            ax6.annotate(f'Trend: {trend}', xy=(0.05, 0.95), xycoords='axes fraction',
                        fontsize=11, fontweight='bold', va='top')
        
        # 7. Width Distribution
        ax7 = fig.add_subplot(2, 4, 7)
        ax7.hist(width_values, bins=min(12, len(width_values)), 
                color='steelblue', edgecolor='black', alpha=0.7)
        ax7.axvline(x=np.mean(width_values), color='red', linestyle='--', 
                    linewidth=2, label=f'Mean: {np.mean(width_values):.1f}')
        ax7.axvline(x=np.median(width_values), color='orange', linestyle='--', 
                    linewidth=2, label=f'Median: {np.median(width_values):.1f}')
        ax7.set_xlabel('Ring Width (pixels)', fontsize=10)
        ax7.set_ylabel('Frequency', fontsize=10)
        ax7.set_title('Width Distribution', fontsize=12, fontweight='bold')
        ax7.legend(loc='upper right')
        ax7.grid(True, alpha=0.3)
        
        # 8. Detection Statistics
        ax8 = fig.add_subplot(2, 4, 8)
        ax8.axis('off')
        
        # Calculate statistics
        recall = det_count / gt_count * 100 if gt_count > 0 else 0
        missed = gt_count - det_count if gt_count > det_count else 0
        
        stats_text = f"""
╔══════════════════════════════════════╗
║       DETECTION SUMMARY              ║
╠══════════════════════════════════════╣
║  Ground Truth Rings:  {gt_count:>3}            ║
║  Detected Rings:      {det_count:>3}            ║
║  Missed Rings:        {missed:>3}            ║
║  Detection Rate:      {recall:>5.1f}%         ║
╠══════════════════════════════════════╣
║       RING WIDTH STATS               ║
╠══════════════════════════════════════╣
║  Mean Width:    {np.mean(width_values):>7.1f} px         ║
║  Min Width:     {np.min(width_values):>7.1f} px         ║
║  Max Width:     {np.max(width_values):>7.1f} px         ║
║  Std Dev:       {np.std(width_values):>7.1f} px         ║
╠══════════════════════════════════════╣
║  Total Radius:  {cumulative[-1]:>7.1f} px         ║
║  Est. Age:      ~{det_count} years              ║
╚══════════════════════════════════════╝
        """
        
        ax8.text(0.1, 0.95, stats_text, transform=ax8.transAxes, fontsize=11,
                verticalalignment='top', fontfamily='monospace',
                bbox=dict(boxstyle='round', facecolor='wheat', alpha=0.5))
    
    # Main title
    fig.suptitle(f'🌲 TreeTrace Analysis: {image_name}\n'
                f'Detected: {det_count} rings | Ground Truth: {gt_count} rings | '
                f'Detection Rate: {det_count/gt_count*100:.0f}%' if gt_count > 0 else 
                f'🌲 TreeTrace Analysis: {image_name}\nDetected: {det_count} rings',
                fontsize=16, fontweight='bold', y=0.98)
    
    plt.tight_layout(rect=[0, 0, 1, 0.95])
    
    # Save
    viz_path = output_dir / f"{image_name}_full_analysis.png"
    plt.savefig(viz_path, dpi=150, bbox_inches='tight', facecolor='white')
    plt.close()
    
    return viz_path


def create_ring_overlay_comparison(image_path, det_shapes, gt_shapes, cx, cy, 
                                    output_dir, image_name):
    """Create ring overlay with GT comparison using OpenCV."""
    image = cv2.imread(str(image_path))
    h, w = image.shape[:2]
    
    # Draw Ground Truth in BLUE
    if gt_shapes:
        for shape in gt_shapes:
            points = np.array(shape.get('points', []), dtype=np.int32)
            if len(points) > 0:
                cv2.polylines(image, [points], isClosed=True, color=(255, 100, 0), thickness=2)
    
    # Draw Detection in GREEN with gradient
    if det_shapes:
        num_rings = len(det_shapes)
        for i, shape in enumerate(det_shapes):
            points = np.array(shape.get('points', []), dtype=np.int32)
            if len(points) > 0:
                # Color gradient: green (inner) to red (outer)
                ratio = i / max(1, num_rings - 1)
                color = (0, int(255 * (1 - ratio)), int(255 * ratio))  # BGR
                cv2.polylines(image, [points], isClosed=True, color=color, thickness=3)
    
    # Draw pith
    cv2.circle(image, (cx, cy), 12, (0, 255, 0), -1)
    cv2.circle(image, (cx, cy), 14, (255, 255, 255), 2)
    
    # Add legend box
    legend_y = 30
    cv2.rectangle(image, (10, 10), (350, 130), (255, 255, 255), -1)
    cv2.rectangle(image, (10, 10), (350, 130), (0, 0, 0), 2)
    
    # Detection info
    det_count = len(det_shapes) if det_shapes else 0
    gt_count = len(gt_shapes) if gt_shapes else 0
    
    cv2.putText(image, f"TreeTrace Analysis", (20, legend_y + 5), 
                cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 0), 2)
    
    # Legend items
    cv2.line(image, (20, legend_y + 35), (50, legend_y + 35), (0, 255, 0), 3)
    cv2.putText(image, f"Detected: {det_count} rings", (60, legend_y + 40), 
                cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 100, 0), 2)
    
    cv2.line(image, (20, legend_y + 65), (50, legend_y + 65), (255, 100, 0), 3)
    cv2.putText(image, f"Ground Truth: {gt_count} rings", (60, legend_y + 70), 
                cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 100, 0), 2)
    
    if gt_count > 0:
        rate = det_count / gt_count * 100
        cv2.putText(image, f"Detection Rate: {rate:.0f}%", (20, legend_y + 100), 
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 0), 2)
    
    # Save
    overlay_path = output_dir / f"{image_name}_overlay.png"
    cv2.imwrite(str(overlay_path), image)
    
    return overlay_path


def create_manual_review_file(det_shapes, gt_shapes, cx, cy, widths, output_dir, image_name):
    """Create a JSON file for manual review and editing."""
    
    # Prepare ring data for review
    rings_for_review = []
    
    if det_shapes:
        for i, shape in enumerate(det_shapes):
            points = np.array(shape.get('points', []))
            if len(points) > 0:
                distances = np.sqrt((points[:, 0] - cx)**2 + (points[:, 1] - cy)**2)
                rings_for_review.append({
                    'ring_id': i + 1,
                    'source': 'detected',
                    'status': 'confirmed',  # User can change to 'rejected' or 'modified'
                    'mean_radius': round(float(np.mean(distances)), 2),
                    'width_px': widths[i]['width_px'] if i < len(widths) else None,
                    'confidence': 'auto',
                    'notes': '',
                    'points_count': len(points)
                })
    
    # Add missed rings from GT (if available)
    missed_rings = []
    if gt_shapes and det_shapes:
        # Simple matching based on radius
        det_radii = []
        for shape in det_shapes:
            points = np.array(shape.get('points', []))
            if len(points) > 0:
                distances = np.sqrt((points[:, 0] - cx)**2 + (points[:, 1] - cy)**2)
                det_radii.append(np.mean(distances))
        
        for gt_shape in gt_shapes:
            gt_points = np.array(gt_shape.get('points', []))
            if len(gt_points) > 0:
                gt_distances = np.sqrt((gt_points[:, 0] - cx)**2 + (gt_points[:, 1] - cy)**2)
                gt_radius = np.mean(gt_distances)
                
                # Check if this GT ring was detected (within 20px tolerance)
                matched = any(abs(gt_radius - det_r) < 20 for det_r in det_radii)
                
                if not matched:
                    missed_rings.append({
                        'ring_id': f"GT_{gt_shape.get('label', '?')}",
                        'source': 'ground_truth',
                        'status': 'missed',
                        'mean_radius': round(gt_radius, 2),
                        'notes': 'Not detected by CS-TRD',
                        'points_count': len(gt_points)
                    })
    
    review_data = {
        'image': image_name,
        'pith': {'cx': cx, 'cy': cy},
        'timestamp': datetime.now().isoformat(),
        'summary': {
            'detected_rings': len(det_shapes) if det_shapes else 0,
            'ground_truth_rings': len(gt_shapes) if gt_shapes else 0,
            'missed_rings': len(missed_rings),
            'detection_rate': round(len(det_shapes) / len(gt_shapes) * 100, 1) if gt_shapes else None
        },
        'instructions': {
            'status_options': ['confirmed', 'rejected', 'modified', 'added'],
            'how_to_review': [
                "1. Review each ring in 'detected_rings'",
                "2. Change 'status' to 'rejected' if false positive",
                "3. Check 'missed_rings' - these are in GT but not detected",
                "4. Add notes for any issues",
                "5. Save and re-run with --review flag to update"
            ]
        },
        'detected_rings': rings_for_review,
        'missed_rings': missed_rings,
        'user_added_rings': []  # User can add manual rings here
    }
    
    review_path = output_dir / f"{image_name}_review.json"
    with open(review_path, 'w') as f:
        json.dump(review_data, f, indent=2)
    
    return review_path, review_data


def print_banner():
    print("""
╔══════════════════════════════════════════════════════════════════╗
║                       🌲 TreeTrace 🌲                             ║
║            AI-Powered Tree Ring Detection & Analysis             ║
║                    Enhanced Version with GT                       ║
╚══════════════════════════════════════════════════════════════════╝
    """)


def print_review_summary(review_data):
    """Print manual review summary."""
    print(f"\n📋 MANUAL REVIEW FILE CREATED")
    print(f"{'='*50}")
    print(f"   Detected rings:    {review_data['summary']['detected_rings']}")
    print(f"   Ground truth:      {review_data['summary']['ground_truth_rings']}")
    print(f"   Missed rings:      {review_data['summary']['missed_rings']}")
    print(f"   Detection rate:    {review_data['summary']['detection_rate']}%")
    print(f"\n   📝 To manually review:")
    print(f"   1. Open the _review.json file")
    print(f"   2. Change 'status' for any incorrect rings")
    print(f"   3. Add notes for issues found")
    print(f"   4. Add manual rings to 'user_added_rings' if needed")


def main():
    parser = argparse.ArgumentParser(
        description="TreeTrace - Enhanced Tree Ring Detection with GT Comparison",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Basic analysis
  python treetrace.py --image F02a

  # With custom pith
  python treetrace.py --image photo.png --pith 500,600

  # Skip GT comparison
  python treetrace.py --image F02a --no-gt

  # Quick mode (no charts)
  python treetrace.py --image F02a --quick
        """
    )
    
    parser.add_argument("--image", required=True, help="Image path or dataset name (e.g., F02a)")
    parser.add_argument("--pith", help="Pith coordinates as x,y (e.g., 500,600)")
    parser.add_argument("--output", help="Output directory")
    parser.add_argument("--scale", type=float, help="Pixels per mm for conversion")
    parser.add_argument("--no-gt", action="store_true", help="Skip ground truth comparison")
    parser.add_argument("--no-viz", action="store_true", help="Skip visualization generation")
    parser.add_argument("--quick", action="store_true", help="Quick mode - minimal output")
    
    args = parser.parse_args()
    
    print_banner()
    
    # Resolve image path
    image_path = Path(args.image)
    image_name = image_path.stem
    
    if not image_path.exists():
        for ext in ['.png', '.jpg', '.PNG', '.JPG']:
            candidate = PROJECT_ROOT / "01_Raw_Data" / "URuDendro" / "images" / f"{args.image}{ext}"
            if candidate.exists():
                image_path = candidate
                image_name = args.image
                break
    
    if not image_path.exists():
        print(f"❌ Error: Image not found: {args.image}")
        return 1
    
    print(f"📷 Image: {image_path.name}")
    
    # Get pith coordinates
    if args.pith:
        cx, cy = map(int, args.pith.split(','))
    else:
        pith_coords = load_pith_csv()
        if image_name in pith_coords:
            cx, cy = pith_coords[image_name]
        else:
            print(f"❌ Error: No pith coordinates. Use --pith x,y")
            return 1
    
    print(f"🎯 Pith: ({cx}, {cy})")
    
    # Setup output
    if args.output:
        output_dir = Path(args.output)
    else:
        output_dir = OUTPUT_DIR / "treetrace_results" / image_name
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Load ground truth
    gt_data = None
    gt_shapes = None
    if not args.no_gt:
        gt_data = load_ground_truth(image_name)
        if gt_data:
            gt_shapes = gt_data.get('shapes', [])
            print(f"📊 Ground Truth: {len(gt_shapes)} rings")
        else:
            print(f"⚠️  No ground truth available for {image_name}")
    
    # Detect rings
    print(f"\n⏳ Detecting rings...")
    detection = detect_rings(image_path, cx, cy, output_dir)
    
    if not detection or not detection.get('shapes'):
        print(f"\n❌ No rings detected.")
        return 1
    
    det_shapes = detection['shapes']
    det_count = len(det_shapes)
    gt_count = len(gt_shapes) if gt_shapes else 0
    
    print(f"\n✅ Detection Complete!")
    print(f"{'='*55}")
    print(f"🌲 Detected Rings:    {det_count}")
    if gt_count > 0:
        print(f"📊 Ground Truth:      {gt_count}")
        print(f"📈 Detection Rate:    {det_count/gt_count*100:.1f}%")
        print(f"❌ Missed Rings:      {max(0, gt_count - det_count)}")
    print(f"📅 Estimated Age:     ~{det_count} years")
    
    # Calculate widths
    widths, ring_data = calculate_widths(det_shapes, cx, cy)
    
    if widths:
        width_values = [w['width_px'] for w in widths]
        
        print(f"\n📏 Ring Width Statistics:")
        print(f"   Mean:   {np.mean(width_values):.1f} px")
        print(f"   Min:    {np.min(width_values):.1f} px")
        print(f"   Max:    {np.max(width_values):.1f} px")
        print(f"   Median: {np.median(width_values):.1f} px")
        
        if args.scale:
            print(f"\n   📐 With scale ({args.scale} px/mm):")
            print(f"   Mean:   {np.mean(width_values)/args.scale:.2f} mm")
    
    # Generate visualizations
    if not args.no_viz and not args.quick:
        print(f"\n🎨 Generating visualizations...")
        
        # Ring overlay with GT comparison
        overlay_path = create_ring_overlay_comparison(
            image_path, det_shapes, gt_shapes, cx, cy, output_dir, image_name
        )
        print(f"   ✓ Overlay: {overlay_path.name}")
        
        # Full analysis chart
        try:
            viz_path = create_comparison_visualization(
                image_path, det_shapes, gt_shapes, cx, cy, widths, output_dir, image_name
            )
            print(f"   ✓ Full analysis: {viz_path.name}")
        except Exception as e:
            print(f"   ⚠ Chart failed: {e}")
    
    # Create manual review file
    review_path, review_data = create_manual_review_file(
        det_shapes, gt_shapes, cx, cy, widths, output_dir, image_name
    )
    print_review_summary(review_data)
    
    # Save results
    results = {
        'image': str(image_path),
        'image_name': image_name,
        'pith': {'cx': cx, 'cy': cy},
        'detection': {
            'ring_count': det_count,
            'ground_truth_count': gt_count,
            'detection_rate': round(det_count / gt_count * 100, 1) if gt_count > 0 else None,
            'missed_rings': max(0, gt_count - det_count) if gt_count > 0 else None
        },
        'statistics': {
            'mean_width_px': round(np.mean(width_values), 2) if widths else None,
            'min_width_px': round(np.min(width_values), 2) if widths else None,
            'max_width_px': round(np.max(width_values), 2) if widths else None,
            'median_width_px': round(np.median(width_values), 2) if widths else None,
            'std_width_px': round(np.std(width_values), 2) if widths else None,
        },
        'widths': widths,
        'timestamp': datetime.now().isoformat()
    }
    
    results_path = output_dir / "results.json"
    with open(results_path, 'w') as f:
        json.dump(results, f, indent=2)
    
    # Save CSV
    csv_path = output_dir / "ring_widths.csv"
    with open(csv_path, 'w', newline='') as f:
        fieldnames = ['ring', 'width_px', 'radius_px', 'min_radius_px', 'max_radius_px']
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(widths)
    
    print(f"\n📁 Output Files:")
    print(f"   {output_dir}")
    for f in sorted(output_dir.iterdir()):
        size = f.stat().st_size
        size_str = f"{size/1024:.1f}KB" if size > 1024 else f"{size}B"
        print(f"   ├── {f.name} ({size_str})")
    
    print(f"\n{'='*55}")
    print(f"✨ TreeTrace analysis complete!")
    print(f"{'='*55}")
    
    if not args.quick:
        print(f"\n💡 Tips:")
        print(f"   • View overlay:  start \"{output_dir / f'{image_name}_overlay.png'}\"")
        print(f"   • View analysis: start \"{output_dir / f'{image_name}_full_analysis.png'}\"")
        print(f"   • Edit review:   notepad \"{output_dir / f'{image_name}_review.json'}\"")
    
    return 0


if __name__ == "__main__":
    sys.exit(main())