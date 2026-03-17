"""
Storage service — save/load analysis results from 07_Outputs/api_results/
"""
import json
from pathlib import Path
from datetime import datetime
from config import API_RESULTS_DIR


def save_analysis_result(analysis_id: str, result: dict) -> Path:
    """Save full analysis result JSON to disk."""
    result_dir = API_RESULTS_DIR / analysis_id
    result_dir.mkdir(parents=True, exist_ok=True)

    result_path = result_dir / "result.json"
    with open(result_path, 'w') as f:
        json.dump(result, f, indent=2, default=str)

    return result_path


def load_analysis_result(analysis_id: str) -> dict | None:
    """Load a saved analysis result by ID."""
    result_path = API_RESULTS_DIR / analysis_id / "result.json"
    if not result_path.exists():
        return None

    with open(result_path) as f:
        return json.load(f)


def list_all_results() -> list[dict]:
    """
    List all saved analysis results, sorted newest first.
    Returns lightweight summary objects (not full results).
    """
    summaries = []

    if not API_RESULTS_DIR.exists():
        return summaries

    for folder in sorted(API_RESULTS_DIR.iterdir(), reverse=True):
        if not folder.is_dir():
            continue
        result_path = folder / "result.json"
        if not result_path.exists():
            continue

        with open(result_path) as f:
            data = json.load(f)

        # Return only the fields needed for the history page
        summaries.append({
            'id': data.get('id'),
            'image_name': data.get('image_name'),
            'ring_count': data.get('ring_count'),
            'estimated_age': data.get('estimated_age'),
            'health_score': data.get('health', {}).get('score'),
            'health_label': data.get('health', {}).get('label'),
            'f1_score': data.get('metrics', {}).get('f1_score'),
            'processing_time_seconds': data.get('processing_time_seconds'),
            'analyzed_at': data.get('analyzed_at'),
        })

    return summaries


def delete_analysis_result(analysis_id: str) -> bool:
    """Delete a saved analysis result."""
    import shutil
    result_dir = API_RESULTS_DIR / analysis_id
    if result_dir.exists():
        shutil.rmtree(result_dir)
        return True
    return False


def generate_analysis_id(image_name: str) -> str:
    """Generate a unique analysis ID."""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    clean_name = Path(image_name).stem  # Remove extension
    return f"analysis_{timestamp}_{clean_name}"
