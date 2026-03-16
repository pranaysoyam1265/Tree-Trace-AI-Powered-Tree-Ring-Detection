export type Theme = "dark" | "midnight" | "terminal" | "light"

export interface Settings {
  // 1. General
  general: {
    language: string
    region: string
    timezone: string
    startPage: string
    defaultMode: "single" | "batch"
    autoLogout: string
    rememberSession: boolean
  }
  // 2. Appearance
  appearance: {
    theme: Theme
    accentColor: string
    uiFont: string
    monoFont: string
    fontSize: "small" | "medium" | "large"
    hudIntensity: number
    enableAnimations: boolean
    animationSpeed: number
    reduceMotion: boolean
    pageTransitions: boolean
    counterAnimations: boolean
    chartAnimations: boolean
    hudTyping: boolean
    interfaceDensity: "comfortable" | "compact" | "spacious"
  }
  // 3. Analysis Defaults
  analysis: {
    primaryUnit: "px" | "mm" | "um"
    globalScaleFactor: number
    showBothUnits: boolean
    sensitivity: number
    minRingWidth: number
    maxRingCount: number
    pithMethod: "manual" | "center" | "auto"
    autoDetectConfidence: number
    confirmPith: boolean
    autoEnhance: boolean
    autoCrop: boolean
    removeBackground: boolean
    defaultResize: string
    maxConcurrent: number
    autoRetry: boolean
    retryCount: number
    skipNoPith: boolean
    defaultBatchNaming: "timestamp" | "prefix" | "folder"
  }
  // 4. Export & Output
  export: {
    singleExportFormat: string[]
    batchExportFormat: string[]
    quickExportFormat: string
    csvDelimiter: string
    csvIncludeHeaders: boolean
    csvDecimal: string
    csvMetadata: boolean
    csvRingNumbering: "outward" | "inward"
    jsonFormat: string
    jsonPretty: boolean
    jsonRawPolygon: boolean
    jsonMetrics: boolean
    pngColorScheme: string
    pngOpacity: number
    pngLabels: boolean
    pngLegend: boolean
    pngResolution: string
    pngBackground: string
    pdfIncludeSections: string[]
    pdfPageSize: string
    pdfOrientation: "portrait" | "landscape" | "auto"
    pdfBranding: boolean
    pdfAuthor: string
    defaultSaveLocation: string
    autoCreateSubfolders: boolean
  }
  // 5. Notifications
  notifications: {
    browserEnabled: boolean
    notifyAnalysis: boolean
    notifyBatch: boolean
    notifyExport: boolean
    notifyAchievement: boolean
    notifySystem: boolean
    soundEnabled: boolean
    soundVolume: number
    chimeAnalysis: boolean
    chimeBatch: boolean
    chimeError: boolean
    chimeFanfare: boolean
    soundTheme: string
    notifyAvatarBadge: boolean
    notifyPosition: string
    notifyDismissTime: string
  }
  // 6. Privacy & Security
  privacy: {
    telemetryEnabled: boolean
    storeHistory: boolean
    publicProfile: boolean
    searchableProfile: boolean
    autoDeleteResults: string
    autoDeleteLog: string
  }
  // 7. Data Management
  data: {
    mergeStrategy: string
  }
  // 8. Keyboard
  keyboard: Record<string, string> // Action ID to Key combo
  // 9. Advanced
  advanced: {
    devTools: boolean
    verboseLogging: boolean
    apiEndpoint: string
    mockMode: boolean
    perfOverlay: boolean
    flagAutoPith: boolean
    flagCrossDating: boolean
    flag3DView: boolean
    flagAISpecies: boolean
    gpuAcceleration: boolean
    maxMemory: number
    processingTimeout: number
    imageCacheSize: number
  }
}

export const DEFAULT_KEYBOARD_SHORTCUTS: Record<string, string> = {
  "nav.home": "g h",
  "nav.analyze": "g a",
  "nav.batch": "g b",
  "nav.profile": "g p",
  "nav.settings": ",",
  "nav.sidebar": "/",
  "nav.esc": "Escape",
  "analysis.start": "Enter",
  "analysis.batch.toggle": " ",
  "analysis.retry": "r",
  "analysis.undo_pith": "Control z",
  "analysis.zoom_in": "+",
  "analysis.zoom_out": "-",
  "analysis.fit": "0",
  "analysis.fullscreen": "f",
  "results.toggle_overlay": "t",
  "results.toggle_labels": "l",
  "results.prev_ring": "ArrowLeft",
  "results.next_ring": "ArrowRight",
  "results.quick_export": "Control e",
  "results.export_panel": "Control Shift E",
  "general.help": "?",
  "general.command": "Control k",
  "general.new": "n",
  "general.save": "Control s",
}

export const DEFAULT_SETTINGS: Settings = {
  general: {
    language: "en",
    region: "MM/DD/YYYY",
    timezone: "auto",
    startPage: "home",
    defaultMode: "single",
    autoLogout: "never",
    rememberSession: true,
  },
  appearance: {
    theme: "dark",
    accentColor: "#00FF88",
    uiFont: "system",
    monoFont: "jetbrains",
    fontSize: "medium",
    hudIntensity: 50,
    enableAnimations: true,
    animationSpeed: 50,
    reduceMotion: false,
    pageTransitions: true,
    counterAnimations: true,
    chartAnimations: true,
    hudTyping: true,
    interfaceDensity: "comfortable",
  },
  analysis: {
    primaryUnit: "px",
    globalScaleFactor: 1,
    showBothUnits: false,
    sensitivity: 50,
    minRingWidth: 5,
    maxRingCount: 0,
    pithMethod: "manual",
    autoDetectConfidence: 75,
    confirmPith: true,
    autoEnhance: false,
    autoCrop: false,
    removeBackground: false,
    defaultResize: "none",
    maxConcurrent: 1,
    autoRetry: false,
    retryCount: 1,
    skipNoPith: true,
    defaultBatchNaming: "timestamp",
  },
  export: {
    singleExportFormat: ["csv"],
    batchExportFormat: ["csv_combined"],
    quickExportFormat: "csv",
    csvDelimiter: "comma",
    csvIncludeHeaders: true,
    csvDecimal: "period",
    csvMetadata: true,
    csvRingNumbering: "outward",
    jsonFormat: "native",
    jsonPretty: true,
    jsonRawPolygon: false,
    jsonMetrics: false,
    pngColorScheme: "warm_cool",
    pngOpacity: 50,
    pngLabels: false,
    pngLegend: false,
    pngResolution: "original",
    pngBackground: "original",
    pdfIncludeSections: ["summary", "chart", "table"],
    pdfPageSize: "a4",
    pdfOrientation: "portrait",
    pdfBranding: true,
    pdfAuthor: "",
    defaultSaveLocation: "",
    autoCreateSubfolders: true,
  },
  notifications: {
    browserEnabled: false,
    notifyAnalysis: true,
    notifyBatch: true,
    notifyExport: true,
    notifyAchievement: true,
    notifySystem: true,
    soundEnabled: true,
    soundVolume: 50,
    chimeAnalysis: true,
    chimeBatch: false,
    chimeError: true,
    chimeFanfare: true,
    soundTheme: "default",
    notifyAvatarBadge: true,
    notifyPosition: "bottom-right",
    notifyDismissTime: "5",
  },
  privacy: {
    telemetryEnabled: true,
    storeHistory: true,
    publicProfile: false,
    searchableProfile: false,
    autoDeleteResults: "never",
    autoDeleteLog: "90",
  },
  data: {
    mergeStrategy: "keep",
  },
  keyboard: { ...DEFAULT_KEYBOARD_SHORTCUTS },
  advanced: {
    devTools: false,
    verboseLogging: false,
    apiEndpoint: "",
    mockMode: true,
    perfOverlay: false,
    flagAutoPith: false,
    flagCrossDating: false,
    flag3DView: false,
    flagAISpecies: false,
    gpuAcceleration: true,
    maxMemory: 2048,
    processingTimeout: 120,
    imageCacheSize: 500,
  },
}
