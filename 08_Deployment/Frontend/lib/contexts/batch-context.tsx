"use client"

import { createContext, useContext, useReducer, useCallback, useEffect, useState, type ReactNode, useRef } from "react"
import {
  type BatchState, type BatchImage, type BatchHealth, type ProcessingStage,
  type LogEntry, getMockSampleImages, calculateBatchSummary, calculateBatchHealth, shouldImageFail,
} from "../mock-batch"
import { generateMockResult } from "../mock-results"

/* ═══════════════════════════════════════════════════════════════════
   BATCH CONTEXT — Redesigned
   Manages state, processing simulation, and activity logging
   for the three-phase batch workstation.
   ═══════════════════════════════════════════════════════════════════ */

// ─── PUBLIC API ──────────────────────────────────────────────────

interface BatchContextValue {
  state: BatchState
  logs: LogEntry[]
  // Phase 1 actions
  addFiles: (files: File[]) => void
  addSamples: () => void
  removeImage: (id: string) => void
  selectImage: (id: string | null) => void
  setImageAlias: (id: string, alias: string) => void
  setImageTags: (id: string, tags: string[]) => void
  setImageNotes: (id: string, notes: string) => void
  setPith: (id: string, cx: number, cy: number, method?: "manual" | "center" | "auto") => void
  setAllPithsCenter: () => void
  setBatchName: (name: string) => void
  setBatchNotes: (notes: string) => void
  // Phase 2 actions
  startBatch: () => void
  cancelBatch: () => void
  retryImage: (id: string) => void
  // Phase 3 actions
  resetBatch: () => void
}

// ─── INITIAL STATE ───────────────────────────────────────────────

const initialState: BatchState = {
  id: `batch-${Date.now()}`,
  name: "Untitled Batch",
  notes: "",
  tags: [],
  status: "configuring",
  createdAt: new Date().toISOString(),
  completedAt: null,
  images: [],
  selectedImageId: null,
  currentProcessingIndex: null,
  summary: null,
  health: null,
}

// ─── REDUCER ─────────────────────────────────────────────────────

type Action =
  | { type: "ADD_IMAGES"; images: BatchImage[] }
  | { type: "REMOVE_IMAGE"; id: string }
  | { type: "SELECT_IMAGE"; id: string | null }
  | { type: "SET_ALIAS"; id: string; alias: string }
  | { type: "SET_IMAGE_TAGS"; id: string; tags: string[] }
  | { type: "SET_IMAGE_NOTES"; id: string; notes: string }
  | { type: "SET_PITH"; id: string; cx: number; cy: number; method: "manual" | "center" | "auto" }
  | { type: "SET_ALL_PITHS_CENTER" }
  | { type: "SET_BATCH_NAME"; name: string }
  | { type: "SET_BATCH_NOTES"; notes: string }
  | { type: "START_BATCH" }
  | { type: "UPDATE_IMAGE"; id: string; updates: Partial<BatchImage> }
  | { type: "COMPLETE_BATCH" }
  | { type: "CANCEL_BATCH" }
  | { type: "RESET" }

function reducer(state: BatchState, action: Action): BatchState {
  switch (action.type) {
    case "ADD_IMAGES": {
      const newImages = [...state.images, ...action.images]
      return {
        ...state,
        images: newImages,
        selectedImageId: state.selectedImageId || action.images[0]?.id || null,
      }
    }
    case "REMOVE_IMAGE": {
      const filtered = state.images.filter(img => img.id !== action.id)
      const selectedStillExists = filtered.some(img => img.id === state.selectedImageId)
      return {
        ...state,
        images: filtered,
        selectedImageId: selectedStillExists ? state.selectedImageId : (filtered[0]?.id || null),
      }
    }
    case "SELECT_IMAGE":
      return { ...state, selectedImageId: action.id }
    case "SET_ALIAS":
      return { ...state, images: state.images.map(i => i.id === action.id ? { ...i, alias: action.alias } : i) }
    case "SET_IMAGE_TAGS":
      return { ...state, images: state.images.map(i => i.id === action.id ? { ...i, tags: action.tags } : i) }
    case "SET_IMAGE_NOTES":
      return { ...state, images: state.images.map(i => i.id === action.id ? { ...i, notes: action.notes } : i) }
    case "SET_PITH":
      return {
        ...state,
        images: state.images.map(i =>
          i.id === action.id ? { ...i, pith: { cx: action.cx, cy: action.cy }, pithMethod: action.method, status: "ready" } : i
        ),
      }
    case "SET_ALL_PITHS_CENTER":
      return {
        ...state,
        images: state.images.map(i =>
          !i.pith ? {
            ...i,
            pith: { cx: Math.round(i.dimensions.width / 2), cy: Math.round(i.dimensions.height / 2) },
            pithMethod: "center",
            status: "ready",
          } : i
        ),
      }
    case "SET_BATCH_NAME":
      return { ...state, name: action.name }
    case "SET_BATCH_NOTES":
      return { ...state, notes: action.notes }
    case "START_BATCH":
      return {
        ...state,
        status: "processing",
        images: state.images.map(i => ({ ...i, status: "queued" as const, progress: 0, processingStage: null })),
        currentProcessingIndex: 0,
      }
    case "UPDATE_IMAGE":
      return { ...state, images: state.images.map(i => i.id === action.id ? { ...i, ...action.updates } : i) }
    case "COMPLETE_BATCH": {
      const summary = calculateBatchSummary(state.images)
      return {
        ...state,
        status: "completed",
        completedAt: new Date().toISOString(),
        currentProcessingIndex: null,
        summary,
        health: calculateBatchHealth(summary),
      }
    }
    case "CANCEL_BATCH": {
      const imgs = state.images.map(i =>
        (i.status === "queued" || i.status === "processing") ? { ...i, status: "cancelled" as const } : i
      )
      const summary = calculateBatchSummary(imgs)
      return {
        ...state,
        status: "cancelled",
        completedAt: new Date().toISOString(),
        currentProcessingIndex: null,
        images: imgs,
        summary,
        health: calculateBatchHealth(summary),
      }
    }
    case "RESET":
      state.images.forEach(i => { if (i.thumbnailUrl.startsWith("blob:")) URL.revokeObjectURL(i.thumbnailUrl) })
      return { ...initialState, id: `batch-${Date.now()}` }
    default:
      return state
  }
}

// ─── CONTEXT & PROVIDER ─────────────────────────────────────────

const BatchContext = createContext<BatchContextValue | null>(null)

export function BatchProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)
  const [logs, setLogs] = useState<LogEntry[]>([])

  const processingRef = useRef(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const mountedRef = useRef(true)

  useEffect(() => { mountedRef.current = true; return () => { mountedRef.current = false } }, [])

  const addLog = useCallback((message: string, type: LogEntry["type"] = "info") => {
    setLogs(prev => [...prev, {
      id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toLocaleTimeString([], { hour12: false }),
      message, type,
    }])
  }, [])

  // ── Phase 1 Actions ─────────────────────────────────────────

  const addFiles = useCallback((files: File[]) => {
    if (!mountedRef.current) return
    const images: BatchImage[] = files.map(file => {
      const url = URL.createObjectURL(file)
      return {
        id: `img-${Date.now()}-${file.name}`,
        file, fileName: file.name, alias: file.name.replace(/\.[^/.]+$/, ""),
        tags: [], notes: "",
        dimensions: { width: 1000, height: 1000 },
        fileSize: file.size, thumbnailUrl: url,
        pith: null, pithMethod: null,
        status: "pending" as const, processingStage: null, progress: 0,
        startedAt: null, completedAt: null, processingTime: null,
        result: null, error: null, retryCount: 0,
      }
    })
    dispatch({ type: "ADD_IMAGES", images })
    addLog(`Added ${images.length} image${images.length > 1 ? "s" : ""} to batch`, "info")
  }, [addLog])

  const addSamples = useCallback(() => {
    const samples = getMockSampleImages()
    dispatch({ type: "ADD_IMAGES", images: samples })
    addLog(`Loaded ${samples.length} sample images`, "info")
  }, [addLog])

  const removeImage = useCallback((id: string) => {
    dispatch({ type: "REMOVE_IMAGE", id })
  }, [])

  const selectImage = useCallback((id: string | null) => dispatch({ type: "SELECT_IMAGE", id }), [])
  const setImageAlias = useCallback((id: string, alias: string) => dispatch({ type: "SET_ALIAS", id, alias }), [])
  const setImageTags = useCallback((id: string, tags: string[]) => dispatch({ type: "SET_IMAGE_TAGS", id, tags }), [])
  const setImageNotes = useCallback((id: string, notes: string) => dispatch({ type: "SET_IMAGE_NOTES", id, notes }), [])
  const setPith = useCallback((id: string, cx: number, cy: number, method: "manual" | "center" | "auto" = "manual") => {
    dispatch({ type: "SET_PITH", id, cx, cy, method })
  }, [])
  const setAllPithsCenter = useCallback(() => {
    dispatch({ type: "SET_ALL_PITHS_CENTER" })
    addLog("Auto-centered pith for all unconfigured images", "info")
  }, [addLog])
  const setBatchName = useCallback((name: string) => dispatch({ type: "SET_BATCH_NAME", name }), [])
  const setBatchNotes = useCallback((notes: string) => dispatch({ type: "SET_BATCH_NOTES", notes }), [])

  // ── Processing Engine ───────────────────────────────────────

  const processNextImage = useCallback(() => {
    if (!processingRef.current || !mountedRef.current) return

    // Find the next queued image
    const idx = state.images.findIndex(i => i.status === "queued")
    if (idx === -1) {
      processingRef.current = false
      dispatch({ type: "COMPLETE_BATCH" })
      addLog("Batch processing complete", "success")
      return
    }

    const img = state.images[idx]
    const stages: ProcessingStage[] = ["preprocessing", "detecting", "postprocessing"]
    const workDuration = 3000 + Math.random() * 3000 // 3–6 seconds

    // Mark as processing
    dispatch({ type: "UPDATE_IMAGE", id: img.id, updates: { status: "processing", startedAt: new Date().toISOString(), processingStage: "preprocessing" } })
    addLog(`Processing ${img.alias}...`, "info")

    // Cycle through stages
    let stageIdx = 0
    const stageInterval = workDuration / 3
    const stageTimer = setInterval(() => {
      stageIdx++
      if (stageIdx < stages.length && mountedRef.current && processingRef.current) {
        dispatch({ type: "UPDATE_IMAGE", id: img.id, updates: { processingStage: stages[stageIdx] } })
      }
    }, stageInterval)

    // Progress ticks
    let progress = 0
    intervalRef.current = setInterval(() => {
      if (!processingRef.current || !mountedRef.current) { clearInterval(intervalRef.current!); clearInterval(stageTimer); return }
      progress += 100 / (workDuration / 300)
      if (progress < 95) dispatch({ type: "UPDATE_IMAGE", id: img.id, updates: { progress } })
    }, 300)

    // Complete
    timerRef.current = setTimeout(() => {
      clearInterval(intervalRef.current!)
      clearInterval(stageTimer)
      if (!processingRef.current || !mountedRef.current) return

      const failure = shouldImageFail(img.fileName)
      const timeSeconds = parseFloat((workDuration / 1000).toFixed(1))

      if (failure.fail) {
        dispatch({
          type: "UPDATE_IMAGE", id: img.id, updates: {
            status: "failed", progress: 0, processingStage: null,
            completedAt: new Date().toISOString(), error: failure.reason,
          }
        })
        addLog(`✖ ${img.alias} — ${failure.reason}`, "error")
      } else {
        const result = generateMockResult(img.id)
        dispatch({
          type: "UPDATE_IMAGE", id: img.id, updates: {
            status: "completed", progress: 100, processingStage: null,
            completedAt: new Date().toISOString(), processingTime: timeSeconds, result,
          }
        })
        addLog(`✓ ${img.alias} — ${result.ringCount} rings (${timeSeconds}s)`, "success")
      }

      setTimeout(() => { if (processingRef.current && mountedRef.current) processNextImage() }, 400)
    }, workDuration)
  }, [state.images, addLog])

  const startBatch = useCallback(() => {
    const unready = state.images.filter(i => !i.pith)
    if (unready.length > 0) { addLog(`Cannot start: ${unready.length} images missing pith`, "error"); return }
    dispatch({ type: "START_BATCH" })
    addLog(`Starting batch analysis for ${state.images.length} images`, "info")
    processingRef.current = true
    setTimeout(() => { if (mountedRef.current && processingRef.current) processNextImage() }, 500)
  }, [state.images, addLog, processNextImage])

  const cancelBatch = useCallback(() => {
    processingRef.current = false
    if (timerRef.current) clearTimeout(timerRef.current)
    if (intervalRef.current) clearInterval(intervalRef.current)
    dispatch({ type: "CANCEL_BATCH" })
    addLog("Batch cancelled by user", "warning")
  }, [addLog])

  const retryImage = useCallback((id: string) => {
    dispatch({ type: "UPDATE_IMAGE", id, updates: { status: "queued", error: null, result: null, progress: 0, retryCount: (state.images.find(i => i.id === id)?.retryCount || 0) + 1 } })
    addLog(`Re-queued ${id} for retry`, "info")
  }, [addLog, state.images])

  const resetBatch = useCallback(() => {
    processingRef.current = false
    if (timerRef.current) clearTimeout(timerRef.current)
    if (intervalRef.current) clearInterval(intervalRef.current)
    setLogs([])
    dispatch({ type: "RESET" })
  }, [])

  useEffect(() => {
    return () => { processingRef.current = false; if (timerRef.current) clearTimeout(timerRef.current); if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [])

  return (
    <BatchContext.Provider value={{
      state, logs,
      addFiles, addSamples, removeImage, selectImage,
      setImageAlias, setImageTags, setImageNotes,
      setPith, setAllPithsCenter,
      setBatchName, setBatchNotes,
      startBatch, cancelBatch, retryImage, resetBatch,
    }}>
      {children}
    </BatchContext.Provider>
  )
}

export function useBatch() {
  const ctx = useContext(BatchContext)
  if (!ctx) throw new Error("useBatch must be used within BatchProvider")
  return ctx
}
