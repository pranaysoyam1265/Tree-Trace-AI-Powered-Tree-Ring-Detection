# System Architecture

## Overview
TreeTrace uses a multi-stage pipeline:

1. **Data Ingestion**: Raw tree ring images from various sources
2. **Preprocessing**: Standardization, normalization, augmentation
3. **Self-Supervised Learning**: MAE pre-training for feature extraction
4. **Ring Segmentation**: U-Net based segmentation of ring boundaries
5. **Graph Analysis**: GNN for understanding ring topology
6. **Anomaly Detection**: Detecting false and missing rings
7. **Inference & Visualization**: Predictions and interactive UI

## Model Pipeline

```
Raw Image → Preprocessing → MAE Encoder → Feature Extraction
                               ↓
                        Ring Segmenter
                               ↓
                        Ring Extraction
                               ↓
                        Graph Construction
                               ↓
                        GNN Analysis
                               ↓
                        Anomaly Detector
                               ↓
                        Results & Visualization
```

## Components

### ML Core (06_ML_Core/)
- **models/**: MAE, Segmenter, GraphNet, AnomalyDetector
- **data/**: Dataset loaders and transforms
- **training/**: Training loops, losses, metrics
- **inference/**: Prediction and postprocessing

### Deployment (08_Deployment/)
- **Streamlit_App/**: Interactive analysis interface
- **Frontend/**: React-based web application
- **Backend/**: FastAPI REST API

### Data Pipeline
- **01_Raw_Data/**: Original images
- **02_Preprocessed/**: Processed and augmented data
- **03_Features/**: Extracted features and embeddings
- **04_Labels/**: Annotations and train/val/test splits
- **05_Models/**: Weights and ONNX exports
