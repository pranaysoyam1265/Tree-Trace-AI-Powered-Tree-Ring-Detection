import { AnalysisRecord } from "./mock-history"

export type SortField = 'date' | 'rings' | 'precision' | 'f1' | 'time' | 'name'
export type SortDirection = 'asc' | 'desc'

export function sortHistoryIndex(records: AnalysisRecord[], field: SortField, direction: SortDirection): AnalysisRecord[] {
  return [...records].sort((a, b) => {
    let valA: any
    let valB: any

    switch (field) {
      case 'date':
        valA = new Date(a.analyzedAt).getTime()
        valB = new Date(b.analyzedAt).getTime()
        break
      case 'rings':
        valA = a.ringCount || 0
        valB = b.ringCount || 0
        break
      case 'precision':
        valA = a.precision || 0
        valB = b.precision || 0
        break
      case 'f1':
        valA = a.f1Score || 0
        valB = b.f1Score || 0
        break
      case 'time':
        valA = a.processingTime || 0
        valB = b.processingTime || 0
        break
      case 'name':
        valA = a.imageName.toLowerCase()
        valB = b.imageName.toLowerCase()
        break
    }

    if (valA < valB) return direction === 'asc' ? -1 : 1
    if (valA > valB) return direction === 'asc' ? 1 : -1
    return 0
  })
}
