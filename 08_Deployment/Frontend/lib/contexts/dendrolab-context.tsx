"use client"

import React, { createContext, useContext, useReducer, ReactNode, useEffect } from "react"
import { DendroSpecimen, ClimateDataset, DendroLabState } from "../mock-dendrolab"

// Determine initial guide mode from localStorage (SSR-safe)
function getInitialGuideMode(): boolean {
  if (typeof window === "undefined") return true
  try {
    const stored = localStorage.getItem("treetrace_dendrolab_guide_mode")
    return stored === null ? true : stored === "true"
  } catch { return true }
}

export const initialState: DendroLabState = {
  // Pipeline — 4 steps
  currentStage: 1,
  completedStages: new Set<number>(),
  guideMode: true,

  // Step 1: Add Your Specimens (was Load + Date)
  specimens: [],
  datingConfig: {},
  datedSeries: {},
  overlapPeriod: null,

  // Step 2: Compare Growth Patterns (was Cross-Date & Chronology)
  correlationMatrix: {},
  selectedForChronology: [],
  averagingMethod: 'biweight-robust-mean',
  siteChronology: null,
  chronologyStats: null,
  slidingCorrelation: null,

  // Step 3: Connect to Climate Data (was Standardize + Correlate)
  detrendingInput: 'site-chronology',
  detrendingMethod: 'negative-exp',
  splineStiffness: 67,
  rawWidths: [],
  fittedCurve: [],
  rwi: [],
  rwiStats: null,
  climateDatasets: [],
  activeClimateVariable: null,
  correlationPeriod: 'annual',
  customMonths: { current: [], previous: [] },
  correlationResult: null,
  monthlyCorrelations: [],
  regressionLine: { slope: 0, intercept: 0 },

  // Step 4: Discover Events & Trends (was Events & Reconstruction)
  activeTab: 'events',
  stressThreshold: 0.7,
  droughtThreshold: 0.4,
  detectedEvents: [],
  multiSpecimenCheck: [],
  trendAnalysis: null,
  calibrationPeriod: { start: 2001, end: 2012 },
  verificationPeriod: { start: 2013, end: 2023 },
  reconstructionModel: null,
  reconstructedValues: [],
  keyFindings: null,

  // Export
  exportDrawerOpen: false,
  selectedExports: new Set<string>(),
  exportProgress: null
}

export type DendroLabAction =
  | { type: "SET_STAGE"; payload: 1 | 2 | 3 | 4 }
  | { type: "MARK_STAGE_COMPLETED"; payload: number }
  | { type: "SET_SPECIMENS"; payload: DendroSpecimen[] }
  | { type: "TOGGLE_EXPORT_DRAWER"; payload: boolean }
  | { type: "SET_GUIDE_MODE"; payload: boolean }
  | { type: "LOAD_CLIMATE_DATA"; payload: ClimateDataset[] }
  | { type: "SET_ACTIVE_CLIMATE_VARIABLE"; payload: string }

function dendrolabReducer(state: DendroLabState, action: DendroLabAction): DendroLabState {
  switch (action.type) {
    case "SET_STAGE":
      return { ...state, currentStage: action.payload }
    case "MARK_STAGE_COMPLETED": {
      const newCompleted = new Set(state.completedStages)
      newCompleted.add(action.payload)
      return { ...state, completedStages: newCompleted }
    }
    case "SET_SPECIMENS":
      return { ...state, specimens: action.payload }
    case "TOGGLE_EXPORT_DRAWER":
      return { ...state, exportDrawerOpen: action.payload }
    case "SET_GUIDE_MODE":
      if (typeof window !== "undefined") {
        try { localStorage.setItem("treetrace_dendrolab_guide_mode", String(action.payload)) } catch { }
      }
      return { ...state, guideMode: action.payload }
    case "LOAD_CLIMATE_DATA":
      return {
        ...state,
        climateDatasets: action.payload,
        activeClimateVariable: action.payload.length > 0 ? action.payload[0].variable : null
      }
    case "SET_ACTIVE_CLIMATE_VARIABLE":
      return { ...state, activeClimateVariable: action.payload }
    default:
      return state
  }
}


const DendroLabContext = createContext<{
  state: DendroLabState
  dispatch: React.Dispatch<DendroLabAction>
} | undefined>(undefined)

export function DendroLabProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(dendrolabReducer, initialState)

  // Hydrate guide mode from localStorage on mount
  useEffect(() => {
    dispatch({ type: "SET_GUIDE_MODE", payload: getInitialGuideMode() })
  }, [])

  return (
    <DendroLabContext.Provider value={{ state, dispatch }}>
      {children}
    </DendroLabContext.Provider>
  )
}

export function useDendroLab() {
  const context = useContext(DendroLabContext)
  if (context === undefined) {
    throw new Error("useDendroLab must be used within a DendroLabProvider")
  }
  return context
}
