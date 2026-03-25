"use client"

import { createContext, useContext, useReducer, useCallback, type ReactNode } from "react"

/* ═══════════════════════════════════════════════════════════════════
   ANALYSIS WORKFLOW STATE
   Manages the entire 4-step analysis flow:
   Upload → Pith → Processing → Complete
   ═══════════════════════════════════════════════════════════════════ */

export interface ImageMetadata {
  name: string
  size: number
  type: string
  dimensions?: { w: number; h: number }
}

export interface DetectionParams {
  sigma?: number
  th_low?: number
  th_high?: number
  nr?: number
  alpha?: number
  min_chain_length?: number
  preset?: string
}

export interface AnalysisState {
  step: 1 | 2 | 3 | 4
  file: File | null
  previewUrl: string | null
  metadata: ImageMetadata | null
  pith: { x: number; y: number } | null
  pithMethod: "manual" | "auto"
  detectionParams: DetectionParams
  processStatus: "idle" | "running" | "success" | "error"
  processMessage: string
  progress: number
  resultId: string | null
  error: string | null
  detectionMode: "baseline" | "adaptive" | "adaptive_clahe"
}

type Action =
  | { type: "SET_STEP"; step: AnalysisState["step"] }
  | { type: "SET_FILE"; file: File; previewUrl: string; metadata: ImageMetadata }
  | { type: "CLEAR_FILE" }
  | { type: "SET_PITH"; x: number; y: number }
  | { type: "CLEAR_PITH" }
  | { type: "SET_PITH_METHOD"; method: "manual" | "auto" }
  | { type: "SET_DETECTION_PARAMS"; params: DetectionParams }
  | { type: "SET_PROCESS_STATUS"; status: AnalysisState["processStatus"]; message?: string; progress?: number }
  | { type: "SET_RESULT"; resultId: string }
  | { type: "SET_ERROR"; error: string }
  | { type: "SET_DETECTION_MODE"; mode: AnalysisState["detectionMode"] }
  | { type: "RESET" }

const initialState: AnalysisState = {
  step: 1,
  file: null,
  previewUrl: null,
  metadata: null,
  pith: null,
  pithMethod: "manual",
  detectionParams: { preset: "auto" },
  processStatus: "idle",
  processMessage: "",
  progress: 0,
  resultId: null,
  error: null,
  detectionMode: "adaptive",
}

function reducer(state: AnalysisState, action: Action): AnalysisState {
  switch (action.type) {
    case "SET_STEP":
      return { ...state, step: action.step, error: null }
    case "SET_FILE":
      return {
        ...state,
        file: action.file,
        previewUrl: action.previewUrl,
        metadata: action.metadata,
        error: null,
      }
    case "CLEAR_FILE":
      if (state.previewUrl) URL.revokeObjectURL(state.previewUrl)
      return {
        ...state,
        file: null,
        previewUrl: null,
        metadata: null,
        pith: null,
        step: 1,
        error: null,
      }
    case "SET_PITH":
      return { ...state, pith: { x: action.x, y: action.y }, error: null }
    case "CLEAR_PITH":
      return { ...state, pith: null }
    case "SET_PITH_METHOD":
      return { ...state, pithMethod: action.method }
    case "SET_DETECTION_PARAMS":
      return { ...state, detectionParams: { ...state.detectionParams, ...action.params } }
    case "SET_DETECTION_MODE":
      return { ...state, detectionMode: action.mode }
    case "SET_PROCESS_STATUS":
      return {
        ...state,
        processStatus: action.status,
        processMessage: action.message ?? state.processMessage,
        progress: action.progress ?? state.progress,
      }
    case "SET_RESULT":
      return { ...state, resultId: action.resultId, processStatus: "success" }
    case "SET_ERROR":
      return { ...state, error: action.error }
    case "RESET":
      if (state.previewUrl) URL.revokeObjectURL(state.previewUrl)
      return { ...initialState }
    default:
      return state
  }
}

interface AnalysisContextValue {
  state: AnalysisState
  setStep: (step: AnalysisState["step"]) => void
  setFile: (file: File) => void
  clearFile: () => void
  setPith: (x: number, y: number) => void
  clearPith: () => void
  setPithMethod: (method: "manual" | "auto") => void
  setDetectionParams: (params: DetectionParams) => void
  setDetectionMode: (mode: AnalysisState["detectionMode"]) => void
  updateProcess: (status: AnalysisState["processStatus"], message?: string, progress?: number) => void
  setResult: (resultId: string) => void
  setError: (error: string) => void
  reset: () => void
  goNext: () => void
  goBack: () => void
}

const AnalysisContext = createContext<AnalysisContextValue | null>(null)

export function AnalysisProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  const setStep = useCallback((step: AnalysisState["step"]) => {
    dispatch({ type: "SET_STEP", step })
  }, [])

  const setFile = useCallback((file: File) => {
    const previewUrl = URL.createObjectURL(file)
    const metadata: ImageMetadata = {
      name: file.name,
      size: file.size,
      type: file.type,
    }

    // Load image to get dimensions
    const img = new Image()
    img.onload = () => {
      metadata.dimensions = { w: img.naturalWidth, h: img.naturalHeight }
      dispatch({ type: "SET_FILE", file, previewUrl, metadata })
    }
    img.onerror = () => {
      dispatch({ type: "SET_FILE", file, previewUrl, metadata })
    }
    img.src = previewUrl
  }, [])

  const clearFile = useCallback(() => dispatch({ type: "CLEAR_FILE" }), [])
  const setPith = useCallback((x: number, y: number) => dispatch({ type: "SET_PITH", x, y }), [])
  const clearPith = useCallback(() => dispatch({ type: "CLEAR_PITH" }), [])
  const setPithMethod = useCallback((method: "manual" | "auto") => dispatch({ type: "SET_PITH_METHOD", method }), [])
  const setDetectionParams = useCallback((params: DetectionParams) => dispatch({ type: "SET_DETECTION_PARAMS", params }), [])
  const setDetectionMode = useCallback((mode: AnalysisState["detectionMode"]) => dispatch({ type: "SET_DETECTION_MODE", mode }), [])

  const updateProcess = useCallback(
    (status: AnalysisState["processStatus"], message?: string, progress?: number) => {
      dispatch({ type: "SET_PROCESS_STATUS", status, message, progress })
    },
    []
  )

  const setResult = useCallback((resultId: string) => dispatch({ type: "SET_RESULT", resultId }), [])
  const setError = useCallback((error: string) => dispatch({ type: "SET_ERROR", error }), [])
  const reset = useCallback(() => dispatch({ type: "RESET" }), [])

  const goNext = useCallback(() => {
    if (state.step < 4) dispatch({ type: "SET_STEP", step: (state.step + 1) as AnalysisState["step"] })
  }, [state.step])

  const goBack = useCallback(() => {
    if (state.step > 1) dispatch({ type: "SET_STEP", step: (state.step - 1) as AnalysisState["step"] })
  }, [state.step])

  return (
    <AnalysisContext.Provider
      value={{ state, setStep, setFile, clearFile, setPith, clearPith, setPithMethod, setDetectionParams, setDetectionMode, updateProcess, setResult, setError, reset, goNext, goBack }}
    >
      {children}
    </AnalysisContext.Provider>
  )
}

export function useAnalysis() {
  const ctx = useContext(AnalysisContext)
  if (!ctx) throw new Error("useAnalysis must be used within AnalysisProvider")
  return ctx
}
