"""
Data handling utilities for TreeTrace Streamlit app
"""

import json
import csv
import shutil
from pathlib import Path
from datetime import datetime
import pandas as pd

PROJECT_ROOT = Path(__file__).parent.parent.parent.parent


def get_sample_images():
    """Get list of sample images from dataset."""
    image_dir = PROJECT_ROOT / "01_Raw_Data" / "URuDendro" / "images"
    images = []
    
    if image_dir.exists():
        for ext in ['*.png', '*.jpg', '*.PNG', '*.JPG']:
            images.extend(image_dir.glob(ext))
    
    return sorted([img.stem for img in images])


def load_pith_coordinates():
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


def get_image_path(image_name):
    """Get full path for an image."""
    image_dir = PROJECT_ROOT / "01_Raw_Data" / "URuDendro" / "images"
    
    for ext in ['.png', '.jpg', '.PNG', '.JPG']:
        path = image_dir / f"{image_name}{ext}"
        if path.exists():
            return path
    return None


def save_results(image_name, results, output_dir=None):
    """Save analysis results."""
    if output_dir is None:
        output_dir = PROJECT_ROOT / "07_Outputs" / "streamlit_results" / image_name
    
    output_dir = Path(output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Save JSON
    json_path = output_dir / "results.json"
    with open(json_path, 'w') as f:
        json.dump(results, f, indent=2, default=str)
    
    # Save CSV of widths
    if 'widths' in results and results['widths']:
        csv_path = output_dir / "ring_widths.csv"
        df = pd.DataFrame(results['widths'])
        df.to_csv(csv_path, index=False)
    
    return output_dir


def load_previous_results():
    """Load list of previous analysis results."""
    results_dir = PROJECT_ROOT / "07_Outputs" / "streamlit_results"
    results = []
    
    if results_dir.exists():
        for folder in results_dir.iterdir():
            if folder.is_dir():
                json_path = folder / "results.json"
                if json_path.exists():
                    with open(json_path) as f:
                        data = json.load(f)
                    results.append({
                        'name': folder.name,
                        'path': folder,
                        'data': data
                    })
    
    return sorted(results, key=lambda x: x['name'])


def export_to_csv(results, output_path):
    """Export results to CSV."""
    df = pd.DataFrame(results['widths'])
    df.to_csv(output_path, index=False)
    return output_path


def export_to_json(results, output_path):
    """Export results to JSON."""
    with open(output_path, 'w') as f:
        json.dump(results, f, indent=2, default=str)
    return output_path