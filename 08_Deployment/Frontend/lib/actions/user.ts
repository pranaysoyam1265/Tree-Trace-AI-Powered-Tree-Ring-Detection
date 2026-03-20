"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function updateProfile(data: { name?: string, role?: string, institution?: string, location?: string, bio?: string }) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const updatedUser = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name: data.name,
      role: data.role,
      institution: data.institution,
      location: data.location,
      bio: data.bio
    }
  })

  return updatedUser
}

export async function getUserProfile() {
  const session = await auth()
  if (!session?.user?.id) return null

  return prisma.user.findUnique({
    where: { id: session.user.id }
  })
}

export async function getFullUserProfile() {
  const session = await auth()
  if (!session?.user?.id) return null

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      analyses: { orderBy: { createdAt: 'desc' } },
      batches: { orderBy: { createdAt: 'desc' } },
      accounts: true
    }
  })

  if (!user) return null

  const totalAnalyses = user.analyses.length
  const totalRingsDetected = user.analyses.reduce((acc, a) => acc + (a.ringCount || 0), 0)

  let oldestSpecimen = { rings: 0, name: "None" }
  if (totalAnalyses > 0) {
    const sortedByAge = [...user.analyses].sort((a, b) => (b.estimatedAge || 0) - (a.estimatedAge || 0))
    if (sortedByAge[0].estimatedAge > 0) {
      oldestSpecimen = { rings: sortedByAge[0].estimatedAge, name: sortedByAge[0].imageName }
    }
  }

  const avgPrec = totalAnalyses > 0 ? user.analyses.reduce((a, b) => a + (b.precision || 0), 0) / totalAnalyses : 0
  const avgRec = totalAnalyses > 0 ? user.analyses.reduce((a, b) => a + (b.recall || 0), 0) / totalAnalyses : 0
  const avgF1 = totalAnalyses > 0 ? user.analyses.reduce((a, b) => a + (b.f1Score || 0), 0) / totalAnalyses : 0

  const totalProcessingTime = user.analyses.reduce((acc, a) => acc + (a.processingTimeSeconds || 0), 0)

  const recentAnalyses = user.analyses.slice(0, 5).map(a => ({
    id: a.id,
    imageName: a.imageName,
    ringCount: a.ringCount,
    confidence: (a.f1Score || 0) > 0.8 ? "high" : ((a.f1Score || 0) > 0.5 ? "medium" : "low") as "high" | "medium" | "low",
    processingTime: a.processingTimeSeconds,
    createdAt: a.createdAt.toISOString(),
    thumbnailUrl: a.overlayImagePath || "/placeholder.png",
    tags: a.tags ? a.tags.split(",") : []
  }))

  const activities: any[] = []
  user.analyses.forEach(a => {
    activities.push({
      id: "a" + a.id,
      type: "analyze",
      message: `${a.imageName} → ${a.ringCount} rings detected (${a.processingTimeSeconds}s)`,
      timestamp: a.createdAt.toISOString(),
      linkTo: `/results/${a.id}`
    })
  })
  user.batches.forEach(b => {
    activities.push({
      id: "b" + b.id,
      type: "batch",
      message: `Batch ${b.name || b.id.slice(0, 6)} completed (${b.successCount}/${b.totalImages} success)`,
      timestamp: typeof b.createdAt === 'string' ? new Date(b.createdAt).toISOString() : b.createdAt.toISOString(),
    })
  })
  activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  const achievements: any[] = []
  if (totalAnalyses > 0) achievements.push({ id: "first-ring", unlockedAt: user.analyses[user.analyses.length - 1].createdAt.toISOString() })
  if (totalRingsDetected >= 100) achievements.push({ id: "century-counter", unlockedAt: new Date().toISOString() })
  if (user.batches.length > 0) achievements.push({ id: "batch-master", unlockedAt: user.batches[user.batches.length - 1].createdAt.toISOString() })

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatar: user.image,
    role: user.role,
    institution: user.institution,
    location: user.location,
    bio: user.bio,
    memberSince: user.createdAt.toISOString(),
    stats: {
      totalAnalyses,
      totalRingsDetected,
      oldestSpecimen,
      averagePrecision: avgPrec,
      averageRecall: avgRec,
      averageF1: avgF1,
      totalProcessingTime,
      hoursWithTreeTrace: (totalProcessingTime / 3600).toFixed(1),
      estimatedTimeSaved: `${((totalProcessingTime * 10) / 3600).toFixed(1)} hours`,
      totalBatches: user.batches.length,
      totalExports: 0,
      analysesThisWeek: totalAnalyses,
      analysesThisMonth: totalAnalyses,
      weeklyActivity: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, totalAnalyses],
      speciesBreakdown: [{ tag: "Specimen", percentage: 100 }]
    },
    recentAnalyses,
    activityLog: activities.slice(0, 10),
    achievements,
    connectedAccounts: {
      google: user.accounts.some(a => a.provider === "google"),
      github: user.accounts.some(a => a.provider === "github"),
      orcid: false,
      publicProfile: false,
      publicProfileUrl: `treetrace.io/u/${user.id}`
    }
  }
}
