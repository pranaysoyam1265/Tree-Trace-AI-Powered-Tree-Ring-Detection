"""
TreeTrace Settings Page
"""

import streamlit as st
from pathlib import Path

st.set_page_config(page_title="Settings - TreeTrace", page_icon="⚙️", layout="wide")

st.title("⚙️ Settings & About")

st.markdown("---")

tab1, tab2, tab3 = st.tabs(["🔧 Configuration", "ℹ️ About", "📋 System Info"])

with tab1:
    st.subheader("🔬 Detection Parameters")
    st.markdown("Adjust CS-TRD parameters for detection. Default values work well for most images.")

    col1, col2 = st.columns(2)

    with col1:
        st.slider("Sigma (Edge Smoothing)", 1.0, 10.0, 3.0, 0.5,
                  help="Higher = smoother edges, fewer false detections")
        st.slider("Threshold Low", 1, 20, 5,
                  help="Lower edge detection threshold")
        st.slider("Threshold High", 5, 50, 20,
                  help="Upper edge detection threshold")

    with col2:
        st.slider("Number of Rays", 180, 720, 360, 30,
                  help="More rays = finer detection but slower")
        st.slider("Alpha (Angle)", 10, 60, 30, 5,
                  help="Angular filtering parameter")
        st.slider("Min Chain Length", 1, 10, 2,
                  help="Minimum edge chain length to consider")

    st.info("⚠️ Parameter changes will take effect on the next analysis run.")

with tab2:
    st.markdown("""
    ## 🌲 TreeTrace
    **Version:** 1.0.0
    
    **Purpose:** AI-powered tree ring detection and dendrochronological analysis platform.
    
    ---
    
    ### 🔬 Core Technology
    
    **CS-TRD** (Cross-Section Tree Ring Detection)
    - Authors: Marichal, Passarella, Randall
    - Published: Image Processing On Line (IPOL), 2025
    - [Paper](https://www.ipol.im/pub/pre/485/)
    
    ### 📊 Dataset
    
    **URuDendro** - Tree ring benchmark dataset
    - 64 tree cross-section images (Pinus taeda)
    - Ground truth annotations
    - Pith coordinates
    
    ### 📈 Performance
    
    | Metric | Score |
    |---|---|
    | Precision | 91% |
    | Recall | 73% |
    | F1 Score | 0.81 |
    | RMSE | 3.47 px |
    
    ### 🏆 Novel Features
    
    1. **Tree Biography** - Narrative life story generation
    2. **Climate Anomaly Detection** - Automatic stress event identification
    3. **Health Scoring** - Quantitative tree health assessment
    4. **Carbon Calculator** - CO₂ storage estimation
    5. **Growth Phase Analysis** - Developmental stage identification
    
    ---
    
    ### 📄 Citation
    
    ```
    @software{treetrace2024,
      title={TreeTrace: AI-Powered Tree Ring Detection Platform},
      year={2024},
      note={Powered by CS-TRD (IPOL 2025)}
    }
    ```
    """)

with tab3:
    st.subheader("📋 System Information")

    PROJECT_ROOT = Path(r"C:\Users\prana\OneDrive\Desktop\TreeTrace")

    paths = {
        "Project Root": str(PROJECT_ROOT),
        "CS-TRD": r"C:\Users\prana\OneDrive\Desktop\cstrd_ipol",
        "UruDendro": r"C:\Users\prana\OneDrive\Desktop\uruDendro-main",
        "Images": str(PROJECT_ROOT / "01_Raw_Data" / "URuDendro" / "images"),
        "Results": str(PROJECT_ROOT / "07_Outputs" / "streamlit_results"),
    }

    for name, path in paths.items():
        exists = Path(path).exists()
        status = "✅" if exists else "❌"
        st.text(f"{status} {name}: {path}")

    st.markdown("---")
    st.markdown("Made with ❤️ for Dendrochronology")