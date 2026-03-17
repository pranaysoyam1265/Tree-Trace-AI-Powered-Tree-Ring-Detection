"""
Visualization utilities for TreeTrace Streamlit app
"""

import numpy as np
import cv2
import plotly.graph_objects as go
import plotly.express as px
from plotly.subplots import make_subplots


def create_ring_overlay(image, shapes, cx, cy, gt_shapes=None):
    """
    Create ring overlay on image.
    
    Args:
        image: Input image (numpy array)
        shapes: Detected ring shapes
        cx, cy: Pith coordinates
        gt_shapes: Optional ground truth shapes
    
    Returns:
        numpy array: Image with overlay
    """
    overlay = image.copy()
    
    # Draw GT in blue if available
    if gt_shapes:
        for shape in gt_shapes:
            points = np.array(shape.get('points', []), dtype=np.int32)
            if len(points) > 0:
                cv2.polylines(overlay, [points], isClosed=True, 
                            color=(255, 150, 0), thickness=2)
    
    # Draw detections with color gradient
    if shapes:
        num_rings = len(shapes)
        for i, shape in enumerate(shapes):
            points = np.array(shape.get('points', []), dtype=np.int32)
            if len(points) > 0:
                # Color gradient: green (inner) to red (outer)
                ratio = i / max(1, num_rings - 1)
                color = (0, int(255 * (1 - ratio)), int(255 * ratio))
                cv2.polylines(overlay, [points], isClosed=True, 
                            color=color, thickness=3)
    
    # Draw pith
    cv2.circle(overlay, (int(cx), int(cy)), 12, (0, 255, 0), -1)
    cv2.circle(overlay, (int(cx), int(cy)), 14, (255, 255, 255), 2)
    
    return overlay


def create_width_chart(widths, birth_year=None):
    """Create ring width bar chart using Plotly."""
    if not widths:
        return None
    
    ring_numbers = [w['ring'] for w in widths]
    width_values = [w['width_px'] for w in widths]
    mean_width = np.mean(width_values)
    
    # Use years if available
    x_values = [birth_year + r - 1 for r in ring_numbers] if birth_year else ring_numbers
    xaxis_title = "Estimated Year" if birth_year else "Ring Number (1 = center)"
    
    # Create color gradient
    colors = px.colors.sample_colorscale('YlOrRd', 
                                          [i/len(widths) for i in range(len(widths))])
    
    fig = go.Figure()
    
    fig.add_trace(go.Bar(
        x=x_values,
        y=width_values,
        marker_color=colors,
        name='Ring Width'
    ))
    
    fig.add_hline(y=mean_width, line_dash="dash", line_color="blue",
                  annotation_text=f"Mean: {mean_width:.1f} px")
    
    fig.update_layout(
        title="Ring Widths",
        xaxis_title=xaxis_title,
        yaxis_title="Width (pixels)",
        showlegend=False,
        height=400
    )
    
    return fig


def create_growth_chart(widths, birth_year=None):
    """Create cumulative growth chart using Plotly."""
    if not widths:
        return None
    
    ring_numbers = [w['ring'] for w in widths]
    width_values = [w['width_px'] for w in widths]
    cumulative = np.cumsum(width_values)
    
    # Use years if available
    x_values = [birth_year + r - 1 for r in ring_numbers] if birth_year else ring_numbers
    xaxis_title = "Estimated Year" if birth_year else "Ring Number (Age)"
    
    fig = go.Figure()
    
    fig.add_trace(go.Scatter(
        x=x_values,
        y=cumulative,
        mode='lines+markers',
        fill='tozeroy',
        line=dict(color='forestgreen', width=2),
        marker=dict(size=8),
        name='Cumulative Radius'
    ))
    
    fig.update_layout(
        title="Cumulative Growth",
        xaxis_title=xaxis_title,
        yaxis_title="Total Radius (pixels)",
        showlegend=False,
        height=400
    )
    
    return fig


def create_distribution_chart(widths):
    """Create width distribution histogram using Plotly."""
    if not widths:
        return None
    
    width_values = [w['width_px'] for w in widths]
    mean_width = np.mean(width_values)
    median_width = np.median(width_values)
    
    fig = go.Figure()
    
    fig.add_trace(go.Histogram(
        x=width_values,
        nbinsx=min(15, len(width_values)),
        marker_color='steelblue',
        name='Width Distribution'
    ))
    
    fig.add_vline(x=mean_width, line_dash="dash", line_color="red",
                  annotation_text=f"Mean: {mean_width:.1f}")
    fig.add_vline(x=median_width, line_dash="dash", line_color="orange",
                  annotation_text=f"Median: {median_width:.1f}")
    
    fig.update_layout(
        title="Width Distribution",
        xaxis_title="Ring Width (pixels)",
        yaxis_title="Frequency",
        showlegend=False,
        height=400
    )
    
    return fig


def create_comparison_chart(det_count, gt_count):
    """Create detection vs GT comparison chart."""
    fig = go.Figure()
    
    fig.add_trace(go.Bar(
        x=['Ground Truth', 'Detected'],
        y=[gt_count, det_count],
        marker_color=['#1f77b4', '#2ca02c'],
        text=[gt_count, det_count],
        textposition='auto'
    ))
    
    fig.update_layout(
        title="Detection Comparison",
        yaxis_title="Ring Count",
        showlegend=False,
        height=300
    )
    
    return fig


def create_anomaly_chart(widths, anomalies, birth_year):
    """Create anomaly highlight chart using Plotly."""
    if not widths:
        return None
        
    ring_numbers = [w['ring'] for w in widths]
    width_values = [w['width_px'] for w in widths]
    years = [birth_year + r - 1 for r in ring_numbers]
    mean_width = np.mean(width_values)
    
    fig = go.Figure()
    
    # Base widths
    fig.add_trace(go.Bar(
        x=years,
        y=width_values,
        marker_color='lightgray',
        name='Normal Growth'
    ))
    
    # Highlight anomalies
    if anomalies:
        for anomaly in anomalies:
            year = anomaly['year']
            width = anomaly['width']
            label = anomaly['label']
            
            color = 'red' if 'Drought' in label or 'Frost' in label else 'blue'
            
            fig.add_trace(go.Bar(
                x=[year],
                y=[width],
                marker_color=color,
                name=label,
                text=[anomaly['emoji']],
                textposition='outside'
            ))
            
    fig.add_hline(y=mean_width, line_dash="dash", line_color="black",
                  annotation_text="Average")
                  
    fig.update_layout(
        title="Climate Anomalies & Growth Extremes",
        xaxis_title="Estimated Year",
        yaxis_title="Ring Width (pixels)",
        showlegend=True,
        height=400,
        barmode='overlay'
    )
    
    return fig


def create_health_gauge(score):
    """Create health score gauge chart."""
    fig = go.Figure(go.Indicator(
        mode = "gauge+number",
        value = score,
        domain = {'x': [0, 1], 'y': [0, 1]},
        title = {'text': "Health Score"},
        gauge = {
            'axis': {'range': [None, 100], 'tickwidth': 1, 'tickcolor': "darkblue"},
            'bar': {'color': "darkblue"},
            'bgcolor': "white",
            'borderwidth': 2,
            'bordercolor': "gray",
            'steps': [
                {'range': [0, 50], 'color': 'lightcoral'},
                {'range': [50, 75], 'color': 'khaki'},
                {'range': [75, 100], 'color': 'lightgreen'}],
            'threshold': {
                'line': {'color': "red", 'width': 4},
                'thickness': 0.75,
                'value': score}}))
                
    fig.update_layout(height=300, margin=dict(l=20, r=20, t=50, b=20))
    return fig


def create_carbon_chart(carbon_data):
    """Create carbon storage visualization."""
    fig = go.Figure(go.Indicator(
        mode = "number+delta",
        value = carbon_data['co2_equivalent_kg'],
        title = {"text": "Lifetime CO₂ Stored<br><span style='font-size:0.8em;color:gray'>Kilograms</span>"},
        domain = {'x': [0, 1], 'y': [0, 1]}
    ))
    
    fig.update_layout(height=250)
    return fig