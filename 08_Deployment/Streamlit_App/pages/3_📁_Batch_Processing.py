"""
TreeTrace Batch Processing Page
"""

import streamlit as st
import pandas as pd
from pathlib import Path
import sys
import json
from datetime import datetime

sys.path.insert(0, str(Path(__file__).parent.parent))

from utils.detection import run_cstrd_detection, load_ground_truth, calculate_ring_widths, calculate_statistics
from utils.data_handler import get_sample_images, load_pith_coordinates, get_image_path, save_results

st.set_page_config(page_title="Batch Processing - TreeTrace", page_icon="📁", layout="wide")

st.title("📁 Batch Processing")

st.markdown("""
Process multiple images at once. Only images with known pith coordinates can be processed.
""")

st.markdown("---")

# Load data
sample_images = get_sample_images()
pith_coords = load_pith_coordinates()

# Filter to images with pith coordinates
available_images = [img for img in sample_images if img in pith_coords]

st.info(f"📊 {len(available_images)} images available with pith coordinates")

# Image selection
st.subheader("Select Images")

col1, col2 = st.columns([3, 1])

with col1:
    selected_images = st.multiselect(
        "Choose images to process:",
        available_images,
        default=available_images[:5] if len(available_images) >= 5 else available_images
    )

with col2:
    if st.button("Select All"):
        selected_images = available_images
    if st.button("Clear All"):
        selected_images = []

st.write(f"**Selected:** {len(selected_images)} images")

# Processing
st.markdown("---")

if st.button("🚀 Start Batch Processing", type="primary", disabled=len(selected_images) == 0):
    
    progress_bar = st.progress(0)
    status_text = st.empty()
    
    results_list = []
    
    for i, image_name in enumerate(selected_images):
        status_text.text(f"Processing {image_name}... ({i+1}/{len(selected_images)})")
        
        image_path = get_image_path(image_name)
        cx, cy = pith_coords[image_name]
        
        try:
            # Create output directory
            output_dir = Path(f"temp_batch/{image_name}")
            output_dir.mkdir(parents=True, exist_ok=True)
            
            # Run detection
            detection = run_cstrd_detection(image_path, cx, cy, output_dir)
            
            if detection and detection.get('shapes'):
                shapes = detection['shapes']
                widths, _ = calculate_ring_widths(shapes, cx, cy)
                stats = calculate_statistics(widths)
                
                # Load GT
                gt_data = load_ground_truth(image_name)
                gt_count = len(gt_data.get('shapes', [])) if gt_data else 0
                
                det_count = len(shapes)
                rate = (det_count / gt_count * 100) if gt_count > 0 else None
                
                results_list.append({
                    'Image': image_name,
                    'Detected': det_count,
                    'Ground Truth': gt_count or 'N/A',
                    'Rate (%)': f"{rate:.1f}" if rate else 'N/A',
                    'Mean Width (px)': stats.get('mean_width', 'N/A'),
                    'Status': '✅ Success'
                })
            else:
                results_list.append({
                    'Image': image_name,
                    'Detected': 0,
                    'Ground Truth': 'N/A',
                    'Rate (%)': 'N/A',
                    'Mean Width (px)': 'N/A',
                    'Status': '❌ No rings'
                })
        
        except Exception as e:
            results_list.append({
                'Image': image_name,
                'Detected': 'Error',
                'Ground Truth': 'N/A',
                'Rate (%)': 'N/A',
                'Mean Width (px)': 'N/A',
                'Status': f'❌ {str(e)[:20]}'
            })
        
        progress_bar.progress((i + 1) / len(selected_images))
    
    status_text.text("✅ Batch processing complete!")
    
    # Display results
    st.markdown("---")
    st.subheader("📊 Results")
    
    df = pd.DataFrame(results_list)
    st.dataframe(df, use_container_width=True)
    
    # Summary
    successful = len([r for r in results_list if '✅' in r['Status']])
    failed = len(results_list) - successful
    
    col1, col2, col3 = st.columns(3)
    col1.metric("Total Processed", len(results_list))
    col2.metric("Successful", successful)
    col3.metric("Failed", failed)
    
    # Export
    csv = df.to_csv(index=False)
    st.download_button(
        "📥 Download Results CSV",
        csv,
        file_name=f"batch_results_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv",
        mime="text/csv"
    )