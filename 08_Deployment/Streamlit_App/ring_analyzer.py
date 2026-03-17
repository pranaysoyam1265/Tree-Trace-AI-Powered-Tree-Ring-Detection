"""
Ring Width Measurement Module - ROBUST VERSION
Uses Probability Map Peaks instead of Binary Masks
"""

import numpy as np
import cv2
from scipy import ndimage
from scipy.signal import find_peaks
import matplotlib.pyplot as plt


def find_center_prob(prob_map):
    """
    Find center (pith) using the probability map weighting.
    The center usually has a distinct texture or is surrounded by rings.
    """
    # Smooth the map
    blurred = cv2.GaussianBlur(prob_map, (15, 15), 0)
    
    # Find the centroid of the active region
    M = cv2.moments((blurred > 0.2).astype(np.uint8))
    
    if M["m00"] > 0:
        cx = int(M["m10"] / M["m00"])
        cy = int(M["m01"] / M["m00"])
        return (cx, cy)
    
    h, w = prob_map.shape
    return (w // 2, h // 2)


def sample_radial_profiles(prob_map, center, num_angles=12):
    """
    Extract profiles from center to edge at multiple angles.
    """
    h, w = prob_map.shape
    cx, cy = center
    max_radius = min(cx, cy, w - cx, h - cy)
    
    profiles = []
    
    # Scan 12 directions (every 30 degrees)
    for angle_deg in np.linspace(0, 360, num_angles, endpoint=False):
        angle_rad = np.deg2rad(angle_deg)
        
        # Coordinates line
        x0, y0 = cx, cy
        x1 = int(cx + max_radius * np.cos(angle_rad))
        y1 = int(cy + max_radius * np.sin(angle_rad))
        
        # Extract line profile
        # Use num_points = max_radius to preserve pixel resolution
        x_coords = np.linspace(x0, x1, max_radius)
        y_coords = np.linspace(y0, y1, max_radius)
        
        # Bilinear interpolation for smooth sampling
        profile = ndimage.map_coordinates(prob_map, [y_coords, x_coords], order=1)
        profiles.append(profile)
        
    return profiles


def detect_peaks_robust(profiles):
    """
    Find peaks (rings) that appear consistently across multiple angles.
    """
    all_peaks = []
    
    # Analyze each profile
    for profile in profiles:
        # Smooth profile to remove noise
        smoothed = ndimage.gaussian_filter1d(profile, sigma=1.0)
        
        # Find peaks
        # height=0.3: Minimum probability to consider a ring (adjust if needed)
        # distance=3: Minimum pixels between rings
        # prominence=0.05: Peak must stick out from surrounding
        peaks, _ = find_peaks(smoothed, height=0.2, distance=3, prominence=0.02)
        all_peaks.append(peaks)
    
    # We need to find the "median" count and typical locations
    counts = [len(p) for p in all_peaks]
    median_count = int(np.median(counts))
    
    # Find the "best" profile (the one closest to median count)
    best_idx = np.argmin([abs(c - median_count) for c in counts])
    best_peaks = all_peaks[best_idx]
    
    return best_peaks, profiles[best_idx]


def analyze_rings(prob_map, binary_mask=None, pixel_per_mm=None):
    """
    Main function: Analyze rings using probability peaks.
    
    Args:
        prob_map: Float array (0.0-1.0) from model prediction.
        binary_mask: Optional, used for visualization limits.
    """
    # 1. Find Center
    center = find_center_prob(prob_map)
    
    # 2. Get Radial Profiles (from center outward)
    profiles = sample_radial_profiles(prob_map, center)
    
    # 3. Detect Peaks (The Rings)
    peak_indices, best_profile = detect_peaks_robust(profiles)
    
    # 4. Calculate Widths
    # Distance between peaks = ring width
    widths_pixels = np.diff(peak_indices).tolist() if len(peak_indices) > 1 else []
    
    # Convert to mm
    widths_mm = [w / pixel_per_mm for w in widths_pixels] if pixel_per_mm else None
    
    # 5. Statistics
    count = len(widths_pixels)
    if count > 0:
        stats = {
            "count": count,
            "mean": np.mean(widths_pixels),
            "std": np.std(widths_pixels),
            "min": np.min(widths_pixels),
            "max": np.max(widths_pixels),
            "total_radius": peak_indices[-1] - peak_indices[0],
        }
        
        # Trend
        if count >= 4:
            half = count // 2
            early = np.mean(widths_pixels[:half])
            late = np.mean(widths_pixels[half:])
            if late > early * 1.1: stats["trend"] = "Increasing ↑"
            elif late < early * 0.9: stats["trend"] = "Decreasing ↓"
            else: stats["trend"] = "Stable →"
        else:
            stats["trend"] = "N/A"
    else:
        stats = {"count": 0, "mean": 0, "std": 0, "min": 0, "max": 0, "total_radius": 0, "trend": "N/A"}
    
    # 6. Anomalies
    anomalies = detect_anomalies(widths_pixels)
    
    return {
        "center": center,
        "ring_radii": peak_indices,  # Distances from center
        "widths_pixels": widths_pixels,
        "widths_mm": widths_mm,
        "stats": stats,
        "anomalies": anomalies
    }


def detect_anomalies(widths, threshold_std=1.5):
    """Detect anomalous rings"""
    if len(widths) < 5: return []
    
    mean = np.mean(widths)
    std = np.std(widths)
    
    anomalies = []
    for i, w in enumerate(widths):
        z = (w - mean) / (std + 1e-6)
        if z < -threshold_std:
            anomalies.append({
                "ring": i+1, "type": "narrow", "width": w,
                "message": f"Ring {i+1}: Narrow ({w:.1f}px)"
            })
        elif z > threshold_std:
            anomalies.append({
                "ring": i+1, "type": "wide", "width": w,
                "message": f"Ring {i+1}: Wide ({w:.1f}px)"
            })
    return anomalies


def create_growth_chart(widths, title="Ring Widths"):
    fig, ax = plt.subplots(figsize=(10, 3))
    if not widths: return fig
    
    ax.bar(range(1, len(widths)+1), widths, color='teal', alpha=0.7)
    ax.plot(range(1, len(widths)+1), widths, color='black', alpha=0.3)
    ax.set_xlabel("Ring Number")
    ax.set_ylabel("Width (px)")
    ax.set_title(title)
    plt.tight_layout()
    return fig


def create_radial_visualization(image, center, ring_radii):
    """Draw simple circles for detected rings"""
    vis = image.copy()
    if len(vis.shape) == 2: vis = cv2.cvtColor(vis, cv2.COLOR_GRAY2RGB)
    
    # Draw center
    cv2.circle(vis, center, 4, (255, 0, 0), -1)
    
    # Draw rings
    for r in ring_radii:
        cv2.circle(vis, center, int(r), (0, 255, 0), 1)
        
    return vis


def export_to_csv(analysis_result):
    lines = ["Ring_Number,Width_Pixels,Status"]
    widths = analysis_result["widths_pixels"]
    anomalies = {a["ring"]: a["type"] for a in analysis_result["anomalies"]}
    
    for i, w in enumerate(widths):
        status = anomalies.get(i+1, "Normal")
        lines.append(f"{i+1},{w:.2f},{status}")
        
    return "\n".join(lines)