// ═══════════════════════════════════════════════════════════════════
// TreeTrace — Dithered Illustration System Exports
// ═══════════════════════════════════════════════════════════════════

// Foundation
export { TerminalFrame } from "./terminal-frame"
export {
  applyBayerDither,
  loadSvgImage,
  drawScanlines,
  drawScanBeam,
  breathe,
  breathingAnimation,
  flickerAnimation,
  PALETTE,
} from "./animation-utils"

// Scene Components
export { TreeRingDithered } from "./tree-ring-dithered"
export { CoreSampleDithered } from "./core-sample-dithered"
export { TreeStumpDithered } from "./tree-stump-dithered"
export { FullTreeDithered } from "./full-tree-dithered"
export { ForestSceneDithered } from "./forest-scene-dithered"
export { RingDetailDithered } from "./ring-detail-dithered"
export { TreeTrunkDithered } from "./tree-trunk-dithered"
export { DitheredTreeScenes } from "./dithered-tree-scenes"

// Illustration name type
export type IllustrationName =
  | "tree-ring"
  | "core-sample"
  | "stump"
  | "tree"
  | "forest"
  | "ring-detail"
  | "trunk"
