export interface TechSection {
  id: string
  number: string
  title: string
  subtitle: string
  description: string
  ascii: string
  specs: { label: string; value: string }[]
  commands: string[]
}

export const techSections: TechSection[] = [
  {
    id: "ring-detection",
    number: "01",
    title: "Ring Detection",
    subtitle: "CS-TRD Algorithm",
    description:
      "Automatic tree ring boundary detection powered by the CS-TRD algorithm. Our computer vision pipeline identifies ring boundaries from cross-section images with 91% precision, enabling accurate age estimation and growth analysis.",
    ascii: `
    ██████████████████████████████████████████████████████████████████████
    █ ░▒▓                   RING DETECTION & EXTRACTION ENGINE           █
    ██████████████████████████████████████████████████████████████████████
    █ ┌───────────────┐   ┌─────────────────┐                            █
    █ │ INPUT TENSOR  │   │ PITH COORDINATE │    [ RING BOUNDARIES ]     █
    █ │ ░▒▓██████▓▒░  │   │ ░░▒▒▓▓████▓▓▒▒░ │            ▲               █
    █ └───────┬───────┘   └────────┬────────┘            │               █
    █         │                    │            ┌────────┴─────────────┐ █
    █         ▼                    ▼            │ ░▒▓ POLAR TRANSFORM  │ █
    █ ┌─────────────────────────────────────┐   │ ▓▓▓ SHORTEST PATH    │ █
    █ │ ▓▓▒░ MULTI-SCALE CSTRD FILTER ░▒▓▓  │──▶└──────────────────────┘ █
    █ │ ▒▒ PRE-PROCESSING (CLAHE)       ▒▒  │                            █
    █ │ ██ ADAPTIVE OTSU / CANNY EDGE   ██  │                            █
    █ └─────────────────────────────────────┘                            █
    ██████████████████████████████████████████████████████████████████████`,
    specs: [
      { label: "Algorithm", value: "CS-TRD" },
      { label: "Precision", value: "91%" },
      { label: "Input Format", value: "PNG, JPG, TIFF" },
      { label: "Output", value: "LabelMe JSON" },
    ],
    commands: [
      "$ treetrace detect --image F02a.png",
      "Loading image... 2364x2364 px",
      "$ Detecting pith at (1182, 1182)",
      "Running CS-TRD algorithm...",
      "$ Rings detected: 23",
      "Output: F02a_rings.json [OK]",
    ],
  },
  {
    id: "width-measurement",
    number: "02",
    title: "Width Measurement",
    subtitle: "Growth pattern analysis",
    description:
      "Accurate ring width measurement from detected boundaries. Width data reveals growth patterns influenced by climate, competition, and environmental conditions — the foundation of dendrochronology research.",
    ascii: `
    ██████████████████████████████████████████████████████████████████████
    █ ░▒▓                   CHRONOLOGICAL WIDTH ANALYSIS                 █
    ██████████████████████████████████████████████████████████████████████
    █  ░░ INNER CORE                                      OUTER BARK ▓▓  █
    █  ██████████████║██████████║██████║████║███║██║█║█│                 █
    █  ──────────────╨──────────╨──────╨────╨───╨──╨─╨─┴─                █
    █  ΔR (px)  48         32       16   8   4   2   1                   █
    █                                                                    █
    █ ┌───────────────────┐   ┌───────────────────┐   ┌────────────────┐ █
    █ │ ░▒ MACRO-RNG      │   │ ▓█ MICRO-RNG      │   │ ▓▒ CLIMATE MAT │ █
    █ │ HIGH PRECIP.      │──▶│ DROUGHT EVENT     │──▶│ ██████░░░░░░░░ │ █
    █ │ FAST GROWTH       │   │ STRESS MARKER     │   │ ▒▒▒▒▒▒▓▓▓▓░░░░ │ █
    █ └───────────────────┘   └───────────────────┘   └────────────────┘ █
    ██████████████████████████████████████████████████████████████████████`,
    specs: [
      { label: "Unit", value: "Pixels / mm" },
      { label: "RMSE", value: "3.47 px" },
      { label: "Calibration", value: "Scale Factor" },
      { label: "Export", value: "CSV, JSON" },
    ],
    commands: [
      "$ treetrace measure --rings F02a_rings.json",
      "Ring 1: width=12.4px (inner)",
      "$ treetrace measure --unit mm --scale 0.1",
      "Ring 1: width=1.24mm",
      "$ treetrace export --format csv",
      "Exported: F02a_widths.csv [23 rings]",
    ],
  },
  {
    id: "visualization",
    number: "03",
    title: "Visualization",
    subtitle: "Interactive ring display",
    description:
      "Rich interactive visualizations overlay detected rings on the original cross-section image. Color-coded boundaries, hover inspection, zoom and pan controls let researchers validate results intuitively.",
    ascii: `
    ██████████████████████████████████████████████████████████████████████
    █ ░▒▓                   VISUALIZATION & RENDER SYSTEM                █
    ██████████████████████████████████████████████████████████████████████
    █ ┌─────────────────────────────────────┐                            █
    █ │ ░░ VECTOR POLYGON PARSER ░░         │                            █
    █ │ ▒▒▒ JSON -> SVG / CANVAS CONTROLS   │                            █
    █ └──────────────────┬──────────────────┘      ┌───┬───┬───┐         █
    █                    ▼                      ┌──┘ ░ │ ▒ │ ▓ └──┐      █
    █ ┌───────────────┐   ┌─────────────────┐ ┌─┘ ░░░░ │▒▒▒│▓▓▓▓▓ └─┐    █
    █ │ ▓ COLOR MAP   │   │ █ LAYER BLEND   │ │ ░░  ██ │███│  ██ ▓▓ │    █
    █ │ ▒ CYCLE GEN   │──▶│ ▓ MULTIPLY/ADD  │ │ ░░░░   │▒▒▒│   ▓▓▓▓ │    █
    █ │ ░ OPACITY/HUE │   │ ▒ Z-INDEX SORT  │ └─┐ ░░░░ │▒▒▒│ ▓▓▓▓ ┌─┘    █
    █ └───────────────┘   └────────┬────────┘   └──┐ ░ │ ▒ │ ▓ ┌──┘      █
    █                              └───────────────────┴───┴───┘         █
    ██████████████████████████████████████████████████████████████████████`,
    specs: [
      { label: "Renderer", value: "Canvas 2D" },
      { label: "Interaction", value: "Zoom / Pan / Hover" },
      { label: "Colors", value: "6-color gradient cycle" },
      { label: "Export", value: "PNG overlay" },
    ],
    commands: [
      "$ treetrace visualize --input F02a_rings.json",
      "Loading 23 ring polygons...",
      "$ Canvas: 2364x2364 initialized",
      "Ring colors: [R,O,Y,G,C,P] cycle",
      "$ treetrace export --format png",
      "Overlay saved: F02a_overlay.png",
    ],
  },
]

export const navLinks = techSections.map((s) => ({
  id: s.id,
  number: s.number,
  title: s.title,
}))
