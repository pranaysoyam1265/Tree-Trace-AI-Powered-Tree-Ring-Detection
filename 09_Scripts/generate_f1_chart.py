import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np
import os

# Data
images = ['F02a', 'F02b', 'F02c', 'F03a', 'F07a']
scores = [0.75, 0.90, 0.85, 0.87, 0.67]
baseline_score = 0.73

# Setup figure
plt.figure(figsize=(10, 6), dpi=300, facecolor='white')
ax = plt.gca()
ax.set_facecolor('white')

# Gridlines
plt.grid(axis='y', linestyle='-', alpha=0.3, color='gray', zorder=0)
plt.yticks(np.arange(0.0, 1.2, 0.2))
plt.ylim(0, 1.1)

# Bar chart
bar_width = 0.6
bars = plt.bar(images, scores, width=bar_width, color='steelblue', edgecolor='black', linewidth=0.5, zorder=3, label="TreeTrace CS-TRD (No Training Data Required)")

# Data labels
for bar in bars:
    height = bar.get_height()
    plt.text(bar.get_x() + bar.get_width()/2., height + 0.02,
             f'{height:.2f}', ha='center', va='bottom', fontsize=11, fontweight='bold', zorder=4)

# Reference line
plt.axhline(y=baseline_score, color='red', linestyle='--', linewidth=2, zorder=5, label="Supervised Deep Learning Baseline")
plt.text(len(images) - 0.5, baseline_score + 0.02, f"Wu et al. [7] Supervised Baseline (F1 = {baseline_score})", 
         color='red', ha='right', va='bottom', fontsize=10, fontweight='bold', bbox=dict(facecolor='white', alpha=0.8, edgecolor='none', pad=1))

# Labels and Title
plt.xlabel("URuDendro Test Image", fontsize=12, fontweight='bold', labelpad=10)
plt.ylabel("F1 Score", fontsize=12, fontweight='bold', labelpad=10)
plt.title("Per-Image F1 Score Comparison vs. Supervised Baseline", fontsize=14, fontweight='bold', pad=15)

# Styling
ax.spines['top'].set_visible(False)
ax.spines['right'].set_visible(False)
ax.spines['left'].set_color('#333333')
ax.spines['bottom'].set_color('#333333')

plt.xticks(fontsize=11)
plt.yticks(fontsize=11)

# Legend
plt.legend(loc='lower center', bbox_to_anchor=(0.5, -0.2), ncol=1, frameon=False, fontsize=11)

# Save
output_path = os.path.join(os.path.dirname(__file__), "f1_comparison_chart.png")
plt.tight_layout()
plt.savefig(output_path, bbox_inches='tight')
print(f"Chart successfully saved to: {output_path}")

