# Setup Guide

## Prerequisites

- Python 3.9+
- CUDA 11.8+ (for GPU acceleration)
- 8GB+ RAM
- 50GB+ disk space for models and data

## Installation

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/treetrace.git
cd treetrace
```

### 2. Create Virtual Environment
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Download Pretrained Models
```bash
python 09_Scripts/download_data.py
```

### 5. Verify Installation
```bash
python -c "import torch; print(torch.cuda.is_available())"
```

## Quick Start Tutorial

### Step 1: Data Preparation
Place your tree ring images in `01_Raw_Data/Tree_Ring_Images/`

```bash
python 09_Scripts/preprocess.py --input 01_Raw_Data --output 02_Preprocessed
```

### Step 2: Run Inference
```bash
python 09_Scripts/evaluate.py --input 02_Preprocessed --output 07_Outputs
```

### Step 3: View Results
```bash
streamlit run 08_Deployment/Streamlit_App/app.py
```

Open browser to `http://localhost:8501`

### Step 4: API Server (Optional)
```bash
uvicorn 08_Deployment/Backend/main:app --reload --port 8000
```

## Directory Structure

```
TreeTrace/
├── 01_Raw_Data/           ← Input images here
├── 02_Preprocessed/       ← Processed data
├── 05_Models/             ← Model weights
├── 06_ML_Core/            ← Core ML code
├── 08_Deployment/         ← UI and API
├── 09_Scripts/            ← Execution scripts
└── 07_Outputs/            ← Results
```

## Troubleshooting

### CUDA Not Available
```bash
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118
```

### Out of Memory
Reduce batch size in `config.yaml`:
```yaml
training:
  batch_size: 16  # Reduce from 32
```

### Models Not Found
```bash
python 09_Scripts/download_data.py --force
```

## Support
For issues, check the documentation in `11_Docs/` or create a GitHub issue.
