"""
Measurement service — wraps existing backend.py calculate_measurements
"""
# backend.py is in Streamlit_App/utils which is on sys.path via config.py
from backend import calculate_measurements as _calculate_measurements

def calculate_ring_measurements(shapes: list, cx: int, cy: int, birth_year: int):
    """
    Calculate ring widths and build the complete rings[] array.
    
    Returns list of ring dicts matching the RingShape schema.
    """
    widths, ring_data = _calculate_measurements(shapes, cx, cy)

    if not widths:
        return [], []

    # Build the rings array with all fields the frontend needs
    rings = []
    for i, (w, rd) in enumerate(zip(widths, ring_data)):
        ring_number = i + 1
        estimated_year = birth_year + i

        rings.append({
            'ring_number': ring_number,
            'label': rd.get('label', str(ring_number)),
            'inner_radius_px': round(w['radius_px'] - w['width_px'], 2),
            'outer_radius_px': round(w['radius_px'], 2),
            'width_px': round(w['width_px'], 2),
            'estimated_year': estimated_year,
            'eccentricity': round(w.get('eccentricity', 0), 4),
            'points': rd['points'].tolist()  # numpy array -> list for JSON
        })

    return rings, widths
