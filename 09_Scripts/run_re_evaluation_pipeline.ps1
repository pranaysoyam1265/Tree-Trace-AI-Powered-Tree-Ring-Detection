# TreeTrace Re-evaluation & Comparison Pipeline
# Executes the full mode comparison suite.
# Usage:
#   .\09_Scripts\run_re_evaluation_pipeline.ps1

$ErrorActionPreference = "Stop"
$env:PYTHONIOENCODING = "utf-8"

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  TREETRACE RE-EVALUATION PIPELINE                " -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

# Define modes to test
$modes = @("baseline", "adaptive", "adaptive_clahe")
# Use a fast subset limit for quick CI validation, or set to 0 to run the entire 2560 dataset
$limit = 0 

foreach ($mode in $modes) {
    Write-Host ">>> RUNNING MODE: $mode" -ForegroundColor Yellow
    
    # 1. Detection
    Write-Host "  -> Phase 1: Detection" -ForegroundColor DarkGray
    if ($limit -gt 0) {
        python 09_Scripts/run_mode_specific_augmented_detection.py --mode $mode --limit $limit
    } else {
        python 09_Scripts/run_mode_specific_augmented_detection.py --mode $mode
    }
    
    # 2. Evaluation
    Write-Host "  -> Phase 2: Evaluation" -ForegroundColor DarkGray
    python 09_Scripts/evaluate_mode_specific_augmented.py --mode $mode
    
    # 3. Analysis
    Write-Host "  -> Phase 3: Analysis" -ForegroundColor DarkGray
    python 09_Scripts/analyze_mode_specific_failures.py --mode $mode
    
    Write-Host ""
}

# 4. Final Comparison
Write-Host ">>> COMPARING MODES AND CHECKING THRESHOLDS" -ForegroundColor Yellow
python 09_Scripts/compare_detection_modes.py

Write-Host ""
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  PIPELINE COMPLETE.                              " -ForegroundColor Cyan
Write-Host "  Check 07_Outputs/improvement_comparison/        " -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
