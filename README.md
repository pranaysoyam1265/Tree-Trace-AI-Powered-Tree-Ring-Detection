<![CDATA[<div align="center">

```
╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                              ║
║   ████████╗██████╗ ███████╗███████╗████████╗██████╗  █████╗  ██████╗███████╗ ║
║   ╚══╦═══╝██╔══██╗██╔════╝██╔════╝╚══╦═══╝██╔══██╗██╔══██╗██╔════╝██╔════╝ ║
║      ║    ██████╔╝█████╗  █████╗     ║    ██████╔╝███████║██║     █████╗   ║
║      ║    ██╔══██╗██╔══╝  ██╔══╝     ║    ██╔══██╗██╔══██║██║     ██╔══╝   ║
║      ║    ██║  ██║███████╗███████╗   ║    ██║  ██║██║  ██║╚██████╗███████╗ ║
║      ╚╝   ╚═╝  ╚═╝╚══════╝╚══════╝   ╚╝   ╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝╚══════╝ ║
║                                                                              ║
║                    DENDROCHRONOLOGY ANALYSIS TERMINAL                         ║
║                      DECODE · MEASURE · ANALYZE                              ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

**AI-powered tree ring detection for dendrochronology research.**
*Upload a cross-section image → mark the pith → receive precise ring counts, width measurements, and ecological analytics in seconds.*

[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://docker.com)
[![License](https://img.shields.io/badge/License-MIT-EA580C?style=for-the-badge)](LICENSE)

---

</div>

## 🌲 What is TreeTrace?

TreeTrace is a **desktop-class web application** for dendrochronology research that transforms raw cross-section photographs into actionable ecological data. It wraps the [CS-TRD](https://github.com/hmarichal93/cstrd) (Concentric Shape Tree Ring Detection) computer vision algorithm in a production-grade full-stack application with an **industrial brutalist** UI aesthetic.

> **For researchers, foresters, and environmental scientists** who need to move beyond manual counting and analog measurement tools.

### The Problem

Manual tree ring counting is tedious, error-prone, and doesn't scale. Existing software tools require desktop installations, proprietary licenses, or deep computer vision expertise. Most lack the interactive visualization and analytics that modern research demands.

### The Solution

TreeTrace automates the entire dendrochronology workflow — from image upload to ring boundary detection, width measurement, growth trend analysis, and data export — through an intuitive web interface with real-time processing feedback and comprehensive ecological analytics.

---

## ✨ Core Features

<table>
<tr>
<td width="50%">

### 🔬 Automated Ring Detection
Leverages the CS-TRD algorithm to detect concentric ring boundaries from high-res wood cross-section images. Supports conifer and hardwood specimens across PNG, JPEG, and TIFF formats up to 10 MB.

### 📊 Comprehensive Analytics
- Estimated tree age from ring count
- Ring width distributions & cumulative growth curves
- Growth trend analysis (increasing/decreasing/stable)
- Health scores based on growth consistency, stress resistance, and recovery
- Biomass & carbon sequestration equivalents

### 🗺️ Interactive Ring Map
Custom canvas-based polygon renderer that overlays detected ring boundaries on the original image. Pan, zoom, and inspect individual rings with sub-pixel precision.

</td>
<td width="50%">

### 📤 Multi-Format Export
Export ring measurements — inner radius, outer radius, width, estimated year — to **CSV** or **JSON** for downstream statistical analysis in R, Python, or Excel.

### 🧪 Guided Analysis Pipeline
Step-by-step workflow: **Upload → Pith Selection → Processing → Results**. Each stage includes contextual tooltips, progress indicators, and real-time processing simulations.

### 📜 Analysis History
Persistent session history with search, filtering, and instant resume. Pick up any previous analysis exactly where you left off.

### 🌍 Ecological Intelligence
Auto-generated "Specimen Biography" including climate correlation insights, anomaly detection panels, and forest ecology context cards.

</td>
</tr>
</table>

---

## 🏗️ Architecture

TreeTrace is built on a **decoupled, three-tier architecture** with strict type contracts between layers.

```
┌─────────────────────────────────────────────────────────────────────┐
│                          CLIENT BROWSER                             │
│                                                                     │
│   ┌─────────────┐  ┌──────────────┐  ┌────────────────────────┐    │
│   │  Landing /   │  │   DendroLab  │  │   Results Dashboard    │    │
│   │  Hero + Demo │  │  Pipeline UI │  │  Ring Map · Charts ·   │    │
│   │              │  │  Upload →    │  │  Health · Export ·     │    │
│   │  ASCII Hub   │  │  Pith →     │  │  Specimen Biography    │    │
│   │  Terminal    │  │  Process →   │  │  Climate Correlation   │    │
│   └──────────────┘  │  Complete    │  └────────────────────────┘    │
│                     └──────────────┘                                │
│   Next.js 16 · React 19 · Tailwind CSS · Framer Motion · Recharts │
└────────────────────────────┬────────────────────────────────────────┘
                             │ REST API (JSON)
                             │ /api/analyze · /api/results · /api/samples
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        FASTAPI BACKEND                              │
│                                                                     │
│   ┌──────────┐  ┌──────────────┐  ┌──────────────┐  ┌───────────┐ │
│   │  Routes   │  │   Services   │  │   Schemas    │  │  Config   │ │
│   │ analyze   │  │  CS-TRD      │  │  Pydantic    │  │  CORS /   │ │
│   │ results   │  │  wrapper     │  │  validation  │  │  paths    │ │
│   │ samples   │  │  pipeline    │  │  & typing    │  │           │ │
│   │ health    │  │  subprocess  │  │              │  │           │ │
│   └──────────┘  └──────┬───────┘  └──────────────┘  └───────────┘ │
│                         │                                           │
│   Python 3.11 · FastAPI · Uvicorn · OpenCV · Pydantic · Pillow     │
└─────────────────────────┬───────────────────────────────────────────┘
                          │ subprocess call
                          ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     CS-TRD CORE ALGORITHM                           │
│                                                                     │
│   Concentric Shape Tree Ring Detection                              │
│   Image → Polar Transform → Edge Detection → Ring Segmentation     │
│   → Polygon Extraction → LabelMe JSON output                       │
│                                                                     │
│   OpenCV · NumPy · SciPy · scikit-image · Shapely                  │
└─────────────────────────────────────────────────────────────────────┘
```

### Frontend (`08_Deployment/Frontend/`)

| Technology | Purpose |
|:--|:--|
| **Next.js 16** | Server-side rendering, routing, API proxy layer |
| **React 19** | Component architecture with hooks & context |
| **Tailwind CSS 4** | Industrial brutalist design system |
| **Framer Motion** | Page transitions, micro-animations, processing simulations |
| **Recharts** | Width distribution charts, cumulative growth curves |
| **Radix UI** | Accessible dialog, dropdown, tooltip primitives |
| **Prisma + SQLite** | Persistent analysis history & user sessions |
| **Three.js / R3F** | 3D visualizations and cinematic landing elements |

### Backend (`08_Deployment/Backend/`)

| Technology | Purpose |
|:--|:--|
| **FastAPI** | High-performance async API framework |
| **Pydantic** | Strict request/response schema validation |
| **OpenCV** | Image preprocessing, overlay rendering |
| **Pillow** | Image format handling and conversion |
| **NumPy / SciPy** | Ring width calculation & statistical analysis |

### Core Algorithm

TreeTrace wraps the open-source **[CS-TRD](https://github.com/hmarichal93/cstrd)** library — a computer vision pipeline that converts wood cross-section images into LabelMe-formatted ring boundary polygons via polar coordinate transformation, edge detection, and concentric shape segmentation.

---

## 🚀 Getting Started

### Prerequisites

| Requirement | Version |
|:--|:--|
| Node.js | 18+ |
| Python | 3.11+ |
| npm | 9+ |
| Git | 2.30+ |

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/TreeTrace.git
cd TreeTrace
```

### 2. Set Up the Backend

```bash
# Create a Python virtual environment
python -m venv .venv

# Activate it
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

# Install backend dependencies
pip install -r 08_Deployment/Backend/requirements.txt
```

### 3. Set Up CS-TRD

The CS-TRD algorithm must be available locally. Clone it alongside the project or set the `CSTRD_ROOT` environment variable:

```bash
git clone --depth 1 https://github.com/hmarichal93/cstrd.git cstrd_ipol
```

### 4. Set Up the Frontend

```bash
# From the project root
npm run install-frontend

# Or manually
cd 08_Deployment/Frontend
npm install
```

### 5. Configure Environment

```bash
# Copy the example env file and adjust paths
cp 08_Deployment/Frontend/.env.example 08_Deployment/Frontend/.env.local
```

### 6. Launch

```bash
# Terminal 1 — Backend (runs on :8000)
cd 08_Deployment/Backend
python main.py

# Terminal 2 — Frontend (runs on :3000)
npm run dev
```

Open **[http://localhost:3000](http://localhost:3000)** and start analyzing.

---

## 🐳 Docker

Build and run the full backend stack in a single container:

```bash
docker build -t treetrace .
docker run -p 8000:8000 treetrace
```

The Dockerfile automatically clones CS-TRD, installs all dependencies, and starts the FastAPI server.

---

## 📡 API Reference

The backend exposes a RESTful JSON API documented at `/docs` (Swagger UI) when running.

| Method | Endpoint | Description |
|:--|:--|:--|
| `GET` | `/health` | Server health check |
| `POST` | `/api/analyze` | Upload image + pith coords → run detection pipeline |
| `GET` | `/api/results/{id}` | Retrieve analysis results by ID |
| `GET` | `/api/samples` | List available sample images for demo use |

<details>
<summary><strong>Example: Analyze an Image</strong></summary>

```bash
curl -X POST http://localhost:8000/api/analyze \
  -F "file=@cross_section.jpg" \
  -F "cx=500" \
  -F "cy=600"
```

**Response:**
```json
{
  "id": "a1b2c3d4",
  "ring_count": 47,
  "estimated_age": 47,
  "widths": [
    { "ring": 1, "width_px": 28.4, "radius_px": 28.4 },
    { "ring": 2, "width_px": 31.2, "radius_px": 59.6 }
  ],
  "statistics": {
    "mean_width_px": 24.7,
    "min_width_px": 8.3,
    "max_width_px": 42.1,
    "std_width_px": 9.8
  }
}
```

</details>

---

## 🧰 CLI Tool

TreeTrace also ships a standalone CLI for batch processing and scriptable workflows:

```bash
python 09_Scripts/treetrace.py --image F02a
```

```
╔══════════════════════════════════════════════════════════════════╗
║                       🌲 TreeTrace 🌲                             ║
║            AI-Powered Tree Ring Detection & Analysis             ║
╚══════════════════════════════════════════════════════════════════╝

📷 Image: F02a.png
🎯 Pith: (487, 512)
📊 Ground Truth: 38 rings

⏳ Detecting rings...

✅ Detection Complete!
🌲 Detected Rings:    35
📈 Detection Rate:    92.1%
📅 Estimated Age:     ~35 years

📏 Ring Width Statistics:
   Mean:   24.7 px
   Min:    8.3 px
   Max:    42.1 px
```

| Flag | Description |
|:--|:--|
| `--image` | Image path or dataset name (e.g., `F02a`) |
| `--pith x,y` | Manual pith coordinates |
| `--scale` | Pixels per mm for metric conversion |
| `--no-gt` | Skip ground truth comparison |
| `--no-viz` | Skip visualization generation |
| `--quick` | Minimal output mode |

The CLI outputs ring overlays, full analysis charts, width CSVs, and a manual review JSON file for human-in-the-loop correction.

---

## 📂 Project Structure

```
TreeTrace/
│
├── 08_Deployment/
│   ├── Frontend/               # Next.js 16 web application
│   │   ├── app/                #   App router pages (analyze, results, history, etc.)
│   │   ├── components/         #   UI components organized by domain
│   │   │   ├── analysis/       #     Upload, pith selection, processing steps
│   │   │   ├── results/        #     Ring map, charts, health scores, export
│   │   │   ├── ascii-hub/      #     Landing page hero, navigation, terminal
│   │   │   ├── dendrolab/      #     Guided analysis pipeline UI
│   │   │   ├── cinematic/      #     3D and animated visual elements
│   │   │   └── ui/             #     Shared Radix-based primitives
│   │   ├── lib/                #   Contexts, hooks, utilities
│   │   └── prisma/             #   Database schema & migrations
│   │
│   ├── Backend/                # FastAPI REST API
│   │   ├── routes/             #   analyze, results, samples, health
│   │   ├── services/           #   CS-TRD wrapper & pipeline logic
│   │   ├── schemas/            #   Pydantic request/response models
│   │   └── main.py             #   Application entry point
│   │
│   └── Streamlit_App/          # Legacy Python-only dashboard
│
├── 09_Scripts/                 # CLI tools & evaluation scripts
│   ├── treetrace.py            #   Main CLI entry point
│   ├── cstrd_wrapper.py        #   CS-TRD integration layer
│   ├── tiled_inference.py      #   Large image tiled processing
│   └── evaluate_detection.py   #   Detection accuracy evaluation
│
├── 06_ML_Core/                 # Experimental ML pipeline
│   ├── models/                 #   MAE, U-Net segmenter, GraphNet, anomaly detector
│   ├── training/               #   Training loops, losses, metrics
│   └── inference/              #   Prediction & postprocessing
│
├── 11_Docs/                    # Extended documentation
│   ├── architecture.md         #   System design overview
│   ├── model_details.md        #   ML model specifications
│   ├── api_reference.md        #   API endpoint documentation
│   └── setup_guide.md          #   Detailed installation guide
│
├── Dockerfile                  # Containerized backend deployment
├── package.json                # Root monorepo delegation scripts
└── README.md                   # ← You are here
```

---

## 🔬 ML Research Pipeline

Beyond the CS-TRD integration, TreeTrace includes an experimental **deep learning pipeline** for next-generation ring detection:

| Model | Architecture | Purpose |
|:--|:--|:--|
| **MAE** | Vision Transformer | Self-supervised pre-training on unlabeled cross-sections (768-dim embeddings) |
| **Ring Segmenter** | U-Net encoder-decoder | Binary segmentation of ring boundaries (Dice + CE loss) |
| **GraphNet** | Graph Convolutional Network | Ring topology analysis & ring-to-ring relationship modeling |
| **Anomaly Detector** | Gradient Boosting Ensemble | False ring / missing ring identification with confidence scores |

Training uses **AdamW** optimizer with **CosineAnnealingLR** scheduling, mixed precision, and a 10% holdout with early stopping. Augmentations include random crops, flips, rotations, and color jitter.

---

## 🤝 Contributing

Contributions are welcome. When submitting changes:

1. **Type safety** — Frontend TypeScript types must be mirrored in the backend's Pydantic schemas. Run `npm run build` to verify before committing.
2. **Linting** — Run `npm run lint` for the frontend.
3. **Testing** — Validate detection accuracy with the evaluation scripts in `09_Scripts/` against the URuDendro benchmark dataset.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

<div align="center">

```
┌──────────────────────────────────────────────────────┐
│                                                      │
│   Built for dendrochronology. Powered by CS-TRD.     │
│                                                      │
│   Trees record time. TreeTrace reads it.             │
│                                                      │
└──────────────────────────────────────────────────────┘
```

</div>
]]>
