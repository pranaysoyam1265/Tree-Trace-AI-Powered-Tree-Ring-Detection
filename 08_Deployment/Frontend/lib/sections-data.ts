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
    ┌─────────────────────────┐
    │  CS-TRD PIPELINE         │
    │  ┌───────┐ ┌───────┐   │
    │  │ IMAGE │ │ PITH  │   │
    │  └───┬───┘ └───┬───┘   │
    │      │         │        │
    │  ┌───┴─────────┴───┐   │
    │  │  EDGE DETECTION  │   │
    │  └─────────────────┘   │
    │  ┌───────────────────┐  │
    │  │  RING BOUNDARIES   │  │
    │  └───────────────────┘  │
    └─────────────────────────┘`,
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
    Ring #1 (inner)    Ring #2
    ┌──────────┐      ┌──────────┐
    │ Width: 12│─────>│ Width: 8 │
    │ Year: '01│      │ Year: '02│
    │ Rain: Hi │      │ Rain: Lo │
    │ Temp: Med│      │ Temp: Hi │
    └──────────┘      └──────────┘
         │                  │
    ┌────┴────┐        ┌────┴────┐
    │ Growth  │        │ Growth  │
    │ FAST    │        │ SLOW    │
    └─────────┘        └─────────┘`,
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
    Image  ──> Ring Overlay
                    │
             Color Assignment
                    │
              Render Canvas
                    │
              ┌──────┴──────┐
              │  Ring View   │
              │  ┌──┬──┬──┐ │
              │  │R1│R2│R3│ │
              │  ├──┼──┼──┤ │
              │  │R4│R5│R6│ │
              │  └──┴──┴──┘ │
              └─────────────┘`,
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
