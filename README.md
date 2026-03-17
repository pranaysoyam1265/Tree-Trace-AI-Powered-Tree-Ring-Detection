# TreeTrace | AI-Powered Tree Ring Detection

TreeTrace is an advanced desktop-class web application for dendrochronology research. It uses AI-powered computer vision (CS-TRD) to automatically identify tree ring boundaries, count rings, and measure ring widths from high-resolution wood cross-section images.

## Features

- **Automated Ring Detection**: Leverages the CS-TRD (Concentric Shape - Tree Ring Detection) algorithm to accurately map tree rings.
- **Interactive Visualization**: Features a high-performance custom canvas viewer to inspect and interact with detected ring boundaries over the original image.
- **Comprehensive Analytics**: Automatically calculates:
  - Estimated tree age
  - Average growth rates and trends
  - Health scores based on growth consistency, stress resistance, and recovery
  - Biomass and carbon sequestration equivalents
- **Data Export**: Export ring measurements (inner radius, outer radius, width, estimated year) to CSV or JSON formats for further statistical analysis.
- **Analysis History**: Keeps a persistent record of all past analyses, searchable and filterable.

## Architecture

TreeTrace is built with a modern, decoupled architecture:

### 1. Frontend (Next.js)
- **Location**: `08_Deployment/Frontend/`
- **Tech Stack**: Next.js 14, React, Tailwind CSS, Framer Motion
- **Design**: "Industrial Brutalist" UI, heavily utilizing monospace fonts, precise grid layouts, and high-contrast status indicators.
- **Key Capabilities**: 
  - Real-time processing simulations
  - Canvas-based polygon rendering for ring maps
  - Complex charting (Width Distributions, Cumulative Growth) using custom SVG components.

### 2. Backend (FastAPI)
- **Location**: `08_Deployment/Backend/`
- **Tech Stack**: Python 3.11, FastAPI, Uvicorn, Pydantic, OpenCV, Pillow
- **Role**: Serves as the bridge between the React frontend and the raw Python analysis pipelines.
- **Capabilities**:
  - Exposes REST endpoints (`/api/analyze`, `/api/results`, `/api/samples`)
  - Executes the underlying CS-TRD pipeline subprocesses
  - Transforms raw numpy/JSON outputs into strictly typed analytical summaries for the UI.

### 3. Core Algorithm (CS-TRD)
- **Location**: `09_Scripts/cstrd_wrapper.py` & `c:/Users/prana/OneDrive/Desktop/cstrd_ipol/`
- **Role**: The foundational computer vision model that processes images to extract ring boundary polygons and pith coordinates.

## Getting Started

### Prerequisites
- Node.js (v18+)
- Python 3.11+
- The `cstrd_ipol` core algorithm must be available at the configured path.

### Running the Backend

1. Navigate to the backend directory:
   ```bash
   cd 08_Deployment/Backend
   ```
2. Install requirements (if not already installed globally):
   ```bash
   pip install fastapi uvicorn pydantic opencv-python-headless pillow numpy
   ```
3. Start the FastAPI server (runs on `http://localhost:8000` by default):
   ```bash
   python main.py
   ```

### Running the Frontend

1. Navigate to the frontend directory:
   ```bash
   cd 08_Deployment/Frontend
   ```
2. Install NPM dependencies:
   ```bash
   npm install
   ```
3. Start the Next.js development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```text
TreeTrace/
├── 01_Raw_Data/           # Source images (URuDendro, CS-TRD samples)
├── 08_Deployment/
│   ├── Backend/           # FastAPI application (main.py, routers, schema)
│   ├── Frontend/          # Next.js web application (app, components, lib)
│   └── Streamlit_App/     # Legacy Python-only dashboard
├── 09_Scripts/            # Core wrapper scripts, evaluation scripts
└── README.md              # This file
```

## Contributing
When contributing to TreeTrace, please ensure that any frontend type changes are strictly mirrored in the backend's Pydantic schemas, and run `npm run build` to verify type safety before committing.
