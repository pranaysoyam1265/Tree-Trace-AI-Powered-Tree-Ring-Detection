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
    if "09_Scripts" in path.relative_to(PROJECT_ROOT).parts:
        return "DELETE", "Other script in 09_Scripts (not in keep list)"

    # Rule 7: General 07_Outputs rule
    if "07_Outputs" in path.relative_to(PROJECT_ROOT).parts:
        return "DELETE", "Other output in 07_Outputs (not in keep list)"

    return "UNSURE", "Does not strongly match any KEEP or DELETE rule"

def main():
    print("\n" + "="*60)
    print("TreeTrace Clean-Up Script")
    print("="*60)
    
    stats = {
        "KEEP": {"count": 0, "size": 0},
        "DELETE": {"count": 0, "size": 0},
        "UNSURE": {"count": 0, "size": 0}
    }
    
    files_to_delete = []
    
    for root, _, files in os.walk(PROJECT_ROOT):
        if ".git" in root or ".venv" in root:
            continue
            
        for file in files:
            path = Path(root) / file
            if not path.exists(): continue
            
            size = path.stat().st_size
            mod_time = datetime.fromtimestamp(path.stat().st_mtime).strftime('%Y-%m-%d %H:%M')
            
            category, _ = categorize_file(path)
            stats[category]["count"] += 1
            stats[category]["size"] += size
            
            if category == "DELETE":
                files_to_delete.append((path, size, mod_time))

    print(f"Total files scanned (excluding .venv/.git): {sum(s['count'] for s in stats.values())}")
    print(f"Files to KEEP:     {stats['KEEP']['count']} ({format_size(stats['KEEP']['size'])})")
    print(f"Files UNSURE:      {stats['UNSURE']['count']} ({format_size(stats['UNSURE']['size'])})")
    print(f"Files to DELETE:   {len(files_to_delete)} ({format_size(stats['DELETE']['size'])})")
    print(f"Space to be freed: {format_size(stats['DELETE']['size'])}")
    
    if len(files_to_delete) == 0:
        print("\nNo files to delete. Exiting.")
        return

    print("\n" + "="*60)
    print("FILES SCHEDULED FOR DELETION")
    print("="*60)
    for path, size, mod in sorted(files_to_delete):
        print(path.relative_to(PROJECT_ROOT))
        
    print("\n" + "="*60)
    print("CONFIRM DELETION")
    print("="*60)
    print("WARNING: These files will be permanently deleted.")
    confirmation = input("Type 'YES' to confirm deletion or 'NO' to cancel: ")
    
    if confirmation.strip() == "YES":
        print("\nProceeding with deletion...")
        
        # Setup Logger
        log_dir = PROJECT_ROOT / "12_Logs"
        log_dir.mkdir(parents=True, exist_ok=True)
        log_file = log_dir / "cleanup_log.txt"
        
        timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        with open(log_file, "a", encoding="utf-8") as f:
            f.write(f"\n[{timestamp}] Cleanup Run started\n")
            
            for path, _, _ in files_to_delete:
                try:
                    path.unlink()
                    print(f"Deleted: {path.relative_to(PROJECT_ROOT)}")
                    f.write(f"Deleted: {path.relative_to(PROJECT_ROOT)}\n")
                except Exception as e:
                    print(f"Failed to delete {path.relative_to(PROJECT_ROOT)}: {e}")
                    f.write(f"Failed to delete {path.relative_to(PROJECT_ROOT)}: {e}\n")
            
            f.write(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Cleanup Run finished\n")
            
        print(f"\nCleanup complete. Log saved to {log_file.relative_to(PROJECT_ROOT)}")
        
        # Cleanup empty directories
        print("\nRemoving empty output/script directories...")
        for dir_path in EXACT_DELETE_DIRS:
            full_path = PROJECT_ROOT / dir_path
            if full_path.exists() and full_path.is_dir():
                try:
                    full_path.rmdir() # Only removes if empty
                    print(f"Removed empty directory: {dir_path}")
                except Exception:
                    pass
    else:
        print("Deletion canceled.")

if __name__ == '__main__':
    main()
