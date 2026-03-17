"""
TreeTrace - AI-Powered Tree Ring Analysis Platform
Main Application Entry Point
"""

import streamlit as st

st.set_page_config(
    page_title="TreeTrace",
    page_icon="🌲",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS
st.markdown("""
<style>
    .main-title {
        font-size: 3.5rem;
        color: #2E7D32;
        font-weight: bold;
        text-align: center;
    }
    .subtitle {
        font-size: 1.3rem;
        color: #333;
        text-align: center;
        margin-bottom: 30px;
    }
    .feature-card {
        background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
        padding: 25px;
        border-radius: 15px;
        border-left: 6px solid #2E7D32;
        margin-bottom: 20px;
        box-shadow: 2px 2px 10px rgba(0,0,0,0.1);
        color: #333333;
    }
    .feature-card h3 {
        color: #111111;
        margin-top: 0;
    }
    .feature-card p {
        color: #444444;
        margin-bottom: 0;
    }
    .metric-card {
        background: white;
        padding: 20px;
        border-radius: 10px;
        text-align: center;
        box-shadow: 2px 2px 8px rgba(0,0,0,0.1);
        border-top: 4px solid #2E7D32;
    }
    .metric-number {
        font-size: 2.5rem;
        font-weight: bold;
        color: #2E7D32;
    }
    .metric-label {
        font-size: 0.9rem;
        color: #555;
    }
</style>
""", unsafe_allow_html=True)

# Header
st.markdown('<p class="main-title">🌲 TreeTrace</p>', unsafe_allow_html=True)
st.markdown('<p class="subtitle">From Tree Rings to Actionable Intelligence</p>', unsafe_allow_html=True)

# Metrics
col1, col2, col3, col4 = st.columns(4)

for col, number, label in [
    (col1, "91%", "Precision"),
    (col2, "73%", "Recall"),
    (col3, "0.81", "F1 Score"),
    (col4, "27+", "Trees Analyzed")
]:
    with col:
        st.markdown(f"""
        <div class="metric-card">
            <div class="metric-number">{number}</div>
            <div class="metric-label">{label}</div>
        </div>
        """, unsafe_allow_html=True)

st.markdown("---")

# Feature Cards
col1, col2 = st.columns(2)

with col1:
    st.markdown("""
    <div class="feature-card">
        <h3>📷 Ring Detection & Analysis</h3>
        <p>State-of-the-art CS-TRD algorithm detects ring boundaries automatically.
        Measures widths, calculates statistics, and exports data.</p>
    </div>
    """, unsafe_allow_html=True)

    st.markdown("""
    <div class="feature-card">
        <h3>📖 Tree Biography</h3>
        <p>Transform ring data into a narrative life story. Read about
        the tree's birth, growth phases, struggles, and triumphs.</p>
    </div>
    """, unsafe_allow_html=True)

    st.markdown("""
    <div class="feature-card">
        <h3>🌍 Carbon Calculator</h3>
        <p>Estimate how much carbon this tree has stored over its lifetime.
        See equivalents in car kilometers and household energy.</p>
    </div>
    """, unsafe_allow_html=True)

with col2:
    st.markdown("""
    <div class="feature-card">
        <h3>⚠️ Climate Anomaly Detection</h3>
        <p>Automatically identify drought years, frost events, and
        exceptional growth periods from ring width patterns.</p>
    </div>
    """, unsafe_allow_html=True)

    st.markdown("""
    <div class="feature-card">
        <h3>🏥 Tree Health Monitor</h3>
        <p>Get a health score (0-100) based on growth consistency,
        stress resistance, and recovery ability.</p>
    </div>
    """, unsafe_allow_html=True)

    st.markdown("""
    <div class="feature-card">
        <h3>📊 Growth Analysis</h3>
        <p>Interactive charts showing growth history, cumulative radius,
        width distribution, and trend analysis.</p>
    </div>
    """, unsafe_allow_html=True)

st.markdown("---")

# Quick Start
st.subheader("🚀 Quick Start")
st.markdown("""
1. **Navigate to 📷 Analysis Studio** in the sidebar
2. **Select or upload** a tree cross-section image
3. **Set the pith** (center) coordinates
4. **Click Analyze** and explore the results!
""")

st.info("👈 **Select 'Analysis Studio' from the sidebar to begin!**")

# Sidebar
st.sidebar.markdown("### 🌲 TreeTrace")
st.sidebar.markdown("v1.0.0")
st.sidebar.markdown("---")
st.sidebar.markdown("""
**Powered by:**
- CS-TRD (IPOL 2025)
- URuDendro Dataset
- OpenCV + NumPy
""")
st.sidebar.markdown("---")
st.sidebar.markdown("Made with ❤️ for Dendrochronology")