# TreeTrace

AI-powered tree ring detection and dendrochronology analysis system.

## Project Structure

```
TreeTrace/
├── 01_Raw_Data/          — URuDendro dataset (images, pith CSV)
├── 02_Preprocessed/      — Preprocessed image data
├── 03_Features/          — Extracted features
├── 04_Labels/            — Annotation labels
├── 05_Models/            — Trained model weights
├── 06_ML_Core/           — Core ML pipeline code
├── 07_Outputs/           — Detection and evaluation outputs
├── 08_Deployment/
│   ├── Frontend/         — Next.js web application
│   └── Backend/          — FastAPI Python server
├── 09_Scripts/           — Utility and processing scripts
├── 10_Notebooks/         — Jupyter notebooks
├── 11_Docs/              — Documentation
└── 12_Logs/              — Log files
```

## External Dependencies

```
C:\Users\prana\OneDrive\Desktop\cstrd_ipol\     — CS-TRD ring detector
C:\Users\prana\OneDrive\Desktop\uruDendro-main\ — Evaluation toolkit
```

## Running the Application

### Frontend (Next.js)
```powershell
cd 08_Deployment\Frontend
npm install
npm run dev
# Runs at http://localhost:3000
```

### Backend (FastAPI)
```powershell
cd 08_Deployment\Backend
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
# Runs at http://localhost:8000
```

### Detection Script (CLI)
```powershell
python 09_Scripts/cstrd_wrapper.py --image F02a
```

## Benchmark Results

| Image | Precision | Recall | F1 Score |
|-------|-----------|--------|----------|
| F02a  | 88%       | 65%    | 0.75     |
| F02b  | 95%       | 86%    | 0.90     |
| F02c  | 94%       | 77%    | 0.85     |
| F03a  | 91%       | 83%    | 0.87     |
| F07a  | 87%       | 54%    | 0.67     |

**Average:** Precision 91% | Recall 73% | F1 0.81
