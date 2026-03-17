"""
TreeTrace Ring Analysis App - V2 with Working Ring Counter
"""

import streamlit as st
import numpy as np
import cv2
import torch
from pathlib import Path
import sys
import matplotlib.pyplot as plt

# Add project paths
PROJECT_ROOT = Path(__file__).parent.parent.parent
sys.path.append(str(PROJECT_ROOT))
sys.path.append(str(PROJECT_ROOT / '09_Scripts'))
sys.path.append(str(PROJECT_ROOT / '06_ML_Core'))

# Import modules
from radial_ring_counter_v2 import RadialRingCounterV2, RadialRingVisualizerV2
from models.segmenter import SimpleUNet


# Page config
st.set_page_config(
    page_title="TreeTrace - Ring Analysis",
    page_icon="🌲",
    layout="wide"
)

# Title
st.title("🌲 TreeTrace - Tree Ring Analysis")
st.markdown("Upload a tree cross-section image to detect and count rings.")


@st.cache_resource
def load_model():
    """Load segmentation model (cached)."""
    model_path = PROJECT_ROOT / '05_Models' / 'Segmentation_v2' / 'segmenter_v2_best.pth'
    
    device = 'cuda' if torch.cuda.is_available() else 'cpu'
    
    checkpoint = torch.load(str(model_path), map_location=device, weights_only=False)
    state_dict = checkpoint['model_state_dict'] if 'model_state_dict' in checkpoint else checkpoint
    
    model = SimpleUNet(in_channels=3, out_channels=1, base_c=32)
    try:
        model.load_state_dict(state_dict)
    except RuntimeError:
        model = SimpleUNet(in_channels=3, out_channels=1, base_c=64)
        model.load_state_dict(state_dict)
    
    model.to(device)
    model.eval()
    
    return model, device


@st.cache_resource
def get_ring_counter():
    """Get ring counter instance (cached)."""
    return RadialRingCounterV2(
        num_rays=360,
        min_ring_distance_px=2,
        peak_prominence=0.01,
        consistency_threshold=0.25,
        prob_threshold=0.02,
        auto_invert=True
    )


def process_image(image_rgb, model, device, counter, pith_location=None):
    """Run segmentation and ring counting."""
    
    # Resize to model input
    image_resized = cv2.resize(image_rgb, (256, 256))
    
    # Run segmentation
    tensor = torch.from_numpy(image_resized).float().permute(2, 0, 1) / 255.0
    tensor = tensor.unsqueeze(0).to(device)
    
    with torch.no_grad():
        output = model(tensor)
        prob_map = torch.sigmoid(output).squeeze().cpu().numpy()
    
    # Count rings
    result = counter.count_rings(
        prob_map,
        pith_location=pith_location,
        return_details=True
    )
    
    return image_resized, prob_map, result


def create_overlay(image, result, prob_map):
    """Create visualization overlay."""
    overlay = image.copy()
    cx, cy = result.pith_location
    
    # Draw rings
    for i, pos in enumerate(result.ring_positions):
        radius = int(pos)
        # Color gradient
        green = int(255 * (1 - i / max(len(result.ring_positions), 1)))
        cv2.circle(overlay, (cx, cy), radius, (0, 255, green), 2)
    
    # Draw pith
    cv2.circle(overlay, (cx, cy), 5, (255, 0, 0), -1)
    cv2.circle(overlay, (cx, cy), 7, (255, 0, 0), 2)
    
    return overlay


# Sidebar
st.sidebar.header("⚙️ Settings")

# Pith location control
st.sidebar.subheader("Pith Location")
auto_pith = st.sidebar.checkbox("Auto-detect pith", value=True)

if not auto_pith:
    pith_x = st.sidebar.slider("Pith X", 0, 255, 128)
    pith_y = st.sidebar.slider("Pith Y", 0, 255, 128)
else:
    pith_x, pith_y = None, None

# Advanced parameters
with st.sidebar.expander("Advanced Parameters"):
    min_distance = st.slider("Min ring distance (px)", 1, 10, 2)
    prominence = st.slider("Peak prominence", 0.005, 0.05, 0.01, 0.005)
    consistency = st.slider("Consistency threshold", 0.1, 0.5, 0.25, 0.05)


# Main content
uploaded_file = st.file_uploader(
    "Upload tree cross-section image",
    type=['png', 'jpg', 'jpeg', 'tif', 'tiff']
)

if uploaded_file is not None:
    # Load image
    file_bytes = np.asarray(bytearray(uploaded_file.read()), dtype=np.uint8)
    image = cv2.imdecode(file_bytes, cv2.IMREAD_COLOR)
    image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    
    st.success(f"Image loaded: {image.shape[1]}x{image.shape[0]} pixels")
    
    # Load model
    with st.spinner("Loading model..."):
        model, device = load_model()
        counter = get_ring_counter()
    
    # Update counter parameters if changed
    counter.min_ring_distance_px = min_distance
    counter.peak_prominence = prominence
    counter.consistency_threshold = consistency
    
    # Set pith location
    pith_location = None if auto_pith else (pith_x, pith_y)
    
    # Process
    with st.spinner("Analyzing rings..."):
        image_resized, prob_map, result = process_image(
            image_rgb, model, device, counter, pith_location
        )
    
    # Display results
    st.header("📊 Results")
    
    # Key metrics
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        st.metric("🌲 Ring Count", result.ring_count)
    
    with col2:
        st.metric("📈 Confidence", f"{result.confidence:.1%}")
    
    with col3:
        if result.ring_widths:
            mean_width = np.mean(result.ring_widths)
            st.metric("📏 Mean Width", f"{mean_width:.1f} px")
        else:
            st.metric("📏 Mean Width", "N/A")
    
    with col4:
        st.metric("🎯 Est. Age", f"{result.ring_count} years")
    
    # Visualizations
    st.header("🖼️ Visualizations")
    
    col1, col2 = st.columns(2)
    
    with col1:
        st.subheader("Original Image")
        st.image(image_resized, use_container_width=True)
    
    with col2:
        st.subheader("Detected Rings")
        overlay = create_overlay(image_resized, result, prob_map)
        st.image(overlay, use_container_width=True)
    
    col1, col2 = st.columns(2)
    
    with col1:
        st.subheader("Probability Map")
        fig, ax = plt.subplots(figsize=(6, 6))
        im = ax.imshow(prob_map, cmap='hot')
        ax.scatter(*result.pith_location, c='cyan', s=100, marker='+', linewidths=2)
        ax.set_title(f"Ring Probability (Method: {result.method_used})")
        ax.axis('off')
        plt.colorbar(im, ax=ax, fraction=0.046)
        st.pyplot(fig)
        plt.close()
    
    with col2:
        st.subheader("Per-Ray Count Distribution")
        valid_counts = [c for c in result.per_ray_counts if c > 0]
        if valid_counts:
            fig, ax = plt.subplots(figsize=(6, 6))
            ax.hist(valid_counts, bins=range(min(valid_counts), max(valid_counts) + 2),
                   edgecolor='black', alpha=0.7, color='forestgreen')
            ax.axvline(result.ring_count, color='red', linestyle='--', linewidth=2,
                      label=f'Final count: {result.ring_count}')
            ax.axvline(np.median(valid_counts), color='blue', linestyle=':',
                      label=f'Median: {np.median(valid_counts):.0f}')
            ax.set_xlabel('Rings detected per ray')
            ax.set_ylabel('Number of rays')
            ax.set_title(f'Detection Consistency\n(Range: {min(valid_counts)}-{max(valid_counts)})')
            ax.legend()
            st.pyplot(fig)
            plt.close()
    
    # Ring width analysis
    if result.ring_widths and len(result.ring_widths) > 1:
        st.header("📏 Ring Width Analysis")
        
        col1, col2 = st.columns(2)
        
        with col1:
            fig, ax = plt.subplots(figsize=(10, 4))
            bars = ax.bar(range(1, len(result.ring_widths) + 1), result.ring_widths,
                         color='forestgreen', edgecolor='black')
            ax.axhline(np.mean(result.ring_widths), color='red', linestyle='--',
                      label=f'Mean: {np.mean(result.ring_widths):.1f} px')
            ax.set_xlabel('Ring Number (from pith)')
            ax.set_ylabel('Width (pixels)')
            ax.set_title('Ring Width Progression')
            ax.legend()
            st.pyplot(fig)
            plt.close()
        
        with col2:
            # Anomaly detection
            widths = np.array(result.ring_widths)
            mean_w = np.mean(widths)
            std_w = np.std(widths)
            
            st.subheader("Growth Pattern Analysis")
            
            # Identify unusual rings
            anomalies = []
            for i, w in enumerate(widths):
                if abs(w - mean_w) > 2 * std_w:
                    anomaly_type = "Wide" if w > mean_w else "Narrow"
                    anomalies.append((i + 1, w, anomaly_type))
            
            if anomalies:
                st.warning("⚠️ Unusual Growth Detected:")
                for ring_num, width, anomaly_type in anomalies:
                    st.write(f"  • Ring {ring_num}: {anomaly_type} ({width:.1f} px vs mean {mean_w:.1f} px)")
                st.info("These rings have widths more than 2 standard deviations from the mean, "
                       "which may indicate unusual growth conditions (drought, injury, etc.)")
            else:
                st.success("✅ Growth appears consistent - no major anomalies detected.")
            
            # Statistics table
            st.subheader("Width Statistics")
            stats_df = {
                "Metric": ["Mean Width", "Std Dev", "Min Width", "Max Width", "Range"],
                "Value (px)": [
                    f"{np.mean(widths):.1f}",
                    f"{np.std(widths):.1f}",
                    f"{np.min(widths):.1f}",
                    f"{np.max(widths):.1f}",
                    f"{np.max(widths) - np.min(widths):.1f}"
                ]
            }
            st.table(stats_df)
    
    # Detailed data
    with st.expander("📋 Detailed Data"):
        st.subheader("Ring Positions (distance from pith in pixels)")
        st.write(result.ring_positions)
        
        st.subheader("Ring Widths (pixels)")
        st.write(result.ring_widths)
        
        st.subheader("Detection Details")
        st.write(f"- Pith location: {result.pith_location}")
        st.write(f"- Method used: {result.method_used}")
        st.write(f"- Rays processed: {len(result.per_ray_counts)}")
        st.write(f"- Valid rays: {len([c for c in result.per_ray_counts if c > 0])}")

else:
    # No file uploaded - show instructions
    st.info("👆 Upload a tree cross-section image to begin analysis.")
    
    st.markdown("""
    ### How it works:
    1. **Upload** a tree cross-section image (PNG, JPG, or TIFF)
    2. **Automatic segmentation** detects ring boundaries
    3. **Radial analysis** counts rings from pith to bark
    4. **Width measurement** calculates ring widths for growth analysis
    
    ### Tips for best results:
    - Use well-lit, clean cross-section images
    - Ensure the pith (center) is visible
    - Higher resolution images give better accuracy
    - Lab/scientific images work best
    
    ### About TreeTrace:
    TreeTrace uses deep learning segmentation combined with radial profile analysis
    to accurately count tree rings and measure their widths. This enables:
    - **Age estimation** from ring count
    - **Growth pattern analysis** from ring widths
    - **Anomaly detection** for unusual growth events
    """)

# Footer
st.markdown("---")
st.markdown("🌲 **TreeTrace** - Tree Ring Detection & Analysis | Built with Streamlit & PyTorch")
