from pathlib import Path
import sys

# Project roots
PROJECT_ROOT = Path(r"C:\Users\prana\OneDrive\Desktop\TreeTrace")
CSTRD_ROOT = Path(r"C:\Users\prana\OneDrive\Desktop\cstrd_ipol")

# Existing code locations
STREAMLIT_UTILS = PROJECT_ROOT / "08_Deployment" / "Streamlit_App" / "utils"
SCRIPTS_DIR = PROJECT_ROOT / "09_Scripts"

# Data directories
IMAGE_DIR = PROJECT_ROOT / "01_Raw_Data" / "URuDendro" / "images"
PITH_CSV = PROJECT_ROOT / "01_Raw_Data" / "URuDendro" / "pith_location.csv"

# Output directories (API uses its own folder, separate from Streamlit)
API_RESULTS_DIR = PROJECT_ROOT / "07_Outputs" / "api_results"
CSTRD_RESULTS_DIR = PROJECT_ROOT / "07_Outputs" / "cstrd_results"

# API settings
API_HOST = "0.0.0.0"
API_PORT = 8000
ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

# Add existing code directories to Python path so they can be imported
sys.path.insert(0, str(STREAMLIT_UTILS))
sys.path.insert(0, str(SCRIPTS_DIR))
