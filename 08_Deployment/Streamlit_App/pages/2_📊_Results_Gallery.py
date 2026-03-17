"""
TreeTrace Results Gallery
Browse and compare previous analyses
"""

import streamlit as st
import json
import pandas as pd
from pathlib import Path

import sys
sys.path.insert(0, str(Path(__file__).parent.parent))
from utils.backend import load_saved_results
from utils.visualization import create_width_chart, create_growth_chart as create_growth_curve

st.set_page_config(page_title="Results Gallery - TreeTrace", page_icon="📊", layout="wide")

st.title("📊 Results Gallery")
st.markdown("Browse and compare previous analyses.")

st.markdown("---")

results = load_saved_results()

if not results:
    st.info("No saved results yet. Run an analysis in the Analysis Studio first!")
else:
    st.success(f"📁 Found {len(results)} saved analyses")

    # Create summary table
    summary_data = []
    for r in results:
        data = r['data']
        analysis = data.get('analysis', {})
        summary = analysis.get('summary', {})
        health = analysis.get('health', {})

        summary_data.append({
            'Image': r['name'],
            'Rings': summary.get('ring_count', 'N/A'),
            'Age (years)': summary.get('estimated_age', 'N/A'),
            'Mean Width (px)': summary.get('mean_width_px', 'N/A'),
            'Health Score': health.get('score', 'N/A'),
            'Health': health.get('label', 'N/A'),
            'Trend': analysis.get('trend', {}).get('direction', 'N/A')
        })

    df = pd.DataFrame(summary_data)
    st.dataframe(df, width="stretch")

    st.markdown("---")

    # Detail view
    selected = st.selectbox("Select analysis to view:", [r['name'] for r in results])
    selected_result = next((r for r in results if r['name'] == selected), None)

    if selected_result:
        data = selected_result['data']
        analysis = data.get('analysis', {})
        widths = data.get('widths', [])

        col1, col2, col3, col4 = st.columns(4)
        summary = analysis.get('summary', {})
        health = analysis.get('health', {})

        col1.metric("🌲 Rings", summary.get('ring_count', 'N/A'))
        col2.metric("📏 Mean Width", f"{summary.get('mean_width_px', 0):.1f} px")
        col3.metric("🏥 Health", f"{health.get('score', 'N/A')}/100")
        col4.metric("📈 Trend", analysis.get('trend', {}).get('direction', 'N/A'))

        tab1, tab2, tab3 = st.tabs(["📊 Charts", "📖 Biography", "📏 Data"])

        with tab1:
            if widths:
                col1, col2 = st.columns(2)
                with col1:
                    fig = create_width_chart(widths)
                    if fig:
                        st.plotly_chart(fig, width="stretch")
                with col2:
                    fig = create_growth_curve(widths)
                    if fig:
                        st.plotly_chart(fig, width="stretch")

        with tab2:
            bio = analysis.get('biography', 'No biography available.')
            st.markdown(bio)

        with tab3:
            if widths:
                st.dataframe(pd.DataFrame(widths), width="stretch")
            st.markdown("### Full Analysis")
            st.json(analysis)