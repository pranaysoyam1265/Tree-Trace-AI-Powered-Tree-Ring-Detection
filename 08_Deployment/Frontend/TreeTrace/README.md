# TreeTrace - Tree Ring Analysis with Deep Learning

TreeTrace is a comprehensive system for analyzing tree ring images using state-of-the-art deep learning models.

## Features
- Ring segmentation using U-Net style architecture
- Graph neural networks for ring topology
- Masked autoencoders for self-supervised learning
- Anomaly detection for false/missing rings
- Streamlit UI for interactive analysis
- FastAPI backend for production deployment

## Setup

```bash
pip install -r requirements.txt
```

## Project Structure

See the directory layout above for detailed structure.

## Quick Start

1. Download datasets: `python 09_Scripts/download_data.py`
2. Preprocess data: `python 09_Scripts/preprocess.py`
3. Train MAE: `python 09_Scripts/train_mae.py`
4. Train segmenter: `python 09_Scripts/train_segmenter.py`
5. Run inference: `python 09_Scripts/evaluate.py`
6. Launch UI: `streamlit run 08_Deployment/Streamlit_App/app.py`
