# Save as C:\Users\prana\OneDrive\Desktop\cstrd_ipol\check_all.py

import json
import numpy as np

cx, cy = 1197, 1293

tests = [
    ("Default (baseline)", "output/labelme.json"),
    ("Prev best (th3,15,fullres)", "output_sensitive/labelme.json"),
    ("A: th3,12,s3,fullres", "output_A/labelme.json"),
    ("B: th4,15,s3,fullres", "output_B/labelme.json"),
    ("C: th3,15,s2.5,fullres", "output_C/labelme.json"),
    ("D: th3,15,s3,alpha20", "output_D/labelme.json"),
]

print(f"{'Test':<35} {'Rings':>6} {'Max R':>8} {'Cover%':>8}")
print("-" * 60)

best_count = 0
best_name = ""

for name, path in tests:
    try:
        with open(path) as f:
            data = json.load(f)
        shapes = data.get('shapes', [])
        count = len(shapes)
        
        max_r = 0
        if shapes:
            for s in shapes:
                pts = np.array(s['points'])
                dists = np.sqrt((pts[:,0]-cx)**2 + (pts[:,1]-cy)**2)
                max_r = max(max_r, dists.max())
        
        coverage = max_r / 1115 * 100
        marker = " <-- BEST" if count > best_count else ""
        if count > best_count:
            best_count = count
            best_name = name
        print(f"{name:<35} {count:>6} {max_r:>8.0f} {coverage:>7.1f}%{marker}")
    except FileNotFoundError:
        print(f"{name:<35}   NOT FOUND")
    except Exception as e:
        print(f"{name:<35}   ERROR")

print(f"\n{'GROUND TRUTH':<35} {'23':>6} {'1115':>8} {'100.0':>7}%")
print(f"\nBest result: {best_name} ({best_count} rings)")