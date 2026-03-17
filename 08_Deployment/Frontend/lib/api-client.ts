/* ═══════════════════════════════════════════════════════════════════
   API CLIENT
   All communication with the FastAPI backend goes through this file.
   Pages and components import from here — never write raw fetch().
   ═══════════════════════════════════════════════════════════════════ */

import type {
  AnalysisResult,
  AnalysisResultSummary,
  SampleImage,
  HealthCheckResponse,
} from "./types"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

/* ── Helpers ── */

async function get<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`)
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: response.statusText }))
    throw new Error(error.detail || `Request failed: ${response.status}`)
  }
  return response.json()
}

async function post<T>(path: string, body: FormData | object, signal?: AbortSignal): Promise<T> {
  const isFormData = body instanceof FormData
  const response = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: isFormData ? undefined : { "Content-Type": "application/json" },
    body: isFormData ? body : JSON.stringify(body),
    signal,
  })
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: response.statusText }))
    throw new Error(error.detail || `Request failed: ${response.status}`)
  }
  return response.json()
}

async function del<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, { method: "DELETE" })
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: response.statusText }))
    throw new Error(error.detail || `Request failed: ${response.status}`)
  }
  return response.json()
}

/* ── Exported API ── */

export const apiClient = {
  /** Health check — verify backend is running */
  checkHealth: () => get<HealthCheckResponse>("/api/health"),

  /** Run ring detection on an uploaded image (takes 10-30s) */
  analyze: (formData: FormData, signal?: AbortSignal) =>
    post<AnalysisResult>("/api/analyze", formData, signal),

  /** Get all saved analyses (lightweight summaries for history page) */
  getAllResults: () =>
    get<{ results: AnalysisResultSummary[]; count: number }>("/api/results"),

  /** Get single full analysis result by ID */
  getResult: (id: string) => get<AnalysisResult>(`/api/results/${id}`),

  /** Delete an analysis result */
  deleteResult: (id: string) => del<{ deleted: string }>(`/api/results/${id}`),

  /** List sample images with pith coordinates */
  getSamples: () => get<{ samples: SampleImage[] }>("/api/samples"),

  /** Thumbnail URL for a sample image (use as img src directly) */
  getSampleThumbnailUrl: (name: string) => `${API_BASE}/api/samples/${name}/thumbnail`,

  /** Full resolution image URL for a sample */
  getSampleFullImageUrl: (name: string) => `${API_BASE}/api/samples/${name}/full`,
}
