/* ═══════════════════════════════════════════════════════════════════
   MOCK PROFILE DATA
   User identity, stats, preferences, achievements, activity log.
   ═══════════════════════════════════════════════════════════════════ */

// ── Types ──

export interface UserProfile {
  id: string
  name: string
  email: string
  avatar: string | null
  role: string
  institution: string
  location: string
  bio: string
  memberSince: string
  plan: "free" | "pro"
  connectedAccounts: ConnectedAccounts
  stats: UserStats
  preferences: UserPreferences
  achievements: UnlockedAchievement[]
  recentAnalyses: RecentAnalysis[]
  activityLog: ActivityEntry[]
}

export interface ConnectedAccounts {
  google: boolean
  github: boolean
  orcid: boolean
  publicProfile: boolean
  publicProfileUrl: string
}

export interface UserStats {
  totalAnalyses: number
  totalRingsDetected: number
  oldestSpecimen: { rings: number; name: string }
  averagePrecision: number
  averageRecall: number
  averageF1: number
  totalProcessingTime: number
  hoursWithTreeTrace: string
  estimatedTimeSaved: string
  totalBatches: number
  totalExports: number
  analysesThisWeek: number
  analysesThisMonth: number
  weeklyActivity: number[] // 12 weeks of counts
  speciesBreakdown: { tag: string; percentage: number }[]
}

export interface UserPreferences {
  theme: "dark" | "light"
  units: "pixels" | "mm" | "um"
  defaultExport: "csv" | "json" | "both"
  soundEnabled: boolean
  notificationsEnabled: boolean
  autoSave: boolean
  language: string
}

export interface UnlockedAchievement {
  id: string
  unlockedAt: string
}

export interface RecentAnalysis {
  id: string
  imageName: string
  ringCount: number
  confidence: "high" | "medium" | "low"
  processingTime: number
  createdAt: string
  thumbnailUrl: string
  tags: string[]
}

export interface ActivityEntry {
  id: string
  type: "analyze" | "export" | "batch" | "system"
  message: string
  timestamp: string
  linkTo?: string
}

// ── Achievement Definitions ──

export interface AchievementDef {
  id: string
  icon: string
  title: string
  description: string
  criteria: string
}

export const ACHIEVEMENTS: AchievementDef[] = [
  { id: "first-ring", icon: "🌲", title: "First Ring", description: "Completed your first analysis", criteria: "1 analysis" },
  { id: "century-counter", icon: "🔬", title: "Century Counter", description: "Detected 100+ total rings", criteria: "100 cumulative rings" },
  { id: "batch-master", icon: "📊", title: "Batch Master", description: "Completed a batch with 5+ images", criteria: "1 batch ≥5 images" },
  { id: "precision-expert", icon: "🎯", title: "Precision Expert", description: "Achieved 95%+ precision", criteria: "≥95% precision" },
  { id: "speed-demon", icon: "⚡", title: "Speed Demon", description: "Analysis completed in under 10 seconds", criteria: "Processing <10s" },
  { id: "cross-dater", icon: "🌍", title: "Cross-Dater", description: "Used the pattern comparison tool", criteria: "Compare 2+ patterns" },
  { id: "data-exporter", icon: "📦", title: "Data Exporter", description: "Exported results in 3+ formats", criteria: "CSV + JSON + PNG" },
  { id: "ring-master", icon: "🏆", title: "Ring Master", description: "Detected 1000+ total rings", criteria: "1000 cumulative rings" },
  { id: "streak", icon: "🔥", title: "Streak", description: "Analyzed specimens 7 days in a row", criteria: "7-day streak" },
  { id: "beta-tester", icon: "🧪", title: "Beta Tester", description: "Used TreeTrace during beta period", criteria: "Pre-v1.0 account" },
]

// ── Mock User ──

export const MOCK_USER: UserProfile = {
  id: "USR-2024-0147",
  name: "Pranav Kumar",
  email: "pranav@treetrace.io",
  avatar: null,
  role: "Dendrochronology Researcher",
  institution: "Forest Research Institute",
  location: "Dehradun, India",
  bio: "Studying growth patterns in Himalayan conifers. Over 10 years experience in dendrochronology and climate modeling.",
  memberSince: "2024-01-10T16:00:00Z",
  plan: "free",
  connectedAccounts: {
    google: true,
    github: true,
    orcid: false,
    publicProfile: false,
    publicProfileUrl: "treetrace.io/u/pranav-kumar",
  },
  stats: {
    totalAnalyses: 47,
    totalRingsDetected: 1247,
    oldestSpecimen: { rings: 83, name: "P04a" },
    averagePrecision: 0.912,
    averageRecall: 0.73,
    averageF1: 0.81,
    totalProcessingTime: 1847,
    hoursWithTreeTrace: "18.5",
    estimatedTimeSaved: "45 hours",
    totalBatches: 3,
    totalExports: 21,
    analysesThisWeek: 5,
    analysesThisMonth: 18,
    weeklyActivity: [2, 5, 3, 0, 7, 4, 1, 6, 3, 8, 5, 2],
    speciesBreakdown: [
      { tag: "Pine", percentage: 60 },
      { tag: "Oak", percentage: 25 },
      { tag: "Spruce", percentage: 15 },
    ],
  },
  preferences: {
    theme: "dark",
    units: "pixels",
    defaultExport: "csv",
    soundEnabled: false,
    notificationsEnabled: true,
    autoSave: true,
    language: "en",
  },
  achievements: [
    { id: "first-ring", unlockedAt: "2024-01-10T16:05:00Z" },
    { id: "century-counter", unlockedAt: "2024-01-14T09:30:00Z" },
    { id: "batch-master", unlockedAt: "2024-01-16T09:47:00Z" },
    { id: "data-exporter", unlockedAt: "2024-01-15T14:00:00Z" },
    { id: "speed-demon", unlockedAt: "2024-01-17T14:23:00Z" },
    { id: "ring-master", unlockedAt: "2024-01-20T11:00:00Z" },
  ],
  recentAnalyses: [
    { id: "analysis-001", imageName: "F02a", ringCount: 23, confidence: "high", processingTime: 8.2, createdAt: "2024-01-17T14:23:00Z", thumbnailUrl: "/dataset/urudendro/F02a.png", tags: ["Pine", "Site-C"] },
    { id: "analysis-002", imageName: "F02b", ringCount: 20, confidence: "high", processingTime: 12.4, createdAt: "2024-01-17T14:10:00Z", thumbnailUrl: "/dataset/urudendro/F02b.png", tags: ["Pine", "Site-C"] },
    { id: "analysis-003", imageName: "F03a", ringCount: 24, confidence: "high", processingTime: 9.1, createdAt: "2024-01-16T11:30:00Z", thumbnailUrl: "/dataset/urudendro/F03a.png", tags: ["Oak"] },
    { id: "analysis-004", imageName: "L04a", ringCount: 18, confidence: "medium", processingTime: 15.6, createdAt: "2024-01-15T09:45:00Z", thumbnailUrl: "/dataset/urudendro/L04a.png", tags: ["Spruce"] },
    { id: "analysis-005", imageName: "L07a", ringCount: 31, confidence: "low", processingTime: 22.3, createdAt: "2024-01-14T16:20:00Z", thumbnailUrl: "/dataset/urudendro/L07a.png", tags: ["Pine", "Old-Growth"] },
  ],
  activityLog: [
    { id: "log-01", type: "analyze", message: "F02a → 23 rings detected (8.2s)", timestamp: "2024-01-17T14:23:05Z", linkTo: "/results/analysis-001" },
    { id: "log-02", type: "export", message: "F02a → CSV downloaded", timestamp: "2024-01-17T14:25:12Z" },
    { id: "log-03", type: "analyze", message: "F02b → 20 rings detected (12.4s)", timestamp: "2024-01-17T14:10:00Z", linkTo: "/results/analysis-002" },
    { id: "log-04", type: "batch", message: "Batch #3 started (15 images)", timestamp: "2024-01-16T09:15:00Z" },
    { id: "log-05", type: "batch", message: "Batch #3 completed (13/15 success)", timestamp: "2024-01-16T09:47:32Z" },
    { id: "log-06", type: "export", message: "Batch #3 → Summary CSV downloaded", timestamp: "2024-01-16T09:48:01Z" },
    { id: "log-07", type: "analyze", message: "F03a → 24 rings detected (9.1s)", timestamp: "2024-01-16T11:30:00Z", linkTo: "/results/analysis-003" },
    { id: "log-08", type: "export", message: "F03a → JSON + PNG exported", timestamp: "2024-01-16T11:35:00Z" },
    { id: "log-09", type: "analyze", message: "S01a → 18 rings detected (15.6s)", timestamp: "2024-01-15T09:45:00Z", linkTo: "/results/analysis-004" },
    { id: "log-10", type: "system", message: "Account created", timestamp: "2024-01-10T16:00:00Z" },
  ],
}
