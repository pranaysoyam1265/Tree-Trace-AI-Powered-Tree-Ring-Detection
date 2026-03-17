"""
Integration module for radial ring counting in Streamlit app.
"""

import numpy as np
import torch
import cv2
import sys
from pathlib import Path

# Add project root and 09_Scripts to path
app_dir = Path(__file__).parent
PROJECT_ROOT = app_dir.parent.parent
sys.path.insert(0, str(PROJECT_ROOT))
sys.path.insert(0, str(PROJECT_ROOT / "09_Scripts"))

from radial_ring_counter import RadialRingCounter, RingCountResult

def count_rings_from_probmap(
    prob_map: np.ndarray,
    pith_location: tuple = None,
    params: dict = None
) -> RingCountResult:
    """
    Wrapper for Streamlit app to count rings from probability map.
    
    Args:
        prob_map: Probability map from segmentation (H, W), values 0-1
        pith_location: Optional (x, y) pith center
        params: Optional parameter overrides
        
    Returns:
        RingCountResult object
    """
    # Default parameters (tuned for your model)
    default_params = {
        'num_rays': 360,
        'min_ring_distance_px': 3,
        'peak_prominence': 0.05,
        'smoothing_window': 5,
        'consistency_threshold': 0.5,
        'edge_margin_px': 10,
        'prob_threshold': 0.1
    }
    
    if params:
        default_params.update(params)
    
    counter = RadialRingCounter(**default_params)
    
    result = counter.count_rings(
        prob_map,
        pith_location=pith_location,
        return_details=True
    )
    
    return result

def draw_ring_overlay(
    image: np.ndarray,
    result: RingCountResult,
    ring_color: tuple = (0, 255, 0),
    pith_color: tuple = (255, 0, 0)
) -> np.ndarray:
    """
    Draw detected rings on image.
    
    Args:
        image: Original image (H, W, 3)
        result: RingCountResult from counting
        ring_color: BGR color for rings
        pith_color: BGR color for pith marker
        
    Returns:
        Image with ring overlay
    """
    overlay = image.copy()
    
    if result.pith_location is None:
        return overlay
        
    cx, cy = result.pith_location
    
    # Draw rings
    for pos in result.ring_positions:
        radius = int(pos)
        cv2.circle(overlay, (cx, cy), radius, ring_color, 1)
    
    # Draw pith
    cv2.circle(overlay, (cx, cy), 5, pith_color, -1)
    cv2.circle(overlay, (cx, cy), 7, pith_color, 1)
    
    return overlay
