"""
09_Scripts/check_urudendro_error.py
Check what error UruDendro evaluation gives
"""

import sys
import os
import subprocess
from pathlib import Path

URUDENDRO_ROOT   = Path(r"C:\Users\prana\OneDrive\Desktop\uruDendro-main")
URUDENDRO_SCRIPT = URUDENDRO_ROOT / "urudendro" / "metric_influence_area.py"
ANNOTATIONS_DIR  = URUDENDRO_ROOT / "annotations (1)"
PROJECT_ROOT     = Path(r"C:\Users\prana\OneDrive\Desktop\TreeTrace")
PRED_DIR         = PROJECT_ROOT / "07_Outputs" / "canny_predictions"
IMAGE_DIR        = PROJECT_ROOT / "01_Raw_Data" / "URuDendro" / "images"

env = os.environ.copy()
env['PYTHONPATH'] = str(URUDENDRO_ROOT)

cmd = [
    sys.executable,
    str(URUDENDRO_SCRIPT),
    "--dt_filename",  str(PRED_DIR / "F02a_pred.json"),
    "--gt_filename",  str(ANNOTATIONS_DIR / "F02a.json"),
    "--img_filename", str(IMAGE_DIR / "F02a.png"),
    "--cx",           "1197",
    "--cy",           "1293",
    "--output_dir",   str(PROJECT_ROOT / "07_Outputs" / "canny_evaluation" / "F02a"),
    "--th",           "0.5"
]

print("Running UruDendro evaluation...")
print(f"Command: {' '.join(cmd)}\n")

result = subprocess.run(
    cmd,
    capture_output=True,
    text=True,
    cwd=str(URUDENDRO_ROOT),
    env=env,
    timeout=120
)

print("=== STDOUT ===")
print(result.stdout)
print("\n=== STDERR (FULL) ===")
print(result.stderr)
print(f"\nReturn code: {result.returncode}")