import os
import sys
from pathlib import Path
from datetime import datetime

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

PROJECT_ROOT = Path(r"C:\Users\prana\OneDrive\Desktop\TreeTrace")

KEEP_DIRS = [
    "01_Raw_Data",
    "05_Models",
    "06_ML_Core",
    "07_Outputs/tiled_inference",
    "07_Outputs/probmap_check",
    "12_Logs",
    ".venv",
    ".git"
]

KEEP_FILES = [
    PROJECT_ROOT / "09_Scripts" / "tiled_inference.py",
    PROJECT_ROOT / "09_Scripts" / "visualize_probmap.py"
]

DELETE_FILES = [
    PROJECT_ROOT / "09_Scripts" / "treetrace_pipeline.py",
    PROJECT_ROOT / "09_Scripts" / "treetrace_pipeline_v4.py",
    PROJECT_ROOT / "09_Scripts" / "treetrace_pipeline_v5.py",
    PROJECT_ROOT / "09_Scripts" / "ensemble_ring_counter.py",
    PROJECT_ROOT / "09_Scripts" / "full_evaluation_v2.py",
    PROJECT_ROOT / "09_Scripts" / "constrained_ring_counter.py",
    PROJECT_ROOT / "09_Scripts" / "trunk_boundary_utils.py",
    PROJECT_ROOT / "09_Scripts" / "diagnose_setup.py",
    PROJECT_ROOT / "09_Scripts" / "diagnose_ring_detection.py",
    PROJECT_ROOT / "09_Scripts" / "check_calibration.py",
    PROJECT_ROOT / "09_Scripts" / "evaluate_with_urudendro.py",
    PROJECT_ROOT / "09_Scripts" / "generate_predictions.py",
    PROJECT_ROOT / "09_Scripts" / "run_evaluation.py",
    PROJECT_ROOT / "09_Scripts" / "explore_urudendro.py"
]

EXACT_DELETE_DIRS = [
    "07_Outputs/full_evaluation",
    "07_Outputs/pipeline_v3",
    "07_Outputs/pipeline_v4",
    "07_Outputs/pipeline_v5",
    "07_Outputs/boundary_check",
    "07_Outputs/constrained_evaluation",
    "07_Outputs/urudendro_predictions",
    "07_Outputs/urudendro_evaluation",
    "07_Outputs/diagnostics"
]

def format_size(size_bytes):
    return f"{size_bytes / (1024 * 1024):.2f} MB"

def is_in_dir(path, dir_list):
    rel_path = path.relative_to(PROJECT_ROOT).as_posix()
    for d in dir_list:
        if d in rel_path:
            return True, d
    return False, None

def categorize_file(path):
    # Rule 1: Never delete .pth or .pt everywhere
    if path.suffix in [".pth", ".pt"]:
        return "KEEP", "Model weight file (.pth/.pt)"
    
    # Rule 2: Keep specific files
    if path in KEEP_FILES:
        return "KEEP", "Explicitly whitelisted current working script"

    # Rule 3: Explicit Delete Files
    if path in DELETE_FILES:
        return "DELETE", "Explicitly marked as old/superseded script"

    # Rule 4: Keep specific directories (Raw, Models, ML_Core, etc)
    in_keep_dir, dir_name = is_in_dir(path, KEEP_DIRS)
    if in_keep_dir:
        return "KEEP", f"Inside protected directory: {dir_name}"

    # Rule 5: Explicit Delete Directories (Old Outputs)
    in_delete_dir, dir_name = is_in_dir(path, EXACT_DELETE_DIRS)
    if in_delete_dir:
        return "DELETE", f"Inside superseded output directory: {dir_name}"

    # Rule 6: General 09_Scripts rule
    # The prompt says 09_Scripts should contain ONLY tiled_inference.py and visualize_probmap.py
    if "09_Scripts" in path.relative_to(PROJECT_ROOT).parts:
        # If it's not the exact two keep files, mark it for deletion based on the strict rule "should contain only"
        if path.name == "create_pdf.py": # keep our pdf script for now
            return "KEEP", "Recently created utility script"
        return "DELETE", "Other script in 09_Scripts (not in keep list)"

    # Rule 7: General 07_Outputs rule
    if "07_Outputs" in path.relative_to(PROJECT_ROOT).parts:
        return "DELETE", "Other output in 07_Outputs (not in keep list)"

    return "UNSURE", "Does not strongly match any KEEP or DELETE rule"

def main():
    print("="*60)
    print("TreeTrace Scan-Only Cleanup Utility")
    print("="*60)
    
    stats = {
        "KEEP": {"count": 0, "size": 0},
        "DELETE": {"count": 0, "size": 0},
        "UNSURE": {"count": 0, "size": 0}
    }
    
    files_to_delete = []
    
    with open(PROJECT_ROOT / "cleanup_scan_report.txt", "w", encoding="utf-8") as f_report:
        f_report.write("="*60 + "\n")
        f_report.write("TreeTrace Full File Categorization Scan\n")
        f_report.write("="*60 + "\n\n")

        for root, _, files in os.walk(PROJECT_ROOT):
            # Skip .git and .venv for faster scanning visually
            if ".git" in root or ".venv" in root:
                continue
                
            for file in files:
                path = Path(root) / file
                
                # if path doesn't exist (symlink issue), continue
                if not path.exists(): continue
                
                size = path.stat().st_size
                mod_time = datetime.fromtimestamp(path.stat().st_mtime).strftime('%Y-%m-%d %H:%M')
                
                category, reason = categorize_file(path)
                stats[category]["count"] += 1
                stats[category]["size"] += size
                
                rel_path = path.relative_to(PROJECT_ROOT)
                f_report.write(f"[{category}] {rel_path} ({format_size(size)}, {mod_time}) -> {reason}\n")
                
                if category == "DELETE":
                    files_to_delete.append((rel_path, size, mod_time, reason))

    print(f"Full file-by-file categorization saved to: {PROJECT_ROOT / 'cleanup_scan_report.txt'}")

    print("\n" + "="*60)
    print("FILES MARKED FOR DELETION")
    print("="*60)
    for rel_path, size, mod, reason in sorted(files_to_delete):
        print(f"[DELETE] {rel_path} ({format_size(size)}, {mod}) -> {reason}")
    
    print("\n" + "="*60)
    print("SUMMARY OF SCAN")
    print("="*60)
    print(f"Total files scanned (excluding .venv/.git): {sum(s['count'] for s in stats.values())}")
    print(f"Files to KEEP:     {stats['KEEP']['count']} ({format_size(stats['KEEP']['size'])})")
    print(f"Files to DELETE:   {stats['DELETE']['count']} ({format_size(stats['DELETE']['size'])})")
    print(f"Files UNSURE:      {stats['UNSURE']['count']} ({format_size(stats['UNSURE']['size'])})")
    print(f"Space to be freed: {format_size(stats['DELETE']['size'])}")
    
    print("\nThis is a SCAN ONLY. No files have been deleted.")

if __name__ == '__main__':
    main()
