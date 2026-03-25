import os
from pathlib import Path
import sys

# Project roots - dynamically locate the root directory (2 levels up from Backend/config.py)
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent

# Optional: CS-TRD can be provided via environment variable, or assume it's next to the project root
CSTRD_ROOT = Path(os.environ.get("CSTRD_ROOT", str(PROJECT_ROOT.parent / "cstrd_ipol")))

# Existing code locations
STREAMLIT_UTILS = PROJECT_ROOT / "08_Deployment" / "Streamlit_App" / "utils"
SCRIPTS_DIR = PROJECT_ROOT / "09_Scripts"

# Data directories (ensure they exist dynamically during access point if missing)
IMAGE_DIR = PROJECT_ROOT / "01_Raw_Data" / "URuDendro" / "images"
PITH_CSV = PROJECT_ROOT / "01_Raw_Data" / "URuDendro" / "pith_location.csv"

# Output directories
API_RESULTS_DIR = PROJECT_ROOT / "07_Outputs" / "api_results"
CSTRD_RESULTS_DIR = PROJECT_ROOT / "07_Outputs" / "cstrd_results"

# Ensure output directories exist
API_RESULTS_DIR.mkdir(parents=True, exist_ok=True)
CSTRD_RESULTS_DIR.mkdir(parents=True, exist_ok=True)

# API settings
API_HOST = os.environ.get("API_HOST", "0.0.0.0")
API_PORT = int(os.environ.get("PORT", 8000))  # Railway sets PORT env var automatically

# Allow explicit origins from env var, or fallback to dev defaults
env_origins = os.environ.get("ALLOWED_ORIGINS", "")
if env_origins:
    ALLOWED_ORIGINS = [origin.strip() for origin in env_origins.split(",")]
else:
    ALLOWED_ORIGINS = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
        "https://treetrace.vercel.app",  # Add vercel default
    ]

# Add existing code directories to Python path so they can be imported
sys.path.insert(0, str(STREAMLIT_UTILS))
sys.path.insert(0, str(SCRIPTS_DIR))
