"""
Analysis service — wraps existing analysis.py generate_full_analysis
"""
# analysis.py (TreeTrace analysis, not this file) is in Streamlit_App/utils
# Import it with an alias to avoid name conflict with this file
import importlib.util
from pathlib import Path
from config import STREAMLIT_UTILS

# Load the Streamlit analysis module with a specific name to avoid conflict
spec = importlib.util.spec_from_file_location(
    "streamlit_analysis",
    STREAMLIT_UTILS / "analysis.py"
)
streamlit_analysis = importlib.util.module_from_spec(spec)
spec.loader.exec_module(streamlit_analysis)

def run_full_analysis(widths: list, sampling_year: int) -> dict | None:
    """
    Run the complete analysis pipeline on ring widths.
    
    widths: list of dicts from calculate_measurements 
            [{'ring': 1, 'width_px': 13.5, 'radius_px': 45.2, ...}, ...]
    sampling_year: the year the sample was taken
    
    Returns the full analysis dict from generate_full_analysis
    """
    return streamlit_analysis.generate_full_analysis(widths, current_year=sampling_year)


def compute_moving_averages(width_values: list, window: int = 5) -> list:
    """
    Compute moving averages for the ring width chart overlay.
    Returns list of {ring: int, value: float} dicts.
    """
    import numpy as np
    n = len(width_values)
    results = []
    for i in range(n):
        if i < window // 2 or i >= n - window // 2:
            continue
        window_slice = width_values[max(0, i - window // 2): i + window // 2 + 1]
        results.append({
            'ring': i + 1,
            'value': round(float(np.mean(window_slice)), 2)
        })
    return results
