"""
TreeTrace Analysis Studio
Main analysis page with detection, visualization, and insights
"""

import streamlit as st
import numpy as np
import cv2
import json
import tempfile
import pandas as pd
from pathlib import Path
from datetime import datetime
from PIL import Image

import sys
sys.path.insert(0, str(Path(__file__).parent.parent))

from utils.backend import (
    run_detection, calculate_measurements, load_pith_coordinates,
    get_sample_images, get_image_path, load_ground_truth, save_results
)
from utils.analysis import generate_full_analysis
from utils.visualization import (
    create_ring_overlay, create_width_chart, create_growth_chart as create_growth_curve,
    create_distribution_chart, create_anomaly_chart, create_health_gauge,
    create_carbon_chart
)

st.set_page_config(page_title="Analysis Studio - TreeTrace", page_icon="📷", layout="wide")

# Initialize session state
for key in ['results', 'analysis', 'image_path', 'image_name', 'pith_x', 'pith_y']:
    if key not in st.session_state:
        st.session_state[key] = None

# ========================================
# SIDEBAR: Image & Pith Selection
# ========================================
st.sidebar.header("📁 Image Selection")

image_source = st.sidebar.radio("Source:", ["Sample Dataset", "Upload Image"])

image = None
image_path_resolved = None

if image_source == "Sample Dataset":
    sample_images = get_sample_images()
    pith_coords = load_pith_coordinates()

    selected = st.sidebar.selectbox("Select image:", sample_images)

    if selected:
        image_path_resolved = get_image_path(selected)
        if image_path_resolved:
            image = cv2.imread(str(image_path_resolved))
            image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            st.session_state.image_name = selected
            st.session_state.image_path = str(image_path_resolved)

            if selected in pith_coords:
                auto_cx, auto_cy = pith_coords[selected]
                st.sidebar.info(f"📍 Dataset pith: ({auto_cx}, {auto_cy})")
                if st.sidebar.button("✅ Use Dataset Pith"):
                    st.session_state.pith_x = auto_cx
                    st.session_state.pith_y = auto_cy

else:
    uploaded = st.sidebar.file_uploader("Upload image:", type=['png', 'jpg', 'jpeg'])
    if uploaded:
        tfile = tempfile.NamedTemporaryFile(delete=False, suffix=".png")
        tfile.write(uploaded.read())
        tfile.flush()

        image_path_resolved = Path(tfile.name)
        image = cv2.imread(str(image_path_resolved))
        image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        st.session_state.image_name = Path(uploaded.name).stem
        st.session_state.image_path = str(image_path_resolved)

# Pith coordinates
st.sidebar.header("🎯 Pith Coordinates")
col1, col2 = st.sidebar.columns(2)
with col1:
    input_x = st.number_input("X:", min_value=0, value=st.session_state.pith_x or 0, step=1)
with col2:
    input_y = st.number_input("Y:", min_value=0, value=st.session_state.pith_y or 0, step=1)

if st.sidebar.button("🎯 Set Pith"):
    st.session_state.pith_x = int(input_x)
    st.session_state.pith_y = int(input_y)

if st.session_state.pith_x and st.session_state.pith_y:
    st.sidebar.success(f"✅ Pith: ({st.session_state.pith_x}, {st.session_state.pith_y})")

# ========================================
# MAIN CONTENT
# ========================================
st.title("📷 Analysis Studio")

if image is not None:
    # Preview with pith marker
    col1, col2 = st.columns([2, 1])

    with col1:
        st.markdown("### 🎯 Pith Selection")
        st.markdown("Click on the image to set the pith, or use the exact coordinates in the sidebar.")
        
        display = image.copy()
        if st.session_state.pith_x and st.session_state.pith_y:
            cv2.circle(display, (st.session_state.pith_x, st.session_state.pith_y), 15, (0, 255, 0), -1)
            cv2.circle(display, (st.session_state.pith_x, st.session_state.pith_y), 17, (255, 255, 255), 2)
            
        # Use Plotly for image display to capture clicks
        import plotly.express as px
        fig = px.imshow(display)
        fig.update_layout(
            margin=dict(l=0, r=0, t=0, b=0),
            coloraxis_showscale=False,
            xaxis=dict(showticklabels=False, visible=False),
            yaxis=dict(showticklabels=False, visible=False),
            hovermode=False,
            dragmode="pan"
        )
        
        # Capture selection events
        evt = st.plotly_chart(fig, width="stretch", on_select="rerun", selection_mode=("points"))
        
        # Process click
        if evt and evt.get("selection") and evt["selection"].get("points"):
            points = evt["selection"]["points"]
            if len(points) > 0:
                pt = points[0]
                clicked_x = int(pt["x"])
                clicked_y = int(pt["y"])
                
                # Update session state if it changed
                if clicked_x != st.session_state.pith_x or clicked_y != st.session_state.pith_y:
                    st.session_state.pith_x = clicked_x
                    st.session_state.pith_y = clicked_y
                    st.rerun()

    with col2:
        st.markdown("### 🔬 Controls")

        can_analyze = (
            st.session_state.pith_x is not None and
            st.session_state.pith_y is not None and
            st.session_state.pith_x > 0 and
            st.session_state.pith_y > 0
        )

        if not can_analyze:
            st.warning("⚠️ Set pith coordinates first!")

        if st.button("🚀 Analyze Rings", disabled=not can_analyze, type="primary", width="stretch"):
            with st.spinner("🔍 Detecting rings with CS-TRD... (this may take 1-2 minutes)"):
                out_dir = Path(tempfile.mkdtemp())
                detection = run_detection(
                    st.session_state.image_path,
                    st.session_state.pith_x,
                    st.session_state.pith_y,
                    out_dir
                )

                if detection and detection.get('shapes'):
                    shapes = detection['shapes']
                    widths, ring_data = calculate_measurements(
                        shapes, st.session_state.pith_x, st.session_state.pith_y
                    )
                    analysis = generate_full_analysis(widths)

                    # Load GT
                    gt_data = load_ground_truth(st.session_state.image_name)
                    gt_shapes = gt_data.get('shapes', []) if gt_data else []

                    st.session_state.results = {
                        'image_name': st.session_state.image_name,
                        'pith': {'cx': st.session_state.pith_x, 'cy': st.session_state.pith_y},
                        'shapes': shapes,
                        'gt_shapes': gt_shapes,
                        'widths': widths,
                        'ring_data': ring_data,
                        'timestamp': datetime.now().isoformat()
                    }
                    st.session_state.analysis = analysis

                    st.success(f"✅ Detected **{len(shapes)}** rings!")
                else:
                    st.error("❌ No rings detected. Try adjusting pith location.")

        # Quick stats
        if st.session_state.analysis:
            a = st.session_state.analysis
            st.metric("🌲 Rings", a['summary']['ring_count'])
            st.metric("📅 Est. Age", f"~{a['summary']['estimated_age']} years")
            st.metric("🏥 Health", f"{a['health']['score']}/100 {a['health']['emoji']}")

    # ========================================
    # RESULTS TABS
    # ========================================
    if st.session_state.results and st.session_state.analysis:
        st.markdown("---")

        results = st.session_state.results
        analysis = st.session_state.analysis
        widths = results['widths']
        ring_data = results['ring_data']
        birth_year = analysis['summary']['birth_year']

        tabs = st.tabs([
            "📖 Biography",
            "🖼️ Ring Overlay",
            "📊 Growth Charts",
            "⚠️ Anomalies",
            "🏥 Health",
            "🌍 Carbon",
            "📏 Data & Export"
        ])

        # TAB 1: Biography
        with tabs[0]:
            st.markdown(analysis['biography'])

        # TAB 2: Ring Overlay
        with tabs[1]:
            col1, col2 = st.columns(2)

            with col1:
                st.markdown("### Detected Rings")
                overlay = create_ring_overlay(
                    image,
                    ring_data,
                    results['pith']['cx'],
                    results['pith']['cy']
                )
                if overlay is not None:
                    st.image(overlay, width="stretch")

            with col2:
                st.markdown("### With Ground Truth (Blue)")
                gt_overlay = create_ring_overlay(
                    image,
                    ring_data,
                    results['pith']['cx'],
                    results['pith']['cy'],
                    results['gt_shapes']
                )
                if gt_overlay is not None:
                    st.image(gt_overlay, width="stretch")

                gt_count = len(results['gt_shapes'])
                det_count = len(results['shapes'])
                if gt_count > 0:
                    st.info(f"Detected: {det_count} | Ground Truth: {gt_count} | "
                            f"Rate: {det_count / gt_count * 100:.0f}%")

        # TAB 3: Growth Charts
        with tabs[2]:
            col1, col2 = st.columns(2)

            with col1:
                fig = create_width_chart(widths, birth_year)
                if fig:
                    st.plotly_chart(fig, width="stretch")

            with col2:
                fig = create_growth_curve(widths, birth_year)
                if fig:
                    st.plotly_chart(fig, width="stretch")

            fig = create_distribution_chart(widths)
            if fig:
                st.plotly_chart(fig, width="stretch")

        # TAB 4: Anomalies
        with tabs[3]:
            st.markdown("### ⚠️ Climate Anomaly Detection")

            fig = create_anomaly_chart(widths, analysis['anomalies'], birth_year)
            if fig:
                st.plotly_chart(fig, width="stretch")

            if analysis['anomalies']:
                st.markdown("### Detected Events")
                for a in analysis['anomalies']:
                    st.markdown(f"{a['emoji']} **Year {a['year']}** (Ring {a['ring']}): "
                                f"**{a['label']}** — {a['interpretation']} "
                                f"(Width: {a['width']} px, Deviation: {a['deviation']}σ)")
            else:
                st.success("No significant anomalies detected! Very stable growth.")

        # TAB 5: Health
        with tabs[4]:
            col1, col2 = st.columns(2)

            with col1:
                st.markdown("### 🏥 Overall Health Assessment")
                fig = create_health_gauge(analysis['health']['score'])
                st.plotly_chart(fig, width="stretch")
                st.markdown(f"**{analysis['health']['emoji']} {analysis['health']['label']}**: "
                            f"{analysis['health']['detail']}")

            with col2:
                st.markdown("### 📊 Health Components")
                components = analysis['health']['components']

                for name, score in components.items():
                    label = name.replace('_', ' ').title()
                    color = "green" if score >= 70 else "orange" if score >= 50 else "red"
                    st.markdown(f"**{label}:** {score}/100")
                    st.progress(score / 100)

            st.markdown("### 📈 Growth Trend")
            trend = analysis['trend']
            st.markdown(f"{trend['emoji']} **{trend['direction']}**: {trend['interpretation']}")
            st.markdown(f"- Early growth: {trend['early_growth']:.1f} px/year")
            st.markdown(f"- Late growth: {trend['late_growth']:.1f} px/year")
            st.markdown(f"- Change: {trend['change_percent']:+.1f}%")

            if analysis['phases']:
                st.markdown("### 🌱 Growth Phases")
                for phase in analysis['phases']:
                    st.markdown(f"**{phase['name']}** ({phase['years']}): "
                                f"{phase['avg_width']} px/year — {phase['description']}")

        # TAB 6: Carbon
        with tabs[5]:
            col1, col2 = st.columns(2)

            with col1:
                st.markdown("### 🌍 Carbon Storage Estimate")
                carbon = analysis['carbon']

                fig = create_carbon_chart(carbon)
                st.plotly_chart(fig, width="stretch")

            with col2:
                st.markdown("### 🚗 Real-World Equivalents")
                st.markdown(f"This tree has stored approximately:")
                st.metric("CO₂ Absorbed", f"{carbon['co2_equivalent_kg']:.1f} kg")
                st.metric("🚗 Car Driving Offset", f"{carbon['car_km_offset']:.0f} km")
                st.caption(carbon['note'])

        # TAB 7: Data & Export
        with tabs[6]:
            st.markdown("### 📏 Ring Width Data")

            df = pd.DataFrame(widths)
            st.dataframe(df, width="stretch")

            col1, col2, col3 = st.columns(3)

            with col1:
                csv_data = df.to_csv(index=False)
                st.download_button("📥 Download CSV", csv_data,
                                   f"{results['image_name']}_widths.csv", "text/csv")

            with col2:
                export_data = {
                    'image': results['image_name'],
                    'pith': results['pith'],
                    'analysis': analysis,
                    'widths': widths,
                    'timestamp': results['timestamp']
                }
                json_data = json.dumps(export_data, indent=2, default=str)
                st.download_button("📥 Download JSON", json_data,
                                   f"{results['image_name']}_analysis.json", "application/json")

            with col3:
                report = analysis['biography']
                st.download_button("📥 Download Report", report,
                                   f"{results['image_name']}_biography.md", "text/markdown")

            st.markdown("### 📊 Statistics Summary")
            st.json(analysis['statistics'])

            # Save to project
            if st.button("💾 Save to TreeTrace Project"):
                save_dir = save_results(results['image_name'], {
                    'analysis': analysis, 'widths': widths,
                    'pith': results['pith'], 'timestamp': results['timestamp']
                })
                st.success(f"✅ Saved to {save_dir}")

else:
    st.info("👈 Select an image from the sidebar to begin analysis.")