"""
TreeTrace Advanced Analysis Engine
Tree Biography, Health Assessment, Climate Anomaly Detection
"""

import numpy as np
from datetime import datetime


def generate_full_analysis(widths, current_year=None):
    """
    Generate comprehensive tree analysis from ring widths.
    This is the core novelty of TreeTrace.
    """
    if not widths or len(widths) < 3:
        return None

    if current_year is None:
        current_year = datetime.now().year

    w_vals = np.array([w['width_px'] for w in widths])
    n_rings = len(w_vals)
    mean_w = np.mean(w_vals)
    std_w = np.std(w_vals)
    median_w = np.median(w_vals)
    birth_year = current_year - n_rings

    # ==========================================
    # 1. CLIMATE ANOMALY DETECTION
    # ==========================================
    anomalies = []
    for i, val in enumerate(w_vals):
        ring_num = i + 1
        year = birth_year + i
        deviation = (val - mean_w) / std_w if std_w > 0 else 0

        if val < mean_w - 2 * std_w:
            anomalies.append({
                'ring': ring_num, 'year': year, 'width': round(val, 2),
                'deviation': round(deviation, 2),
                'type': 'severe_stress',
                'emoji': '🔴',
                'label': 'Severe Stress',
                'interpretation': 'Possible severe drought, frost damage, or disease'
            })
        elif val < mean_w - 1.5 * std_w:
            anomalies.append({
                'ring': ring_num, 'year': year, 'width': round(val, 2),
                'deviation': round(deviation, 2),
                'type': 'moderate_stress',
                'emoji': '🟠',
                'label': 'Moderate Stress',
                'interpretation': 'Possible drought, competition, or environmental stress'
            })
        elif val > mean_w + 2 * std_w:
            anomalies.append({
                'ring': ring_num, 'year': year, 'width': round(val, 2),
                'deviation': round(deviation, 2),
                'type': 'exceptional_growth',
                'emoji': '🟢',
                'label': 'Exceptional Growth',
                'interpretation': 'Optimal conditions - abundant water and nutrients'
            })
        elif val > mean_w + 1.5 * std_w:
            anomalies.append({
                'ring': ring_num, 'year': year, 'width': round(val, 2),
                'deviation': round(deviation, 2),
                'type': 'favorable',
                'emoji': '🌿',
                'label': 'Favorable Year',
                'interpretation': 'Good growing conditions'
            })

    # ==========================================
    # 2. GROWTH TREND ANALYSIS
    # ==========================================
    x = np.arange(n_rings)
    slope, intercept = np.polyfit(x, w_vals, 1)

    if slope < -1.0:
        trend_dir = "Strongly Decreasing"
        trend_emoji = "📉📉"
        trend_interp = "Significant growth decline - typical of aging or increasing stress"
    elif slope < -0.3:
        trend_dir = "Decreasing"
        trend_emoji = "📉"
        trend_interp = "Normal maturation pattern - growth naturally slows with age"
    elif slope > 1.0:
        trend_dir = "Strongly Increasing"
        trend_emoji = "📈📈"
        trend_interp = "Unusual rapid growth increase - possibly recovering from past stress"
    elif slope > 0.3:
        trend_dir = "Increasing"
        trend_emoji = "📈"
        trend_interp = "Growth improving - conditions getting better or competition reduced"
    else:
        trend_dir = "Stable"
        trend_emoji = "➡️"
        trend_interp = "Consistent growth - stable environmental conditions"

    # Early vs Late growth
    mid = n_rings // 2
    early_mean = np.mean(w_vals[:mid])
    late_mean = np.mean(w_vals[mid:])
    growth_change = ((late_mean - early_mean) / early_mean * 100) if early_mean > 0 else 0

    # ==========================================
    # 3. HEALTH ASSESSMENT
    # ==========================================
    stress_count = sum(1 for a in anomalies if 'stress' in a['type'])
    stress_ratio = stress_count / n_rings

    # Health components (0-100 each)
    growth_rate_score = min(100, max(0, int(50 + (mean_w - 20) * 2)))
    consistency_score = max(0, int(100 - (std_w / mean_w * 100 * 2))) if mean_w > 0 else 50
    stress_resistance = max(0, int(100 - stress_ratio * 300))
    recovery_score = 80  # Default - would need more analysis

    # Check recovery after stress
    for i in range(1, len(w_vals)):
        if w_vals[i - 1] < mean_w - std_w and w_vals[i] > mean_w:
            recovery_score = min(100, recovery_score + 5)

    health_score = int(
        growth_rate_score * 0.3 +
        consistency_score * 0.25 +
        stress_resistance * 0.25 +
        recovery_score * 0.2
    )
    health_score = max(0, min(100, health_score))

    if health_score >= 80:
        health_label = "Excellent"
        health_emoji = "🟢"
        health_detail = "This tree shows strong, consistent growth with few stress indicators."
    elif health_score >= 60:
        health_label = "Good"
        health_emoji = "🟡"
        health_detail = "Overall healthy with some stress periods but good recovery."
    elif health_score >= 40:
        health_label = "Fair"
        health_emoji = "🟠"
        health_detail = "Shows significant stress. Growth is inconsistent."
    else:
        health_label = "Poor"
        health_emoji = "🔴"
        health_detail = "Severe growth problems detected. Multiple stress events."

    health = {
        'score': health_score,
        'label': health_label,
        'emoji': health_emoji,
        'detail': health_detail,
        'components': {
            'growth_rate': growth_rate_score,
            'consistency': consistency_score,
            'stress_resistance': stress_resistance,
            'recovery_ability': recovery_score
        }
    }

    # ==========================================
    # 4. GROWTH PHASES
    # ==========================================
    phases = []
    if n_rings >= 6:
        # Juvenile
        juv_end = max(3, n_rings // 5)
        juv_mean = np.mean(w_vals[:juv_end])
        phases.append({
            'name': '🌱 Juvenile',
            'years': f"Years 1-{juv_end} ({birth_year}-{birth_year + juv_end})",
            'avg_width': round(juv_mean, 1),
            'description': 'Establishment phase - roots developing, canopy forming'
        })

        # Mature
        mat_end = int(n_rings * 0.8)
        mat_mean = np.mean(w_vals[juv_end:mat_end])
        phases.append({
            'name': '🌳 Mature',
            'years': f"Years {juv_end + 1}-{mat_end} ({birth_year + juv_end}-{birth_year + mat_end})",
            'avg_width': round(mat_mean, 1),
            'description': 'Peak growth phase - maximum canopy and resource capture'
        })

        # Late
        late_mean = np.mean(w_vals[mat_end:])
        phases.append({
            'name': '🍂 Late',
            'years': f"Years {mat_end + 1}-{n_rings} ({birth_year + mat_end}-{current_year})",
            'avg_width': round(late_mean, 1),
            'description': 'Growth slowing - energy directed to maintenance'
        })

    # ==========================================
    # 5. TREE BIOGRAPHY
    # ==========================================
    biography = generate_biography(w_vals, birth_year, anomalies, phases, trend_dir, health)

    # ==========================================
    # 6. CARBON ESTIMATE (Simplified)
    # ==========================================
    # Rough estimate: radius in pixels -> assume 1px ≈ 0.5mm for estimation
    total_radius_mm = sum(w_vals) * 0.5
    diameter_cm = total_radius_mm * 2 / 10
    # Simple allometric: biomass(kg) ≈ 0.1 * diameter^2.5 (rough)
    biomass_kg = 0.1 * (diameter_cm ** 2.5) if diameter_cm > 0 else 0
    carbon_kg = biomass_kg * 0.5  # ~50% of biomass is carbon
    co2_kg = carbon_kg * 3.67  # CO2 equivalent

    carbon = {
        'estimated_biomass_kg': round(biomass_kg, 1),
        'carbon_stored_kg': round(carbon_kg, 1),
        'co2_equivalent_kg': round(co2_kg, 1),
        'car_km_offset': round(co2_kg / 0.21, 0),  # ~210g CO2/km
        'note': 'Rough estimate based on ring dimensions. Actual values depend on species and wood density.'
    }

    # ==========================================
    # COMPILE RESULTS
    # ==========================================
    return {
        'summary': {
            'ring_count': n_rings,
            'estimated_age': n_rings,
            'birth_year': birth_year,
            'total_radius_px': round(sum(w_vals), 2),
            'mean_width_px': round(mean_w, 2),
            'median_width_px': round(median_w, 2),
            'std_width_px': round(std_w, 2),
            'min_width_px': round(np.min(w_vals), 2),
            'max_width_px': round(np.max(w_vals), 2),
        },
        'trend': {
            'direction': trend_dir,
            'emoji': trend_emoji,
            'slope': round(slope, 4),
            'interpretation': trend_interp,
            'early_growth': round(early_mean, 2),
            'late_growth': round(late_mean, 2),
            'change_percent': round(growth_change, 1)
        },
        'health': health,
        'anomalies': anomalies,
        'phases': phases,
        'biography': biography,
        'carbon': carbon,
        'statistics': {
            'mean': round(mean_w, 2),
            'median': round(median_w, 2),
            'std': round(std_w, 2),
            'cv_percent': round(std_w / mean_w * 100, 1) if mean_w > 0 else 0,
            'min': round(np.min(w_vals), 2),
            'max': round(np.max(w_vals), 2),
            'range': round(np.max(w_vals) - np.min(w_vals), 2)
        }
    }


def generate_biography(w_vals, birth_year, anomalies, phases, trend, health):
    """Generate formal scientific abstract for the specimen."""
    n = len(w_vals)
    if n == 0:
        return "Insufficient data for abstract."
    mean_w = np.mean(w_vals)

    lines = []
    
    # Overview
    lines.append(f"This specimen chronologically spans {n} years, with an estimated establishment year of {birth_year}. Over the observed period, the mean radial growth rate was {mean_w:.2f} pixels per year. The overall long-term growth trajectory exhibits a **{trend.lower()}** trend, indicating shifts in site conditions, canopy competition, or ontogenetic maturation.")
    lines.append("")
    
    # Phases
    if phases:
         phase_desc = [f"the {p['name'].split()[-1].lower()} phase ({p['avg_width']} px/yr)" for p in phases]
         lines.append(f"Ontogenetic development can be macroscopically partitioned into functional periods: {', '.join(phase_desc)}.")
         lines.append("")
        
    # Health and anomalies
    stress_count = sum(1 for a in anomalies if 'stress' in a['type'])
    favorable_count = sum(1 for a in anomalies if 'exceptional' in a['type'] or 'favorable' in a['type'])
    
    if stress_count > 0:
         stress_years = [str(a['year']) for a in anomalies if 'stress' in a['type']]
         lines.append(f"The ring chronology exhibits marked variance driven by {stress_count} acute environmental stress episodes (putative drought, frost damage, or pathogenic events), most notably in the years: **{', '.join(stress_years[:8])}**.")
    else:
         lines.append("The specimen chronology is remarkably consistent, exhibiting minimal severe stress anomalies throughout its lifespan.")
         
    if favorable_count > 0:
        lines.append(f"Conversely, {favorable_count} years demonstrated exceptional radial growth indicative of optimal climatic conditions or successful canopy release.")
        
    lines.append("")
    # Health
    lines.append(f"Based on cumulative growth consistency indices and post-stress recovery analysis, the aggregate physiological status of the specimen is classified as **{health['label'].upper()}** (Health Index: {health['score']}/100).")
    
    return "\n".join(lines)